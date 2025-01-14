import { handlers } from "../../../handlers";
import { neuranet } from "../../../neuranet";

export async function fetchNotifications(username: string, setNotifications: (notifications: any) => void) {
    const response = await neuranet.notifications.getNotifications(username);
    console.log("notifications", response.notifications);
    setNotifications(response.notifications);
}
