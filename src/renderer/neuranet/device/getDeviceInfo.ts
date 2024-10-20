import { neuranet } from '../../neuranet'

export async function getDeviceInfo() {
    try {
        const [
            usbDevices,
            storageCapacity,
            deviceManufacturer,
            deviceModel,
            deviceVersion,
            cpuInfoManufacturer,
            cpuInfoBrand,
            cpuInfoSpeed,
            cpuInfoCores,
            cpuInfoPhysicalCores,
            cpuInfoProcessors,
            cpuUsage,
            gpuUsage,
            ramUsage,
            ramTotal,
            ramFree,
            ipAddress,
            batteryStatus,
            batteryTimeRemaining,
            uploadSpeed,
            downloadSpeed,
            bluetoothStatus
        ] = await Promise.all([
            neuranet.device.usb_devices(),
            neuranet.device.storage_capacity(),
            neuranet.device.device_manufacturer(),
            neuranet.device.device_model(),
            neuranet.device.device_version(),
            neuranet.device.cpu_info_manufacturer(),
            neuranet.device.cpu_info_brand(),
            neuranet.device.cpu_info_speed(),
            neuranet.device.cpu_info_cores(),
            neuranet.device.cpu_info_physicalCores(),
            neuranet.device.cpu_info_processors(),
            neuranet.device.cpu_usage(),
            neuranet.device.gpu_usage(),
            neuranet.device.ram_usage(),
            neuranet.device.ram_total(),
            neuranet.device.ram_free(),
            neuranet.device.ip_address(),
            neuranet.device.battery_status(),
            neuranet.device.battery_time_remaining(),
            neuranet.device.upload_speed(),
            neuranet.device.download_speed(),
            neuranet.device.bluetooth_status()
        ]);

        return {
            usbDevices,
            storageCapacity,
            deviceManufacturer,
            deviceModel,
            deviceVersion,
            cpuInfoManufacturer,
            cpuInfoBrand,
            cpuInfoSpeed,
            cpuInfoCores,
            cpuInfoPhysicalCores,
            cpuInfoProcessors,
            cpuUsage,
            gpuUsage,
            ramUsage,
            ramTotal,
            ramFree,
            ipAddress,
            batteryStatus,
            batteryTimeRemaining,
            uploadSpeed,
            downloadSpeed,
            bluetoothStatus,
        };
    } catch (error) {
        console.error('Error fetching device info:', error);
        throw error; // Re-throw the error for the caller to handle
    }
}
