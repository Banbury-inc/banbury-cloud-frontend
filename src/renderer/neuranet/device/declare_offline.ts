import axios from 'axios';
import { neuranet } from '../../neuranet'
import * as DateUtils from '../../utils/dateUtils';
import { useAuth } from '../../context/AuthContext';


export async function declare_offline(
  username: string,
) {


  let user = username;

  let device_name = neuranet.device.name();

  try {
    const url = `https://banbury-cloud-backend-prod-389236221119.us-east1.run.app/declare_offline/${username}/`;
    const response = await axios.post<{ result: string; username: string; }>(url, {
      device_name: device_name,
    });
    const result = response.data.result;

    if (result === 'success') {

      console.log("declare offline success");

      return result;
    }
    if (result === 'fail') {
      console.log("declare offline failed");
      return 'failed';
    }
    if (result === 'task_already_exists') {
      console.log("task already exists");
      return 'exists';
    }

    else {
      console.log("declare offline failed");
      console.log(result);
      return 'task_add failed';
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

