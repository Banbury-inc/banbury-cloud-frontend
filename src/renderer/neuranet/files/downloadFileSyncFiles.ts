import axios from 'axios';
import { neuranet } from '..'
import * as DateUtils from '../../utils/dateUtils';
import { useAuth } from '../../context/AuthContext';
import { CONFIG } from '../../config/config';
import { handlers } from '../../handlers';
import { downloadFile } from '../../handlers/files/downloadFile';
import path from 'path';
import fs from 'fs';


/**
 * Downloads files from available online devices in the sync queue
 * @param username - The username of the current user
 * @param download_queue - Array of files that need to be downloaded
 * @param devices - Array of available devices in the network
 * @param taskInfo - Information about the current download task
 * @returns Array of successfully downloaded file names
 */
export async function downloadFileSyncFiles(
  username: string,
  download_queue: {
    files: any[];
    files_available_for_download: number;
  },
  devices: any[],
  taskInfo: any,
  tasks: any[] | null,
  setTasks: any,
  setTaskbox_expanded: any,
  websocket: WebSocket,
) {

  // Add validation for download_queue and its properties
  if (!download_queue || !Array.isArray(download_queue.files)) {
    console.error('Invalid download queue structure');
    return [];
  }

  // Check if there are no files to download
  if (download_queue.files_available_for_download === 0) {
    // Create a task to show completion
    const task_name = 'Checking for files to download';
    const download_task = await neuranet.sessions.addTask(username ?? '', task_name, tasks, setTasks);

    if (download_task && typeof download_task !== 'string') {
      download_task.task_progress = 100;
      download_task.task_status = 'complete';
      await neuranet.sessions.updateTask(username ?? '', download_task);
    }

    return [];
  }

  // Array to track successfully downloaded files
  let downloaded_files = [];
  let download_task: any;
  // Iterate through each file in the download queue
  for (let i = 0; i < download_queue.files.length; i++) {
    // Create a single task for the entire download process
    let task_progress = i / download_queue.files.length;
    let task_name = `Downloading files`;

    if (i === 0) {
      download_task = await neuranet.sessions.addTask(username ?? '', task_name, tasks, setTasks);
      if (!download_task) {
        return downloaded_files;
      }
    } else {
      if (download_task) {
        download_task.task_name = task_name;
        download_task.task_progress = i / download_queue.files.length * 100;
        const update_response = await neuranet.sessions.updateTask(username ?? '', download_task);
      }
    }

    setTaskbox_expanded(true);

    let file = download_queue.files[i];

    let file_name = file.file_name;
    let source_device = file.device_name;

    // Check if file already exists in destination path
    const destination_path = path.join(CONFIG.download_destination, file_name);
    if (fs.existsSync(destination_path)) {
      console.log(`File ${file_name} already exists in ${destination_path}`);
      downloaded_files.push(file_name);
      const response = await neuranet.files.add_device_id_to_file_sync_file(file_name, username);
      continue;
    }
    else {

        // Attempt to download file from source device
        try {
          const result = await downloadFile(username, [file_name], [source_device], download_task, tasks || [], setTasks, setTaskbox_expanded, websocket as unknown as WebSocket);

          if (result === 'success') {
            downloaded_files.push(file_name);
            const response = await neuranet.files.add_device_id_to_file_sync_file(file_name, username);
          }
    } catch (error) {

      // Update task info for failure
      if (download_task) {
        download_task.task_progress = (i / download_queue.files.length * 100);
        download_task.task_status = 'error';

        // Call failTask with the specific error
        await neuranet.sessions.failTask(
          username ?? '',
          download_task,
          error, // Pass the specific error message
          tasks,
          setTasks
        );

        switch (error) {
          case 'file_not_found':
            // console.log(`File ${file_name} not found on ${source_device}`);
            break;
          case 'device_offline':
            // console.log(`Device ${source_device} is offline`);
            break;
          case 'permission_denied':
            // console.log(`Permission denied to download ${file_name}`);
            break;
          case 'transfer_failed':
            // console.log(`Transfer failed for ${file_name}`);
            break;
          case 'connection_error':
            // console.log(`Connection error with ${source_device}`);
            break;
          case 'timeout':
            // console.log(`Download timeout for ${file_name}`);
            break;
          default:
          // console.log(`Unknown error occurred while downloading ${file_name}`);
        }
      }
    }
  }
}

  // Only mark as complete if we have a task and it didn't encounter errors
  if (download_task && typeof download_task !== 'string') {
    download_task.task_progress = 100;
    download_task.task_status = 'complete';
    const update_response = await neuranet.sessions.updateTask(username ?? '', download_task);
  }

  // Return array of successfully downloaded files
  return downloaded_files;
}
