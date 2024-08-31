import axios from 'axios';
import { neuranet } from '../../neuranet'
import * as DateUtils from '../../utils/dateUtils';


export async function addDevice(username: string) {


  let user = username;
  let device_number = 1;
  let device_name = neuranet.device.name();
  let storage_capacity_GB = await neuranet.device.storage_capacity();
  let max_storage_capacity_GB = 50;
  let date_added = DateUtils.get_current_date_and_time();
  let ip_address = await neuranet.device.ip_address();
  let upload_network_speed = 0;
  let download_network_speed = 0;
  let gpu_usage = await neuranet.device.gpu_usage();
  let cpu_usage = await neuranet.device.cpu_usage();
  let ram_usage = await neuranet.device.ram_usage();
  let ram_total = await neuranet.device.ram_total();
  let ram_free = await neuranet.device.ram_free();
  let device_priority = 1;
  let sync_status = false;
  let optimization_status = false;
  let online = true;




  try {
    const url = `https://website2-v3xlkt54dq-uc.a.run.app/add_device/${username}/${device_name}/`;
    const response = await axios.post<{ result: string; username: string; }>(url, {
      user: user,
      device_number: device_number,
      device_name: device_name,
      storageCapacityGB: storage_capacity_GB,
      maxStorageCapacityGB: max_storage_capacity_GB,
      date_added: date_added,
      ip_address: ip_address,
      upload_network_speed: 0,
      download_network_speed: 0,
      gpu_usage: gpu_usage,
      cpu_usage: cpu_usage,
      ram_usage: ram_usage,
      ram_total: ram_total,
      ram_free: ram_free,
      device_priority: device_priority,
      sync_status: sync_status,
      optimization_status: optimization_status,
      online: online,
    });
    const result = response.data.result;

    if (result === 'success') {
      console.log("device add_success");
      return 'success';
    }
    if (result === 'fail') {
      console.log("device_add failed");
      return 'failed';
    }
    if (result === 'device_already_exists') {
      console.log("device already exists");
      return 'exists';
    }

    else {
      console.log("device_add failed");
      console.log(result);
      return 'device_add failed';
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

