import { neuranet } from '../../neuranet'
import * as PingHandler from '../handlers/pingHandlers';
import * as FileHandler from '../handlers/fileHandlers';
import * as dotenv from 'dotenv';
import * as net from 'net';

export async function connect(username: any, senderSocket: net.Socket): Promise<void> {
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
          await neuranet.handlers.small_ping_request(username, senderSocket);
        }
        if (fileType === 'PING_REQUEST') {
          await neuranet.handlers.ping_request(username, senderSocket);
        }
        if (fileType === 'FILE_REQUEST') {
          await neuranet.handlers.file_request(senderSocket, file_name, file_size);
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


