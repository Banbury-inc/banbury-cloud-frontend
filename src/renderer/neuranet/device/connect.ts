import axios from 'axios';
import path from 'path';
import os from 'os';
import fs from 'fs';
import { arrayBuffer } from 'stream/consumers';
import { neuranet } from '../../neuranet'
import { CONFIG } from '../../config/config';
import { useAuth } from '../../context/AuthContext';

// Add state all file chunks
let accumulatedData: Buffer[] = [];

// Function to handle the received file chunk in binary form
export function handleReceivedFileChunk(data: ArrayBuffer) {
  // Convert ArrayBuffer to Buffer and ensure it's a valid chunk
  try {
    const chunkBuffer = Buffer.from(data);
    if (chunkBuffer.length > 0) {
      accumulatedData.push(chunkBuffer);
      console.log('Added chunk of size:', chunkBuffer.length);
    }
  } catch (error) {
    console.error('Error processing file chunk:', error);
  }
}

// Function to save the accumulated file after all chunks are received
function saveFile(fileName: string, file_path: string) {
  try {
    const userHomeDirectory = os.homedir();
    const filePath = path.join(userHomeDirectory, 'Downloads', fileName);

    // Combine all chunks and verify we have data
    const completeBuffer = Buffer.concat(accumulatedData);
    if (completeBuffer.length === 0) {
      throw new Error('No data accumulated to save');
    }

    // Use synchronous write to ensure file is saved before clearing buffer
    fs.writeFileSync(filePath, completeBuffer);
    console.log(`File saved successfully: ${filePath} (${completeBuffer.length} bytes)`);

    // Clear accumulated data only after successful save
    accumulatedData = [];
    return 'success';
  } catch (error) {
    console.error('Error saving file:', error);
    throw error;
  }
}

function handleTransferError(
  errorType: 'save_error' | 'file_not_found' | 'device_offline' | 'permission_denied' | 'transfer_failed',
  fileName: string,
  tasks: any[] | null,
  setTasks: ((tasks: any[]) => void) | null,
  setTaskbox_expanded: ((expanded: boolean) => void) | null,
  deviceName?: string
) {
  if (!tasks || !setTasks || !setTaskbox_expanded) {
    console.error('Missing required parameters for error handling');
    return;
  }

  const errorMessages = {
    save_error: `Failed to save file: ${fileName}`,
    file_not_found: `File not found: ${fileName}`,
    device_offline: `Device ${deviceName} is offline`,
    permission_denied: `Permission denied for file: ${fileName}`,
    transfer_failed: `Transfer failed for file: ${fileName}`,
  };

  const updatedTasks = tasks.map((task: any) =>
    task.file_name === fileName
      ? { ...task, status: 'error', error_message: errorMessages[errorType] }
      : task
  );

  setTasks(updatedTasks);
  setTaskbox_expanded(true);
}

// Function to create a WebSocket connection and invoke the callback after the connection is open
export function createWebSocketConnection(
  username: string,
  device_name: string,
  taskInfo: any,
  tasks: any[],
  setTasks: (tasks: any[]) => void,
  setTaskbox_expanded: (expanded: boolean) => void,
  callback: (socket: WebSocket) => void
) {
  // Check if the native WebSocket is available (i.e., in browser)
  const WebSocketClient = typeof window !== 'undefined' ? WebSocket : require('ws');

  let socket: WebSocket;

  const url_ws = CONFIG.url_ws;
  // Replace the URL with your WebSocket endpoint
  socket = new WebSocketClient(url_ws);

  // Set WebSocket to receive binary data as a string
  socket.binaryType = 'arraybuffer';

  // Open event: When the connection is established
  socket.onopen = function () {

    const message = {
      message: `Initiate live data connection`,
      username: username,
      requesting_device_name: device_name,
    };
    socket.send(JSON.stringify(message));

    // Call the callback function with the socket
    callback(socket);
  };

  // Message event: When a message or file is received from the server
  socket.onmessage = async function (event: any) {
    console.log('I received a message: ', event.data);

    // Check if the received data is binary (ArrayBuffer)
    if (event.data instanceof ArrayBuffer) {
      handleReceivedFileChunk(event.data);
    } else {
      try {
        const data = JSON.parse(event.data);
        console.log('I parsed the data: ', data);

        switch (data.message) {
          case 'File transfer complete':
            saveFile(data.file_name || 'received_file.zip', data.file_path);
            const final_message = {
              message: 'File transaction complete',
              username: username,
              requesting_device_name: device_name,
              sending_device_name: data.sending_device_name,
            };
            socket.send(JSON.stringify(final_message));
            console.log(`Sent: ${JSON.stringify(final_message)}`);
            return 'success';

          case 'File not found':
            console.log(`File not found: ${data.file_name}`);
            return 'file_not_found';

          case 'Device offline':
            console.log(`Device offline: ${data.sending_device_name}`);
            return 'device_offline';

          case 'Permission denied':
            console.log(`Permission denied for file: ${data.file_name}`);
            return 'permission_denied';

          case 'Transfer failed':
            console.log(`Transfer failed for file: ${data.file_name}`);
            if (tasks && setTasks && setTaskbox_expanded) {
              handleTransferError(
                'transfer_failed',
                data.file_name,
                tasks,
                setTasks,
                setTaskbox_expanded
              );
            }
            return 'transfer_failed';
        }


        if (data.request_type === 'device_info') {
          console.log('I was asked for device info')
          let device_info = await neuranet.device.getDeviceInfo();
          console.log('I retrieved the device info: ', device_info)
          const message = {
            message: `device_info_response`,
            username: username,
            sending_device_name: device_name,
            requesting_device_name: data.requesting_device_name,
            device_info: device_info,
          };
          socket.send(JSON.stringify(message));
          console.log(`Sent: ${JSON.stringify(message)}`);
        }



        if (data.request_type === 'file_sync_request') {
          console.log('I was asked to initiate file sync')
          const download_queue = data.download_queue?.download_queue;
          console.log('Extracted download queue: ', download_queue)

          if (download_queue && Array.isArray(download_queue.files)) {
            const response = await neuranet.files.downloadFileSyncFiles(
              username,
              download_queue,
              [],
              taskInfo,
              tasks,
              setTasks,
              setTaskbox_expanded
            );
            console.log('I completed the file sync: ', response)
          } else {
            console.error('Invalid download queue format received:', download_queue);
          }
        }


        // Handle existing request types
        if (data.request_type === 'file_request') {
          console.log('Received file request')
          // const directory_name: string = 'BCloud';
          const file_path = data.file_path;
          const directory_name: string = file_path;
          const directory_path: string = path.join(os.homedir(), directory_name);
          const file_save_path: string = path.join(directory_path);

          console.log('File save path: ', file_save_path)
          console.log('Directory path: ', directory_path)
          console.log('Directory name: ', directory_name)
          console.log('Creating read stream for: ', file_save_path)

          const fileStream = fs.createReadStream(file_path);

          fileStream.on('error', () => {
            const message = {
              message: 'File not found',
              username: username,
              requesting_device_name: data.requesting_device_name,
              file_name: data.file_name,
            };
            socket.send(JSON.stringify(message));
            return 'file_not_found';
          });

          // Add handlers for reading and sending the file
          fileStream.on('data', (chunk) => {
            console.log('Sending chunk: ', chunk)
            socket.send(chunk);
          });

          fileStream.on('end', () => {
            console.log('File transfer complete: containing data:', data)
            const message = {
              message: 'File transfer complete',
              username: username,
              requesting_device_name: data.requesting_device_name,
              sending_device_name: data.device_name,
              file_name: data.file_name,
              file_path: data.file_path,
            };
            socket.send(JSON.stringify(message));
          });
        }
      } catch (error) {
        console.error('Invalid message format:', error);
        return 'invalid_response';
      }
    }
  };

  // Close event: When the WebSocket connection is closed
  socket.onclose = function () {
    console.log('WebSocket connection closed');
    return 'connection_closed';
  };

  // Error event: When an error occurs with the WebSocket connection
  socket.onerror = function (error: any) {
    console.error('WebSocket error: ', error);
    return 'connection_error';
  };
}

// Function to send a download request using the provided socket
export function download_request(username: string, file_name: string, file_path: string, socket: WebSocket, taskInfo: any) {
  const message = {
    message: "Download Request",
    username: username,
    file_name: file_name,
    file_path: file_path,  // This will now be the actual directory path
    requesting_device_name: os.hostname(),
  };
  socket.send(JSON.stringify(message));
}


// Usage of the functions
const username = 'mmills';
const file_name = 'Logo.png';
const file_path = path.join(os.homedir(), 'Downloads');  // Use a proper path
const device_name = os.hostname();
const taskInfo = {
  task_name: 'download_file',
  task_device: device_name,
  task_status: 'in_progress',
};


export function connect(
  username: string,
  tasks: any[],
  setTasks: (tasks: any[]) => void,
  setTaskbox_expanded: (expanded: boolean) => void,
) {
  createWebSocketConnection(
    username,
    device_name,
    taskInfo,
    tasks,
    setTasks,
    setTaskbox_expanded,
    (socket) => {
      // Declare the device online
      //commenting out as url doesnt exist I don't think
      neuranet.device.declare_online(username);
      download_request(username, file_name, file_path, socket, taskInfo);
    }
  );
}
