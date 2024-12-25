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

    // Send single file request
    neuranet.device.download_request(username, files[0], files[0], websocket, taskInfo);

  });
}

