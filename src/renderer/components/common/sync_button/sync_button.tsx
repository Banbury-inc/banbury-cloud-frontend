import React, { useState, useEffect } from 'react';
import { Button, Popover, Box, Typography, Stack, Autocomplete, TextField, Chip, Paper, Badge, CircularProgress, Switch, LinearProgress } from '@mui/material';
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




export default function SyncButton() {
  const [syncData, setSyncData] = useState<{
    syncingFiles: any[];
    recentlyChanged: any[];
  }>({ syncingFiles: [], recentlyChanged: [] });
  const [isScanning, setIsScanning] = useState(false);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const { username, devices, tasks, setTasks } = useAuth();

  const handleClick = async (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    // Fetch folders to display, but don't start scanning
    const syncFolders = await getSyncFolders(devices || [], username || '');
    // Initialize all folders with progress: 0
    const foldersWithProgress = {
      ...syncFolders,
      syncingFiles: syncFolders.syncingFiles.map((f: any) => ({ ...f, progress: 0 }))
    };
    setSyncData(foldersWithProgress);
  };

  const handleSyncClick = async () => {
    setIsScanning(true);

    // Reset all folders to 0 progress when starting a new scan
    setSyncData(prev => ({
      ...prev,
      syncingFiles: prev.syncingFiles.map(f => ({ ...f, progress: 0, speed: undefined }))
    }));

    for (const file of syncData.syncingFiles) {
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
    setIsScanning(false);
    // Reset progress to 0 when closing
    setSyncData(prev => ({
      ...prev,
      syncingFiles: prev.syncingFiles.map(f => ({ ...f, progress: 0, speed: undefined }))
    }));
  };

  return (
    <>
      <Button
        onClick={handleClick}
        sx={{ paddingLeft: '4px', paddingRight: '4px', minWidth: '30px' }}
      >
        <SyncIcon fontSize="inherit" />
      </Button>
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
            width: '500px',
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
            fullWidth
            variant="outlined"
            startIcon={<CreateNewFolderIcon />}
            sx={{
              mb: 2,
              color: '#ffffff',
              borderColor: 'rgba(255, 255, 255, 0.23)',
              '&:hover': {
                borderColor: 'rgba(255, 255, 255, 0.4)',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
              },
            }}
          >
            Add Folder
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
                      <FileIcon filename={file.filename} />
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
                          {`${Math.round(file.progress || 0)}%`}
                        </Typography>
                        <Box sx={{ width: '100px' }}>
                          <LinearProgress
                            variant="determinate"
                            value={file.progress || 0}
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
                  </Box>
                ))}
              </>
            )}

            {/* Up to date status */}
            {syncData.syncingFiles.length === 0 && (
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                color: '#2fca45',
                mt: 1
              }}>
                <CheckCircleIcon fontSize="small" />
                <Typography>Up to date</Typography>
              </Box>
            )}
          </Stack>

          <Button
            fullWidth
            variant="contained"
            onClick={handleSyncClick}
            disabled={isScanning}
            startIcon={<SearchIcon />}
            sx={{ paddingLeft: '4px', paddingRight: '4px', minWidth: '30px', paddingTop: '4px', paddingBottom: '4px', mt: 2 }}
          >
            {isScanning ? 'Scanning...' : 'Scan'}
          </Button>
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
