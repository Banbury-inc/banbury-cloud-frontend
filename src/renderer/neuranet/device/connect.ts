import axios from 'axios';
import path from 'path';
import os from 'os';
import fs from 'fs';
import { arrayBuffer } from 'stream/consumers';
import { neuranet } from '../../neuranet'
import { CONFIG } from '../../config/config';
import { useAuth } from '../../context/AuthContext';
import { Socket } from 'net';

// Add state all file chunks with a reset function
let accumulatedData: Buffer[] = [];

function resetAccumulatedData() {
  accumulatedData = [];
}

// Function to handle the received file chunk in binary form
export function handleReceivedFileChunk(data: ArrayBuffer) {
  console.log("Handling received file chunk, size:", data.byteLength);

  // Convert ArrayBuffer to Buffer and ensure it's a valid chunk
  try {
    const chunkBuffer = Buffer.from(data);
    if (chunkBuffer.length > 0) {
      console.log("Adding chunk to accumulated data, size:", chunkBuffer.length);
      accumulatedData.push(chunkBuffer);
    } else {
      console.warn("Received empty chunk, skipping");
    }
  } catch (error) {
    console.error('Error processing file chunk:', error);
    throw error; // Rethrow to handle in the caller
  }
}

// Function to save the accumulated file after all chunks are received
function saveFile(fileName: string, file_path: string) {
  console.log("Saving file:", fileName, "from path:", file_path);
  console.log("Total accumulated chunks:", accumulatedData.length);

  try {
    // Always save to Downloads folder
    const userHomeDirectory = os.homedir();
    const downloadsPath = path.join(userHomeDirectory, 'Downloads');
    console.log("Saving to downloads path:", downloadsPath);

    // Create Downloads directory if it doesn't exist
    if (!fs.existsSync(downloadsPath)) {
      fs.mkdirSync(downloadsPath, { recursive: true });
    }

    // Create final file path in Downloads
    const filePath = path.join(downloadsPath, fileName);
    console.log("Final file path:", filePath);

    // Combine all chunks and verify we have data
    const completeBuffer = Buffer.concat(accumulatedData);
    console.log("Complete file size:", completeBuffer.length);

    if (completeBuffer.length === 0) {
      throw new Error('No data accumulated to save');
    }

    // Write file synchronously to ensure completion
    fs.writeFileSync(filePath, completeBuffer);
    console.log("File written successfully");

    // Clear accumulated data only after successful save
    resetAccumulatedData();
    return 'success';
  } catch (error) {
    console.error('Error saving file:', error);
    // Reset accumulated data on error to prevent corruption
    resetAccumulatedData();
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
export async function createWebSocketConnection(
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
  const device_id = await neuranet.device.getDeviceId(username);
  const entire_url_ws = `${url_ws}${device_id}/`;
  // Replace the URL with your WebSocket endpoint
  socket = new WebSocketClient(entire_url_ws);

  // Set WebSocket to receive binary data as a string
  socket.binaryType = 'arraybuffer';

  // Open event: When the connection is established
  socket.onopen = function () {

    const message = {
      message_type: `initiate_live_data_connection`,
      username: username,
      device_name: device_name,
      run_device_info_loop: CONFIG.run_device_info_loop,
      run_device_predictions_loop: CONFIG.run_device_predictions_loop,
    };
    socket.send(JSON.stringify(message));
    console.log("Sent message:", message);

    // Call the callback function with the socket
    callback(socket);
  };

  // Message event: When a message or file is received from the server
  socket.onmessage = async function (event: any) {
    console.log("Received message:", event);

    // Check if the received data is binary (ArrayBuffer)
    if (event.data instanceof ArrayBuffer) {
      console.log("Received file chunk, length:", event.data.byteLength);
      handleReceivedFileChunk(event.data);
    } else {
      try {
        const data = JSON.parse(event.data);
        console.log("Received JSON message:", data);

        // Handle both message types for file completion
        if (data.message === 'File sent successfully' || data.type === 'file_sent_successfully') {
          console.log("File transfer complete, saving file:", data.file_name);
          try {
            const result = saveFile(data.file_name, data.file_path || '');
            console.log("File saved successfully:", result);

            // Send completion confirmation
            const final_message = {
              message_type: 'file_transaction_complete', // Changed to match expected message type
              username: username,
              requesting_device_name: device_name,
              sending_device_name: data.sending_device_name,
              file_name: data.file_name,
              file_path: data.file_path
            };
            socket.send(JSON.stringify(final_message));
            console.log("Sent completion confirmation:", final_message);

            // Update task status if available
            if (tasks && setTasks) {
              const updatedTasks = tasks.map((task: any) =>
                task.file_name === data.file_name
                  ? { ...task, status: 'complete' }
                  : task
              );
              setTasks(updatedTasks);
            }
          } catch (error) {
            console.error('Error saving file:', error);
            handleTransferError(
              'save_error',
              data.file_name,
              tasks,
              setTasks,
              setTaskbox_expanded
            );
          }
        } else {
          // Handle other message types in switch statement
          switch (data.message) {
            case 'Start file transfer':
              console.log("Starting new file transfer");
              resetAccumulatedData();
              break;

            case 'File transfer complete':
            case 'File transaction complete':
              // These cases are now handled above
              break;

            case 'File not found':
              console.log(`File not found: ${data.file_name}`);
              handleTransferError(
                'file_not_found',
                data.file_name,
                tasks,
                setTasks,
                setTaskbox_expanded
              );
              break;

            case 'Device offline':
              console.log(`Device offline: ${data.sending_device_name}`);
              handleTransferError(
                'device_offline',
                data.file_name,
                tasks,
                setTasks,
                setTaskbox_expanded,
                data.sending_device_name
              );
              break;

            default:
              console.log("Unhandled message type:", data.message);
              break;
          }
        }

        if (data.request_type === 'device_info') {
          let device_info = await neuranet.device.getDeviceInfo();
          const message = {
            message: `device_info_response`,
            username: username,
            sending_device_name: device_name,
            requesting_device_name: data.requesting_device_name,
            device_info: device_info,
          };
          socket.send(JSON.stringify(message));
        }

        if (data.request_type === 'file_sync_request') {
          const download_queue = data.download_queue?.download_queue;

          if (download_queue && Array.isArray(download_queue.files)) {
            const response = await neuranet.files.downloadFileSyncFiles(
              username,
              download_queue,
              [],
              taskInfo,
              tasks,
              setTasks,
              setTaskbox_expanded,
              socket as unknown as WebSocket,
            );
          } else {
            console.error('Invalid download queue format received:', download_queue);
          }
        }

        // Handle existing request types
        if (data.request_type === 'file_request') {
          console.log("Received file request:", data);
          const file_path = data.file_path;
          const directory_name: string = file_path;
          const directory_path: string = path.join(os.homedir(), directory_name);
          const file_save_path: string = path.join(directory_path);

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
            const message = {
              message_type: 'file_sent_successfully',
              username: username,
              requesting_device_name: data.requesting_device_name,
              sending_device_name: device_name,
              file_name: data.file_name,
              file_path: data.file_path
            };
            socket.send(JSON.stringify(message));
          });
        }
      } catch (error) {
        console.error('Error processing message:', error);
      }
    }
  };

  // Close event: When the WebSocket connection is closed
  socket.onclose = function () {
    return 'connection_closed';
  };

  // Error event: When an error occurs with the WebSocket connection
  socket.onerror = function (error: any) {
    console.error('WebSocket error: ', error);
    return 'connection_error';
  };
}

// Function to send a download request using the provided socket
export async function download_request(username: string, file_name: string, file_path: string, fileInfo: any, socket: WebSocket, taskInfo: any) {
  const requesting_device_id = await neuranet.device.getDeviceId(username);
  const sending_device_id = fileInfo[0]?.device_id;

  // Create the same transfer room name format as backend
  const transfer_room = `transfer_${sending_device_id}_${requesting_device_id}`;

  // Join transfer room before sending request
  socket.send(JSON.stringify({
    message_type: "join_transfer_room",
    transfer_room: transfer_room
  }));

  const message = {
    message_type: "download_request",
    username: username,
    file_name: file_name,
    file_path: file_path,
    file_info: fileInfo,
    requesting_device_name: os.hostname(),
    requesting_device_id: requesting_device_id,
    transfer_room: transfer_room
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
): Promise<WebSocket> {
  return new Promise((resolve) => {
    createWebSocketConnection(
      username,
      device_name,
      taskInfo,
      tasks,
      setTasks,
      setTaskbox_expanded,
      (socket) => {
        resolve(socket);
      }
    );
  });
}
