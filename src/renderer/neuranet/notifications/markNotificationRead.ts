import axios from 'axios';
import { neuranet } from '..'
import * as DateUtils from '../../utils/dateUtils';
import { useAuth } from '../../context/AuthContext';
import { CONFIG } from '../../config/config';


export async function markNotificationAsRead(
    notification_id: string,
) {
    let url = `${CONFIG.url}/notifications/mark_notification_as_read/`;
    const response = await axios.post<{ result: string; }>(url, {
        notification_id: notification_id,
    });
    console.log(response);
    const result = response.data.result;
    console.log(result);

    if (result === 'success') {

        console.log("mark notification as read success");

        return result;
    }
    if (result === 'fail') {
        console.log("mark notification as read failed");
        return 'failed';
    }
    else {
        console.log("mark notification as read failed");
        console.log(result);
        return 'failed';
    }
}

