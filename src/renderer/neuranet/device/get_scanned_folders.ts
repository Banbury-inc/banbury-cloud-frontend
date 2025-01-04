import axios from 'axios';
import { neuranet } from '..'
import * as DateUtils from '../../utils/dateUtils';
import { useAuth } from '../../context/AuthContext';
import { CONFIG } from '../../config/config';


export async function get_scanned_folders(
  username: string,
) {


  let user = username;

  let device_name = neuranet.device.name();


    let url = `${CONFIG.url}/files/get_scanned_folders/${username}/`;



    const response = await axios.post<{ result: string; username: string; }>(url, {
      device_name: device_name,
    });

    if (response.data.result === 'success') {

      console.log("declare offline success");

      return response.data;
    }
    if (response.data.result === 'fail') {
      console.log("declare offline failed");
      return 'failed';
    }
    if (response.data.result === 'task_already_exists') {
      console.log("task already exists");
      return 'exists';
    }

    else {
      console.log("declare offline failed");
      console.log(response.data.result);
      return 'task_add failed';
    }
}

