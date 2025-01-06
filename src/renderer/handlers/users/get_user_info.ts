import axios from 'axios';
import { CONFIG } from '../../config/config';


export async function getUserInfo(username: string) {
  try {
    const response = await axios.get<{
      result: string;
      user_data: any;
    }>(
      `${CONFIG.url}/users/get_user_info/${username}`
    );

    if (response.data.result === 'success') {
      console.log("get user info success");
      return response;
    }
    console.log("get user info failed");
    return null;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}

