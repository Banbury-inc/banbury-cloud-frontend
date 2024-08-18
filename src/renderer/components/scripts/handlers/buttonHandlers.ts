import * as RelayServer from '../networking//relayServer';
import * as CredentialUtils from '../utils/credentialUtils';
import * as net from 'net';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import axios from 'axios';


function delete_file(files: string[], device: string[]): string {
  const senderSocket = RelayServer.connectToRelayServer();
  const endOfHeader = Buffer.from('END_OF_HEADER');
  const credentials = CredentialUtils.loadCredentials();
  let username = Object.keys(credentials)[0];
  const file_size = ""
  let header: string | null = null;
  let buffer = Buffer.alloc(0);
  const fileHeader = `FILE_DELETE_REQUEST:${files}:${file_size}:${username}:`;
  senderSocket.write(fileHeader);
  senderSocket.write(endOfHeader);

  let jobCompleted = false;
  senderSocket.on('data', (data) => {
    buffer = Buffer.concat([buffer, data]);
    let fileType = 'Unknown';
    if (buffer.includes(endOfHeader) && !header) {
      const endOfHeaderIndex = buffer.indexOf(endOfHeader);
      if (endOfHeaderIndex !== -1) {
        const headerPart = buffer.slice(0, endOfHeaderIndex);
        const content = buffer.slice(endOfHeaderIndex + endOfHeader.length);
        header = headerPart.toString();
        const splitHeader = header.split(':');
        fileType = splitHeader[0];
        buffer = content;
      }
    }
  });

  senderSocket.on('end', () => {
    if (!jobCompleted) {
      console.log('Connection closed before login completion.');
    }
  });

  senderSocket.on('error', (err) => {
    console.error('Error during login:', err);
    senderSocket.end();
  });

  return '';
}


function delete_device(device_name: string[]): string {
  const senderSocket = RelayServer.connectToRelayServer();
  const endOfHeader = Buffer.from('END_OF_HEADER');
  const credentials = CredentialUtils.loadCredentials();
  let username = Object.keys(credentials)[0];
  const file_size = ""
  let header: string | null = null;
  let buffer = Buffer.alloc(0);
  let null_arg = ""
  const fileHeader = `DEVICE_DELETE_REQUEST:${device_name}:${null_arg}:${username}:`;
  senderSocket.write(fileHeader);
  senderSocket.write(endOfHeader);

  let jobCompleted = false;
  senderSocket.on('data', (data) => {
    buffer = Buffer.concat([buffer, data]);
    let fileType = 'Unknown';
    if (buffer.includes(endOfHeader) && !header) {
      const endOfHeaderIndex = buffer.indexOf(endOfHeader);
      if (endOfHeaderIndex !== -1) {
        const headerPart = buffer.slice(0, endOfHeaderIndex);
        const content = buffer.slice(endOfHeaderIndex + endOfHeader.length);
        header = headerPart.toString();
        const splitHeader = header.split(':');
        fileType = splitHeader[0];
        buffer = content;
      }
    }
  });

  senderSocket.on('end', () => {
    if (!jobCompleted) {
      console.log('Connection closed before login completion.');
    }
  });

  senderSocket.on('error', (err) => {
    console.error('Error during login:', err);
    senderSocket.end();
  });

  return '';
}


function download_file(files: string[], devices: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const RELAY_HOST = '0.0.0.0';
    const RELAY_PORT = 443;
    const senderSocket = new net.Socket();

    senderSocket.connect(RELAY_PORT, RELAY_HOST, () => {
      const null_arg = '';
      const file_header = `FILE_REQUEST:${files}:7679671:mmills6060:END_OF_HEADER`;
      senderSocket.write(file_header);
      // senderSocket.write("END_OF_HEADER");
    });

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
          const file_name = splitHeader[1];
          const file_size = splitHeader[2];
          if (fileType === 'FILE_REQUEST') {

            console.log(`Device is requesting file: ${file_name}`);
            const directory_name: string = "BCloud";
            const directory_path: string = path.join(os.homedir(), directory_name);
            const file_save_path: string = path.join(directory_path, file_name);
            let request_file_name = path.basename(file_save_path);

            try {
              // Attempt to open the file
              const file: fs.ReadStream = fs.createReadStream(file_save_path);
              const null_string: string = "";
              const file_header: string = `FILE_REQUEST_RESPONSE:${request_file_name}:${file_size}:${null_string}:END_OF_HEADER`;
              senderSocket.write(file_header);

              let total_bytes_sent: number = 0;
              file.on('data', (bytes_read: Buffer) => {
                console.log("sending file...");
                senderSocket.write(bytes_read);
                total_bytes_sent += bytes_read.length;
              });

              file.on('end', () => {
                console.log(`${file_name} has been sent successfully.`);
                senderSocket.end();
              });

              file.on('error', (err: NodeJS.ErrnoException) => {
                console.error(`Error reading file: ${err}`);
                senderSocket.end();
              });

            } catch (error) {
              console.error(`Error sending file response: ${error}`);
              senderSocket.end();
            }


            resolve('received file request ;)');
          }
          if (fileType === 'REGISTRATION_FAILURE_USER_ALREADY_EXISTS') {
            resolve('exists');
          }
          else {
            resolve(fileType);
          }

        }
      }
    });

    senderSocket.on('end', () => {
      console.log('Disconnected from server');
      reject(new Error('Connection ended without confirmation'));
    });

    senderSocket.on('error', (err) => {
      console.error('Socket error:', err);
      reject(err);
    });

    senderSocket.on('close', hadError => {
      if (!hadError) {
        reject(new Error('Connection closed unexpectedly'));
      }
    });
  });
}

export function upload_file(file_path: any, global_file_path: any) {

  const directory_name: string = "BCloud";
  const directory_path: string = path.join(os.homedir(), directory_name);
  console.log("directory_path", directory_path);
  console.log("file_path", file_path);
  console.log("global_file_path", global_file_path);

  try {
    fs.copyFileSync(file_path, path.join(directory_path, path.basename(file_path)));
    console.log(`File copied successfully to ${directory_name}`);
  } catch (error) {
    console.log(`Error copying file: ${error}`);
  }

  return '';
}


export async function change_profile_info(first_name: string, last_name: string, username: any, email: string, password: string) {

  try {
    const response = await axios.get<{
      result: string;
      username: string;
      // }>('https://website2-v3xlkt54dq-uc.a.run.app/getuserinfo2/' + username + '/');
    }>('https://website2-v3xlkt54dq-uc.a.run.app/change_profile/' + username + '/' + password + '/' + first_name + '/' + last_name + '/' + email + '/');
    // }>('https://website2-v3xlkt54dq-uc.a.run.app/getuserinfo/');
    const result = response.data.result;
    if (result === 'success') {
      console.log("change profile success");
      return 'success';
    }
    if (result === 'fail') {
      console.log("change profilefailed");
      return 'failed';
    }
    if (result === 'user_already_exists') {
      console.log("user already exists");
      return 'exists';
    }

    else {
      console.log("change profilefailed");
      return 'change profile failed';
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}


export async function register(first_name: string, last_name: string, username: string, password_str: string) {

  try {
    const response = await axios.get<{
      result: string;
      username: string;
      // }>('https://website2-v3xlkt54dq-uc.a.run.app/getuserinfo2/' + username + '/');
    }>('https://website2-v3xlkt54dq-uc.a.run.app/register/' + username + '/' + password_str + '/' + first_name + '/' + last_name + '/');
    // }>('https://website2-v3xlkt54dq-uc.a.run.app/getuserinfo/');
    const result = response.data.result;
    if (result === 'success') {
      console.log("register success");
      return 'success';
    }
    if (result === 'fail') {
      console.log("register failed");
      return 'failed';
    }
    if (result === 'user_already_exists') {
      console.log("user already exists");
      return 'exists';
    }

    else {
      console.log("register failed");
      return 'register failed';
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}


