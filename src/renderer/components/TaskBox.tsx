import * as React from 'react';
import { Box, Button, Collapse, Typography, CircularProgress } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import theme from '../theme';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { neuranet } from '../neuranet';
import { useEffect } from 'react';
import { CONFIG } from '../config/config';

export default function TaskBox() {
  // Remove local expanded state
  const { username, tasks, setTasks, taskbox_expanded, setTaskbox_expanded } = useAuth();

  const handleExpandClick = () => {
    setTaskbox_expanded(!taskbox_expanded);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        let task_device = neuranet.device.name();
        const url = `${CONFIG.url}/sessions/get_session/${username}/`;
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
    <Box sx={{ width: '100%', overflow: 'auto' }}>
      {/* Header with Expand/Collapse Button */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          paddingLeft: '16px',
          paddingRight: '16px',
          paddingTop: '2px',
          paddingBottom: '2px',
          backgroundColor: theme.palette.background.default,
        }}
      >
        <Typography variant="caption">Tasks</Typography>
        <Button
          onClick={handleExpandClick}
          startIcon={taskbox_expanded ? <ExpandMoreIcon /> : <ExpandLessIcon />}
          sx={{
            paddingLeft: '12px',
            paddingRight: '0px',
            justifyContent: 'center',
            display: 'flex',
            minWidth: '30px',
            alignItems: 'center',
          }}
        />
      </Box>

      {/* Task List (Collapsible) */}
      <Collapse in={taskbox_expanded}>
        {(tasks || []).map((task, index) => (
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            key={index}
            sx={{
              border: '1px solid #424242',
              padding: '8px',
              backgroundColor: theme.palette.background.paper,
            }}
          >
            <Typography
              variant="body2"
              color="textPrimary"
              sx={{ margin: 0 }}
            >
              {task.task_name}
            </Typography>
            <Typography variant="body2" color="textPrimary" sx={{ marginLeft: '8px' }}>
              {task.task_progress}%
            </Typography>
            {/* Render the status icon */}
            {getStatusIcon(task.task_status)}
          </Box>
        ))}
      </Collapse>
    </Box>
  );
}

