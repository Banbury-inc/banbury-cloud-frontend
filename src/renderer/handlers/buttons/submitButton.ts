import axios from 'axios';
import { neuranet } from '../../neuranet'

export async function submitButton(
  username: string | null,
  sync_entire_device_checked: boolean,
) {
  console.log("Submit button clicked");
  try {
    const response = await axios.post<{
      result: string;
    }>('https://website2-v3xlkt54dq-uc.a.run.app/add_file/' + username + '/', {
      sync_entire_device_checked: sync_entire_device_checked,
    });

    const result = response.data.result;
    if (result === 'success') {
      console.log("File added successfully");
      let taskInfo = {
        name: 'update settings',
        device: sync_entire_device_checked,
        status: 'complete',
      }
      let task = await neuranet.sessions.updateTask(username, taskInfo);
      return 'success';
    } else if (result === 'fail') {
      let taskInfo = {
        name: 'update settings',
        device: sync_entire_device_checked,
        status: 'fail',
      }

      let task_name = taskInfo.name;
      let task_device = taskInfo.device;
      let task_status = taskInfo.status;

      let task = await neuranet.sessions.updateTask(username, taskInfo);

      console.log("Failed to add file");
      return 'failed';
    } else if (result === 'device_not_found') {
      console.log("Device not found");
      return 'device not found';
    } else if (result === 'object_id_not_found') {
      console.log("object id not found");
      return 'device not found';

    } else {
      console.log("Failed to add file");
      return 'add file failed';
    }
  } catch (error) {
    console.error('Error adding file:', error);
    return 'error';
  }
}

