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


  console.log('files', files)
  console.log('allfiles', allFiles)


  // Helper function to map devices to files
  const mapDevicesToFiles = (devices: any[], files: any[]) => {
    return devices.flatMap((device, index) => {
      const deviceFiles = files.filter((file) => file.device_name === device.device_name);
      return deviceFiles.map((file, fileIndex) => ({
        id: index * 1000 + fileIndex,
        file_name: file.file_name,
        file_size: file.file_size,
        kind: file.kind,
        file_path: file.file_path,
        date_uploaded: file.date_uploaded,
        deviceID: (index + 1).toString(),
        device_name: device.device_name,
        helpers: 0,
        available: device.online ? 'Available' : 'Unavailable',
      }));
    });
  };




  // Filter files effect
  useEffect(() => {
    const pathToShow = global_file_path || '/';
    const pathSegments = pathToShow.split('/').filter(Boolean).length;

    const filteredFiles = files.filter((file: any) => {
      if (!global_file_path && !global_file_path_device) {
        return true; // Show all files
      }

      if (!global_file_path && global_file_path_device) {
        return file.device_name === global_file_path_device; // Show all files for the specified device
      }

      if (!file.file_path) {
        return false; // Skip files with undefined filePath
      }

      const fileSegments = file.file_path.split('/').filter(Boolean).length;
      const isInSameDirectory = file.file_path.startsWith(pathToShow) && fileSegments === pathSegments + 1;
      const isFile = file.file_path === pathToShow && file.kind !== 'Folder';

      return isInSameDirectory || isFile;
    });

    setFileRows(filteredFiles);

    console.log('devices', devices);
    console.log('files', files);

    if (devices && files) {
      const allFilesData = mapDevicesToFiles(devices, files);
      setAllFiles(allFilesData);
    } else {
      fetchDeviceData(username || '', disableFetch, global_file_path || '', {
        setFirstname,
        setLastname,
        setDevices,
      })
        .then((new_devices) => {
          if (new_devices) {
            setDevices(new_devices);
          }
          console.log("new_devices", new_devices);
        })
        .catch((error) => {
          console.error("Error fetching device data:", error);
        });
    }

    // Ensure setIsLoading is only called once after all operations
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