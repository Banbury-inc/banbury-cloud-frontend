import axios from 'axios';
import fs from 'fs';
import { useEffect, useState } from 'react';
import { fileWatcherEmitter } from '../../../../neuranet/device/watchdog';
import path from 'path';
import os from 'os';
import { fetchDeviceData } from '../utils/fetchDeviceData';
import { fetchFileSyncData } from '../utils/fetchFileSyncData';

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
  sync_files: any,
  devices: any,
  setDevices: (devices: any[]) => void,
) => {
  const [isLoading, setIsLoading] = useState(true);
  const [allFiles, setAllFiles] = useState<any[]>([]);
  const [fileRows, setFileRows] = useState<any[]>([]);

  // Initial load effect
  useEffect(() => {
    const fetchInitialData = async () => {
      const sync_files_data = await fetchFileSyncData(username || '', global_file_path || '', {
        setFirstname,
        setLastname,
        setFileRows,
        setAllFiles,
        setIsLoading,
        set_Files,
        cache: new Map(),
      });

      if (sync_files_data) {
        setFileRows(sync_files_data);
        setAllFiles(sync_files_data);
      }
      setIsLoading(false);
    };

    fetchInitialData();
  }, [updates]); // Empty dependency array for initial load

  // Reset everything when updates change
  useEffect(() => {
    setIsLoading(true);
    setFileRows([]);
    setAllFiles([]);
  }, [updates]);

  console.log('fallFiles', allFiles);
  console.log('sync_files', sync_files);
  console.log('fileRows', fileRows);
  console.log('updates', updates);

  const set_Files = (files: any[]) => {
    console.log('files', files);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!devices || !files) {
        fetchDeviceData(username || '', disableFetch, global_file_path || '', {
          setFirstname,
          setLastname,
          setDevices,
        });
        return;
      }

      const sync_files_data = await fetchFileSyncData(username || '', global_file_path || '', {
        setFirstname,
        setLastname,
        setFileRows,
        setAllFiles,
        set_Files,
        setIsLoading,
        cache: new Map(),
      });

      if (sync_files_data) {
        setFileRows([]);
        setFileRows(sync_files_data);
      }

      setIsLoading(false);
    };

    fetchData();
  }, [global_file_path, global_file_path_device, files, sync_files, devices, disableFetch, username, updates]);

  return { isLoading, allFiles, fileRows, setAllFiles };
};


