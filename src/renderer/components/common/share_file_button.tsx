import React, { useState } from 'react';
import { Button, Popover, Box, Typography, Stack, Autocomplete, TextField, Chip, Paper, Badge } from '@mui/material';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import LinkIcon from '@mui/icons-material/Link';
import { styled } from '@mui/material/styles';
import { handlers } from '../../handlers';
import { neuranet } from '../../neuranet';
import { useAuth } from '../../context/AuthContext';

interface ShareFileButtonProps {
  selectedFileNames: string[];
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

export default function ShareFileButton({ selectedFileNames, onShare }: ShareFileButtonProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const { username } = useAuth();

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setShowSearch(false);
    setSelectedUsers([]);
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleAddPeople = () => {
    setShowSearch(true);
  };

  const handleCopyLink = () => {
    // Implement copy link functionality here
    handleClose();
  };

  // Update search handler to handle the API response correctly
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      handlers.users.typeahead(query)
        .then(response => {
          if (response && response.data) {
            console.log("response", response.data);
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
            {!showSearch ? (
              <>
                <ShareButton onClick={handleAddPeople}>
                  <PersonAddOutlinedIcon fontSize="inherit" sx={{ mr: 1 }} />
                  <Typography fontSize="body1">Add people</Typography>
                </ShareButton>
                
                <ShareButton onClick={handleCopyLink}>
                  <LinkIcon fontSize="inherit" sx={{ mr: 1 }} />
                  <Typography fontSize="body1">Copy link</Typography>
                </ShareButton>
              </>
            ) : (
              <>
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
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 10, pt:10 }}>
                  <Button 
                    variant="contained" 
                    size="small"
                    onClick={() => {
                      console.log('Sharing with:', selectedUsers);

                      for (const user of selectedUsers) {
                        for (const file of selectedFileNames) {
                          const result = neuranet.files.shareFile(file, username, user.username);
                          console.log('result', result);
                        }
                      }
                      handleClose();
                    }}
                  >
                    Share
                  </Button>
                </Box>
              </>
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
