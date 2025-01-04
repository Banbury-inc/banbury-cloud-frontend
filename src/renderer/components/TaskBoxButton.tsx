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
import { CONFIG } from '../config/config';

// Add this interface near the top of the file
interface Task {
  task_id: string;
  task_name: string;
  task_device: string;
  task_status: string;
  task_progress: string;
}

export default function TaskBoxButton() {
  const { username, tasks, setTasks, taskbox_expanded, setTaskbox_expanded } = useAuth();

  // Explicitly type anchorEl as HTMLElement | null
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

  // Function to open the menu when taskbox_expanded is true and close it when false
  useEffect(() => {
    if (taskbox_expanded && !anchorEl) {
      // Automatically opens the menu when taskbox_expanded becomes true
      const button = document.getElementById("menu-button");
      if (button instanceof HTMLElement) {
        setAnchorEl(button);
      }
    } else if (!taskbox_expanded) {
      // Close the menu when taskbox_expanded becomes false
      setAnchorEl(null);
    }
  }, [taskbox_expanded, anchorEl]);

  const handleMenuToggle = (event: React.MouseEvent<HTMLElement>) => {
    if (!taskbox_expanded) {
      setAnchorEl(event.currentTarget); // Set anchor element for the menu
    }
    setTaskbox_expanded(!taskbox_expanded); // Toggle the taskbox_expanded state
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setTaskbox_expanded(false); // Ensure taskbox_expanded is false when the menu closes
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        let task_device = neuranet.device.name();
        const url = `${CONFIG.url}/sessions/get_recent_session/${username}/`;
        const response = await axios.post<{
          result: string;
          sessions: Task[];
        }>(url, {
          task_device: task_device,
        });
        const result = response.data.result;
        const sessions = response.data.sessions;

        if (JSON.stringify(sessions) !== JSON.stringify(tasks)) {
          setTasks(sessions); // Only update tasks if sessions are different
        }

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
            id="menu-button" // Give the button an ID to track it in the useEffect
            onClick={handleMenuToggle}
            sx={{
              paddingLeft: '4px',
              paddingRight: '4px',
              minWidth: '30px',
            }}
          >
            <NotificationsOutlinedIcon fontSize="inherit" />
          </Button>

          {/* Task List Menu */}
          <Menu
            anchorEl={anchorEl}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            open={Boolean(anchorEl)} // Open the menu based on anchorEl's state
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
                  <Typography variant="body2" color="textPrimary" sx={{ marginRight: '8px' }}>
                    {task.task_progress ? Math.round(task.task_progress).toString() : '0'}%
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

