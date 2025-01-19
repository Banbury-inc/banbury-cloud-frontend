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
import TaskBoxButton from '../../common/notifications/NotificationsButton';
import App from './App';
import CloudSync from './CloudSync';
import Public_Profile from './Public_Profile';
import NotificationsButton from '../../common/notifications/NotificationsButton';
import { useAlert } from '../../../context/AlertContext';

interface Section {
  id: string;
  title: string;
}

const sections: Section[] = [
  { id: 'public-profile', title: 'Public Profile' },
  { id: 'cloud-sync', title: 'Cloud Sync' },
  { id: 'app', title: 'App' },
];

export default function Settings() {
  const { showAlert } = useAlert();
  const [activeSection, setActiveSection] = useState('public-profile');

  const handleSectionClick = (sectionId: string) => {
    try {
      setActiveSection(sectionId);
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      } else {
        // showAlert('Warning', [`Section "${sectionId}" not found`], 'warning');
      }
    } catch (error) {
      console.error('Error navigating to section:', error);
      showAlert('Error', ['Failed to navigate to section', error instanceof Error ? error.message : 'Unknown error'], 'error');
    }
  };



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
        {/* Left panel: Device table */}
        <Card variant="outlined" sx={{ flexGrow: 1, height: '100%', width: '30%', overflow: 'hidden' }}>
          <CardContent sx={{ height: '100%', width: '100%', overflow: 'auto' }}>
            <List component="nav">
              {sections.map((section) => (
                <ListItemButton
                  key={section.id}
                  selected={activeSection === section.id}
                  onClick={() => handleSectionClick(section.id)}
                  sx={{
                    borderRadius: 1,
                    mb: 1,
                    '&.Mui-selected': {
                      backgroundColor: 'action.selected',
                    },
                  }}
                >
                  <ListItemText primary={section.title} />
                </ListItemButton>
              ))}
            </List>
          </CardContent>
        </Card>

        {/* Right panel: Device details */}
        <Card variant="outlined" sx={{ p: 2, height: '100%', width: '70%', overflow: 'auto' }}>
          <CardContent>

            <Stack direction="column" spacing={3}>
              {activeSection === 'public-profile' && <Public_Profile />}
              {activeSection === 'app' && <App />}
              {activeSection === 'cloud-sync' && <CloudSync />}
            </Stack>

          </CardContent>

        </Card >

      </Stack >
    </Box >
  );
}
