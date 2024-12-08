
import axios from 'axios';
import { neuranet } from '..'
import * as DateUtils from '../../utils/dateUtils';
import { useAuth } from '../../context/AuthContext';
import { CONFIG } from '../../config/config';


export async function getDownloadQueue(
  username: string,
) {

  let user = username;
  let device_name = neuranet.device.name();
  let url = ''

  try {

      url = `${CONFIG.url}/get_download_queue/${username}/`;

    const response = await axios.post<{ result: string; username: string; }>(url, {
      device_name: device_name,
    });
    const result = response.data.result;

    console.log('getDownloadQueue response: ', response);

    if (result === 'success') {
      return response.data;

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
    return 'error'; // Ensure an error is returned if the request fails
  }
}

