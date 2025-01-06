
import axios from 'axios';
import { neuranet } from '..'
import * as DateUtils from '../../utils/dateUtils';
import { useAuth } from '../../context/AuthContext';
import { CONFIG } from '../../config/config';


export async function shareFile(
    file_name: string,
    username: string,
    friend_username: string,
) {


    console.log('shareFile called with file_name: ', file_name, 'username: ', username, 'friend_username: ', friend_username);


    let user = username;

    let device_name = neuranet.device.name();

    let url = ''

    try {

        url = `${CONFIG.url}/files/share_file/`;


        const response = await axios.post<{ status: string; message: string; }>(url, {
            file_name: file_name,
            username: username,
            friend_username: friend_username,
        });
        const status = response.data.status;

        if (status === 'success') {


            return response;
        }
        if (status === 'fail') {
            return 'share_file failed';
        }

        else {
            return 'share_file failed';
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        return 'error'; // Ensure an error is returned if the request fails
    }
}

