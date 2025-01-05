import React, { useEffect, useState, useRef } from 'react';
import os from 'os';
import Stack from '@mui/material/Stack';
import { Button, Divider, FormControlLabel, FormGroup, Slider, Switch, TextField, Typography, useMediaQuery } from '@mui/material';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { CardContent, Container, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import AccountMenuIcon from '../../common/AccountMenuIcon';
import Card from '@mui/material/Card';
import { List, ListItemButton, ListItemText } from '@mui/material';
import { neuranet } from '../../../neuranet'
import TaskBoxButton from '../../TaskBoxButton';
import SearchIcon from '@mui/icons-material/Search';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { IconButton, InputAdornment, Badge, Avatar, Tabs, Tab } from '@mui/material';



export default function Friends() {

  const [activeSection, setActiveSection] = useState('all-friends');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFriend, setSelectedFriend] = useState<any>(null);

  // Mock data - replace with actual data from your backend
  const [friends, setFriends] = useState([
    { id: 1, name: 'John Doe', status: 'online', stats: { files: 156, devices: 3, connections: 12 } },
    { id: 2, name: 'Jane Smith', status: 'offline', stats: { files: 89, devices: 2, connections: 8 } },
  ]);

  const [friendRequests, setFriendRequests] = useState([
    { id: 3, name: 'Alice Brown', status: 'pending' },
  ]);




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
                    <TaskBoxButton />
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
              placeholder="Search friends..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
              sx={{ mb: 2 }}
            >
              <Tab label="Friends" value="all-friends" />
              <Tab
                label={
                  <Badge badgeContent={friendRequests.length} color="error">
                    Requests
                  </Badge>
                }
                value="requests"
              />
            </Tabs>

            <List component="nav">
              {activeSection === 'all-friends' ? (
                friends.map((friend) => (
                  <ListItemButton
                    key={friend.id}
                    selected={selectedFriend?.id === friend.id}
                    onClick={() => setSelectedFriend(friend)}
                    sx={{
                      borderRadius: 1,
                      mb: 1,
                      '&.Mui-selected': {
                        backgroundColor: 'action.selected',
                      },
                    }}
                  >
                    <Avatar sx={{ mr: 2 }}>{friend.name[0]}</Avatar>
                    <ListItemText
                      primary={friend.name}
                      secondary={friend.status}
                    />
                  </ListItemButton>
                ))
              ) : (
                friendRequests.map((request) => (
                  <ListItemButton
                    key={request.id}
                    sx={{ borderRadius: 1, mb: 1 }}
                  >
                    <Avatar sx={{ mr: 2 }}>{request.name[0]}</Avatar>
                    <ListItemText primary={request.name} />
                    <IconButton color="success" size="small">
                      <CheckIcon />
                    </IconButton>
                    <IconButton color="error" size="small">
                      <CloseIcon />
                    </IconButton>
                  </ListItemButton>
                ))
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
                    <Avatar sx={{ width: 64, height: 64 }}>{selectedFriend.name[0]}</Avatar>
                    <Stack>
                      <Typography variant="h5">{selectedFriend.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedFriend.status}
                      </Typography>
                    </Stack>
                  </Stack>
                  <IconButton color="error">
                    <PersonRemoveIcon />
                  </IconButton>
                </Box>

                <Divider />

                <Typography variant="h6">Statistics</Typography>
                <Grid container spacing={3}>
                  {Object.entries(selectedFriend.stats).map(([key, value]) => (
                    <Grid item xs={4} key={key}>
                      <Card variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="h4" align="center">{String(value)}</Typography>
                        <Typography variant="body2" align="center" color="text.secondary">
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </Typography>
                      </Card>
                    </Grid>
                  ))}
                </Grid>

                <Typography variant="h6">Mutual Friends</Typography>
                <Grid container spacing={2}>
                  {friends.slice(0, 3).map((friend) => (
                    <Grid item xs={4} key={friend.id}>
                      <Card variant="outlined" sx={{ p: 2 }}>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar>{friend.name[0]}</Avatar>
                          <Typography variant="body1">{friend.name}</Typography>
                        </Stack>
                      </Card>
                    </Grid>
                  ))}
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
    </Box>
  );
}