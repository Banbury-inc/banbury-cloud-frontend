import * as DeviceInfo from '../device/deviceInfo';
import * as FileOperations from '../fileSystem/fileOperations';
import * as DateUtils from '../../utils/dateUtils';
import * as DeviceCommunication from '../networking/deviceCommunication';
import * as net from 'net';
import { DeviceInfo as DeviceInfoType } from '../../types/deviceTypes'; // Assuming DeviceInfoType is defined in a types file
import { SmallDeviceInfo as SmallDeviceInfoType } from '../../types/deviceTypes'; // Assuming DeviceInfoType is defined in a types file

export async function handleSmallPingRequest(username: string, senderSocket: net.Socket): Promise<void> {
  console.log("received small ping request");
  // Handle ping request
  let user = username;
  // let user = Object.keys(credentials)[0];
  let device_number = 0;
  let device_name = DeviceInfo.get_device_name();
  let files = FileOperations.get_directory_info();
  let date_added = DateUtils.get_current_date_and_time();

  const device_info_json: SmallDeviceInfoType = {
    user,
    device_number,
    device_name,
    files,
    date_added,
  };

  await DeviceCommunication.sendSmallDeviceInfo(senderSocket, device_info_json);
  console.log("completed small ping request");

}
export async function handlePingRequest(username: string, senderSocket: net.Socket): Promise<void> {
  console.log("Received a ping request");

  let user = username;
  let device_number = 1;
  let device_name = DeviceInfo.get_device_name();
  let files = FileOperations.get_directory_info();
  let storage_capacity_GB = await DeviceInfo.get_storage_capacity();
  let max_storage_capacity_GB = 50;
  let date_added = DateUtils.get_current_date_and_time();
  let ip_address = await DeviceInfo.get_ip_address();
  let average_network_speed = 0;
  let upload_network_speed = 0;
  let download_network_speed = 0;
  let gpu_usage = await DeviceInfo.get_gpu_usage();
  let cpu_usage = await DeviceInfo.get_cpu_usage();
  let ram_usage = await DeviceInfo.get_ram_usage();
  let ram_total = await DeviceInfo.get_ram_total();
  let ram_free = await DeviceInfo.get_ram_free();
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

  await DeviceCommunication.sendDeviceInfo(senderSocket, device_info_json);
  console.log("completed ping request");
}

