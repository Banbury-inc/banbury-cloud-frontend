import path from 'path';
import os from 'os';
import { neuranet } from '../../neuranet'
import { useAuth } from '../../context/AuthContext';

export function downloadFile(username: string, files: string[], devices: string[], taskInfo: any, tasks: any[], setTasks: any, setTaskbox_expanded: any, websocket: WebSocket): Promise<string> {
  return new Promise((resolve, reject) => {
    if (files.length === 0 || devices.length === 0) {
      reject('No file selected');
      return;
    }

    // Add message handler for this specific file transfer
    const messageHandler = (event: MessageEvent) => {
      if (typeof event.data === 'string') {
        try {
          const data = JSON.parse(event.data);

          // Check for success conditions
          if (data.message === 'File transaction complete' && data.file_name === files[0]) {
            websocket.removeEventListener('message', messageHandler);
            resolve('success');
          }

          // Check for error conditions
          if (['File not found', 'Device offline', 'Permission denied', 'Transfer failed'].includes(data.message)) {
            websocket.removeEventListener('message', messageHandler);
            reject(data.message);
          }
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      }
    };

    // Add the message handler
    websocket.addEventListener('message', messageHandler);

    // Send the download request
    neuranet.device.download_request(username, files[0], files[0], websocket, taskInfo);

    // Optional: Add timeout
    setTimeout(() => {
      websocket.removeEventListener('message', messageHandler);
      reject('Download request timed out');
    }, 30000); // 30 second timeout
  });
}

