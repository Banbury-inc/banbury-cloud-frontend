import axios from 'axios';
import { neuranet } from '..'
import * as DateUtils from '../../utils/dateUtils';
import { useAuth } from '../../context/AuthContext';
import { CONFIG } from '../../config/config';
import { handlers } from '../../handlers';

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
  tasks: any[] | undefined,
  setTasks: any,
  setTaskbox_expanded: any,
) {
  console.log('downloadFileSyncFiles download_queue: ', download_queue);

  // Array to track successfully downloaded files
  let downloaded_files = [];
  let files_available_for_download = download_queue.files_available_for_download;
  let download_task: typeof taskInfo;
  // Iterate through each file in the download queue
  for (let i = 0; i < download_queue.files.length; i++) {
    // Create a single task for the entire download process
    let task_progress = i / download_queue.files.length;
    let task_name = `Downloading files`;

    if (i === 0) {
      download_task = await neuranet.sessions.addTask(username ?? '', task_name, tasks, setTasks);
    } else {
      download_task.task_name = task_name;
      download_task.task_progress = i / download_queue.files.length * 100;
      const update_response = await neuranet.sessions.updateTask(username ?? '', download_task);
      console.log('update_response: ', update_response);
    }

    setTaskbox_expanded(true);

    console.log('Processing file: ', i + 1, ' of ', download_queue.files.length);
    let file = download_queue.files[i];
    console.log('file: ', file);

    let file_name = file.file_name;
    let source_device = file.device_name;

    // Attempt to download file from source device
    try {
      // TODO: Implement actual file download logic here
      // For now using placeholder success/fail
      let result = 'success';

      if (result === 'success') {
        // If download successful, add to downloaded files array
        downloaded_files.push(file_name);
        console.log(`Successfully downloaded ${file_name} from ${source_device}`);
      } else {
        console.log(`Download failed for file: ${file_name} from device ${source_device}`);
      }
    } catch (error) {
      console.error(`Error downloading ${file_name} from ${source_device}:`, error);
    }
  }

  download_task.task_progress = 100;
  download_task.task_status = 'complete';
  const update_response = await neuranet.sessions.updateTask(username ?? '', download_task);
  console.log('update_response: ', update_response);

  // Return array of successfully downloaded files
  return downloaded_files;
}
