import axios from 'axios';
import { neuranet } from '../../neuranet'
import * as DateUtils from '../../utils/dateUtils';
import { useAuth } from '../../context/AuthContext';
import os from 'os';


export async function addTask(
  username: string,
  task_description: string,
  tasks: any,
  setTasks: any
) {


  let user = username;

  // let device_name = neuranet.device.name();
  let device_name = os.hostname();
  let taskInfo = {
    task_name: task_description,
    task_device: device_name,
    task_status: 'pending',
  };
  try {
    const url = `https://banbury-cloud-backend-prod-389236221119.us-east1.run.app/add_task/${username}/`;
    const response = await axios.post<{ result: string; username: string; }>(url, {
      user: user,
      task_name: task_description,
      task_device: device_name,
      task_status: 'pending',
    });
    const result = response.data.result;

    if (result === 'success') {

      setTasks([...(tasks || []), taskInfo]);
      console.log("task add success");

      return taskInfo;
    }
    if (result === 'fail') {
      console.log("task add failed");
      return 'failed';
    }
    if (result === 'task_already_exists') {
      console.log("task already exists");
      return 'exists';
    }

    else {
      console.log("task_add failed");
      console.log(result);
      return 'task_add failed';
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

