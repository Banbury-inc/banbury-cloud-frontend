import axios from 'axios';
import fs from 'fs';
import { DatabaseData } from '../types';

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
    // Step 1: Fetch user information
    const userInfoResponse = await axios.get<{
      first_name: string;
      last_name: string;
      phone_number: string;
      email: string;
    }>(`https://website2-389236221119.us-central1.run.app/getuserinfo/${username}/`);

    const { first_name, last_name } = userInfoResponse.data;
    callbacks.setFirstname(first_name);
    callbacks.setLastname(last_name);

    // Step 2: Fetch device information
    const deviceInfoResponse = await axios.get<{
      devices: any[];
    }>(`https://website2-389236221119.us-central1.run.app/getdeviceinfo/${username}/`);

    const { devices } = deviceInfoResponse.data;

    let files: DatabaseData[] = [];

    // Load snapshot from the JSON file if it exists
    if (fs.existsSync(snapshot_json)) {
      const snapshot = fs.readFileSync(snapshot_json, 'utf-8');
      files = JSON.parse(snapshot);
    }

    // Fetch files for all devices
    const fileInfoResponse = await axios.get<{
      files: any[];
    }>(`https://website2-389236221119.us-central1.run.app/getfileinfo/${username}/`);

    files = fileInfoResponse.data.files;

    // Save the fetched data to a JSON file
    fs.writeFileSync(snapshot_json, JSON.stringify(files, null, 2), 'utf-8');

    const allFilesData = devices.flatMap((device: any, index: any) => {
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

    callbacks.setFileRows([]);
    callbacks.setFileRows(buildTree(allFilesData));

    if (!disableFetch) {
      callbacks.setAllFiles(allFilesData);
    }

    callbacks.set_Files(allFilesData);

    console.log("Local file data loaded");

  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    callbacks.setIsLoading?.(false);
  }
} 