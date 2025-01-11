import axios from "axios";
import { CONFIG } from "../../config/config";
import { neuranet } from '..'




// Function to get total requests processed
export async function getDeviceId(username: string | undefined): Promise<any | null> {


  const device_name = neuranet.device.name();

  try {
    const response = await axios.get(`${CONFIG.url}/devices/get_single_device_info_with_device_name/${username}/${device_name}`);
    const deviceInfo = response.data.device_info;
    const device_id = deviceInfo._id;


    return device_id;
  } catch (error) {
    console.error('Error fetching device info:', error);
    if (axios.isAxiosError(error)) {
      console.error('Response data:', error.response?.data);
      console.error('Response status:', error.response?.status);
    }
  }
}
