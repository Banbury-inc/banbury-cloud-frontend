import * as React from 'react';
import { Box, Button, Typography, Popover, IconButton, Stack, Divider } from '@mui/material';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import FolderSharedIcon from '@mui/icons-material/FolderShared';
import { formatDistanceToNow } from 'date-fns';
import { getNotifications, markNotificationAsRead } from '../../../neuranet/notifications';
import DoneIcon from '@mui/icons-material/Done';
import { useAuth } from '../../../context/AuthContext';
import { fetchNotifications } from './fetchNotifications';
import { neuranet } from '../../../neuranet';

interface UserNotification {
  _id: string;
  type: 'friend_request' | 'share' | 'upload' | 'system';
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
}


export default function NotificationsButton({ }: {
}) {

  const { username, websocket } = useAuth();
  const [notifications, setNotifications] = React.useState<UserNotification[]>([]);

  React.useEffect(() => {
    if (!username || !websocket) return;

    // Initial fetch
    fetchNotifications(username, setNotifications);

    // Add websocket listener
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'notification_update') {
          fetchNotifications(username, setNotifications);
        }
      } catch (error) {
        console.error('Error parsing websocket message:', error);
      }
    };

    websocket.addEventListener('message', handleMessage);

    // Cleanup
    return () => {
      websocket.removeEventListener('message', handleMessage);
    };
  }, [username, websocket]);


  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAllAsRead = async () => {
    // Get all unread notifications
    const unreadNotifications = notifications.filter(notif => !notif.read);

    // Mark each unread notification as read in the backend
    try {
      await Promise.all(
        unreadNotifications.map(notification =>
          markNotificationAsRead(notification._id)
        )
      );

      // Update local state only after successful backend updates
      setNotifications(notifications.map(notif => ({ ...notif, read: true })));
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };


  const open = Boolean(anchorEl);
  const id = open ? 'notifications-popover' : undefined;
  const unreadCount = notifications.filter(n => !n.read).length;

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return 'Invalid date';
    }
  };

  return (
    <>
      <Button
        onClick={handleClick}
        sx={{
          paddingLeft: '4px',
          paddingRight: '4px',
          minWidth: '30px',
          position: 'relative'
        }}
      >
        <NotificationsOutlinedIcon sx={{ fontSize: 'inherit' }} />
        {unreadCount > 0 && (
          <Box
            sx={{
              position: 'absolute',
              top: -6,
              right: -6,
              bgcolor: 'error.main',
              borderRadius: '50%',
              width: 16,
              height: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.5rem',
            }}
          >
            {unreadCount}
          </Box>
        )}
      </Button>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
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
            bgcolor: '#1A1A1A',
            width: '400px',
            maxHeight: '80vh',
            borderRadius: '12px',
          }
        }}
      >
        <Box sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2,
            position: 'sticky',
            top: 0,
            zIndex: 1,
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            bgcolor: 'rgba(54,54,54,255)',
          }}>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 500 }}>
              Notifications
            </Typography>
            {unreadCount > 0 && (
              <Button
                onClick={handleMarkAllAsRead}
                size="small"
                sx={{
                  color: 'rgba(255,255,255,0.7)',
                  textTransform: 'none',
                  '&:hover': {
                    color: 'white',
                    backgroundColor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                Mark all as read
              </Button>
            )}
          </Box>
          <Box sx={{
            overflowY: 'auto',
            flex: 1,
            p: 2,
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '4px',
              '&:hover': {
                background: 'rgba(255,255,255,0.3)',
              },
            },
          }}>
            <Stack spacing={1}>
              {notifications.map((notification) => (
                <Box
                  key={notification._id}
                  sx={{
                    p: 1.5,
                    borderRadius: 1,
                    opacity: notification.read ? 0.7 : 1,
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.05)'
                    },
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ color: 'white', mb: 0.5 }}>
                      {notification.title}
                    </Typography>
                    {notification.description && (
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                        {notification.description}
                      </Typography>
                    )}
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                      {formatTimestamp(notification.timestamp)}
                    </Typography>
                  </Box>
                  {!notification.read && (
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        markNotificationAsRead(notification._id);
                        setNotifications(notifications.map(n =>
                          n._id === notification._id ? { ...n, read: true } : n
                        ));
                      }}
                      sx={{
                        ml: 1,
                        color: 'rgba(255,255,255,0.5)',
                        '&:hover': { color: 'white' }
                      }}
                    >
                      <DoneIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
              ))}
            </Stack>
          </Box>
        </Box>
      </Popover>
    </>
  );
}

