import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

import Switch from '@mui/material/Switch';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';
import { Container, Typography, Grid, Button } from "@mui/material";
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import { Stack } from '@mui/material';
import { exec } from "child_process";
import AccountMenuIcon from '../common/AccountMenuIcon';
import { useAuth } from '../../context/AuthContext';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import { handlers } from '../../handlers';
import { neuranet } from '../../neuranet';

import { Email } from '@mui/icons-material';
interface Device {
  device_number: number;
  device_name: string;
  storage_capacity_GB: any;
  average_cpu_usage: number;
  average_download_speed: number;
  average_gpu_usage: number;
  average_ram_usage: number;
  average_time_online: number;
  average_upload_speed: number;
  onlineStatus: string;
  cpu_usage: number[];
  date_added: Date[];
  device_priority: number;
  download_network_speed: number[];
  gpu_usage: number[];
  ip_address: string;
  network_reliability: number;
  optimization_status: boolean;
  ram_usage: number[];
  sync_status: boolean;
  upload_network_speed: number[];
  online: boolean;
  // Add more device properties as needed
}

interface UserResponse {
  devices: Device[];
  first_name: string;
  last_name: string;
  // Include other fields from your API response as needed
}


const { ipcRenderer } = window.require('electron');

ipcRenderer.on('python-output', (event: any, data: any) => {
  console.log('Received Python output:', data);
});




export default function Profile() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [selectedDeviceNames, setSelectedDeviceNames] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const { updates, setUpdates, tasks, setTasks, username, first_name, last_name, setFirstname, setLastname, redirect_to_login, setredirect_to_login, taskbox_expanded, setTaskbox_expanded } = useAuth();
  const [deviceRows, setDeviceRows] = useState<Device[]>([]); // State for storing fetched file data
  const getSelectedDeviceNames = () => {
    return selected.map(device_number => {
      const device = deviceRows.find(device => device.device_number === device_number);
      return device ? device.device_name : null;
    }).filter(deviceName => deviceName !== null); // Filter out any null values if a file wasn't found
  };



  function formatBytes(gigabytes: number, decimals: number = 2): string {
    if (gigabytes === 0) return '0 GB';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    // Since we're starting from GB, there's no need to find the initial index based on the log.
    // Instead, we convert the input gigabytes to bytes to use the original formula,
    // adjusting it to start from GB.
    const bytes = gigabytes * Math.pow(k, 3); // Converting GB to Bytes for calculation
    const i = Math.floor(Math.log(bytes) / Math.log(k)) - 3; // Adjusting index to start from GB

    // Ensure the index does not fall below 0
    const adjustedIndex = Math.max(i, 0);
    return parseFloat((gigabytes / Math.pow(k, adjustedIndex)).toFixed(dm)) + ' ' + sizes[adjustedIndex];
  }

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = devices.map((device) => device.device_number);
      setSelected(newSelected);
    } else {
      setSelected([]);
    }
  };

  const handleClick = (event: React.MouseEvent<unknown>, device_number: number) => {
    const selectedIndex = selected.indexOf(device_number);
    let newSelected: number[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, device_number);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }
    setSelected(newSelected);


    const newSelectedDeviceNames = newSelected.map(device_number => deviceRows.find(device => device.device_number === device_number)?.device_name).filter(name => name !== undefined) as string[];
    setSelectedDeviceNames(newSelectedDeviceNames);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const isSelected = (device_number: number) => selected.indexOf(device_number) !== -1;



  const [sync_entire_device_checked, set_sync_entire_device_checked] = React.useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    set_sync_entire_device_checked(event.target.checked);
  };

  const handlesubmitClick = async (event: React.MouseEvent<unknown>) => {

    let task_description = 'Updating device settings';
    let taskInfo = await neuranet.sessions.addTask(username ?? '', task_description, tasks, setTasks);
    setTaskbox_expanded(true);

    let result = await handlers.buttons.submitButton(username, sync_entire_device_checked);

    if (result === 'success') {
      let task_result = await neuranet.sessions.completeTask(username ?? '', taskInfo, tasks, setTasks);
    }

  };





  return (
    <Box sx={{ width: '100%', height: '100vh', pl: 2, pr: 2, mt: 0, pt: 5 }}>
      <Stack spacing={2}>
        <Grid container justifyContent="space-between" alignItems="center" spacing={2}>
          <Grid item>
          </Grid>
          <Grid item>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-start' }}>
              <AccountMenuIcon />
            </Box>
          </Grid>
        </Grid>
        <Grid container spacing={1}>
        </Grid>
      </Stack>
      <Grid container spacing={2} columns={1} overflow="inherit">
        <Grid item xs={8}>
          <Stack spacing={4}>
            <Card variant='outlined'>
              <CardContent>
                <Box my={0}>
                  <Stack spacing={4}>
                    <Typography variant="h4" gutterBottom>App</Typography>
                    <Stack spacing={1}>
                      <Grid container justifyContent="space-between" alignItems="center" spacing={2}>
                        <Grid item>
                          <Typography variant="subtitle1" gutterBottom>Current version</Typography>
                          <Typography variant="body2" gutterBottom>v1.0.1 beta</Typography>
                        </Grid>
                      </Grid>
                      <Divider orientation="horizontal" variant="middle" />
                      <Grid container justifyContent="space-between" alignItems="center" spacing={2}>
                        <Grid item>
                          <Typography variant="subtitle1" gutterBottom>Sync Entire Device</Typography>
                          <Typography variant="body2" gutterBottom> Sync your entire device starting from the root directory
                          </Typography>
                        </Grid>
                        <Grid item pr={4}>
                          <Switch checked={sync_entire_device_checked} onChange={handleChange} color="success" inputProps={{ 'aria-label': 'controlled' }} />
                        </Grid>
                      </Grid>
                      <Divider orientation="horizontal" variant="middle" />


                      <Grid container justifyContent="space-between" alignItems="center" spacing={2}>
                        <Grid item>
                          <Typography variant="subtitle1" gutterBottom>Help</Typography>
                          <Typography variant="body2" gutterBottom>Learn how to use Banbury Cloud
                          </Typography>
                        </Grid>
                        <Grid item pr={4}>
                          <Button variant="outlined" size="small">
                            Open
                          </Button>
                        </Grid>
                      </Grid>
                    </Stack>
                  </Stack>
                  <Stack direction="row" justifyContent="center">
                    <Grid direction="row" justifyContent="center" item pt={8} pr={4}>
                      <Button variant="outlined" size="small" onClick={handlesubmitClick}>
                        Submit
                      </Button>
                    </Grid>
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}

