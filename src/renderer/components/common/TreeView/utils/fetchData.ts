import axios from 'axios';
import fs from 'fs';
import { DatabaseData } from '../types';
import { CONFIG } from '../../../../config/config';

export async function fetchData(
  username: string | null,
  disableFetch: boolean,
  snapshot_json: string,
  callbacks: {
    setFirstname: (name: string) => void,
    setLastname: (name: string) => void,
    setFileRows: (rows: DatabaseData[]) => void,
    setAllFiles: (files: DatabaseData[]) => void,
    set_Files: (files: DatabaseData[]) => void,
    setIsLoading?: (loading: boolean) => void,
  },
  buildTree: (files: DatabaseData[]) => DatabaseData[]
) {
  try {
    // Step 1: Load from JSON if exists
    let files: DatabaseData[] = [];
    if (fs.existsSync(snapshot_json)) {
      console.log("Loading from snapshot file");
      const snapshot = fs.readFileSync(snapshot_json, 'utf-8');
      files = JSON.parse(snapshot);
      // Build initial tree from snapshot
      callbacks.set_Files(files);
      callbacks.setFileRows(buildTree(files));
    }

    // Step 2: Fetch fresh data from API
    const api_url = CONFIG.prod ? 'https://banbury-cloud-backend-prod-389236221119.us-east1.run.app' : 'http://localhost:8080';
    const [userInfoResponse, deviceInfoResponse, fileInfoResponse] = await Promise.all([
      axios.get<{ first_name: string; last_name: string; }>(`${api_url}/getuserinfo/${username}/`),
      axios.get<{ devices: any[]; }>(`${api_url}/getdeviceinfo/${username}/`),
      axios.get<{ files: any[]; }>(`${api_url}/getfileinfo/${username}/`)
    ]);

    // Update user info
    const { first_name, last_name } = userInfoResponse.data;
    callbacks.setFirstname(first_name);
    callbacks.setLastname(last_name);

    // Process device and file data
    const { devices } = deviceInfoResponse.data;
    files = fileInfoResponse.data.files;

    // Save new data to snapshot
    fs.writeFileSync(snapshot_json, JSON.stringify(files, null, 2), 'utf-8');

    // Build final tree
    const allFilesData = devices.flatMap((device: any) => {
      const deviceFiles = files.filter(file => file.device_name === device.device_name);
      return deviceFiles.map((file, fileIndex) => ({
        id: `device-${device.device_number}-file-${fileIndex}`,
        file_type: file.file_type,
        file_name: file.file_name,
        file_size: file.file_size,
        file_path: file.file_path,
        kind: file.kind,
        helpers: file.helpers,
        date_uploaded: file.date_uploaded,
        deviceID: device.device_number,
        device_name: device.device_name,
        file_parent: file.file_parent,
        original_device: file.original_device,
        available: device.online ? "Available" : "Unavailable",
      }));
    });

    // Update UI with fresh data
    callbacks.setFileRows(buildTree(allFilesData));
    if (!disableFetch) {
      callbacks.setAllFiles(allFilesData);
    }
    callbacks.set_Files(allFilesData);

    console.log("Data refresh complete");

  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    callbacks.setIsLoading?.(false);
  }
} 