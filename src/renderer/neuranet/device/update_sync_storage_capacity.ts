import axios from 'axios';
import { neuranet } from '..'
import * as DateUtils from '../../utils/dateUtils';
import { useAuth } from '../../context/AuthContext';
import { CONFIG } from '../../config/config';


export async function update_sync_storage_capacity(
  username: string,
  sync_storage_capacity_gb: string,
) {


  let user = username;

  let device_name = neuranet.device.name();

  let url = ''

  try {

    if (CONFIG.prod) {
      url = `https://banbury-cloud-backend-prod-389236221119.us-east1.run.app/update_sync_storage_capacity/${username}/`;
    } else {
      url = `http://localhost:8080/update_sync_storage_capacity/${username}/`;

    }

    

    const response = await axios.post<{ result: string; username: string; }>(url, {
      device_name: device_name,
      storage_capacity: sync_storage_capacity_gb,
    });
    const result = response.data.result;
    console.log(result);

    if (result === 'success') {

      console.log("update sync storage capacity success");

      return result;
    }
    if (result === 'fail') {
      console.log("update sync storage capacity failed");
      return 'failed';
    }
    if (result === 'task_already_exists') {
      console.log("task already exists");
      return 'exists';
    }

    else {
      console.log("update sync storage capacity failed");
      console.log(result);
      return 'task_add failed';
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    return 'error'; // Ensure an error is returned if the request fails
  }
}

