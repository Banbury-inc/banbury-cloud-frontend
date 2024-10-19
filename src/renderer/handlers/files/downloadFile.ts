import { neuranet } from '../../neuranet'

export function downloadFile(username: string, files: string[], devices: string[], taskInfo: any) {

    // Usage of the functions
    // const username = 'mmills';
    // const file_name = 'Logo.png';
    // const device_name = 'michael-ubuntu';
  if (files.length === 0 || devices.length === 0) {
    let result = 'No file selected';
    return result;
  } else {
  files.forEach((file_name) => {
    devices.forEach((device_name) => {
      // Create the WebSocket connection and pass the callback to call download_request once the connection is open
      neuranet.device.createWebSocketConnection(username, device_name, (socket) => {
        neuranet.device.download_request(username, file_name, socket, taskInfo);
      });
    });
  }); 
  }

  }

