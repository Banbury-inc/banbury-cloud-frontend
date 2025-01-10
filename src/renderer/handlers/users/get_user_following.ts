import axios from 'axios';
import { CONFIG } from '../../config/config';


export async function getUserFollowing(username: string) {
  try {
    const response = await axios.get<{
      result: string;
      following: any;
    }>(
      `${CONFIG.url}/users/get_user_following/${username}`
    );

    if (response.data.result === 'success') {
      console.log("get user following success");
      return response;
    }
    console.log("get user following failed");
    return null;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}

