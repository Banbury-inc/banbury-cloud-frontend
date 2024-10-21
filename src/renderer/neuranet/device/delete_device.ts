import axios from 'axios';
import { neuranet } from '..'
import * as DateUtils from '../../utils/dateUtils';
import { useAuth } from '../../context/AuthContext';
import { CONFIG } from '../../config/config';


export async function delete_device(
  username: string,
) {


  let user = username;

  let url

  if (CONFIG.prod) {
    url = `https://banbury-cloud-backend-prod-389236221119.us-east1.run.app/delete_device/${username}/`;
  } else {
    url = `http://localhost:8080/delete_device/${username}/`;
  }

  let device_name = neuranet.device.name();

  try {
    const response = await axios.post<{ result: string; user: string; }>(url, {
      device_name: device_name,
    });
    const result = response.data.result;

    if (result === 'success') {

      console.log("delete device success");

      return result;
    }
    if (result === 'fail cant find user') {
      return result;
    }
    if (result === 'fail cant find device') {
      console.log("fail cant find device");
      return result;
    }

    if (result === 'task_already_exists') {
      console.log("task already exists");
      return 'exists';
    }

    else {
      console.log("delete device failed");
      console.log(result);
      return 'task_add failed';
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

