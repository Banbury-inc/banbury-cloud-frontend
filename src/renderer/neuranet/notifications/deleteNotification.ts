import axios from 'axios';
import { neuranet } from '..'
import * as DateUtils from '../../utils/dateUtils';
import { useAuth } from '../../context/AuthContext';
import { CONFIG } from '../../config/config';


export async function deleteNotification(
    notification_id: string,
    username: string,
) {


    let user = username;

    let device_name = neuranet.device.name();

    let url = `${CONFIG.url}/notifications/delete_notification/${username}/`;

    const response = await axios.post<{ result: string; username: string; }>(url, {
        device_name: device_name,
        notification_id: notification_id,
    });
    console.log(response);
    const result = response.data.result;
    console.log(result);

    if (result === 'success') {

        console.log("add device id to file sync success");

        return result;
    }
    if (result === 'fail') {
        console.log("add device id to file sync failed");
        return 'failed';
    }
    if (result === 'task_already_exists') {
        console.log("task already exists");
        return 'exists';
    }

    else {
        console.log("add device id to file sync failed");
        console.log(result);
        return 'task_add failed';
    }
}

