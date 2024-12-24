import path from 'path';
import os from 'os';
import { neuranet } from '../../neuranet'

export function downloadFile(username: string, files: string[], devices: string[], taskInfo: any, tasks: any[], setTasks: any, setTaskbox_expanded: any): Promise<string> {
  return new Promise((resolve, reject) => {
    if (files.length === 0 || devices.length === 0) {
      reject('No file selected');
      return;
    }

    let completedTransfers = 0;
    const totalTransfers = files.length * devices.length;

    files.forEach((file_name, index) => {
      const file_path = files[index];
      devices.forEach((device_name) => {
        neuranet.device.createWebSocketConnection(username, device_name, taskInfo, tasks, setTasks, setTaskbox_expanded, (socket: any) => {
          socket.onmessage = (event: any) => {
            try {
              const data = JSON.parse(event.data);
              console.log(data);
              const file_path = path.join(os.homedir(), 'Downloads', file_name);

              switch (data.message) {
                case 'File transfer complete':
                  completedTransfers++;
                  if (completedTransfers === totalTransfers) {
                    resolve('success');
                  }
                  break;
                case 'File not found':
                  resolve('file_not_found');
                  break;
                case 'Device offline':
                  resolve('device_offline');
                  break;
                case 'Permission denied':
                  resolve('permission_denied');
                  break;
                case 'Transfer failed':
                  resolve('transfer_failed');
                  break;
                // Add more cases as needed
              }
            } catch (error) {
              resolve('invalid_response');
            }
          };

          socket.onerror = () => {
            resolve('connection_error');
          };

          socket.onclose = () => {
            resolve('connection_closed');
          };

          neuranet.device.download_request(username, file_name, file_path, socket, taskInfo);
        });
      });
    });

    // Optional: Add timeout
    setTimeout(() => {
      resolve('timeout');
    }, 30000); // 30 second timeout
  });
}

