import axios from 'axios';
import { CONFIG } from '../../config/config';

export async function removeFriend(
  username: string,
  friend_username: string
) {

  try {

    const response = await axios.post<{
      result: string;
    }>(`${CONFIG.url}/users/remove_friend/`, {
      username: username,
      friend_username: friend_username
    });

    const result = response.data.result;
    if (result === 'success') {
      console.log("remove friend success");
      return 'success';
    }
    if (result === 'fail') {
      console.log("remove friend failed");
      return 'failed';
    }

    else {
      console.log("remove friend failed");
      return 'remove friend failed';
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

