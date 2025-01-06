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
            <ShareButton onClick={handleAddPeople}>
              <PersonAddOutlinedIcon fontSize="inherit" sx={{ mr: 1 }} />
              <Typography fontSize="body1">Add people</Typography>
            </ShareButton>
            
            <ShareButton onClick={handleCopyLink}>
              <LinkIcon fontSize="inherit" sx={{ mr: 1 }} />
              <Typography fontSize="body1">Copy link</Typography>
            </ShareButton>
          </Stack>

          {selectedFileNames.length === 1 && (
            <Box sx={{ mt: 1, px: 1 }}>
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
