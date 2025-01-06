import axios from 'axios';
import { CONFIG } from '../../config/config';

interface UserSearchResponse {
  result: string;
  users?: Array<{
    id: number;
    first_name: string;
    last_name: string;
    status: string;
    username: string;
  }>;
}

export async function typeahead(query: string) {
  try {
    const response = await axios.get<UserSearchResponse>(
      `${CONFIG.url}/users/typeahead/${query}`
    );

    if (response.data.result === 'success') {
      console.log("typeahead success");
      return response;
    }
    console.log("typeahead failed");
    return null;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}

