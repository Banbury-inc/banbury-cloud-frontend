import axios from 'axios';
import { neuranet } from '..'
import * as DateUtils from '../../utils/dateUtils';
import { useAuth } from '../../context/AuthContext';
import { CONFIG } from '../../config/config';
import { handlers } from '../../handlers';
import { downloadFile } from '../../handlers/files/downloadFile';


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
) {
  console.log('downloadFileSyncFiles download_queue: ', download_queue);

  // Check if there are no files to download
  if (download_queue.files_available_for_download === 0) {
    // Create a task to show completion
    const task_name = 'Checking for files to download';
    const download_task = await neuranet.sessions.addTask(username ?? '', task_name, tasks, setTasks);
    
    if (download_task && typeof download_task !== 'string') {
      download_task.task_progress = 100;
      download_task.task_status = 'complete';
      await neuranet.sessions.updateTask(username ?? '', download_task);
      console.log('No files available for download');
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
        console.error('Failed to create download task');
        return downloaded_files;
      }
    } else {
      if (download_task) {
        download_task.task_name = task_name;
        download_task.task_progress = i / download_queue.files.length * 100;
        const update_response = await neuranet.sessions.updateTask(username ?? '', download_task);
        console.log('update_response: ', update_response);
      }
    }

    setTaskbox_expanded(true);

    console.log('Processing file: ', i + 1, ' of ', download_queue.files.length);
    let file = download_queue.files[i];
    console.log('file: ', file);

    let file_name = file.file_name;
    let source_device = file.device_name;

    // Attempt to download file from source device
    try {
      const result = await downloadFile(username, [file_name], [source_device], download_task);

      if (result === 'success') {
        downloaded_files.push(file_name);
        console.log(`Successfully downloaded ${file_name} from ${source_device}`);
      }
    } catch (error) {
      console.error(`Error downloading ${file_name} from ${source_device}:`, error);
      
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
            console.log(`File ${file_name} not found on ${source_device}`);
            break;
          case 'device_offline':
            console.log(`Device ${source_device} is offline`);
            break;
          case 'permission_denied':
            console.log(`Permission denied to download ${file_name}`);
            break;
          case 'transfer_failed':
            console.log(`Transfer failed for ${file_name}`);
            break;
          case 'connection_error':
            console.log(`Connection error with ${source_device}`);
            break;
          case 'timeout':
            console.log(`Download timeout for ${file_name}`);
            break;
          default:
            console.log(`Unknown error occurred while downloading ${file_name}`);
        }
      }
    }
  }

  // Only mark as complete if we have a task and it didn't encounter errors
  if (download_task && typeof download_task !== 'string') {
    download_task.task_progress = 100;
    download_task.task_status = 'complete';
    const update_response = await neuranet.sessions.updateTask(username ?? '', download_task);
    console.log('update_response: ', update_response);
  }

  // Return array of successfully downloaded files
  return downloaded_files;
}
