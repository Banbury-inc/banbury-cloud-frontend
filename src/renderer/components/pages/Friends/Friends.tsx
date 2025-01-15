import React, { useEffect, useState, useRef } from 'react';
import Stack from '@mui/material/Stack';
import { Divider, TextField, Typography, useMediaQuery } from '@mui/material';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { CardContent, Container, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import AccountMenuIcon from '../../common/AccountMenuIcon';
import Card from '@mui/material/Card';
import { List, ListItemButton, ListItemText } from '@mui/material';
import { neuranet } from '../../../neuranet'
import TaskBoxButton from '../../common/notifications/NotificationsButton';
import SearchIcon from '@mui/icons-material/Search';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { IconButton, InputAdornment, Badge, Avatar, Tabs, Tab } from '@mui/material';
import { handlers } from '../../../handlers';
import { useAuth } from '../../../context/AuthContext';
import { TailwindButton } from './Tailwindbutton';
import { Button } from '../../../../components/button'
import { Heading, Subheading } from '../../../../components/heading'
import { Text } from '../../../../components/text'
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import { CircularProgress } from '@mui/material';
import Skeleton from '@mui/material/Skeleton';
import NotificationsButton from '../../common/notifications/NotificationsButton';
import UploadProgress from '../../common/upload_progress/upload_progress';
import DownloadProgress from '../../common/download_progress/download_progress';

interface SearchResult {
  id: number;
  first_name: string;
  last_name: string;
  status: string;
  username: string;
}

export default function Friends() {

  const [activeSection, setActiveSection] = useState('all-friends');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFriend, setSelectedFriend] = useState<any>(null);
  const [friendInfo, setFriendInfo] = useState<any>(null);
  const [updates, setUpdates] = useState<any[]>([]);
  const { username } = useAuth();


  const [friends, setFriends] = useState<any[]>([]);
  const [friendRequests, setFriendRequests] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [followDialog, setFollowDialog] = useState<'friends' | null>(null);
  const [followList, setFollowList] = useState<any[]>([]);
  const [isLoadingFriends, setIsLoadingFriends] = useState(false);
  const [isLoadingFriendInfo, setIsLoadingFriendInfo] = useState(false);


  useEffect(() => {
    if (selectedFriend) {
      setIsLoadingFriendInfo(true);
      handlers.users.getUserInfo(selectedFriend?.username || '')
        .then(response => {
          if (response && response) {
            setFriendInfo(response);
          }
        })
        .catch(error => {
          console.error('Error fetching friends:', error);
        })
        .finally(() => {
          setIsLoadingFriendInfo(false);
        });
    }
  }, [selectedFriend, updates]);


  useEffect(() => {
    handlers.users.getFriends(username || '')
      .then(response => {
        if (response && response.data) {
          setFriends(response.data.friends);
        }
      })
      .catch(error => {
        console.error('Error fetching friends:', error);
      });
  }, [username, updates]);



  useEffect(() => {
    handlers.users.getFriendRequests(username || '')
      .then(response => {
        if (response && response.data) {
          setFriendRequests(response.data.friend_requests);
        }
      })
      .catch(error => {
        console.error('Error fetching friend requests:', error);
      });
  }, [username, updates]);



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

  const handleOpenFriends = async () => {
    setIsLoadingFriends(true);
    setFollowDialog('friends');
    try {
      const response = await handlers.users.getUserFriends(selectedFriend.username);
      console.log("response", response);
      if (response && response.data && Array.isArray(response.data.friends.friends)) {
        setFollowList(response.data.friends.friends);
      } else {
        setFollowList([]);
      }
    } catch (error) {
      console.error('Error fetching friends:', error);
      setFollowList([]);
    }
    setIsLoadingFriends(false);
  };


  const handleCloseDialog = () => {
    setFollowDialog(null);
    setFollowList([]);
  };

  // Add WebSocket effect
  useEffect(() => {
    const connectWebSocket = async () => {
      const socket = await neuranet.device.connect(
        username || '',
        [],
        () => { },
        () => { }
      );

      socket.addEventListener('message', (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.request_type === "friend_request") {
            // Reload friend requests
            handlers.users.getFriendRequests(username || '')
              .then(response => {
                if (response && response.data) {
                  setFriendRequests(response.data.friend_requests);
                }
              })
              .catch(error => {
                console.error('Error fetching friend requests:', error);
              });
          }
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
        }
      });
    };

    if (username) {
      connectWebSocket();
    }
  }, [username]);

  return (
    // <Box sx={{ width: '100%', pl: 4, pr: 4, mt: 0, pt: 5 }}>
    <Box sx={{ width: '100%', pt: 0 }}>

      <Card variant='outlined' sx={{ borderTop: 0, borderLeft: 0, borderBottom: 0 }}>
        <CardContent sx={{ paddingBottom: '2px !important', paddingTop: '46px' }}>
          <Stack spacing={2} direction="row" sx={{ flexWrap: 'nowrap' }}>
            <Grid container spacing={0} sx={{ display: 'flex', flexWrap: 'nowrap', pt: 0 }}>

            </Grid>
            <Grid container justifyContent='flex-end' alignItems='flex-end'>
              <Grid item>
              </Grid>
              <Grid item>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end' }}>
                  <Stack direction="row">
                    <NotificationsButton />
                  </Stack>
                  <Stack paddingLeft={1} direction="row">
                    <AccountMenuIcon />
                  </Stack>
                </Box>
              </Grid>
            </Grid>
          </Stack>
        </CardContent>
      </Card>
      <Stack direction="row" spacing={0} sx={{ width: '100%', height: 'calc(100vh - 76px)', overflow: 'hidden' }}>
        {/* Left panel: Friends list */}
        <Card variant="outlined" sx={{ flexGrow: 1, height: '100%', width: '30%', overflow: 'hidden' }}>
          <CardContent sx={{ height: '100%', width: '100%', overflow: 'auto', p: 2 }}>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />

            <Tabs
              value={activeSection}
              onChange={(e, newValue) => setActiveSection(newValue)}
              sx={{
                minHeight: '32px',
                '& .MuiTab-root': {
                  minHeight: '32px',
                  padding: '6px 12px',
                  fontSize: '12px'
                }
              }}
            >
              <Tab label="Friends" value="all-friends" />
              <Tab
                label={
                  <Badge
                    badgeContent={friendRequests.length}
                    sx={{
                      '& .MuiBadge-badge': {
                        backgroundColor: '#ef4444',
                        fontSize: '9px',
                        height: '14px',
                        minWidth: '14px',
                        padding: '0 2px',
                        right: '-10px',
                      }
                    }}
                  >
                    Requests
                  </Badge>
                }
                value="requests"
              />
              <Tab label="Search" value="search" />
            </Tabs>

            <List component="nav">
              {activeSection === 'all-friends' ? (
                friends.map((friend) => (
                  <ListItemButton
                    dense
                    key={friend.id}
                    selected={selectedFriend?.id === friend.id}
                    onClick={() => setSelectedFriend(friend)}
                    sx={{
                      borderRadius: 1,
                      mb: 0,
                      '&.Mui-selected': {
                        backgroundColor: 'action.selected',
                      },
                    }}
                  >
                    <Avatar sx={{ mr: 2, width: 24, height: 24, fontSize: '12px' }}>{friend.first_name ? friend.first_name[0] : '?'}</Avatar>
                    <ListItemText
                      primary={`${friend.first_name || ''} ${friend.last_name || ''}`.trim() || 'Unknown User'}
                      secondary={friend.username}
                    />
                  </ListItemButton>
                ))
              ) : activeSection === 'requests' ? (
                friendRequests.map((request) => (
                  <ListItemButton
                    dense
                    key={request.id}
                    sx={{
                      borderRadius: 1,
                      mb: 0,
                      '&.Mui-selected': {
                        backgroundColor: 'action.selected',
                      },
                    }}
                  >
                    <Avatar sx={{ mr: 2, width: 24, height: 24, fontSize: '12px' }}>{request.first_name ? request.first_name[0] : '?'}</Avatar>
                    <ListItemText primary={`${request.first_name || ''} ${request.last_name || ''}`.trim() || 'Unknown User'} secondary={request.username} />
                    <IconButton color="success" size="small" onClick={() => {
                      handlers.users.acceptFriendRequest(username || '', request.username || '')
                        .then(() => {
                          setUpdates(prevUpdates => [...prevUpdates, 'friend_request_accepted']);
                          // Refresh both friends and requests lists
                          handlers.users.getFriends(username || '')
                            .then(response => {
                              if (response && response.data) {
                                setFriends(response.data.friends);
                              }
                            });
                          handlers.users.getFriendRequests(username || '')
                            .then(response => {
                              if (response && response.data) {
                                setFriendRequests(response.data.friend_requests);
                              }
                            });
                        });
                    }}>
                      <CheckIcon sx={{ fontSize: '16px' }} />
                    </IconButton>
                    <IconButton color="error" size="small" onClick={() => {
                      handlers.users.rejectFriendRequest(username || '', request.username || '')
                        .then(() => {
                          // Refresh friend requests list
                          handlers.users.getFriendRequests(username || '')
                            .then(response => {
                              if (response && response.data) {
                                setFriendRequests(response.data.friend_requests);
                              }
                            });
                        });
                    }}>
                      <CloseIcon sx={{ fontSize: '16px' }} />
                    </IconButton>
                  </ListItemButton>
                ))
              ) : (
                // Updated search results section with null checks
                searchResults?.map((user) => (
                  <ListItemButton
                    dense
                    key={user.id}
                    sx={{ borderRadius: 1, mb: 0 }}
                  >
                    <Avatar sx={{ mr: 2, width: 24, height: 24, fontSize: '12px' }}>
                      {user.first_name ? user.first_name[0] : '?'}
                    </Avatar>
                    <ListItemText
                      primary={`${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown User'}
                      secondary={user.username}
                    />
                    <IconButton color="primary" size="small" onClick={() => {
                      handlers.users.sendFriendRequest(username || '', user.username || '')
                      setUpdates(prevUpdates => [...prevUpdates, 'friend_request_sent']);
                    }}>
                      <PersonAddIcon sx={{ fontSize: '16px' }} />
                    </IconButton>
                  </ListItemButton>
                )) || null
              )}
            </List>
          </CardContent>
        </Card>

        {/* Right panel: Friend details */}
        <Card variant="outlined" sx={{ p: 2, height: '100%', width: '70%', overflow: 'auto' }}>
          <CardContent>
            {selectedFriend ? (
              <Stack direction="column" spacing={3}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    {isLoadingFriendInfo ? (
                      <>
                        <Skeleton variant="circular" width={64} height={64} />
                        <Stack>
                          <Skeleton variant="text" width={200} height={32} />
                          <Skeleton variant="text" width={150} height={24} />
                          <Skeleton variant="text" width={100} height={24} sx={{ mt: 1 }} />
                        </Stack>
                      </>
                    ) : (
                      <>
                        <Avatar sx={{ width: 64, height: 64 }}>{selectedFriend.first_name ? selectedFriend.first_name[0] : '?'}</Avatar>
                        <Stack>
                          <Heading level={5}>{selectedFriend.first_name ? selectedFriend.first_name : '?'} {selectedFriend.last_name ? selectedFriend.last_name : '?'}</Heading>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography variant="body2" color="text.secondary">
                              {selectedFriend.username}
                            </Typography>
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                backgroundColor: selectedFriend?.online ? '#22c55e' : '#94a3b8',
                              }}
                            />
                            <Typography variant="body2" color="text.secondary">
                              {selectedFriend?.online ? 'Online' : 'Offline'}
                            </Typography>
                          </Stack>
                          <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ cursor: 'pointer' }}
                              onClick={handleOpenFriends}
                            >
                              <strong>{friendInfo?.friends?.length || 0}</strong> Friends
                            </Typography>
                          </Stack>
                        </Stack>
                      </>
                    )}
                  </Stack>
                  <IconButton color="error" onClick={() => {
                    handlers.users.removeFriend(username || '', selectedFriend.username || '')
                    setUpdates(prevUpdates => [...prevUpdates, 'friend_removed']);
                  }}>
                    <PersonRemoveIcon />
                  </IconButton>
                </Box>

                <Divider />

                <Typography variant="h6">Personal Information</Typography>
                <Grid container spacing={2}>
                  {isLoadingFriendInfo ? (
                    <>
                      <Grid item xs={6}>
                        <Skeleton variant="text" width={100} height={20} />
                        <Skeleton variant="text" width={150} height={24} />
                      </Grid>
                      <Grid item xs={6}>
                        <Skeleton variant="text" width={100} height={20} />
                        <Skeleton variant="text" width={150} height={24} />
                      </Grid>
                      <Grid item xs={6}>
                        <Skeleton variant="text" width={100} height={20} />
                        <Skeleton variant="text" width={150} height={24} />
                      </Grid>
                      <Grid item xs={6}>
                        <Skeleton variant="text" width={100} height={20} />
                        <Skeleton variant="text" width={150} height={24} />
                      </Grid>
                    </>
                  ) : (
                    <>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">First Name</Typography>
                        <Typography variant="body1">{friendInfo?.first_name || 'Not available'}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Last Name</Typography>
                        <Typography variant="body1">{friendInfo?.last_name || 'Not available'}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Email address</Typography>
                        <Typography variant="body1">{friendInfo?.email || 'Not available'}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Phone</Typography>
                        <Typography variant="body1">{friendInfo?.phone_number || 'Not available'}</Typography>
                      </Grid>
                    </>
                  )}
                </Grid>
              </Stack>
            ) : (
              <Typography variant="body1" color="text.secondary" align="center">
                Select a friend to view their details
              </Typography>
            )}
          </CardContent>
        </Card>
      </Stack>
      <Dialog
        open={followDialog !== null}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {followDialog === 'friends' ? 'Friends' : 'Following'}
        </DialogTitle>
        <DialogContent>
          {isLoadingFriends ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <List>
              {followList.map((user) => (
                <ListItemButton
                  key={user.id}
                  dense
                  sx={{ borderRadius: 1 }}
                >
                  <Avatar
                    sx={{ mr: 2, width: 32, height: 32, fontSize: '14px' }}
                  >
                    {user.first_name ? user.first_name[0] : '?'}
                  </Avatar>
                  <ListItemText
                    primary={`${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown User'}
                    secondary={user.username}
                  />
                </ListItemButton>
              ))}
              {followList.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                  No {followDialog} found
                </Typography>
              )}
            </List>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
