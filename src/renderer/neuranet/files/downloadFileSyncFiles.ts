import axios from 'axios';
import { neuranet } from '..'
import * as DateUtils from '../../utils/dateUtils';
import { useAuth } from '../../context/AuthContext';
import { CONFIG } from '../../config/config';
import { handlers } from '../../handlers';

export async function downloadFileSyncFiles(
  username: string,
  download_queue: any[],
  devices: any[],
  taskInfo: any,
) {
  console.log('downloadFileSyncFiles download_queue: ', download_queue);


  let downloaded_files = [];

  for (let i = 0; i < download_queue.length; i++) {
    console.log('Processing file: ', i + ' of ' + download_queue.length);
    let file = download_queue[i];
    console.log('file: ', file);
    let device_ids = [file.device_id, file.proposed_device_id];
    let file_name = file.file_name;

    for (let j = 0; j < device_ids.length; j++) {
      let device_id = device_ids[j];
      if (devices) {
        let device = devices.find(d => d.id === device_id);
        let is_online = device ? device.online : false;

        if (is_online) {
          console.log(`Device ID ${device_id} is online, sending download request for file: ${file_name}`);
          // Add your download request logic here

          // let result = await handlers.files.downloadFile(username, [file_name], [device.name], taskInfo);

          let result = 'success';

          if (result === 'success') {
            downloaded_files.push(file_name);
          } else {
            console.log(`Download failed for file: ${file_name} from device ID ${device_id}`);
            // If the download failed, try the next device in the list
            continue;
          }
          }


        }
      }
    }
  }

}

