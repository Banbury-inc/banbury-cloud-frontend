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
  download_queue: any[],
  devices: any[],
  taskInfo: any,
  tasks: any[] | undefined,
  setTasks: any,
  setTaskbox_expanded: any,
) {
  console.log('downloadFileSyncFiles download_queue: ', download_queue);

  // Array to track successfully downloaded files
  let downloaded_files = [];

  // Create a single task for the entire download process
  let task_description = `Downloading file 1 of ${download_queue.length}`;
  taskInfo = await neuranet.sessions.addTask(username ?? '', task_description, tasks, setTasks);
  setTaskbox_expanded(true);

  // Iterate through each file in the download queue
  for (let i = 0; i < download_queue.length; i++) {
    console.log('Processing file: ', i + 1, ' of ', download_queue.length);
    let file = download_queue[i];
    console.log('file: ', file);
    
    // Each file can potentially be downloaded from two devices:
    // - device_id: The primary device where the file is stored
    // - proposed_device_id: A backup device that also has the file
    let device_ids = [file.device_id, file.proposed_device_id];
    let file_name = file.file_name;

    // Try downloading from each potential device
    for (let j = 0; j < device_ids.length; j++) {
      let device_id = device_ids[j];
      
      // Check if devices array exists and find the specific device
      if (devices) {
        let device = devices.find(d => d.id === device_id);
        // Check if the device is currently online
        let is_online = device ? device.online : false;

        if (is_online) {
          console.log(`Device ID ${device_id} is online, sending download request for file: ${file_name}`);

          // Note: Actual download logic is currently commented out
          // let result = await handlers.files.downloadFile(username, [file_name], [device.name], taskInfo);

          // Temporary success placeholder
          let result = 'success';

          if (result === 'success') {
            // If download successful, add to downloaded files array
            downloaded_files.push(file_name);

            // Update task description to reflect progress
            taskInfo.task_description = `Downloading file ${i + 1} of ${download_queue.length}`;
            await neuranet.sessions.updateTask(username ?? '', taskInfo);

            // Break out of the device loop once the file is successfully downloaded
            break;
          } else {
            // If download fails, try the next device in device_ids array
            console.log(`Download failed for file: ${file_name} from device ID ${device_id}`);
            continue;
          }
        }
      }
    }
  }

  // Mark the task as completed once all files are downloaded
  await neuranet.sessions.completeTask(username ?? '', taskInfo, tasks, setTasks);

  // Return array of successfully downloaded files
  return downloaded_files;
}
