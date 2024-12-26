
import axios from 'axios';
import { neuranet } from '..'
import * as DateUtils from '../../utils/dateUtils';
import { useAuth } from '../../context/AuthContext';
import { CONFIG } from '../../config/config';


export async function add_device_id_to_file_sync_file(
  file_path: string,
  username: string,
) {


  let user = username;

  let device_name = neuranet.device.name();


    let url = `${CONFIG.url}/predictions/add_device_id_to_file_sync_file/${username}/`;

    

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
}

