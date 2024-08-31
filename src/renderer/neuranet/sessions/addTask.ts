import axios from 'axios';
import { neuranet } from '../../neuranet'
import * as DateUtils from '../../utils/dateUtils';

export async function addTask(
  username: string,
  taskInfo: any
) {


  let user = username;

  try {
    const url = `https://website2-v3xlkt54dq-uc.a.run.app/add_task/${username}/`;
    const response = await axios.post<{ result: string; username: string; }>(url, {
      user: user,
      task_name: taskInfo.name,
      task_device: taskInfo.device,
      task_status: taskInfo.status,
    });
    const result = response.data.result;

    if (result === 'success') {
      console.log("task add success");

      // Append the new task to the tasks list
      const newTask = {
        name: taskInfo.name,
        device: taskInfo.device,
        status: taskInfo.status,
      };


      return 'success';
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

