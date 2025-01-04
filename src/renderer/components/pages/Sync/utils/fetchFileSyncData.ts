import axios from 'axios';
import fs from 'fs';
import { DatabaseData } from '../components/NewTreeView/types';
import { useState } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { CONFIG } from '../../../../config/config';



export const fetchFileSyncData = async (
  username: string,
  disableFetch: boolean,
  snapshot_json: string,
  global_file_path: string,
  options: {
    setFirstname: (value: string) => void;
    setLastname: (value: string) => void;
    setFileRows: (value: DatabaseData[]) => void;
    setAllFiles: (value: DatabaseData[]) => void;
    set_Files: (value: any[]) => void;
    setIsLoading: (value: boolean) => void;
    cache: Map<string, DatabaseData[]>;
  },
) => {


  try {

    // Fetch fresh data from API
    const [fileInfoResponse] = await Promise.all([
      axios.post<{ files: any[]; }>(`${CONFIG.url}/predictions/get_files_to_sync/${username}/`, {
        global_file_path: global_file_path
      })
    ]);


    return fileInfoResponse.data.files;


  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    options.setIsLoading(false);
  }
} 
