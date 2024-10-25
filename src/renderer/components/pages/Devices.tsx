import React, { useEffect, useState, useRef } from 'react';
import os from 'os';
import Stack from '@mui/material/Stack';
import { join } from 'path';
import { shell } from 'electron';
import axios from 'axios';
import { useMediaQuery } from '@mui/material';
import ButtonBase from '@mui/material/ButtonBase';
import Box from '@mui/material/Box';
import { readdir, stat } from 'fs/promises';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import DevicesIcon from '@mui/icons-material/Devices';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import { Skeleton } from '@mui/material';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import GrainIcon from '@mui/icons-material/Grain';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Checkbox from '@mui/material/Checkbox';
import Tooltip from '@mui/material/Tooltip';
import DeleteIcon from '@mui/icons-material/Delete';
import { visuallyHidden } from '@mui/utils';
import { CardContent, Container } from "@mui/material";
import AccountMenuIcon from '../common/AccountMenuIcon';
import AddToQueueIcon from '@mui/icons-material/AddToQueue';
import { useAuth } from '../../context/AuthContext';
import Card from '@mui/material/Card';
import TextField from '@mui/material/TextField';
import { handlers } from '../../handlers';
import path from 'path';
import fs from 'fs';
import { neuranet } from '../../neuranet';
import { fileWatcherEmitter } from '../../neuranet/device/watchdog';
import TaskBoxButton from '../TaskBoxButton';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

import { CONFIG } from '../../config/config';


// Update the interface to match device data
interface DeviceData {
  id: number;
  device_name: string;
  device_manufacturer: string;
  device_model: string;
  storage_capacity_gb: string;
  total_storage: string;
  upload_speed: number | string;  // Changed to allow both number and string
  download_speed: number | string;  // Changed to allow both number and string
  battery_status: string;
  battery_time_remaining: string;
  available: string;
  cpu_info_manufacturer: string;
  cpu_info_brand: string;
  cpu_info_speed: string;
  cpu_info_cores: string;
  cpu_info_physical_cores: string;
  cpu_info_processors: string;
  cpu_info_socket: string;
  cpu_info_vendor: string;
  cpu_info_family: string;
  cpu_usage: string;
  gpu_usage: string;
  ram_usage: string;
  ram_total: string;
  ram_free: string;
}

const headCells: HeadCell[] = [
  { id: 'device_name', numeric: false, label: 'Name', isVisibleOnSmallScreen: true },
];

type Order = 'asc' | 'desc';

interface HeadCell {
  disablePadding?: boolean;
  id: keyof DeviceData;
  label: string;
  numeric: boolean;
  isVisibleOnSmallScreen: boolean;
}

interface EnhancedTableProps {
  numSelected: number;
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof DeviceData) => void;
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void;
  order: Order;
  orderBy: keyof DeviceData;
  rowCount: number;
}

function EnhancedTableHead(props: EnhancedTableProps) {
  const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } = props;
  const isSmallScreen = useMediaQuery('(max-width:960px)');
  const createSortHandler = (property: keyof DeviceData) => (event: React.MouseEvent<unknown>) => {
    onRequestSort(event, property);
  };

  const { files, set_Files, global_file_path, global_file_path_device } = useAuth();  // Assuming global_file_path is available via context
  const pathSegments = global_file_path ? global_file_path.split('/').filter(Boolean) : []; // Split and remove empty segments safely


  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            color="primary"
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{
              'aria-label': 'select all desserts',
            }}
          />
        </TableCell>
        {headCells
          .filter(headCell => !isSmallScreen || headCell.isVisibleOnSmallScreen)
          .map(headCell => (
            <TableCell
              key={headCell.id}
              align={headCell.numeric ? 'right' : 'left'}
              sortDirection={orderBy === headCell.id ? order : false}
            >
              <TableSortLabel
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : 'asc'}
                onClick={createSortHandler(headCell.id)}
              >
                {headCell.label}
                {orderBy === headCell.id ? (
                  <Box component="span" sx={visuallyHidden}>
                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                  </Box>
                ) : null}
              </TableSortLabel>
            </TableCell>
          ))}
      </TableRow>
    </TableHead>
  );
}


const file_name: string = 'mmills_database_snapshot.json';
const directory_name: string = 'BCloud';
const directory_path: string = path.join(os.homedir(), directory_name);
const snapshot_json: string = path.join(directory_path, file_name);

// Add this utility function at the top of the file, outside of any component
function formatSpeed(speed: number | string): string {
  if (typeof speed === 'number') {
    const speedInMbps = speed / 1000000; // Convert bits to megabits
    return `${speedInMbps.toFixed(2)} Mbps`;
  }
  return speed as string; // If it's not a number, return as is (e.g., 'N/A')
}

// Add this utility function at the top of the file, outside of any component
function formatBatteryStatus(status: string): string {
  return status === 'N/A' ? status : `${status}%`;
}

// Add this utility function at the top of the file, outside of any component
function formatStorageCapacity(capacity: string | number): string {
  if (typeof capacity === 'number') {
    const capacityInGB = capacity; // Convert MB to GB
    return `${capacityInGB.toFixed(2)} GB`;
  } else if (typeof capacity === 'string' && !isNaN(parseFloat(capacity))) {
    const capacityInGB = parseFloat(capacity); // Convert MB to GB
    return `${capacityInGB.toFixed(2)} GB`;
  }
  return capacity as string; // If it's not a number or valid numeric string, return as is (e.g., 'N/A')
}

export default function Devices() {
  const isSmallScreen = useMediaQuery('(max-width:960px)');
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof DeviceData>('device_name');
  const [selected, setSelected] = useState<readonly number[]>([]);
  const [selectedDeviceNames, setSelectedDeviceNames] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredRowId, setHoveredRowId] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [dense, setDense] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(100);
  const [fileRows, setFileRows] = useState<DeviceData[]>([]); // State for storing fetched file data
  const [allDevices, setAllDevices] = useState<DeviceData[]>([]);
  const { global_file_path, global_file_path_device, setGlobal_file_path } = useAuth();
  const [isAddingFolder, setIsAddingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [disableFetch, setDisableFetch] = useState(false);
  const { updates, setUpdates, tasks, setTasks, username, first_name, last_name, setFirstname, setLastname, redirect_to_login, setredirect_to_login, taskbox_expanded, setTaskbox_expanded } = useAuth();
  const [selectedDevice, setSelectedDevice] = useState<DeviceData | null>(null);

  let url: string;
  if (CONFIG.prod) {
    url = 'https://website2-389236221119.us-central1.run.app';
  } else {
    url = 'http://localhost:8080';
  }

  const getSelectedDeviceNames = () => {
    return selected.map(id => {
      const device = fileRows.find(device => device.id === id);
      return device ? device.device_name : null;
    }).filter(device_name => device_name !== null); // Filter out any null values if a file wasn't found
  };


  const fetchDevices = async () => {
    try {
      setIsLoading(true);
      // Fetch user information
      const userInfoResponse = await axios.get<{
        first_name: string;
        last_name: string;
        phone_number: string;
        email: string;
      }>(`${url}/getuserinfo/${username}/`);

      const { first_name, last_name } = userInfoResponse.data;
      setFirstname(first_name);
      setLastname(last_name);

      // Fetch device information
      const deviceInfoResponse = await axios.get<{
        devices: any[];
      }>(`${url}/getdeviceinfo/${username}/`);

      const { devices } = deviceInfoResponse.data;

      // Transform device data
      const transformedDevices: DeviceData[] = devices.map((device, index) => ({
        id: index + 1,
        device_name: device.device_name,
        device_manufacturer: device.device_manufacturer,
        device_model: device.device_model,
        storage_capacity_gb: device.storage_capacity_gb,
        total_storage: device.total_storage,
        upload_speed: Array.isArray(device.upload_speed)
          ? device.upload_speed[0] || 'N/A'
          : device.upload_speed || 'N/A',
        download_speed: Array.isArray(device.download_speed)
          ? device.download_speed[0] || 'N/A'
          : device.download_speed || 'N/A',
        battery_status: Array.isArray(device.battery_status)
          ? device.battery_status[0] || 'N/A'
          : device.battery_status || 'N/A',
        battery_time_remaining: device.battery_time_remaining,
        available: device.online ? "Available" : "Unavailable",
        cpu_info_manufacturer: device.cpu_info_manufacturer,
        cpu_info_brand: device.cpu_info_brand,
        cpu_info_speed: device.cpu_info_speed,
        cpu_info_cores: device.cpu_info_cores,
        cpu_info_physical_cores: device.cpu_info_physical_cores,
        cpu_info_processors: device.cpu_info_processors,
        cpu_info_socket: device.cpu_info_socket,
        cpu_info_vendor: device.cpu_info_vendor,
        cpu_info_family: device.cpu_info_family,
        cpu_usage: device.cpu_usage,
        gpu_usage: device.gpu_usage,
        ram_usage: device.ram_usage,
        ram_total: device.ram_total,
        ram_free: device.ram_free,

      }));

      setAllDevices(transformedDevices);

      // Select the first device if the list is not empty
      if (transformedDevices.length > 0) {
        setSelectedDevice(transformedDevices[0]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, [username, updates]);





  useEffect(() => {
    const pathToShow = global_file_path || '/';
    const pathSegments = pathToShow.split('/').filter(Boolean).length;

    const filteredDevices = allDevices.filter(device => {
      if (!global_file_path && !global_file_path_device) {
        return true; // Show all files
      }

      if (!global_file_path && global_file_path_device) {
        return device.device_name === global_file_path_device; // Show all files for the specified device
      }

      // Add a check to ensure filePath is defined
      if (!device.device_name) {
        return false; // Skip files with undefined filePath
      }

      const deviceSegments = device.device_name.split('/').filter(Boolean).length;
      const isInSameDirectory = device.device_name.startsWith(pathToShow) && deviceSegments === pathSegments + 1;
      const isFile = device.device_name === pathToShow;

      return isInSameDirectory || isFile;
    });

    setFileRows(filteredDevices);

  }, [global_file_path, global_file_path_device, allDevices]);


  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: keyof DeviceData,
  ) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = fileRows.map((n) => n.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleFileNameClick = async (id: number) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: readonly number[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
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
    const device_name = fileRows.find(device => device.id === id)?.device_name;
    const newSelectedDeviceNames = newSelected
      .map(id => fileRows.find(device => device.id === id)?.device_name)
      .filter(name => name !== undefined) as string[];
    console.log(newSelectedDeviceNames[0]);
    const directoryName = "BCloud";
    const directoryPath = join(os.homedir(), directoryName);
    let fileFound = false;
    let folderFound = false;
    let filePath = '';
    try {
      const deviceStat = await stat(newSelectedDeviceNames[0]);
      if (deviceStat.isFile()) {
        fileFound = true;
        console.log(`File '${file_name}' found in directory.`);
      }
      if (deviceStat.isDirectory()) {
        folderFound = true;
        setGlobal_file_path(newSelectedDeviceNames[0]);
      }
      if (fileFound) {
        // Send an IPC message to the main process to handle opening the file
        console.log(`Opening file '${file_name}'...`);
        shell.openPath(newSelectedDeviceNames[0]);
      }
      if (folderFound) {
        // Send an IPC message to the main process to handle opening the file
        console.log(`Opening folder '${file_name}'...`);
        // shell.openPath(newSelectedDeviceNames[0]);
      }
      if (!fileFound && !folderFound) {

        console.error(`File '${file_name}' not found in directory, searhing other devices`);

        let task_description = 'Opening ' + selectedDeviceNames.join(', ');
        let taskInfo = await neuranet.sessions.addTask(username ?? '', task_description, tasks, setTasks);
        setTaskbox_expanded(true);
        let response = await handlers.files.downloadFile(username ?? '', selectedDeviceNames, selectedDeviceNames, taskInfo);
        if (response === 'No file selected') {
          let task_result = await neuranet.sessions.failTask(username ?? '', taskInfo, response, tasks, setTasks);
        }
        if (response === 'File not available') {
          let task_result = await neuranet.sessions.failTask(username ?? '', taskInfo, response, tasks, setTasks);
        }
        if (response === 'success') {
          let task_result = await neuranet.sessions.completeTask(username ?? '', taskInfo, tasks, setTasks);
          const directory_name: string = 'BCloud';
          const directory_path: string = path.join(os.homedir(), directory_name);
          const file_save_path: string = path.join(directory_path, file_name ?? '');
          shell.openPath(file_save_path);

          // Create a file watcher
          const watcher = fs.watch(file_save_path, (eventType, filename) => {
            if (eventType === 'rename' || eventType === 'change') {
              // The file has been closed, so we can delete it
              watcher.close(); // Stop watching the file

              fs.unlink(file_save_path, (err) => {
                if (err) {
                  console.error('Error deleting file:', err);
                } else {
                  console.log(`File ${file_save_path} successfully deleted.`);
                }
              });
            }
          });
        }
      }
    } catch (err) {
      console.error('Error searching for file:', err);

    }
  };
  const handleClick = (event: React.MouseEvent<unknown>, id: number) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: readonly number[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
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

    const device_name = fileRows.find(device => device.id === id)?.device_name;
    const newSelectedDeviceNames = newSelected.map(id => fileRows.find(device => device.id === id)?.device_name).filter(name => name !== undefined) as string[];
    setSelectedDeviceNames(newSelectedDeviceNames);
    console.log(newSelectedDeviceNames)
    console.log(selectedDeviceNames)

  };


  const [selectedDevices, setSelectedDevices] = useState<readonly number[]>([]);



  const handleAddDeviceClick = async () => {
    console.log("handling add device click")
    let device_name = neuranet.device.name();
    let task_description = 'Adding device ' + device_name;
    let result = await handlers.devices.addDevice(username ?? '');
    let taskInfo = await neuranet.sessions.addTask(username ?? '', task_description, tasks, setTasks);
    setTaskbox_expanded(true);

    if (result === 'success') {
      let task_result = await neuranet.sessions.completeTask(username ?? '', taskInfo, tasks, setTasks);
      // Refresh the device list after adding a device
      await fetchDevices();
    }
  };

  const handleDeleteDevice = async () => {
    let task_description = 'Deleting device ' + selectedDeviceNames.join(', ');
    let taskInfo = await neuranet.sessions.addTask(username ?? '', task_description, tasks, setTasks);
    setTaskbox_expanded(true);
    let result = await neuranet.device.delete_device(username ?? '');
    if (result === 'success') {
      let task_result = await neuranet.sessions.completeTask(username ?? '', taskInfo, tasks, setTasks);
      // Refresh the device list after deleting a device
      await fetchDevices();
    }
    setSelectedDevices([]);
  };


  const [deleteloading, setdeleteLoading] = useState<boolean>(false);

  const [backHistory, setBackHistory] = useState<any[]>([]);
  const [forwardHistory, setForwardHistory] = useState<any[]>([]);

  const handleKeyPress = async (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      await handlers.keybinds.foldernameSave(
        newFolderName,
        setIsAddingFolder,
        setUpdates,
        updates,
        global_file_path ?? '',
        setFileRows,
        setNewFolderName,
        setDisableFetch,
        username
      );
    }
  }
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const isSelected = (id: number) => selected.indexOf(id) !== -1;

  // Avoid a layout jump when reaching the last page with empty rows.
  // Calculate empty rows for pagination
  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - fileRows.length) : 0;

  function stableSort<T>(array: T[], comparator: (a: T, b: T) => number): T[] {
    return array
      .map((el, index) => ({ el, index })) // Attach the original index to each element
      .sort((a, b) => {
        const order = comparator(a.el, b.el);
        if (order !== 0) return order; // If elements are not equal, sort them according to `comparator`
        return a.index - b.index; // If elements are equal, sort them according to their original position
      })
      .map(({ el }) => el); // Extract the sorted elements
  }

  function getComparator<Key extends keyof any>(
    order: Order,
    orderBy: Key,
  ): (a: { [key in Key]: number | string }, b: { [key in Key]: number | string }) => number {
    return order === 'desc'
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  }

  function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
    return 0;
  }

  const handleDeviceClick = (device: DeviceData) => {
    setSelectedDevice(device);
  };

  return (
    // <Box sx={{ width: '100%', pl: 4, pr: 4, mt: 0, pt: 5 }}>
    <Box sx={{ width: '100%', pt: 0 }}>

      <Card variant='outlined' sx={{ borderTop: 0, borderLeft: 0, borderBottom: 0 }}>
        <CardContent sx={{ paddingBottom: '2px !important', paddingTop: '46px' }}>
          <Stack spacing={2} direction="row" sx={{ flexWrap: 'nowrap' }}>
            <Grid container spacing={0} sx={{ display: 'flex', flexWrap: 'nowrap', pt: 0 }}>

              <Grid item paddingRight={1}>
                <Tooltip title="Add Device">
                  <Button
                    onClick={handleAddDeviceClick}
                    sx={{ paddingLeft: '4px', paddingRight: '4px', minWidth: '30px' }}
                  >
                    <AddToQueueIcon fontSize="inherit" />
                  </Button>
                </Tooltip>
              </Grid>


              <Grid item paddingRight={1}>
                <Tooltip title="Delete Device">
                  <Button
                    onClick={handleDeleteDevice}
                    sx={{ paddingLeft: '4px', paddingRight: '4px', minWidth: '30px' }}
                  >
                    <DeleteIcon fontSize="inherit" />
                  </Button>
                </Tooltip>
              </Grid>
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
        {/* Left panel: Device table */}
        <Card variant="outlined" sx={{ flexGrow: 1, height: '100%', width: '30%', overflow: 'hidden' }}>
          <CardContent sx={{ height: '100%', width: '100%', overflow: 'auto' }}>
            <TableContainer sx={{ maxHeight: '96%', overflowY: 'auto', overflowX: 'auto' }}>
              <Table aria-labelledby="tableTitle" size="small">
                <EnhancedTableHead
                  numSelected={selected.length}
                  order={order}
                  orderBy={orderBy}
                  onSelectAllClick={handleSelectAllClick}
                  onRequestSort={handleRequestSort}
                  rowCount={allDevices.length}
                />
                <TableBody>
                  {isLoading ? (
                    Array.from(new Array(rowsPerPage)).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell padding="checkbox">
                          <Skeleton variant="rectangular" width={24} height={24} />
                        </TableCell>
                        <TableCell>
                          <Skeleton variant="text" width="100%" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    stableSort(allDevices, getComparator(order, orderBy))
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((row, index) => {
                        const isItemSelected = isSelected(row.id);
                        const labelId = `enhanced-table-checkbox-${index}`;

                        return (
                          <TableRow
                            hover
                            onClick={() => handleDeviceClick(row)}
                            role="checkbox"
                            aria-checked={isItemSelected}
                            tabIndex={-1}
                            key={row.id}
                            selected={!!selectedDevice && selectedDevice.id === row.id}
                          >
                            <TableCell padding="checkbox">
                              <Checkbox
                                color="primary"
                                checked={isItemSelected}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleClick(event, row.id);
                                }}
                                inputProps={{ 'aria-labelledby': labelId }}
                              />
                            </TableCell>
                            <TableCell component="th" id={labelId} scope="row" padding="normal">
                              {row.device_name}
                            </TableCell>
                          </TableRow>
                        );
                      })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50, 100]}
              component="div"
              count={allDevices.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </CardContent>
        </Card>

        {/* Right panel: Device details */}
        <Card variant="outlined" sx={{ height: '100%', width: '70%', overflow: 'auto' }}>
          <CardContent>

            {selectedDevice ? (
              <>
                <Typography variant="h4" gutterBottom>
                  {selectedDevice.device_name}
                </Typography>
                <Divider sx={{ my: 2 }} />

                <Stack justifyContent="space-evenly" direction="row" spacing={2}>
                  <Stack direction="column" spacing={2}>
                    <Typography variant="h5" gutterBottom>
                      Device Information
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Typography>
                      <strong style={{ color: "white" }}>Status:</strong>{" "}
                      <span style={{ color: selectedDevice.available === "Available" ? "green" : "red" }}>
                        {selectedDevice.available}
                      </span>
                    </Typography>
                    <Typography><strong>Manufacturer:</strong> {selectedDevice.device_manufacturer}</Typography>
                    <Typography><strong>Model:</strong> {selectedDevice.device_model}</Typography>
                    <Typography><strong>Battery Status:</strong> {formatBatteryStatus(selectedDevice.battery_status)}</Typography>
                    <Typography><strong>Storage Capacity:</strong> {formatStorageCapacity(selectedDevice.storage_capacity_gb)}</Typography>
                  </Stack>

                  <Stack direction="column" spacing={2}>
                    <Typography variant="h5" gutterBottom>
                      Network Details
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Typography><strong>Upload Speed:</strong> {formatSpeed(selectedDevice.upload_speed)}</Typography>
                    <Typography><strong>Download Speed:</strong> {formatSpeed(selectedDevice.download_speed)}</Typography>
                  </Stack>


                  <Stack direction="column" spacing={2}>
                    <Typography variant="h5" gutterBottom>
                      Performance Metrics
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Typography><strong>CPU Info:</strong> {selectedDevice.cpu_info_manufacturer} {selectedDevice.cpu_info_brand}</Typography>
                    <Typography><strong>CPU Speed: </strong>{selectedDevice.cpu_info_speed}</Typography>
                    <Typography><strong>CPU Cores: </strong>{selectedDevice.cpu_info_cores}</Typography>
                    <Typography><strong>CPU Physical Cores: </strong>{selectedDevice.cpu_info_physical_cores}</Typography>
                    <Typography><strong>CPU Processors: </strong>{selectedDevice.cpu_info_processors}</Typography>
                    <Typography>
                      <strong>CPU Usage:</strong> {`${(parseFloat(selectedDevice.cpu_usage) || 0).toFixed(2)}%`}
                    </Typography>
                    <Typography><strong>GPU Usage:</strong> {selectedDevice.gpu_usage[0]}</Typography>
                    <Typography><strong>RAM Usage:</strong> {selectedDevice.ram_usage[0]}</Typography>
                    <Typography><strong>RAM Total:</strong> {selectedDevice.ram_total[0]}</Typography>
                    <Typography><strong>RAM Free:</strong> {selectedDevice.ram_free[0]}</Typography>

                  </Stack>

                </Stack>

                <Typography variant="h5" gutterBottom>
                  Files
                </Typography>
                <Divider sx={{ my: 2 }} />

                <Typography variant="body1" gutterBottom>
                  Add Folders to your library
                </Typography>
                <Button
                  onClick={() => setIsAddingFolder(true)}
                  variant="outlined"
                  color="primary"
                  sx={{ mt: 2 }}
                >
                  Browse For Media Folder
                </Button>




              </>
            ) : (
              <Typography variant="body1">Select a device to view details</Typography>
            )}
          </CardContent>
        </Card>
      </Stack>
    </Box >

  );
}
