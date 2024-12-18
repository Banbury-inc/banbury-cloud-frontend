
import axios from 'axios';
import { neuranet } from '..'
import * as DateUtils from '../../utils/dateUtils';
import { useAuth } from '../../context/AuthContext';
import { CONFIG } from '../../config/config';


export async function runPipeline(
  username: string,
) {
  let device_name = neuranet.device.name();
  let url = `${CONFIG.url}/predictions/run_pipeline/${username}/`;

  try {
    const response = await axios.get<{ result: string; username: string; }>(url);
    const result = response.data.result;

    console.log('runPipeline response: ', response);

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
    return 'error';
  }
}
