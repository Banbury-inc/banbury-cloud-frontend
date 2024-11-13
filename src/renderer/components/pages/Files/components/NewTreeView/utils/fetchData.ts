import axios from 'axios';
import fs from 'fs';
import { DatabaseData } from '../types';
import { useState } from 'react';
import { useAuth } from '../../../../../../context/AuthContext';
import { CONFIG } from '../../../../../../config/config';

export async function fetchData(
  username: string | null,
  disableFetch: boolean,
  snapshot_json: string,
  global_file_path: string,
  callbacks: {
    setFirstname: (name: string) => void,
    setLastname: (name: string) => void,
    setFileRows: (rows: DatabaseData[]) => void,
    setAllFiles: (files: DatabaseData[]) => void,
    set_Files: (files: DatabaseData[]) => void,
    setIsLoading?: (loading: boolean) => void,
  },
  buildTree: (files: DatabaseData[], devices: any[]) => DatabaseData[]

) {

    console.log("fetching data")

    console.log("global_file_path", global_file_path)

  try {


    const api_url = CONFIG.prod ? 'https://banbury-cloud-backend-prod-389236221119.us-east1.run.app' : 'http://localhost:8080';

    // Step 2: Fetch fresh data from API
    const [userInfoResponse, deviceInfoResponse, fileInfoResponse] = await Promise.all([
      axios.get<{ first_name: string; last_name: string; }>(`${api_url}/getuserinfo/${username}/`),
      axios.get<{ devices: any[]; }>(`${api_url}/getdeviceinfo/${username}/`),
      axios.post<{ files: any[]; }>(`${api_url}/get_files_from_filepath/${username}/`, {
        global_file_path: global_file_path
      })
    ]);

    console.log("deviceInfoResponse", deviceInfoResponse)
    console.log("fileInfoResponse", fileInfoResponse)

    // Update user info
    const { first_name, last_name } = userInfoResponse.data;
    callbacks.setFirstname(first_name);
    callbacks.setLastname(last_name);

    // Process device and file data
    const { devices } = deviceInfoResponse.data;
    const files = fileInfoResponse.data.files;



    // Update UI with fresh data


    const allFilesData = buildTree(files, devices);

    callbacks.setFileRows(allFilesData);
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