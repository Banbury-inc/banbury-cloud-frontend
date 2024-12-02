import axios from 'axios';
import { neuranet } from '../../neuranet'
import os from 'os';
import { CONFIG } from '../../config/config';

export async function addFiles(
  username: string,
  filesInfo: any) {

  const device = os.hostname();
  try {
    const api_url = CONFIG.prod ? 'https://banbury-cloud-backend-prod-389236221119.us-east1.run.app' : 'http://localhost:8080';
    const response = await axios.post<{
      result: string;
      // }>('https://website2-389236221119.us-central1.run.app/add_files/' + username + '/', {
    }>('' + api_url + '/add_files/' + username + '/', {

      // }>('http://localhost:8080/add_files/' + username + '/', {
      files: filesInfo,
      device_name: device,
    });

    const result = response.data.result;
    if (result === 'success') {
      console.log("File added successfully");
      return 'success';
    } else if (result === 'fail') {
      console.log("Failed to add file");
      return 'failed';
    } else if (result === 'device_not_found') {
      console.log("Device not found");
      return 'device not found';
    } else if (result === 'object_id_not_found') {
      console.log("object id not found");
      return 'device not found';

    } else {
      console.log("Failed to add file");
      return 'add file failed';
    }
  } catch (error) {
    console.error('Error adding file:', error);
    return 'error';
  }
}
