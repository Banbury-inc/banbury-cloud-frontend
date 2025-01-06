import React, { useState } from 'react';
import { Button, Popover, Box, Typography, Stack, Autocomplete, TextField, Chip } from '@mui/material';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import LinkIcon from '@mui/icons-material/Link';
import { styled } from '@mui/material/styles';
import { handlers } from '../../handlers';

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

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
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
            width: '200px',
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
        <Box sx={{ p: 1 }}>
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
                  onInputChange={(event, value) => handleSearch(value)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      autoFocus
                      size="small"
                      placeholder="Search people..."
                      sx={{
                        '& .MuiInputBase-root': {
                          color: 'white',
                          '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.23)' },
                          '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.4)' },
                        }
                      }}
                    />
                  )}
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
                        }}
                      />
                    ))
                  }
                />
                {searchResults.map((user) => (
                  <ShareButton key={user.id} onClick={() => console.log('Selected user:', user)}>
                    <Typography fontSize="body1">{`${user.first_name} ${user.last_name}`}</Typography>
                  </ShareButton>
                ))}
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
