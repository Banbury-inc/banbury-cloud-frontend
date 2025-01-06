import React, { useState } from 'react';
import { Button, Popover, Box, Typography, Stack } from '@mui/material';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import LinkIcon from '@mui/icons-material/Link';
import { styled } from '@mui/material/styles';

interface ShareFileButtonProps {
  selectedFileNames: string[];
  onShare: () => void;
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

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleAddPeople = () => {
    handleClose();
    onShare();
  };

  const handleCopyLink = () => {
    // Implement copy link functionality here
    handleClose();
  };

  return (
    <>
      <Button
        disabled={selectedFileNames.length !== 1}
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
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            width: '300px',
            backgroundColor: '#1e1e1e',
            borderRadius: '12px',
            mt: 1,
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Stack spacing={1}>
            <ShareButton onClick={handleAddPeople}>
              <PersonAddOutlinedIcon sx={{ mr: 2 }} />
              <Typography>Add people</Typography>
            </ShareButton>
            
            <ShareButton onClick={handleCopyLink}>
              <LinkIcon sx={{ mr: 2 }} />
              <Typography>Copy link</Typography>
            </ShareButton>
          </Stack>

          {selectedFileNames.length === 1 && (
            <Box sx={{ mt: 2, px: 1 }}>
              <Typography variant="body2" color="text.secondary">
                {selectedFileNames[0]}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Folder
              </Typography>
            </Box>
          )}
        </Box>
      </Popover>
    </>
  );
}
