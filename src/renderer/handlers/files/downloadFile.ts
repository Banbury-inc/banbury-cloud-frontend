import path from 'path';
import os from 'os';
import { neuranet } from '../../neuranet'

export function downloadFile(username: string, files: string[], devices: string[], taskInfo: any, tasks: any[], setTasks: any, setTaskbox_expanded: any): Promise<string> {
  return new Promise((resolve, reject) => {
    if (files.length === 0 || devices.length === 0) {
      reject('No file selected');
      return;
    }

    // Track active transfers with more detail
    const activeTransfers = new Map<string, {
      socket: WebSocket,
      completed: boolean
    }>();

    // Only create one connection to the first available device
    const device_name = devices[0];
    const file_name = path.basename(files[0]);
    const transferId = `${file_name}-${device_name}`;

    if (!activeTransfers.has(transferId)) {
      neuranet.device.createWebSocketConnection(
        username,
        device_name,
        taskInfo,
        tasks,
        setTasks,
        setTaskbox_expanded,
        (socket: WebSocket) => {
          activeTransfers.set(transferId, {
            socket,
            completed: false
          });

          socket.onmessage = (event: any) => {
            try {
              if (event.data instanceof ArrayBuffer) {
                // Handle binary data through the existing handleReceivedFileChunk
                neuranet.device.handleReceivedFileChunk(event.data);
                return;
              }

              const data = JSON.parse(event.data);
              console.log('Transfer response:', data);

              if (data.message === 'File transfer complete') {
                const transfer = activeTransfers.get(transferId);
                if (transfer && !transfer.completed) {
                  transfer.completed = true;
                  transfer.socket.close();
                  activeTransfers.delete(transferId);
                  resolve('success');
                }
              }
            } catch (error) {
              console.error('Error in transfer:', error);
              const transfer = activeTransfers.get(transferId);
              if (transfer) {
                transfer.socket.close();
                activeTransfers.delete(transferId);
              }
              resolve('error');
            }
          };

          // Send single file request
          neuranet.device.download_request(username, file_name, files[0], socket, taskInfo);
        }
      );
    }

    // Timeout handler
    setTimeout(() => {
      if (activeTransfers.size > 0) {
        activeTransfers.forEach(transfer => {
          transfer.socket.close();
        });
        activeTransfers.clear();
        resolve('timeout');
      }
    }, 30000);
  });
}

