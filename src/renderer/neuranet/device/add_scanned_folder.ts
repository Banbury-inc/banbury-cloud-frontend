import axios from 'axios';
import { neuranet } from '../../neuranet'
import * as DateUtils from '../../utils/dateUtils';
import { useAuth } from '../../context/AuthContext';
import { CONFIG } from '../../config/config';


export async function add_scanned_folder(
  scanned_folder: string,
  username: string,
) {


  let user = username;

  let device_name = neuranet.device.name();

  let url = ''

  try {

      url = `${CONFIG.url}/add_scanned_folder/${username}/`;



    const response = await axios.post<{ result: string; username: string; }>(url, {
      device_name: device_name,
      scanned_folder: scanned_folder,
    });
    const result = response.data.result;

    if (result === 'success') {

      console.log("add scanned folder success");

      return result;
    }
    if (result === 'fail') {
      console.log("add scanned folder failed");
      return 'failed';
    }
    if (result === 'task_already_exists') {
      console.log("task already exists");
      return 'exists';
    }

    else {
      console.log("add scanned folder failed");
      console.log(result);
      return 'task_add failed';
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    return 'error'; // Ensure an error is returned if the request fails
  }
}

