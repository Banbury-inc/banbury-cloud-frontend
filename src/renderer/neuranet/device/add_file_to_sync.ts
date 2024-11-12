import axios from 'axios';
import { neuranet } from '..'
import * as DateUtils from '../../utils/dateUtils';
import { useAuth } from '../../context/AuthContext';
import { CONFIG } from '../../config/config';


export async function add_file_to_sync(
  file_path: string,
  username: string,
) {


  let user = username;

  let device_name = neuranet.device.name();

  let url = ''

  try {

    if (CONFIG.prod) {
      url = `https://banbury-cloud-backend-prod-389236221119.us-east1.run.app/add_file_to_sync/${username}/`;
    } else {
      url = `http://localhost:8080/add_file_to_sync/${username}/`;

    }

    

    const response = await axios.post<{ result: string; username: string; }>(url, {
      device_name: device_name,
      file_path: file_path,
    });
    const result = response.data.result;
    console.log(result);

    if (result === 'success') {

      console.log("add file to file sync success");

      return result;
    }
    if (result === 'fail') {
      console.log("add file to sync failed");
      return 'failed';
    }
    if (result === 'task_already_exists') {
      console.log("task already exists");
      return 'exists';
    }

    else {
      console.log("add file to sync failed");
      console.log(result);
      return 'task_add failed';
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    return 'error'; // Ensure an error is returned if the request fails
  }
}

