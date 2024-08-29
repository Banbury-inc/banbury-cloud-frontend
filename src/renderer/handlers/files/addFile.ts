import axios from 'axios';
import { neuranet } from '../../neuranet'

export async function addFile(username: string) {

  let device_name = neuranet.device.name();
  try {
    const response = await axios.post<{
      result: string;
    }>('https://website2-v3xlkt54dq-uc.a.run.app/add_file/' + username + '/', {
      device_name: device_name,
      file_type: 'file_type',
      file_name: 'file_name',
      file_path: 'file_path',
    });

    const result = response.data.result;
    if (result === 'success') {
      console.log("File added successfully");
      return 'success';
    } else if (result === 'fail') {
      console.log("Failed to add file");
      return 'failed';
    } else if (result === 'user_already_exists') {
      console.log("User already exists");
      return 'exists';
    } else {
      console.log("Failed to add file");
      return 'register failed';
    }
  } catch (error) {
    console.error('Error adding file:', error);
    return 'error';
  }
}
