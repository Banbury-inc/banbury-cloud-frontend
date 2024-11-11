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

export default function AddFileToSyncButton() {
  const [loading, setLoading] = useState(false);
  const { username, tasks, setTasks, setTaskbox_expanded } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleFolderSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {

    const file = event.target.files ? event.target.files[0] : null;
    if (!file) return;

    setLoading(true);
    try {
      // Get the folder path from the first file
      const entirepath = file.webkitRelativePath;
      const folderPath = file.webkitRelativePath.split('/')[0];
      const absoluteFolderPath = path.dirname(file.path);

      // Add the selected folder as a scanned folder
      let task_description = `Adding file to sync: ${absoluteFolderPath}`;
      let taskInfo = await neuranet.sessions.addTask(username ?? '', task_description, tasks, setTasks);
      setTaskbox_expanded(true);

      const addResult = await neuranet.device.add_file_to_sync(absoluteFolderPath, username ?? '');

      if (addResult === 'success') {
        await neuranet.sessions.completeTask(username ?? '', taskInfo, tasks, setTasks);
      }
    } catch (error) {
      console.error('Error selecting folder:', error);
    } finally {
      setLoading(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFolderSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <Tooltip title="Add File to File Sync">
      <LoadingButton
        onClick={triggerFolderSelect}
        loading={loading}
        loadingPosition="end"
        sx={{ paddingLeft: '4px', paddingRight: '4px', minWidth: '30px' }}
      >
        <CreateNewFolderOutlinedIcon
        fontSize="inherit" />
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFolderSelect}
          style={{ display: 'none' }}
          webkitdirectory=""
          directory=""
        />
      </LoadingButton>
    </Tooltip>
  );
}
