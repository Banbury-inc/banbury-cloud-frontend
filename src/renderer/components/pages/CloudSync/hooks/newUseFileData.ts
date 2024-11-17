import axios from 'axios';
import fs from 'fs';
import { useEffect, useState } from 'react';
import { fileWatcherEmitter } from '../../../../neuranet/device/watchdog';
import path from 'path';
import os from 'os';
import { fetchDeviceData } from '../utils/fetchDeviceData';

const file_name: string = 'mmills_database_snapshot.json';
const directory_name: string = 'BCloud';
const directory_path: string = path.join(os.homedir(), directory_name);
const snapshot_json: string = path.join(directory_path, file_name);

export const newUseFileData = (
  username: string | null,
  disableFetch: boolean,
  updates: number,
  global_file_path: string | null,
  global_file_path_device: string | null,
  setFirstname: (name: string) => void,
  setLastname: (name: string) => void,
  files: any,
  devices: any,
  setDevices: (devices: any[]) => void,
) => {
  const [isLoading, setIsLoading] = useState(true);
  const [allFiles, setAllFiles] = useState<any[]>([]);
  const [fileRows, setFileRows] = useState<any[]>([]);




  // Helper function to map devices to files
  const mapDevicesToFiles = (devices: any[], files: any[]) => {
    return devices.flatMap((device, deviceIndex) => {
      const deviceFiles = files.filter((file) => file.device_name === device.device_name);
      return deviceFiles.map((file, fileIndex) => ({
        id: `${device.device_name}-${file.file_path}-${deviceIndex}-${fileIndex}`,
        file_name: file.file_name,
        file_size: file.file_size,
        kind: file.kind,
        file_path: file.file_path,
        date_uploaded: file.date_uploaded,
        deviceID: (deviceIndex + 1).toString(),
        device_name: device.device_name,
        helpers: 0,
        available: device.online ? 'Available' : 'Unavailable',
      }));
    });
  };




  // Filter files effect
  useEffect(() => {
    if (!devices || !files) {
      // Fetch devices if they're not available
      fetchDeviceData(username || '', disableFetch, global_file_path || '', {
        setFirstname,
        setLastname,
        setDevices,
      })
        .then((new_devices) => {
          if (new_devices) {
            setDevices(new_devices);
          }
        })
        .catch((error) => {
          console.error("Error fetching device data:", error);
        });
      return;
    }

    // First map devices to files to include availability
    const allFilesData = mapDevicesToFiles(devices, files);
    setAllFiles(allFilesData);

    // Then filter the mapped files
    const file_path = global_file_path?.split('/').slice(3).join('/');
    const pathToShow = '/' + (file_path || '/');
    const pathSegments = pathToShow.split('/').filter(Boolean).length;

    const filteredFiles = allFilesData.filter((file: any) => {
      if (!global_file_path && !global_file_path_device) {
        return true; // Show all files
      }

      if (!global_file_path && global_file_path_device) {
        return file.device_name === global_file_path_device; // Filter by device
      }

      if (!file.file_path) {
        return false; // Skip files with undefined filePath
      }

      const fileSegments = file.file_path.split('/').filter(Boolean).length;
      const isInSameDirectory = file.file_path.startsWith(pathToShow) && fileSegments === pathSegments + 1;
      const isFile = file.file_path === pathToShow && file.kind !== 'Folder';

      return isInSameDirectory || isFile;
    });

    console.log('Filtered files:', filteredFiles);
    setFileRows(filteredFiles);

    if (isLoading) {
      setIsLoading(false);
    }

  }, [global_file_path, global_file_path_device, files, devices, disableFetch, username, setFirstname, setLastname, setDevices]);






  return {
    isLoading,
    allFiles,
    fileRows,
    setAllFiles,
  };
}; 


