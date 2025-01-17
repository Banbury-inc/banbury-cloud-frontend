import { neuranet } from "../../../neuranet";
import { useAuth } from "../../../context/AuthContext";

export const getSyncFiles = async (devices: any[], username: string) => {
    const deviceId = await neuranet.device.getDeviceId(username || 'default');
    const device = devices?.find((device) => device._id === deviceId);
    const scannedFolders = device?.scanned_folders || [];

    // Transform scanned folders into the required format
    const syncingFiles = scannedFolders.map((folder: any) => ({
        filename: folder,
        progress: 100,
        speed: 'Synced'
    }));

    return {
        syncingFiles,
        recentlyChanged: []
    };
};