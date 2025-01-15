import React, { useState } from 'react';
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
import { SyncProgress } from './sync_progress';



export default function SyncButton() {
  const { syncingFiles, recentlyChanged } = SyncProgress()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
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
            width: '300px',
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
            {/* Syncing Section */}
            {syncingFiles.length > 0 && (
              <>
                <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  SYNCING
                </Typography>
                {syncingFiles.map((file, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                      <FileIcon filename={file.filename} />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" noWrap>{file.filename}</Typography>
                        {file.speed && (
                          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                            {file.speed}
                          </Typography>
                        )}
                      </Box>
                    </Box>
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
                            backgroundColor: '#2fca45'
                          }
                        }}
                      />
                    </Box>
                  </Box>
                ))}
              </>
            )}


            {/* Up to date status */}
            {syncingFiles.length === 0 && (
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
            startIcon={<SearchIcon />}
            sx={{
              mt: 2,
              backgroundColor: '#2fca45',
              '&:hover': {
                backgroundColor: '#27a338',
              },
            }}
          >
            Scan
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
