import { neuranet } from '../../neuranet'

export function downloadFile(username: string, files: string[], devices: string[], taskInfo: any): Promise<string> {
  return new Promise((resolve, reject) => {
    if (files.length === 0 || devices.length === 0) {
      reject('No file selected');
      return;
    }

    let completedTransfers = 0;
    const totalTransfers = files.length * devices.length;

    files.forEach((file_name) => {
      devices.forEach((device_name) => {
        neuranet.device.createWebSocketConnection(username, device_name, (socket) => {
          socket.onmessage = (event) => {
            try {
              const data = JSON.parse(event.data);
              
              switch (data.message) {
                case 'File transfer complete':
                  completedTransfers++;
                  if (completedTransfers === totalTransfers) {
                    resolve('success');
                  }
                  break;
                case 'File not found':
                  reject('file_not_found');
                  break;
                case 'Device offline':
                  reject('device_offline');
                  break;
                case 'Permission denied':
                  reject('permission_denied');
                  break;
                case 'Transfer failed':
                  reject('transfer_failed');
                  break;
                // Add more cases as needed
              }
            } catch (error) {
              reject('invalid_response');
            }
          };

          socket.onerror = () => {
            reject('connection_error');
          };

          socket.onclose = () => {
            reject('connection_closed');
          };

          neuranet.device.download_request(username, file_name, socket, taskInfo);
        });
      });
    });

    // Optional: Add timeout
    setTimeout(() => {
      reject('timeout');
    }, 30000); // 30 second timeout
  });
}

