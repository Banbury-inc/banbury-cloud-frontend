
import axios from 'axios';
import { neuranet } from '../../neuranet'
import * as DateUtils from '../../utils/dateUtils';
import { CONFIG } from '../../config/config';

/**
 *
 * @param username
 * @param taskInfo
 */
export async function updateScoreConfigurationPreferences(
  username: string | null,
  use_predicted_cpu_usage: any,
  use_predicted_ram_usage: any,
  use_predicted_gpu_usage: any,
  use_predicted_download_speed: any,
  use_predicted_upload_speed: any,
  use_files_needed: any,
  use_files_available_for_download: any,
  device_name: string
) {


  const user = username;


  try {

    const url = `${CONFIG.url}/update_device_configurations/${username}/`;
    const response = await axios.post<{ result: string; username: string; }>(url, {
      device_name: device_name,
      use_predicted_cpu_usage: use_predicted_cpu_usage,
      use_predicted_ram_usage: use_predicted_ram_usage,
      use_predicted_gpu_usage: use_predicted_gpu_usage,
      use_predicted_download_speed: use_predicted_download_speed,
      use_predicted_upload_speed: use_predicted_upload_speed,
      use_files_needed: use_files_needed,
      use_files_available_for_download: use_files_available_for_download,
    });
    const result = response.data.result;


    if (result === 'success') {
      console.log("settings update success");
      return response.data;
    }
    if (result === 'fail') {
      console.log("settings update failed");
      return 'failed';
    }

    else {
      console.log("settings update failed");
      return 'settings update failed';
    }
  } catch (error) {
    console.error('Error updating settings:', error);
  }
}

