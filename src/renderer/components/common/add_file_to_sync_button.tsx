import React, { useState, useRef } from 'react';

import { Tooltip } from '@mui/material';
import CreateNewFolderOutlinedIcon from '@mui/icons-material/CreateNewFolderOutlined';
import LoadingButton from '@mui/lab/LoadingButton';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import { useAuth } from '../../context/AuthContext';
import { neuranet } from '../../neuranet';
import path from 'path';
// Extend the InputHTMLAttributes interface to include webkitdirectory and directory
declare module 'react' {
  interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
    webkitdirectory?: string;
    directory?: string;
  }
}

export default function AddFileToSyncButton({ selectedFileNames }: { selectedFileNames: string[] }) {
  const [loading, setLoading] = useState(false);
  const { username, tasks, setTasks, setTaskbox_expanded } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);


  const handleAddFileToSync = async () => {
  setLoading(true);

    for (const file of selectedFileNames) {

      try {

        console.log("file", file);

        // Add the selected folder as a scanned folder
        let task_description = `Adding file to sync: ${file}`;
        let taskInfo = await neuranet.sessions.addTask(username ?? '', task_description, tasks, setTasks);
        setTaskbox_expanded(true);

        const addResult = await neuranet.device.add_file_to_sync(file, username ?? '');

        if (addResult === 'success') {
          await neuranet.sessions.completeTask(username ?? '', taskInfo, tasks, setTasks);
        }
      } catch (error) {
        console.error('Error selecting folder:', error);
      }
    }
    try {
      setLoading(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error setting loading to false:', error);
    }
  };


  return (
    <Tooltip title="Add File to File Sync">
      <LoadingButton
        onClick={handleAddFileToSync}
        loading={loading}
        loadingPosition="end"
        sx={{ paddingLeft: '4px', paddingRight: '4px', minWidth: '30px' }}
      >
        <CreateNewFolderOutlinedIcon
          fontSize="inherit"
        />
      </LoadingButton>
    </Tooltip>
  );
}
