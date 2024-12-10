import axios from 'axios';
import { neuranet } from '../../neuranet'
import os from 'os';
import { CONFIG } from '../../config/config';



export async function searchFile(username: string, fileName: string) {

  try {
    const deviceName = os.hostname();
    const response = await axios.post(`${CONFIG.url}/search_file/${username}/`, {
      device_name: deviceName,
      file_name: fileName
    });

    if (response.data.result === 'success') {
      const fileData = response.data.file;
      return response.data.file;
    } else if (response.data.result === 'device_not_found') {
      return 'device not found';
    } else if (response.data.result === 'object_id_not_found') {
      return 'object_id_not_found';
    } else if (response.data.result === 'file_not_found') {
      return 'file_not_found';
    }
    else {
      return response.data.result;
    }
  } catch (error) {
    return 'error';
  }
}

// Example usage:
searchFile('michael-ubuntu', '8641923.png').then(result => {
  console.log(result);
});
