import React, { useState, useEffect, useRef } from 'react';
import { Button, Popover, Box, Typography, Stack, Autocomplete, TextField, Chip, Paper, Badge, CircularProgress, Switch, LinearProgress, IconButton } from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import LinkIcon from '@mui/icons-material/Link';
import { styled } from '@mui/material/styles';
import { handlers } from '../../../handlers';
import { neuranet } from '../../../neuranet';
import { useAuth } from '../../../context/AuthContext';
import CheckIcon from '@mui/icons-material/Check';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LockIcon from '@mui/icons-material/Lock';
import { CONFIG } from '../../../config/config';
import SyncIcon from '@mui/icons-material/Sync';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import SearchIcon from '@mui/icons-material/Search';
import { getSyncFolders } from './getSyncFolders';
import path from 'path';
import CloseIcon from '@mui/icons-material/Close';
import { Alert, AlertTitle, AlertDescription } from '../../../../components/alert';




export default function SyncButton() {
  const [syncData, setSyncData] = useState<{
    syncingFiles: any[];
    recentlyChanged: any[];
  }>({ syncingFiles: [], recentlyChanged: [] });
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const { username, devices, tasks, setTasks } = useAuth();
  const [error, setError] = useState<string | null>('Test notification');

  useEffect(() => {
    // Show notification on component mount
    // setError('Welcome to Banbury Cloud!');

    // Optional: Hide after 5 seconds
    setTimeout(() => setError(null), 50000);
  }, []); // Empty dependency array means this runs once on mount

  const handleClick = async (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    // Fetch folders to display, but don't start scanning
    const syncFolders = await getSyncFolders(devices || [], username || '');
    // Initialize folders while preserving existing progress
    const foldersWithProgress = {
      ...syncFolders,
      syncingFiles: syncFolders.syncingFiles.map((f: any) => {
        const existingFile = syncData.syncingFiles.find(ef => ef.filename === f.filename);
        return {
          ...f,
          progress: existingFile ? existingFile.progress : 0,
          speed: existingFile ? existingFile.speed : undefined
        };
      })
    };
    setSyncData(foldersWithProgress);
  };

  const handleFolderSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (!file) return;

    try {
      // Get the folder path from the first file
      const entirepath = file.webkitRelativePath;
      const folderPath = file.webkitRelativePath.split('/')[0];
      const absoluteFolderPath = path.dirname(file.path);

      // Add the selected folder as a scanned folder
      let task_description = `Adding scanned folder: ${absoluteFolderPath}`;
      let taskInfo = await neuranet.sessions.addTask(username ?? '', task_description, tasks, setTasks);

      const addResult = await neuranet.device.add_scanned_folder(absoluteFolderPath, username ?? '');

      if (addResult === 'success') {
        console.log('addResult', addResult);
        await neuranet.sessions.completeTask(username ?? '', taskInfo, tasks, setTasks);
        // Get fresh devices data first
        const updatedDevices = await neuranet.device.fetchDeviceData(username ?? '');
        // Then get updated folders with fresh device data
        const updatedFolders = await getSyncFolders(updatedDevices || [], username || '');
        setSyncData(updatedFolders);
      }
    } catch (err) {
      handleError('Failed to sync folder. Please try again.');
    }
  };

  const triggerFolderSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSyncClick = async () => {
    setIsScanning(true);

    // Only reset progress for folders that haven't completed scanning
    setSyncData(prev => ({
      ...prev,
      syncingFiles: prev.syncingFiles.map(f => ({
        ...f,
        progress: f.progress === 100 ? 100 : 0,
        speed: f.progress === 100 ? 'Synced' : undefined
      }))
    }));

    for (const file of syncData.syncingFiles) {
      // Skip already synced files
      if (file.progress === 100) continue;

      let task_description = 'Scanning folder';
      let taskInfo = await neuranet.sessions.addTask(username ?? '', task_description, tasks, setTasks);

      // Update local state to show scanning started
      setSyncData(prev => ({
        ...prev,
        syncingFiles: prev.syncingFiles.map(f =>
          f.filename === file.filename
            ? { ...f, progress: 0, speed: 'Starting scan...' }
            : f
        )
      }));

      try {
        let result = await neuranet.device.scanFolder(
          username ?? '',
          file.filename,
          (progress, speed) => {
            console.log('Progress update:', progress, speed);
            setSyncData(prev => ({
              ...prev,
              syncingFiles: prev.syncingFiles.map(f =>
                f.filename === file.filename
                  ? { ...f, progress: Math.min(100, progress), speed }
                  : f
              )
            }));
          }
        );

        if (result === 'success') {
          let task_result = await neuranet.sessions.completeTask(username ?? '', taskInfo, tasks, setTasks);
        }
      } catch (error) {
        console.error('Sync error:', error);
      }
    }
    setIsScanning(false);
  };

  const handleClose = () => {
    setAnchorEl(null);
    // Remove the reset of scanning state and progress
    // setIsScanning(false);
    // setSyncData(prev => ({
    //   ...prev,
    //   syncingFiles: prev.syncingFiles.map(f => ({ ...f, progress: 0, speed: undefined }))
    // }));
  };

  const handleRemoveFolder = async (folderPath: string) => {
    try {
      let task_description = `Removing folder: ${folderPath}`;
      let taskInfo = await neuranet.sessions.addTask(username ?? '', task_description, tasks, setTasks);

      const removeResult = await neuranet.device.remove_scanned_folder(folderPath, username ?? '');

      if (removeResult === 'success') {
        await neuranet.sessions.completeTask(username ?? '', taskInfo, tasks, setTasks);
        // Get fresh devices data first
        const updatedDevices = await neuranet.device.fetchDeviceData(username ?? '');
        // Then get updated folders with fresh device data
        const updatedFolders = await getSyncFolders(updatedDevices || [], username || '');
        setSyncData(updatedFolders);
      }
    } catch (error) {
      console.error('Error removing folder:', error);
    }
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    // Auto-hide the error after 5 seconds
    setTimeout(() => setError(null), 5000);
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        webkitdirectory=""
        directory=""
        multiple
        onChange={handleFolderSelect}
      />

      <Button
        onClick={handleClick}
        sx={{ paddingLeft: '4px', paddingRight: '4px', minWidth: '30px' }}
      >
        <SyncIcon fontSize="inherit" />
      </Button>

      <Alert
        open={error !== null}
        onClose={() => setError(null)}
        size="sm"
        className="fixed top-4 right-4 z-50 max-w-md animate-in fade-in slide-in-from-top-2 duration-300"
      >
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error}
        </AlertDescription>
      </Alert>

      <Popover
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        PaperProps={{
          sx: {
            backgroundColor: '#000000',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            mt: 1,
            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.3)',
            '& .MuiTypography-root': {
              color: '#ffffff',
            },
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Button
            onClick={triggerFolderSelect}
            startIcon={<CreateNewFolderIcon fontSize="inherit" />}
            sx={{
              mr: 2, mb: 2, width: '100%',
              justifyContent: 'flex-start',
              padding: '12px 16px',
              borderRadius: '8px',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
              },
            }}
          >
            <Typography fontSize="body1">Add Folder</Typography>
          </Button>

          <Stack spacing={2}>
            {/* Folders Section */}
            {syncData.syncingFiles.length > 0 && (
              <>
                <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Folders
                </Typography>
                {syncData.syncingFiles.map((file, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                      <FolderIcon />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" noWrap>{file.filename}</Typography>
                        {isScanning && file.speed && (
                          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                            {file.speed}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    {isScanning && (
                      <>
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'rgba(255, 255, 255, 0.7)',
                            minWidth: '35px',
                            textAlign: 'right',
                            mr: 1
                          }}
                        >
                          {`${Math.round(file.progress)}%`}
                        </Typography>
                        <Box sx={{ width: '100px' }}>
                          <LinearProgress
                            variant="determinate"
                            value={file.progress}
                            sx={{
                              backgroundColor: 'rgba(255, 255, 255, 0.1)',
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: '#ffffff'
                              }
                            }}
                          />
                        </Box>
                      </>
                    )}
                    <IconButton
                      onClick={() => handleRemoveFolder(file.filename)}
                      size="small"
                      sx={{
                        color: 'rgba(255, 255, 255, 0.5)',
                        '&:hover': {
                          color: 'rgba(255, 255, 255, 0.8)',
                          backgroundColor: 'rgba(255, 255, 255, 0.08)'
                        }
                      }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </>
            )}

            {/* Loading status */}
            {syncData.syncingFiles.length === 0 && (
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                color: '#2fca45',
                mt: 1
              }}>
                <Typography>Loading...</Typography>
              </Box>
            )}
          </Stack>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button
              variant="contained"
              size="small"
              sx={{
                fontSize: '12px',
              }}
              onClick={handleSyncClick}
              disabled={isScanning}
              startIcon={<SearchIcon />}
            >
              {isScanning ? 'Scanning...' : 'Scan'}
            </Button>
          </Box>
        </Box>
      </Popover>
    </>
  );
}

// Helper component for file icons
function FileIcon({ filename }: { filename: string }) {
  // Add logic to determine icon based on file extension
  return (
    <Box
      sx={{
        width: 32,
        height: 32,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 1,
      }}
    >
      <InsertDriveFileIcon sx={{ fontSize: 20, color: 'rgba(255, 255, 255, 0.7)' }} />
    </Box>
  );
}
