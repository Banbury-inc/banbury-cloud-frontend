import si from '../../../../../dependency/systeminformation'
import axios from 'axios';
import os from 'os';


interface CPUPerformance {
  manufacturer: string;
  brand: string;
  speed: number;
  cores: number;
  physicalCores: number;
  processors: number;
}


interface memUsage {
  total: number;
  free: number;
  used: number;
  usagePercentage: number;
}



export function get_device_name(): string {
  return os.hostname();
}

export async function get_storage_capacity(): Promise<number> {
  try {
    const diskData = await si.fsSize();
    const totalCapacityBytes = diskData.reduce((total, disk) => total + disk.size, 0);
    const totalCapacityGB = totalCapacityBytes / (1024 * 1024 * 1024); // Convert bytes to GB
    return totalCapacityGB;
  } catch (error) {
    console.error('Error retrieving storage capacity:', error);
    throw error; // Rethrow error to handle externally
  }
}

export async function get_cpu_info(): Promise<CPUPerformance> {
  try {
    const cpuData = await si.cpu();
    const cpuPerformance: CPUPerformance = {
      manufacturer: cpuData.manufacturer || 'Unknown',
      brand: cpuData.brand || 'Unknown',
      speed: cpuData.speed || 0,
      cores: cpuData.cores || 0,
      physicalCores: cpuData.physicalCores || 0,
      processors: cpuData.processors || 0
    };
    return cpuPerformance;
  } catch (error) {
    console.error('Error retrieving CPU performance:', error);
    throw error; // Rethrow error to handle externally
  }
}

export async function get_cpu_usage(): Promise<number> {
  try {
    const cpuData = await si.currentLoad();
    const cpuUsage = cpuData.currentLoad || 0;
    return cpuUsage;
  } catch (error) {
    console.error('Error retrieving CPU usage:', error);
    throw error; // Rethrow error to handle externally
  }
}

export async function get_gpu_usage(): Promise<number> {
  try {
    const gpuData = await si.graphics();
    const totalUtilization = gpuData.controllers.reduce((total, controller) => total + (controller.utilizationGpu || 0), 0);
    return totalUtilization / gpuData.controllers.length;
  } catch (error) {
    console.error('Error retrieving GPU utilization:', error);
    throw error; // Rethrow error to handle externally
  }
}

export async function get_ram_usage(): Promise<number> {
  try {
    const memData = await si.mem();
    const totalMemory = memData.total || 0;
    const usedMemory = memData.used || 0;
    const freeMemory = memData.free || 0;

    const usagePercentage = (usedMemory / totalMemory) * 100;

    const ramUsage: memUsage = {
      total: totalMemory,
      free: freeMemory,
      used: usedMemory,
      usagePercentage: isNaN(usagePercentage) ? 0 : usagePercentage // Handle NaN case
    };

    return isNaN(usagePercentage) ? 0 : usagePercentage; // Handle NaN case
  } catch (error) {
    console.error('Error retrieving RAM usage:', error);
    throw error; // Rethrow error to handle externally
  }
}
export async function get_ram_total(): Promise<number> {
  try {
    const memData = await si.mem();
    const totalMemory = memData.total || 0;
    const usedMemory = memData.used || 0;
    const freeMemory = memData.free || 0;

    const usagePercentage = (usedMemory / totalMemory) * 100;

    const ramUsage: memUsage = {
      total: totalMemory,
      free: freeMemory,
      used: usedMemory,
      usagePercentage: isNaN(usagePercentage) ? 0 : usagePercentage // Handle NaN case
    };

    return isNaN(totalMemory) ? 0 : totalMemory; // Handle NaN case
  } catch (error) {
    console.error('Error retrieving RAM usage:', error);
    throw error; // Rethrow error to handle externally
  }
}
export async function get_ram_free(): Promise<number> {
  try {
    const memData = await si.mem();
    const totalMemory = memData.total || 0;
    const usedMemory = memData.used || 0;
    const freeMemory = memData.free || 0;

    const usagePercentage = (usedMemory / totalMemory) * 100;

    const ramUsage: memUsage = {
      total: totalMemory,
      free: freeMemory,
      used: usedMemory,
      usagePercentage: isNaN(usagePercentage) ? 0 : usagePercentage // Handle NaN case
    };

    return isNaN(freeMemory) ? 0 : freeMemory; // Handle NaN case
  } catch (error) {
    console.error('Error retrieving RAM usage:', error);
    throw error; // Rethrow error to handle externally
  }
}


export async function get_ip_address(): Promise<string> {
  let ip_address: string | null = null;

  try {
    const response = await axios.get('https://httpbin.org/ip');
    const ip_info = response.data;
    const origin: string = ip_info.origin || 'Unknown';
    ip_address = origin.split(',')[0];
  } catch (error) {
    console.error('Error occurred:', error);
    ip_address = 'Unknown';
  }

  return ip_address || 'Unknown';
}


