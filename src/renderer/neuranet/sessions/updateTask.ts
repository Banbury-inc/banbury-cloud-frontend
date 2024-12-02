import axios from 'axios';
import { neuranet } from '../../neuranet'
import * as DateUtils from '../../utils/dateUtils';
import { CONFIG } from '../../config/config';

/**
 *
 * @param username
 * @param taskInfo
 */
export async function updateTask(
  username: string | null,
  taskInfo: any
) {


  const user = username;


  try {
    const url = `${CONFIG.url}update_task/${username}/`;
    const response = await axios.post<{ result: string; username: string; task_id: string; }>(url, {
      task_id: taskInfo.task_id,
      task_name: taskInfo.task_name,
      task_progress: taskInfo.task_progress,
      task_status: taskInfo.task_status,
    });
    const result = response.data.result;

    if (result === 'success') {
      taskInfo.task_id = response.data.task_id;
      console.log("task update_success");
      return response.data;
    }
    if (result === 'fail') {
      console.log("task update failed");
      return 'failed';
    }
    if (result === 'device_already_exists') {
      console.log("device already exists");
      return 'exists';
    }

    else {
      console.log("task update failed");
      console.log(result);
      console.log(taskInfo)
      return 'device_add failed';
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

