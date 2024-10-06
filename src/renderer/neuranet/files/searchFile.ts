import axios from 'axios';
import { neuranet } from '../../neuranet'
import os from 'os';



export async function searchFile(username: string, fileName: string) {

  try {
    const deviceName = os.hostname();
    const response = await axios.post(`https://banbury-cloud-backend-prod-389236221119.us-east1.run.app/search_file/${username}/`, {
      device_name: deviceName,
      file_name: fileName
    });

    if (response.data.result === 'success') {
      const fileData = response.data.file;
      console.log("File found:", fileData);
      return response.data.file;
    } else if (response.data.result === 'device_not_found') {
      console.log("Device not found");
      return 'device not found';
    } else if (response.data.result === 'object_id_not_found') {
      console.log("Device ID not found");
      return 'object_id_not_found';
    } else if (response.data.result === 'file_not_found') {
      console.log("File not found");
      return 'file_not_found';
    }
    else {
      return response.data.result;
    }
  } catch (error) {
    console.error('Error searching for file:', error);
    return 'error';
  }
}

// Example usage:
searchFile('michael-ubuntu', '8641923.png').then(result => {
  console.log(result);
});
