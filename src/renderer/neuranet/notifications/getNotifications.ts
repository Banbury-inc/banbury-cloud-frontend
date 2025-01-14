import axios from 'axios';
import { neuranet } from '..';
import { CONFIG } from '../../config/config';



export async function getNotifications(username: string) {
    try {
        const deviceName = neuranet.device.name();
        const url = `${CONFIG.url}/notifications/get_notifications/${username}/`;

        const response = await axios.get(url);

        switch (response.data.result) {
            case 'success':
                console.log("get notifications success");
                return response.data.notifications;

            case 'fail':
                console.log("get notifications failed");
                throw new Error('Failed to fetch notifications');

            case 'task_already_exists':
                console.log("task already exists");
                throw new Error('Task already exists');

            default:
                console.log("Unknown error occurred");
                throw new Error('Unknown error occurred');
        }
    } catch (error) {
        console.error('Error fetching notifications:', error);
        throw error;
    }
}

