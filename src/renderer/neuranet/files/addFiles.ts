import axios from 'axios';
import { neuranet } from '../../neuranet'
import os from 'os';
import { CONFIG } from '../../config/config';

export async function addFiles(
  username: string,
  filesInfo: any) {

  const device_name = os.hostname();

  try {
    const response = await axios.post<{
      result: string;
    }>(`${CONFIG.url}files/add_files/${username}/`, {
      files: filesInfo,
      device_name: device_name,
    });

    const result = response.data.result;
    if (result === 'success') {
      return 'success';
    } else if (result === 'fail') {
      return 'failed';
    } else if (result === 'device_not_found') {
      return 'device not found';
    } else if (result === 'object_id_not_found') {
      return 'device not found';

    } else {
      return 'add file failed';
    }
  } catch (error) {
    return 'error';
  }
}
