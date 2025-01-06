import axios from 'axios';
import { CONFIG } from '../../config/config';

export async function sendFriendRequest(
  username: string,
  friend_username: string
) {

  try {

    const response = await axios.post<{
      result: string;
    }>(`${CONFIG.url}/users/send_friend_request/`, {
      username: username,
      friend_username: friend_username
    });

    const result = response.data.result;
    if (result === 'success') {
      console.log("send friend request success");
      return 'success';
    }
    if (result === 'fail') {
      console.log("send friend request failed");
      return 'failed';
    }
    if (result === 'user_already_exists') {
      console.log("user already exists");
      return 'exists';
    }

    else {
      console.log("register failed");
      return 'register failed';
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

