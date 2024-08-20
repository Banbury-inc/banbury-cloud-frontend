import * as DeviceInfo from '../device/deviceInfo';
import { neuranet } from '../../neuranet'
import * as DateUtils from '../../utils/dateUtils';
import * as net from 'net';
import { DeviceInfo as DeviceInfoType } from '../../types/deviceTypes'; // Assuming DeviceInfoType is defined in a types file
import { SmallDeviceInfo as SmallDeviceInfoType } from '../../types/deviceTypes'; // Assuming DeviceInfoType is defined in a types file

export async function small_ping_request(username: string, senderSocket: net.Socket): Promise<void> {
  console.log("received small ping request");
  // Handle ping request
  let user = username;
  // let user = Object.keys(credentials)[0];
  let device_number = 0;
  let device_name = neuranet.device.name();
  let files = neuranet.device.directory_info();
  let date_added = DateUtils.get_current_date_and_time();

  const device_info_json: SmallDeviceInfoType = {
    user,
    device_number,
    device_name,
    files,
    date_added,
  };

  await neuranet.networking.send_small_device_info(senderSocket, device_info_json);
  console.log("completed small ping request");

}

export async function ping_request(username: string, senderSocket: net.Socket): Promise<void> {
  console.log("Received a ping request");

  let user = username;
  let device_number = 1;
  let device_name = neuranet.device.name();
  let files = neuranet.device.directory_info();
  let storage_capacity_GB = await neuranet.device.storage_capacity();
  let max_storage_capacity_GB = 50;
  let date_added = DateUtils.get_current_date_and_time();
  let ip_address = await neuranet.device.ip_address();
  let average_network_speed = 0;
  let upload_network_speed = 0;
  let download_network_speed = 0;
  let gpu_usage = await neuranet.device.gpu_usage();
  let cpu_usage = await neuranet.device.cpu_usage();
  let ram_usage = await neuranet.device.ram_usage();
  let ram_total = await neuranet.device.ram_total();
  let ram_free = await neuranet.device.ram_free();
  let predicted_upload_network_speed = 0;
  let predicted_download_network_speed = 0;
  let predicted_gpu_usage = 0;
  let predicted_cpu_usage = 0;
  let predicted_ram_usage = 0;
  let predicted_performance_score = 0;
  let network_reliability = 0;
  let average_time_online = 0;
  let tasks = 0;
  let device_priority = 1;
  let sync_status = true;
  let optimization_status = true;
  let online = true;

  const device_info_json: DeviceInfoType = {
    user,
    device_number,
    device_name,
    files,
    storage_capacity_GB,
    max_storage_capacity_GB,
    date_added,
    ip_address,
    average_network_speed,
    upload_network_speed,
    download_network_speed,
    gpu_usage,
    cpu_usage,
    ram_usage,
    ram_total,
    ram_free,
    predicted_upload_network_speed,
    predicted_download_network_speed,
    predicted_gpu_usage,
    predicted_cpu_usage,
    predicted_ram_usage,
    predicted_performance_score,
    network_reliability,
    average_time_online,
    tasks,
    device_priority,
    sync_status,
    optimization_status,
    online
  };

  await neuranet.networking.send_device_info(senderSocket, device_info_json);
  console.log("completed ping request");
}

