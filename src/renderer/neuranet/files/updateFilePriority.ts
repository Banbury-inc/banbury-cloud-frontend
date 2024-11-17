
import axios from 'axios';
import { neuranet } from '..'
import * as DateUtils from '../../utils/dateUtils';
import { useAuth } from '../../context/AuthContext';
import { CONFIG } from '../../config/config';


export async function updateFilePriority(
  file_id: string,
  username: string,
  priority: number,
) {


  console.log('updateFilePriority called with file_id: ', file_id, 'username: ', username, 'priority: ', priority);


  let user = username;

  let device_name = neuranet.device.name();

  let url = ''

  try {

    if (CONFIG.prod) {
      url = `https://banbury-cloud-backend-prod-389236221119.us-east1.run.app/update_file_priority/${username}/`;
    } else {
      url = `http://localhost:8080/update_file_priority/${username}/`;

    }

    const response = await axios.post<{ result: string; username: string; }>(url, {
      file_id: file_id,
      priority: priority,
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
    return 'error'; // Ensure an error is returned if the request fails
  }
}
