import axios from 'axios';
import path from 'path';
import os from 'os';
import fs from 'fs';
import { arrayBuffer } from 'stream/consumers';
import { neuranet } from '../../neuranet'


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
      console.log(`File successfully saved as ${fileName}, total size: ${completeBuffer.length} bytes`);
    }
  });

  // Clear accumulated data after saving
  accumulatedData = [];
}


// Function to create a WebSocket connection and invoke the callback after the connection is open
export function createWebSocketConnection(username: string, device_name: string, callback: (socket: WebSocket) => void) {

  // Check if the native WebSocket is available (i.e., in browser)
  const WebSocketClient = typeof window !== 'undefined' ? WebSocket : require('ws');


  // Replace the URL with your WebSocket endpoint
  //const socket = new WebSocketClient('ws://0.0.0.0:8080/ws/live_data/');
  const socket = new WebSocketClient('wss://banbury-cloud-backend-prod-389236221119.us-east1.run.app/ws/live_data/');

  // Set WebSocket to receive binary data as a string
  socket.binaryType = 'arraybuffer';
  //
  // Open event: When the connection is established
  socket.onopen = function() {
    console.log('WebSocket connection established');



    const message = {
      message: `Initiate live data connection`,
      username: username,
      requesting_device_name: device_name,
    };
    socket.send(JSON.stringify(message));
    console.log(`Sent: ${JSON.stringify(message)}`);


    // Call the callback function with the socket
    callback(socket);
  };

  // Message event: When a message or file is received from the server
  socket.onmessage = function(event: any) {



    // Check if the received data is binary (ArrayBuffer)
    if (event.data instanceof ArrayBuffer) {
      console.log('Received binary data from server');
      // Handle binary data (e.g., save it to a file)
      handleReceivedFileChunk(event.data);
    } else {

      const data = JSON.parse(event.data);
      const message = data.message;
      const request_type = data.request_type;
      const file_name = data.file_name;
      const requesting_device_name = data.requesting_device_name;
      const sending_device_name = data.sending_device_name;


      // Handle text-based messages (e.g., JSON data)
      console.log('Message from server: ', event.data);

      // When the server indicates that the file transfer is complete, save the file
      if (data.message === 'File transfer complete') {
        saveFile(data.file_name || 'received_file.png'); // Save file with correct name
        const final_message = {
          message: `File transaction complete`,
          username: username,
          requesting_device_name: requesting_device_name,
          sending_device_name: sending_device_name,
        };
        socket.send(JSON.stringify(final_message));
        console.log(`Sent: ${JSON.stringify(final_message)}`);

      }

      if (request_type === 'file_request') {
        console.log(`Received download request for file: ${file_name}`);
        const directory_name: string = 'BCloud';
        const directory_path: string = path.join(os.homedir(), directory_name);
        const file_save_path: string = path.join(directory_path, file_name);

        // If the file exists, read the file and send it chunk by chunk
        const fileStream = fs.createReadStream(file_save_path);

        fileStream.on('data', (chunk) => {
          console.log(`Sending file chunk: ${chunk.length} bytes`);
          socket.send(chunk); // Send the chunk as bytes
        });

        fileStream.on('end', () => {
          const message = {
            message: `File sent successfully`,
            file_name: file_name,
            username: username,
            requesting_device_name: requesting_device_name,
            sending_device_name: sending_device_name,
          };
          socket.send(JSON.stringify(message));
          let result = 'success';
          return result;
        });

        fileStream.on('error', (err: any) => {
          console.log(`File not found: ${file_name}`);
          const message = {
            message: `File not found`,
            username: username,
            requesting_device_name: requesting_device_name,
            file_name: file_name,
          };
          socket.send(JSON.stringify(message));
        });
      }
    }
  };

  // Close event: When the WebSocket connection is closed
  socket.onclose = function() {
    console.log('WebSocket connection closed');

    // Declare the device offline
    neuranet.device.declare_offline(username);
    console.log('Device declared offline');
  };

  // Error event: When an error occurs with the WebSocket connection
  socket.onerror = function(error: any) {
    console.error('WebSocket error: ', error);
  };
}

// Function to send a download request using the provided socket
export function download_request(username: string, file_name: string, socket: WebSocket) {
  const message = {
    message: `Download Request`,
    username: username,
    file_name: file_name,
    requesting_device_name: os.hostname(),
  };
  socket.send(JSON.stringify(message));
  console.log(`Sent: ${JSON.stringify(message)}`);
}


// Usage of the functions
const username = 'mmills';
const file_name = 'Logo.png';
const device_name = os.hostname();

export function connect(username: string) {

  // Create the WebSocket connection and pass the callback to call download_request once the connection is open
  createWebSocketConnection(username, device_name, (socket) => {
    // Declare the device online
    neuranet.device.declare_online(username);
    console.log('Device declared online');
    // download_request(username, file_name, socket);
  });

}
