import * as React from 'react';
import { Box, Button, Typography, Menu, MenuItem, CircularProgress } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import theme from '../theme';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { neuranet } from '../neuranet';
import { useEffect } from 'react';
import Stack from '@mui/material/Stack';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import { NotificationsOutlined } from '@mui/icons-material';

export default function TaskBoxButton() {
  const { username, tasks, setTasks } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        let task_device = neuranet.device.name();
        const url = `https://website2-389236221119.us-central1.run.app/get_session/${username}/`;
        const response = await axios.post<{
          result: string;
          sessions: any[];
        }>(url, {
          task_device: task_device,
        });
        const result = response.data.result;
        const sessions = response.data.sessions;

        if (JSON.stringify(sessions) !== JSON.stringify(tasks)) {
          setTasks(sessions); // Only update tasks if sessions are different
        }

        console.log('sessions:', sessions);
        console.log('result:', result);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [tasks, username]); // Add `tasks` and `username` to the dependency array


  // Function to get the appropriate icon based on status
  const getStatusIcon = (status: any) => {
    switch (status) {
      case 'pending':
        return <CircularProgress size={16} sx={{ color: theme.palette.primary.main }} />;
      case 'complete':
        return <CheckCircleIcon sx={{ fontSize: '20px', color: theme.palette.success.main }} />;
      case 'error':
        return <ErrorIcon sx={{ fontSize: '20px', color: theme.palette.error.main }} />;
      default:
        return null;
    }
  };

  return (
    <Box alignItems="flex-end" sx={{ paddingLeft: '4px', paddingRight: '8px', width: '100%' }}>


      <Stack direction="column" spacing={1} alignItems="flex-end">
        <Box>
          <Button
            onClick={handleMenuOpen}
            sx={{
              paddingLeft: '4px',
              paddingRight: '4px',
              minWidth: '30px',
            }}
          >
            <NotificationsOutlined fontSize="inherit" />
          </Button>

          {/* Task List Menu */}
          <Menu
            anchorEl={anchorEl}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            open={open}
            onClose={handleMenuClose}
            PaperProps={{
              style: {
                maxHeight: 300,
              },
            }}
          >
            {(tasks || []).map((task, index) => (
              <MenuItem key={index} onClick={handleMenuClose}>
                <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
                  <Typography variant="body2" color="textPrimary" sx={{ marginRight: '8px' }}>
                    {task.task_name}
                  </Typography>
                  {/* Render the status icon */}
                  {getStatusIcon(task.task_status)}
                </Box>
              </MenuItem>
            ))}
          </Menu>
        </Box>
      </Stack>
    </Box>
  );
}

