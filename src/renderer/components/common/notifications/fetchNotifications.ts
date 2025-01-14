import { handlers } from "../../../handlers";
import { neuranet } from "../../../neuranet";

export async function fetchNotifications(username: string, setNotifications: (notifications: any) => void) {
    try {
        const response = await neuranet.notifications.getNotifications(username);
        setNotifications(response.notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
    }
}
