import { neuranet } from '../../neuranet'

export async function get_device_info() {
    const device_info = await neuranet.device.system_info();
    return device_info;
}

