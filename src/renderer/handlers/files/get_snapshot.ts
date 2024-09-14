
import { useState, useEffect } from 'react';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { CONFIG } from '../../config/config';
import os from 'os';

export async function get_snapshot(username: any) {

  const fullDeviceSync = CONFIG.full_device_sync;
  const skipDotFiles = CONFIG.skip_dot_files;

  // Determine the directory path based on the fullDeviceSync flag
  const bcloudDirectoryPath = fullDeviceSync ? os.homedir() : path.join(os.homedir(), 'BCloud');
  console.log(bcloudDirectoryPath);


  try {
    // Step 1: Fetch user information
    const userInfoResponse = await axios.get<{
      first_name: string;
      last_name: string;
      phone_number: string;
      email: string;
    }>(`https://website2-389236221119.us-central1.run.app/getuserinfo/${username}/`);

    const { first_name, last_name } = userInfoResponse.data;

    // Step 2: Fetch device information
    const deviceInfoResponse = await axios.get<{
      devices: any[];
    }>(`https://website2-389236221119.us-central1.run.app/getdeviceinfo/${username}/`);

    const { devices } = deviceInfoResponse.data;

    // Step 3: Fetch files for all devices
    const fileInfoResponse = await axios.get<{
      files: any[];
    }>(`https://website2-389236221119.us-central1.run.app/getfileinfo/${username}/`);

    const { files } = fileInfoResponse.data;

    // Combine devices with their associated files
    const allFilesData = devices.flatMap((device, index) => {
      const deviceFiles = files.filter(file => file.device_name === device.device_name);
      return deviceFiles.map((file, fileIndex) => ({
        id: index * 1000 + fileIndex,
        file_name: file.file_name,
        kind: file.kind,
        file_path: file.file_path,
        date_uploaded: file.date_uploaded,
        date_modified: file.date_modified,
        deviceID: (index + 1).toString(), // Convert deviceID to string
        original_device: device.device_name,
      }));
    });


    // Step 4: Prepare snapshot data for saving
    const snapshot = {
      user: {
        firstName: first_name,
        lastName: last_name,
      },
      devices: devices.map((device, index) => ({
        id: (index + 1).toString(),
        deviceName: device.device_name,
        available: device.online ? 'Available' : 'Unavailable',
      })),
      files: allFilesData,
    };

    // Step 5: Save snapshot as a JSON file
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], {
      type: 'application/json',
    });

    // Save snapshot to a JSON file
    const snapshotFilePath = path.join(bcloudDirectoryPath, `${username}_database_snapshot.json`);
    fs.writeFileSync(snapshotFilePath, JSON.stringify(allFilesData, null, 2));




  } catch (error) {
    console.error('Error fetching data:', error);
    let result = 'error';
  } finally {
  }

  let result = 'success';
  return result
}

get_snapshot('mmills');
