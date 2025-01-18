
import axios from 'axios';
import { neuranet } from '..'
import * as DateUtils from '../../utils/dateUtils';
import { CONFIG } from '../../config/config';

/**
 *
 * @param username
 * @param taskInfo
 */
export async function addFileRequestSuccess() {
  try {

    const url = `${CONFIG.url}/analytics/add_file_request_success/`;
    const response = await axios.post<{ result: string; }>(url, {
    });
    const result = response.data.result;


    if (result === 'success') {
      console.log("file request value updated successfully");
      return response.data.result;
    }
    if (result === 'fail') {
      console.log("file request failed");
      return 'failed';
    }
    else {
      console.log("file request failed");
      return 'file request failed';
    }
  } catch (error) {
    console.error('Error adding file request:', error);
  }
}

