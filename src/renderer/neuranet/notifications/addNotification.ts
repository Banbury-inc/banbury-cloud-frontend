import axios from 'axios';
import { neuranet } from '..'
import * as DateUtils from '../../utils/dateUtils';
import { useAuth } from '../../context/AuthContext';
import { CONFIG } from '../../config/config';


export async function addNotification(
    username: string,
    notification: {
        type: string;
        title: string;
        description: string;
        timestamp: Date;
        read: boolean;
    },
) {


    let user = username;

    let device_name = neuranet.device.name();
    console.log(notification);


    let url = `${CONFIG.url}/notifications/add_notification/${username}/`;



    const response = await axios.post<{ result: string; username: string; }>(url, {
        device_name: device_name,
        notification: notification,
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

