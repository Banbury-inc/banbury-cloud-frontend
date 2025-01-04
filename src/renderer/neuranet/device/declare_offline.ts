import axios from 'axios';
import { neuranet } from '../../neuranet'
import * as DateUtils from '../../utils/dateUtils';
import { useAuth } from '../../context/AuthContext';
import { CONFIG } from '../../config/config';


export async function declare_offline(
  username: string,
) {


  let user = username;

  let device_name = neuranet.device.name();

  try {
    const url = `${CONFIG.url}/devices/declare_offline/${username}/`;
    const response = await axios.post<{ result: string; username: string; }>(url, {
      device_name: device_name,
    });
    const result = response.data.result;

    if (result === 'success') {


      return result;
    }
    if (result === 'fail') {
      return 'failed';
    }
    if (result === 'task_already_exists') {
      return 'exists';
    }

    else {
      return 'task_add failed';
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

