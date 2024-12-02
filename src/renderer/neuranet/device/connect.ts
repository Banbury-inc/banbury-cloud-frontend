import axios from 'axios';
import path from 'path';
import os from 'os';
import fs from 'fs';
import { arrayBuffer } from 'stream/consumers';
import { neuranet } from '../../neuranet'
import { CONFIG } from '../../config/config';


// Buffer to accumulate all file chunks
let accumulatedData: Buffer[] = [];

// Function to handle the received file chunk in binary form
function handleReceivedFileChunk(data: ArrayBuffer) {
  // Convert ArrayBuffer to Buffer
  const chunkBuffer = Buffer.from(data);

  // Add the chunk to the accumulated data
  accumulatedData.push(chunkBuffer);
}

// Function to save the accumulated file after all chunks are received
function saveFile(fileName: string) {
  const userHomeDirectory = os.homedir(); // Get the user's home directory
  const filePath = path.join(userHomeDirectory, 'Downloads', fileName); // Save it in Downloads folder (or any other folder)

  const completeBuffer = Buffer.concat(accumulatedData); // Combine all chunks

  fs.writeFile(filePath, completeBuffer, (err) => {
    if (err) {
      console.error('Error saving file:', err);
    } else {
      return 'success';

    }
  });

  // Clear accumulated data after saving
  accumulatedData = [];

  return 'success';
}


// Function to create a WebSocket connection and invoke the callback after the connection is open
export function createWebSocketConnection(username: string, device_name: string, callback: (socket: WebSocket) => void) {
  // Check if the native WebSocket is available (i.e., in browser)
  const WebSocketClient = typeof window !== 'undefined' ? WebSocket : require('ws');

  let socket: WebSocket;

  // Replace the URL with your WebSocket endpoint
  if (CONFIG.prod) {  
    socket = new WebSocketClient('wss://banbury-cloud-backend-prod-389236221119.us-east1.run.app/ws/live_data/');
  } else {
    socket = new WebSocketClient('ws://0.0.0.0:8082/ws/live_data/');
  }

  // Set WebSocket to receive binary data as a string
  socket.binaryType = 'arraybuffer';

  // Open event: When the connection is established
  socket.onopen = function() {

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
  socket.onmessage = async function(event: any) {
    // Check if the received data is binary (ArrayBuffer)
    if (event.data instanceof ArrayBuffer) {
      handleReceivedFileChunk(event.data);
    } else {
      try {
        const data = JSON.parse(event.data);
        
        switch (data.message) {
          case 'File transfer complete':
            saveFile(data.file_name || 'received_file.png');
            const final_message = {
              message: 'File transaction complete',
              username: username,
              requesting_device_name: data.requesting_device_name,
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
            return 'transfer_failed';
        }

        // Handle existing request types
        if (data.request_type === 'file_request') {
          const directory_name: string = 'BCloud';
          const directory_path: string = path.join(os.homedir(), directory_name);
          const file_save_path: string = path.join(directory_path, data.file_name);

          const fileStream = fs.createReadStream(file_save_path);

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

          // Rest of file request handling...
        }
      } catch (error) {
        console.error('Invalid message format:', error);
        return 'invalid_response';
      }
    }
  };

  // Close event: When the WebSocket connection is closed
  socket.onclose = function() {
    console.log('WebSocket connection closed');
    return 'connection_closed';
  };

  // Error event: When an error occurs with the WebSocket connection
  socket.onerror = function(error: any) {
    console.error('WebSocket error: ', error);
    return 'connection_error';
  };
}

// Function to send a download request using the provided socket
export function download_request(username: string, file_name: string, socket: WebSocket, taskInfo: any) {
  const message = {
    message: `Download Request`,
    username: username,
    file_name: file_name,
    requesting_device_name: os.hostname(),
  };
  socket.send(JSON.stringify(message));

}


// Usage of the functions
const username = 'mmills';
const file_name = 'Logo.png';
const device_name = os.hostname();
const taskInfo = {
  task_name: 'download_file',
  task_device: device_name,
  task_status: 'in_progress',
};

export function connect(username: string) {

  // Create the WebSocket connection and pass the callback to call download_request once the connection is open
  createWebSocketConnection(username, device_name, (socket) => {
    // Declare the device online
    //commenting out as url doesnt exist I don't think
    //neuranet.device.declare_online(username);
    // download_request(username, file_name, socket);
  });

}
