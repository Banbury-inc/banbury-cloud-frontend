import React, { useState } from 'react';
import { Button, Popover, Box, Typography, Stack, Autocomplete, TextField, Chip, Paper, Badge, CircularProgress, Switch } from '@mui/material';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import LinkIcon from '@mui/icons-material/Link';
import { styled } from '@mui/material/styles';
import { handlers } from '../../handlers';
import { neuranet } from '../../neuranet';
import { useAuth } from '../../context/AuthContext';
import CheckIcon from '@mui/icons-material/Check';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LockIcon from '@mui/icons-material/Lock';
import { CONFIG } from '../../config/config';

interface ShareFileButtonProps {
  selectedFileNames: string[];
  selectedFileInfo: any[];
  onShare: () => void;
}

interface User {
  id: number;
  first_name: string;
  last_name: string;
  status: string;
  username: string;
  email?: string;
  avatar_url?: string;
}

const ShareButton = styled(Button)(({ theme }) => ({
  width: '100%',
  justifyContent: 'flex-start',
  padding: '12px 16px',
  borderRadius: '8px',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
}));

export default function ShareFileButton({ selectedFileNames, selectedFileInfo, onShare }: ShareFileButtonProps) {

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [showPermissions, setShowPermissions] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const { username } = useAuth();
  const [isSharing, setIsSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [togglePublicSuccess, setTogglePublicSuccess] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setIsPublic(selectedFileInfo[0]?.is_public ?? false);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setShowSearch(false);
    setShowPermissions(false);
    setSelectedUsers([]);
    setSearchResults([]);
    setSearchQuery('');
    setIsSharing(false);
    setShareSuccess(false);
  };

  const handleAddPeople = () => {
    setShowSearch(true);
  };

  const handlePermissions = () => {
    setShowPermissions(true);
  };

  const handleCopyLink = async () => {
    const file_id = selectedFileInfo[0]._id;
    const link = `${CONFIG.url}filedownload/${username}/${file_id}`;
    navigator.clipboard.writeText(link);
    handleClose();
  };

  // Update search handler to handle the API response correctly
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      handlers.users.typeahead(query)
        .then(response => {
          if (response && response.data) {
            setSearchResults(response.data.users || []);
          } else {
            setSearchResults([]);
          }
        })
        .catch(error => {
          console.error('Search failed:', error);
          setSearchResults([]);
        });
    } else {
      setSearchResults([]);
    }
  };

  // Add debounced search
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    handleSearch(query);
  };

  const handleShare = async () => {
    setIsSharing(true);

    try {
      // Wait for all share operations to complete
      await Promise.all(
        selectedUsers.flatMap(user =>
          selectedFileNames.map(file =>
            neuranet.files.shareFile(file, username, user.username)
          )
        )
      );

      setIsSharing(false);
      setShareSuccess(true);

      // Close after showing success for 2 seconds
      setTimeout(() => {
        handleClose();
      }, 2000);

    } catch (error) {
      console.error('Error sharing files:', error);
      setIsSharing(false);
    }
  };


  const handleMakePublic = async () => {
    const device_name = selectedFileInfo[0].device_name;
    try {
      // Wait for all share operations to complete
      await Promise.all(
        selectedFileNames.map(file =>
          neuranet.files.makeFilePublic(username, file, device_name)
        )
      );
      setTogglePublicSuccess(true);

      // Close after showing success for 2 seconds
      setTimeout(() => {
        handleClose();
      }, 2000);

    } catch (error) {
      console.error('Error making file public:', error);
    }
  };


  const handleMakePrivate = async () => {
    const device_name = selectedFileInfo[0].device_name;
    try {
      // Wait for all share operations to complete
      await Promise.all(
        selectedFileNames.map(file =>
          neuranet.files.makeFilePrivate(username, file, device_name)
        )
      );
      setTogglePublicSuccess(true);

      // Close after showing success for 2 seconds
      setTimeout(() => {
        handleClose();
      }, 2000);

    } catch (error) {
      console.error('Error making file private:', error);
      setIsSharing(false);
    }
  };


  return (
    <>
      <Button
        onClick={handleClick}
        sx={{ paddingLeft: '4px', paddingRight: '4px', minWidth: '30px' }}
      >
        <ShareOutlinedIcon fontSize="inherit" />
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
          <Stack spacing={1}>
            {!showSearch && !showPermissions ? (
              <>
                <ShareButton onClick={handleAddPeople}>
                  <PersonAddOutlinedIcon fontSize="inherit" sx={{ mr: 1 }} />
                  <Typography fontSize="body1">Add people</Typography>
                </ShareButton>

                <ShareButton onClick={handlePermissions}>
                  <LockOutlinedIcon fontSize="inherit" sx={{ mr: 1 }} />
                  <Typography fontSize="body1">Permissions</Typography>
                </ShareButton>

                <ShareButton onClick={handleCopyLink}>
                  <LinkIcon fontSize="inherit" sx={{ mr: 1 }} />
                  <Typography fontSize="body1">Copy link</Typography>
                </ShareButton>
              </>
            ) : (
              <>
                {showSearch && (
                  <Autocomplete
                    multiple
                    autoHighlight
                    options={searchResults}
                    value={selectedUsers}
                    onChange={(event, newValue) => setSelectedUsers(newValue)}
                    getOptionLabel={(option) => `${option.first_name} ${option.last_name}`}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        autoFocus
                        size="small"
                        placeholder={selectedUsers.length === 0 ? "Add an email or name" : ""}
                        sx={{
                          '& .MuiInputBase-root': {
                            color: 'white',
                            '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.23)' },
                            '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.4)' },
                          }
                        }}
                      />
                    )}
                    onInputChange={(event, value) => handleSearch(value)}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          {...getTagProps({ index })}
                          key={option.id}
                          label={`${option.first_name} ${option.last_name}`}
                          size="small"
                          sx={{
                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                            color: 'white',
                            height: '24px',
                            '& .MuiChip-label': {
                              fontSize: '0.8rem',
                              padding: '0 8px',
                            },
                            '& .MuiChip-deleteIcon': {
                              fontSize: '16px',
                              margin: '0 4px 0 -4px',
                            }
                          }}
                        />
                      ))
                    }
                    renderOption={(props, option) => (
                      <Box component="li" {...props} sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        py: 1.5,
                        px: 2,
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                        '&:last-child': {
                          borderBottom: 'none'
                        }
                      }}>
                        {option.avatar_url ? (
                          <Box
                            component="img"
                            src={option.avatar_url}
                            alt=""
                            sx={{
                              width: 36,
                              height: 36,
                              borderRadius: '50%',
                              objectFit: 'cover'
                            }}
                          />
                        ) : (
                          <Box
                            sx={{
                              width: 36,
                              height: 36,
                              borderRadius: '50%',
                              bgcolor: 'rgba(147, 51, 234, 0.8)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontSize: '15px',
                              fontWeight: 500,
                            }}
                          >
                            {`${option.first_name[0]}${option.last_name[0]}`}
                          </Box>
                        )}
                        <Box sx={{ flex: 1 }}>
                          <Typography sx={{
                            color: 'white',
                            fontSize: '15px',
                            lineHeight: '20px',
                            mb: 0.5
                          }}>
                            {`${option.first_name} ${option.last_name}`}
                          </Typography>
                          <Typography sx={{
                            color: 'rgba(255, 255, 255, 0.6)',
                            fontSize: '13px',
                            lineHeight: '16px'
                          }}>
                            {option.email || option.username}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                    PaperComponent={({ children, ...props }) => (
                      <Paper
                        {...props}
                        sx={{
                          bgcolor: '#1e1e1e',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '12px',
                          '& .MuiAutocomplete-option': {
                            padding: 0,
                            '&:hover': {
                              bgcolor: 'rgba(255, 255, 255, 0.08)',
                            },
                            '&.Mui-focused': {
                              bgcolor: 'rgba(255, 255, 255, 0.12)',
                            }
                          }
                        }}
                      >
                        <Typography sx={{
                          px: 2,
                          py: 1.5,
                          color: 'rgba(255, 255, 255, 0.7)',
                          fontSize: '14px',
                          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                        }}>
                          Suggested people
                        </Typography>
                        {children}
                      </Paper>
                    )}
                  />
                )}
                {showSearch && (
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Button
                      variant="contained"
                      size="small"
                      disabled={isSharing}
                      onClick={handleShare}
                    >
                      {isSharing ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : shareSuccess ? (
                        <CheckIcon sx={{ color: 'success.main' }} />
                      ) : (
                        'Share'
                      )}
                    </Button>
                  </Box>
                )}
              </>
            )}


            {showPermissions && (
              <Box sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: 'background.paper',
                border: '1px solid rgba(255, 255, 255, 0.12)',
              }}>
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2
                }}>
                  <Typography>Make this file public and sharable</Typography>
                  <Switch
                    checked={isPublic}
                    onChange={(e) => {
                      setIsPublic(e.target.checked);
                      if (e.target.checked) {
                        handleMakePublic();
                      } else {
                        handleMakePrivate();
                      }
                    }}
                    size="small"
                    sx={{
                      mt: 1,
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        '&:hover': {
                          backgroundColor: 'rgba(76, 175, 80, 0.08)',
                        },
                      },
                      '& .MuiSwitch-thumb': {
                        backgroundColor: '#fff',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#2fca45',
                      },
                    }} />
                </Box>
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  color: 'text.secondary'
                }}>
                  <LockIcon fontSize="small" />
                  <Typography variant="body2">
                    {isPublic ? "This file is public" : "This file is currently private"}
                  </Typography>
                </Box>
              </Box>
            )}

            {selectedFileNames.length === 1 && (
              <Box sx={{ mt: 1, px: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  {selectedFileNames[0]}
                </Typography>
              </Box>
            )}
          </Stack>
        </Box>
      </Popover>
    </>
  );
}
