
import * as os from 'os';
import * as fs from 'fs';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import * as path from 'path';
import si from '../../../../dependency/systeminformation';
import * as DeviceInfo from './device/deviceInfo';
import * as DateUtils from './utils/dateUtils';
import * as FileOperations from './fileSystem/fileOperations';
import * as DeviceCommunication from './networking/deviceCommunication';
import * as PingHandler from './handlers/pingHandlers';
import * as FileHandler from './handlers/fileHandlers';
import * as RelayServer from './networking/relayServer';
import { DateTime } from 'luxon';
import * as dotenv from 'dotenv';
import * as net from 'net';
import { CONFIG } from './config/config';
import * as crypto from 'crypto';
import ConfigParser from 'configparser';

dotenv.config();


let senderSocket: net.Socket | null = null;

function connectToRelayServer(): net.Socket {
  const RELAY_HOST = CONFIG.relayHost; // Change this to your actual server IP
  const RELAY_PORT = CONFIG.relayPort;
  // Create a new socket and connect
  senderSocket = new net.Socket();
  senderSocket.connect(RELAY_PORT, RELAY_HOST, () => {
    console.log("Connected to the server.");
  });

  // Add error handling to log or handle errors
  senderSocket.on('error', (err) => {
    console.error("Error connecting to the relay server:", err);
  });

  senderSocket.on('close', () => {
    console.log("Socket is now closed.");
  });

  return senderSocket;
}






// let senderSocket = connectToRelayServer();
function send_login_request(username: string, password: string, senderSocket: net.Socket): Promise<string> {
  return new Promise((resolve, reject) => {
    const file_header: string = `LOGIN_REQUEST::${password}:${username}:END_OF_HEADER`;
    senderSocket.write(file_header);
    const endOfHeader = Buffer.from('END_OF_HEADER');
    let buffer = Buffer.alloc(0);

    senderSocket.on('data', (data) => {
      buffer = Buffer.concat([buffer, data]);
      if (buffer.includes(endOfHeader)) {
        const endOfHeaderIndex = buffer.indexOf(endOfHeader);
        if (endOfHeaderIndex !== -1) {
          const headerPart = buffer.slice(0, endOfHeaderIndex);
          const content = buffer.slice(endOfHeaderIndex + endOfHeader.length);
          buffer = content;  // Update buffer to remove processed header

          const header = headerPart.toString();
          const splitHeader = header.split(':');
          const fileType = splitHeader[0];
          if (fileType === 'GREETINGS') {
            console.log('Received greeting from server');
          } else if (fileType === 'LOGIN_SUCCESS') {
            console.log('Received login success from server');
            // const result = receiver(username, senderSocket);
            resolve('login success');
          } else if (fileType === 'LOGIN_FAIL') {
            console.log('Received login failure from server');
            senderSocket.end();
            reject('login failure');
          }
        }
      }
    });
    senderSocket.on('end', () => {
      console.log('Disconnected from server');
    });

    senderSocket.on('error', (err) => {
      console.error('Socket error:', err);
      reject(err.message);
    });

    senderSocket.on('close', (hadError) => {
      if (!hadError) {
        reject(new Error('Connection closed unexpectedly'));
      }
    });
  });
}

async function receiver(username: any, senderSocket: net.Socket): Promise<void> {
  console.log("receiver function called")
  const file_header: string = `GREETINGS::::END_OF_HEADER`;
  senderSocket.write(file_header);

  const endOfHeader = Buffer.from('END_OF_HEADER');
  let buffer = Buffer.alloc(0);

  senderSocket.on('data', async (data) => {
    buffer = Buffer.concat([buffer, data]);
    if (buffer.includes(endOfHeader)) {
      const endOfHeaderIndex = buffer.indexOf(endOfHeader);
      if (endOfHeaderIndex !== -1) {
        const headerPart = buffer.slice(0, endOfHeaderIndex);
        const content = buffer.slice(endOfHeaderIndex + endOfHeader.length);
        buffer = content;  // Update buffer to remove processed header
        console.log('buffer:', buffer.toString());
        const header = headerPart.toString();
        const splitHeader = header.split(':');
        const fileType = splitHeader[0];
        const file_name = splitHeader[1];
        const file_size = splitHeader[2];
        if (fileType === 'GREETINGS') {
          console.log('Received greeting from server');
        }
        if (fileType === 'LOGIN_SUCCESS') {
          console.log('Received login success from server');
        }
        if (fileType === 'LOGIN_FAIL') {
          console.log('Received login failure from server');
        }
        if (fileType === 'SMALL_PING_REQUEST') {
          await PingHandler.handleSmallPingRequest(username, senderSocket);
        }
        if (fileType === 'PING_REQUEST') {
          await PingHandler.handlePingRequest(username, senderSocket);
        }
        if (fileType === 'FILE_REQUEST') {
          await FileHandler.handleFileRequest(senderSocket, file_name, file_size);
        }
        if (fileType === 'REGISTRATION_FAILURE_USER_ALREADY_EXISTS') {
          // Handle registration failure
        }
      }
    }
  });

  senderSocket.on('end', () => {
    console.log('Disconnected from server');
  });

  senderSocket.on('error', (err) => {
    console.error('Socket error:', err);
  });

  senderSocket.on('close', hadError => {
    if (!hadError) {
      console.error('Connection closed unexpectedly');
    }
  });
}

// Wrap the main logic in an async function
async function run() {
  try {
    console.log('Starting receiver...');
  } catch (error) {
    console.error('Error in receiver:', error);
  }
}

// Call the async function from the top-level main function
run().catch((error) => {
  console.error('Error in main function:', error);
});

export { receiver, run, send_login_request, connectToRelayServer }
