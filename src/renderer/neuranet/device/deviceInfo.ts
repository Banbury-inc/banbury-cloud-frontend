import { neuranet } from '../../neuranet'
import si from '../../../../dependency/systeminformation'
import axios from 'axios';
import os from 'os';
import fs from 'fs';
import path from 'path';
import { DateTime } from 'luxon';


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



export function name(): string {
  return os.hostname();
}

export async function storage_capacity(): Promise<number> {
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

export async function cpu_info(): Promise<CPUPerformance> {
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

export async function cpu_usage(): Promise<number> {
  try {
    const cpuData = await si.currentLoad();
    const cpuUsage = cpuData.currentLoad || 0;
    return cpuUsage;
  } catch (error) {
    console.error('Error retrieving CPU usage:', error);
    throw error; // Rethrow error to handle externally
  }
}

export async function gpu_usage(): Promise<number> {
  try {
    const gpuData = await si.graphics();
    const totalUtilization = gpuData.controllers.reduce((total, controller) => total + (controller.utilizationGpu || 0), 0);
    return totalUtilization / gpuData.controllers.length;
  } catch (error) {
    console.error('Error retrieving GPU utilization:', error);
    throw error; // Rethrow error to handle externally
  }
}

export async function ram_usage(): Promise<number> {
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
export async function ram_total(): Promise<number> {
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
export async function ram_free(): Promise<number> {
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


export async function ip_address(): Promise<string> {
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

export function directory_info() {
  const bclouddirectoryName = "BCloud";
  const bclouddirectoryPath = os.homedir() + `/${bclouddirectoryName}`;

  const directoryName = "BCloud";
  const directoryPath = os.homedir() + `/${directoryName}`;




  const filesInfo: any[] = [];

  // Check if the directory exists, create if it does not and create a welcome text file
  if (!fs.existsSync(bclouddirectoryPath)) {
    fs.mkdirSync(bclouddirectoryPath, { recursive: true });
    const welcomeFilePath = path.join(bclouddirectoryPath, "welcome.txt");
    fs.writeFileSync(welcomeFilePath,
      "Welcome to Banbury Cloud! This is the directory that will contain all of the files " +
      "that you would like to have in the cloud and streamed throughout all of your devices. " +
      "You may place as many files in here as you would like, and they will appear on all of " +
      "your other devices."
    );
  }
  function getFileKind(filename: string) {
    const ext = path.extname(filename).toLowerCase();
    const fileTypes: { [key: string]: string } = {
      '.png': 'Image',
      '.jpg': 'Image',
      '.JPG': 'Image',
      '.jpeg': 'Image',
      '.gi': 'Image',
      '.bmp': 'Image',
      '.svg': 'Image',
      '.mp4': 'Video',
      '.mov': 'Video',
      '.webm': 'Video',
      '.avi': 'Video',
      '.mkv': 'Video',
      '.wmv': 'Video',
      '.flv': 'Video',
      '.mp3': 'Audio',
      '.wav': 'Audio',
      '.aac': 'Audio',
      '.flac': 'Audio',
      '.ogg': 'Audio',
      '.wma': 'Audio',
      '.pdf': 'Document',
      '.doc': 'Document',
      '.docx': 'Document',
      '.xls': 'Document',
      '.xlsx': 'Document',
      '.ppt': 'Document',
      '.pptx': 'Document',
      '.txt': 'Text',
      '.csv': 'Data',
      '.json': 'Data',
      '.xml': 'Data',
      '.zip': 'Archive',
      '.rar': 'Archive',
      '.7z': 'Archive',
      '.tar': 'Archive',
      '.gz': 'Archive',
      '.exe': 'Executable',
      '.dll': 'Executable',
      '.sh': 'Script',
      '.cpp': 'Script',
      '.ts': 'Script',
      '.bat': 'Script',
      '.rs': 'Script',
      '.py': 'Script',
      '.js': 'Script',
      '.html': 'Web',
      '.css': 'Web',
      // Add more file extensions as needed
    };
    return fileTypes[ext] || 'unknown';
  }
  // Recursive function to get file info
  function traverseDirectory(currentPath: any) {
    const files = fs.readdirSync(currentPath);
    for (const filename of files) {
      const filePath = path.join(currentPath, filename);
      const stats = fs.statSync(filePath);

      try {
        // Determine if it is a file or directory and push appropriate info to filesInfo
        const fileInfo = {
          "file_type": stats.isDirectory() ? "directory" : "file",
          "file_name": filename,
          "file_path": filePath,
          "date_uploaded": DateTime.fromMillis(stats.birthtimeMs).toFormat('yyyy-MM-dd HH:mm:ss'),
          "date_modified": DateTime.fromMillis(stats.mtimeMs).toFormat('yyyy-MM-dd HH:mm:ss'),
          "file_size": stats.isDirectory() ? 0 : stats.size,  // Size is 0 for directories
          "file_priority": 1,
          "file_parent": path.dirname(filePath),
          "original_device": os.hostname(),  // Assuming the current device name as the original device
          "kind": stats.isDirectory() ? 'Folder' : getFileKind(filename),

        };
        filesInfo.push(fileInfo);

        // If it's a directory, recurse into it
        if (stats.isDirectory()) {
          traverseDirectory(filePath);
        }
      }
      catch (error) {
        console.error('Error reading file:', error);
      }
    }
  }

  // Start traversing from the root directory
  traverseDirectory(directoryPath);
  console.log(filesInfo);
  return filesInfo;
}

