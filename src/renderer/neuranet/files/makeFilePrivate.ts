
import axios from 'axios';
import { neuranet } from '..'
import * as DateUtils from '../../utils/dateUtils';
import { useAuth } from '../../context/AuthContext';
import { CONFIG } from '../../config/config';


export async function makeFilePrivate(
    username: string | null,
    file_name: string,
    device_name: string,
) {

    console.log('makeFilePrivate called with file_name: ', file_name, 'username: ', username);
    let user = username;
    let url = ''
    try {
        url = `${CONFIG.url}/files/make_file_private/`;
        const response = await axios.post<{ status: string; message: string; }>(url, {
            file_name: file_name,
            username: username,
            device_name: device_name,
        });
        const status = response.data.status;

        if (status === 'success') {

            return response;
        }
        if (status === 'fail') {
            return 'make_file_private failed';
        }

        else {
            return 'make_file_private failed';
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        return 'error'; // Ensure an error is returned if the request fails
    }
}

