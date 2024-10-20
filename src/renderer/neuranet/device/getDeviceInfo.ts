import { neuranet } from '../../neuranet'

export async function getDeviceInfo() {
    try {
        const [
            usb_devices,
            storage_capacity_gb,
            device_manufacturer,
            device_model,
            device_version,
            cpu_info_manufacturer,
            cpu_info_brand,
            cpu_info_speed,
            cpu_info_cores,
            cpu_info_physical_cores,
            cpu_info_processors,
            cpu_usage,
            gpu_usage,
            ram_usage,
            ram_total,
            ram_free,
            ip_address,
            battery_status,
            battery_time_remaining,
            upload_speed,
            download_speed,
            bluetooth_status
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
            usb_devices,
            storage_capacity_gb,
            device_manufacturer,
            device_model,
            device_version,
            cpu_info_manufacturer,
            cpu_info_brand,
            cpu_info_speed,
            cpu_info_cores,
            cpu_info_physical_cores,
            cpu_info_processors,
            cpu_usage,
            gpu_usage,
            ram_usage,
            ram_total,
            ram_free,
            ip_address,
            battery_status,
            battery_time_remaining,
            upload_speed,
            download_speed,
            bluetooth_status,
        };
    } catch (error) {
        console.error('Error fetching device info:', error);
        throw error; // Re-throw the error for the caller to handle
    }
}
