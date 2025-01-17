import { neuranet } from "../../../neuranet";
import { useAuth } from "../../../context/AuthContext";

export const getSyncFolders = async (devices: any[], username: string) => {
    const deviceId = await neuranet.device.getDeviceId(username || 'default');
    const device = devices?.find((device) => device._id === deviceId);
    const scannedFolders = device?.scanned_folders || [];

    // Get scan progress from device if available
    const scanProgress = device?.scan_progress || {};

    // Transform scanned folders into the required format
    const syncingFiles = scannedFolders.map((folder: any) => ({
        filename: folder,
        progress: scanProgress[folder] || 100,
        speed: scanProgress[folder] < 100 ? 'Scanning...' : 'Synced'
    }));

    return {
        syncingFiles,
        recentlyChanged: []
    };
};