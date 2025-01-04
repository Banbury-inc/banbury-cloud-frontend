import axios from 'axios';
import { CONFIG } from '../../config/config';

export async function registerUser(first_name: string,
  last_name: string,
  username: string,
  password_str: string) {

  try {
    
    const response = await axios.get<{
      result: string;
      username: string;
    }>(`${CONFIG.url}/authentication/new_register/${username}/${password_str}/${first_name}/${last_name}/`, {
    });
    
    const result = response.data.result;
    if (result === 'success') {
      console.log("register success");
      return 'success';
    }
    if (result === 'fail') {
      console.log("register failed");
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

