import AddToQueueIcon from '@mui/icons-material/AddToQueue';
import CreateNewFolderOutlinedIcon from '@mui/icons-material/CreateNewFolderOutlined';
import DeleteIcon from '@mui/icons-material/Delete';
import DevicesIcon from '@mui/icons-material/Devices';
import DownloadIcon from '@mui/icons-material/Download';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import GrainIcon from '@mui/icons-material/Grain';
import NavigateBeforeOutlinedIcon from '@mui/icons-material/NavigateBeforeOutlined';
import NavigateNextOutlinedIcon from '@mui/icons-material/NavigateNextOutlined';
import { CardContent, Container, Divider, Skeleton, useMediaQuery, LinearProgress } from '@mui/material';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs'; import Button from '@mui/material/Button';
import ButtonBase from '@mui/material/ButtonBase';
import Card from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { visuallyHidden } from '@mui/utils';
import axios from 'axios';
import { shell } from 'electron';
import fs from 'fs';
import { readdir, stat } from 'fs/promises';
import isEqual from 'lodash/isEqual';
import os from 'os';
import path, { join } from 'path';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { handlers } from '../../../handlers';
import { neuranet } from '../../../neuranet';
import { fileWatcherEmitter } from '../../../neuranet/device/watchdog';
import * as utils from '../../../utils';
import AccountMenuIcon from '../../common/AccountMenuIcon';
import FileTreeView from './components/NewTreeView/FileTreeView';
import NewInputFileUploadButton from '../../newuploadfilebutton';
import TaskBoxButton from '../../common/notifications/NotificationsButton';
import { fetchDeviceData } from './utils/fetchDeviceData';
import { FileBreadcrumbs } from './components/FileBreadcrumbs';
import { DatabaseData, Order } from './types/index';
import ShareFileButton from '../../common/share_file_button/share_file_button';

import SyncIcon from '@mui/icons-material/Sync';
import AddFileToSyncButton from '../../common/add_file_to_sync_button';
import { EnhancedTableProps, HeadCell } from './types';
import { useFileData } from './hooks/useFileData';
import { newUseFileData } from './hooks/newUseFileData';
import Rating from '@mui/material/Rating';
import { CONFIG } from '../../../config/config';
import Dialog from '@mui/material/Dialog';
import UploadProgress from '../../common/upload_progress/upload_progress';
import DownloadProgress from '../../common/download_progress/download_progress';
import { addDownloadsInfo, getDownloadsInfo } from '../../common/download_progress/add_downloads_info';
import { getUploadsInfo } from '../../common/upload_progress/add_uploads_info';
import NotificationsButton from '../../common/notifications/NotificationsButton';
import SyncButton from '../../common/sync_button/sync_button';

// Rename the interface to avoid collision with DOM Notification
interface UserNotification {
  id: string;
  type: 'share' | 'upload' | 'system';
  title: string;
  timestamp: string;
  read: boolean;
  folderName?: string;
  actionLabel?: string;
}

interface NotificationResponse {
  result: 'success' | 'fail';
  notifications: UserNotification[];
}

const getHeadCells = (isCloudSync: boolean): HeadCell[] => [
  { id: 'file_name', numeric: false, label: 'Name', isVisibleOnSmallScreen: true, isVisibleNotOnCloudSync: true },
  { id: 'file_size', numeric: false, label: 'Size', isVisibleOnSmallScreen: true, isVisibleNotOnCloudSync: true },
  { id: 'kind', numeric: false, label: 'Kind', isVisibleOnSmallScreen: true, isVisibleNotOnCloudSync: true },
  { id: 'device_name', numeric: false, label: 'Location', isVisibleOnSmallScreen: false, isVisibleNotOnCloudSync: true },
  { id: 'available', numeric: false, label: 'Status', isVisibleOnSmallScreen: false, isVisibleNotOnCloudSync: true },
  { id: 'device_ids', numeric: false, label: 'Coverage', isVisibleOnSmallScreen: true, isVisibleNotOnCloudSync: false },
  { id: 'file_priority', numeric: false, label: 'Priority', isVisibleOnSmallScreen: true, isVisibleNotOnCloudSync: false },
  // { id: 'shared_with', numeric: false, label: 'Shared With', isVisibleOnSmallScreen: true, isVisibleNotOnCloudSync: true },
  { id: 'is_public', numeric: false, label: 'Public', isVisibleOnSmallScreen: true, isVisibleNotOnCloudSync: true },
  { id: 'date_uploaded', numeric: true, label: 'Date Uploaded', isVisibleOnSmallScreen: true, isVisibleNotOnCloudSync: true },
];



function EnhancedTableHead(props: EnhancedTableProps) {
  const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } = props;
  const isSmallScreen = useMediaQuery('(max-width:960px)');
  const { global_file_path } = useAuth();
  const isCloudSync = global_file_path?.includes('Cloud Sync') ?? false;
  const headCells = getHeadCells(isCloudSync);
  const createSortHandler = (property: keyof DatabaseData) => (event: React.MouseEvent<unknown>) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        <TableCell
          padding="checkbox"
          sx={{
            backgroundColor: 'background.paper',
          }}
        >
          <Checkbox
            size="small"
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
          .filter((headCell: HeadCell) => {
            const isVisibleOnCurrentScreen = !isSmallScreen || headCell.isVisibleOnSmallScreen;

            if (isCloudSync) {
              // Show only these specific columns in Cloud Sync view
              const cloudSyncColumns = ['file_name', 'file_size', 'device_ids', 'file_priority'];
              return isVisibleOnCurrentScreen && cloudSyncColumns.includes(headCell.id);
            } else {
              // In regular view, show all except Cloud Sync specific columns
              return isVisibleOnCurrentScreen && headCell.isVisibleNotOnCloudSync;
            }
          })
          .map((headCell: HeadCell, index: number) => (
            <TableCell
              key={`${headCell.id}-${index}`}
              align={headCell.numeric ? 'right' : 'left'}
              sortDirection={orderBy === headCell.id ? order : false}
              sx={{
                backgroundColor: 'background.paper',
              }}
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

export default function Files() {
  const isSmallScreen = useMediaQuery('(max-width:960px)');
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof DatabaseData>('file_name');
  const [selected, setSelected] = useState<readonly number[]>([]);
  const [selectedFileNames, setSelectedFileNames] = useState<string[]>([]);
  const [selectedDeviceNames, setSelectedDeviceNames] = useState<string[]>([]);
  const [selectedFileInfo, setSelectedFileInfo] = useState<any[]>([]);
  const [hoveredRowId, setHoveredRowId] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [dense, setDense] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(100);
  const { global_file_path, global_file_path_device, setGlobal_file_path, websocket } = useAuth();
  const [isAddingFolder, setIsAddingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [disableFetch, setDisableFetch] = useState(false);
  const {
    updates,
    setUpdates,
    tasks,
    setTasks,
    username,
    files,
    sync_files,
    first_name,
    last_name,
    phone_number,
    email,
    picture,
    devices,
    setFirstname,
    setLastname,
    setPhoneNumber,
    setEmail,
    setDevices,
    setSyncFiles,
    setPicture,
    redirect_to_login,
    setredirect_to_login,
    taskbox_expanded,
    setTaskbox_expanded,
  } = useAuth();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState('');

  const getSelectedFileNames = () => {
    return selected
      .map((id) => {
        const file = fileRows.find((file) => file.id === id);
        return file ? file.file_name : null;
      })
      .filter((file_name) => file_name !== null); // Filter out any null values if a file wasn't found
  };



  // useEffect(() => {
  //   const fetchAndUpdateDevices = async () => {
  //     const new_devices = await fetchDeviceData(
  //       username || '',
  //       disableFetch,
  //       global_file_path || '',
  //       {
  //         setFirstname,
  //         setLastname,
  //         setDevices,
  //       },
  //     );

  //     if (new_devices) {
  //       if (devices) {
  //         const updatedDevices = [...devices, ...new_devices];
  //         setDevices(updatedDevices);
  //       } else {
  //         setDevices(new_devices);
  //       }
  //     }
  //   };

  //   fetchAndUpdateDevices();
  // }, [username, disableFetch, updates, global_file_path]);



  const { isLoading, allFiles, fileRows, setAllFiles } = newUseFileData(
    username,
    disableFetch,
    updates,
    global_file_path,
    global_file_path_device,
    setFirstname,
    setLastname,
    files,
    sync_files,
    devices,
    setDevices,
  );

  useEffect(() => {

  }, [files]);


  useEffect(() => {
    let new_devices = fetchDeviceData(username || '', disableFetch, global_file_path || '', {
      setFirstname,
      setLastname,
      setDevices,
    });

  }, [devices]);





  const handleRequestSort = (event: React.MouseEvent<unknown>, property: keyof DatabaseData) => {
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
      newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
    }
    const file_name = fileRows.find((file) => file.id === id)?.file_name;
    const newSelectedFileNames = newSelected
      .map((id) => fileRows.find((file) => file.id === id)?.file_name)
      .filter((name) => name !== undefined) as string[];
    console.log(newSelectedFileNames);
    const newSelectedFilePaths = newSelected
      .map((id) => fileRows.find((file) => file.id === id)?.file_path)
      .filter((name) => name !== undefined) as string[];
    console.log(newSelectedFilePaths[0]);
    const directoryName = 'BCloud';
    const directoryPath = join(os.homedir(), directoryName);
    let fileFound = false;
    let folderFound = false;
    let filePath = '';
    try {
      const fileStat = await stat(newSelectedFilePaths[0]);
      if (fileStat.isFile()) {
        fileFound = true;
        console.log(`File '${file_name}' found in directory.`);
      }
      if (fileStat.isDirectory()) {
        folderFound = true;
        setGlobal_file_path(newSelectedFilePaths[0]);
      }
      if (fileFound) {
        // Send an IPC message to the main process to handle opening the file
        console.log(`Opening file '${file_name}'...`);
        shell.openPath(newSelectedFilePaths[0]);
      }
      if (folderFound) {
        // Send an IPC message to the main process to handle opening the file
        console.log(`Opening folder '${file_name}'...`);
        // shell.openPath(newSelectedFilePaths[0]);
      }
      if (!fileFound && !folderFound) {
        console.error(`File '${file_name}' not found in directory, searhing other devices`);

        let task_description = 'Opening ' + selectedFileNames.join(', ');
        let taskInfo = await neuranet.sessions.addTask(username ?? '', task_description, tasks, setTasks);
        setTaskbox_expanded(true);
        let response = await handlers.files.downloadFile(
          username ?? '',
          selectedFileNames,
          selectedDeviceNames,
          selectedFileInfo,
          taskInfo,
          tasks || [],
          setTasks,
          setTaskbox_expanded,
          websocket as unknown as WebSocket,
        );
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
      newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
    }
    setSelected(newSelected);

    const file_name = fileRows.find((file) => file.id === id)?.file_name;
    const device_name = fileRows.find((file) => file.id === id)?.device_name;
    console.log(newSelected)
    const newSelectedFileNames = newSelected
      .map((id) => fileRows.find((file) => file.id === id)?.file_name)
      .filter((name) => name !== undefined) as string[];
    const newSelectedDeviceNames = newSelected
      .map((id) => fileRows.find((file) => file.id === id)?.device_name)
      .filter((name) => name !== undefined) as string[];
    setSelectedFileNames(newSelectedFileNames);
    setSelectedDeviceNames(newSelectedDeviceNames);
    console.log(newSelectedFileNames);
    console.log(selectedFileNames);
    // Get file info for selected files and update selectedFileInfo state
    const newSelectedFileInfo = newSelected
      .map((id) => fileRows.find((file) => file.id === id))
      .filter((file) => file !== undefined);
    setSelectedFileInfo(newSelectedFileInfo);
    console.log(newSelectedFileInfo);
  };

  const [selectedfiles, setSelectedFiles] = useState<readonly number[]>([]);

  const handleDownloadClick = async () => {
    try {
      setSelectedFiles(selected);
      let task_description = 'Downloading ' + selectedFileNames.join(', ');
      let taskInfo = await neuranet.sessions.addTask(username ?? '', task_description, tasks, setTasks);

      // Initialize download progress for selected files
      const initialDownloads = selectedFileInfo.map(fileInfo => ({
        filename: fileInfo.file_name,
        fileType: fileInfo.kind || 'Unknown',
        progress: 0,
        status: 'downloading' as const,
        totalSize: fileInfo.file_size || 0,
        downloadedSize: 0,
        timeRemaining: undefined
      }));

      // Add to downloads tracking
      addDownloadsInfo(initialDownloads);

      // Add timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Download request timed out')), 30000); // 30 second timeout
      });

      // Race between the download and timeout
      const response = await Promise.race([
        handlers.files.downloadFile(
          username ?? '',
          selectedFileNames,
          selectedDeviceNames,
          selectedFileInfo,
          taskInfo,
          tasks || [],
          setTasks,
          setTaskbox_expanded,
          websocket as unknown as WebSocket,
        ),
        timeoutPromise
      ]);

      if (response === 'No file selected' || response === 'file_not_found') {
        await neuranet.sessions.failTask(username ?? '', taskInfo, response, tasks, setTasks);
      } else if (response === 'success') {
        await neuranet.sessions.completeTask(username ?? '', taskInfo, tasks, setTasks);
      }

      setSelected([]);
    } catch (error) {
      console.error('Download error:', error);
      setSelected([]);
      // Optionally show error to user via toast/alert
    }
  };

  const handleAddDeviceClick = async () => {
    // Here, we are specifically adding the task after the device has been created
    // Because the database will not know what device to add it to, as the device does not
    // exist yet

    console.log('handling add device click');

    let device_name = neuranet.device.name();
    let task_description = 'Adding device ' + device_name;
    let result = await handlers.devices.addDevice(username ?? '');
    let taskInfo = await neuranet.sessions.addTask(username ?? '', task_description, tasks, setTasks);
    setTaskbox_expanded(true);

    if (result === 'success') {
      let task_result = await neuranet.sessions.completeTask(username ?? '', taskInfo, tasks, setTasks);
    }
  };
  const handleSyncClick = async () => {
    // let result = handlers.files.addFile(username ?? '');
    let task_description = 'Scanning filesystem';
    let taskInfo = await neuranet.sessions.addTask(username ?? '', task_description, tasks, setTasks);
    setTaskbox_expanded(true);

    let result = await neuranet.device.scanFilesystem(username ?? '');

    if (result === 'success') {
      let task_result = await neuranet.sessions.completeTask(username ?? '', taskInfo, tasks, setTasks);
      setUpdates(updates + 1);
    }
  };

  const [deleteloading, setdeleteLoading] = useState<boolean>(false);

  const [backHistory, setBackHistory] = useState<any[]>([]);
  const [forwardHistory, setForwardHistory] = useState<any[]>([]);




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

  const handlePriorityChange = async (row: any, newValue: number | null) => {
    if (newValue === null) return;


    let task_description = 'Updating File Priority';
    let taskInfo = await neuranet.sessions.addTask(username ?? '', task_description, tasks, setTasks);
    setTaskbox_expanded(true);

    const newPriority = newValue;

    const result = await neuranet.files.updateFilePriority(row._id, username ?? '', newPriority);

    if (result === 'success') {
      let task_result = await neuranet.sessions.completeTask(username ?? '', taskInfo, tasks, setTasks);
      setUpdates(updates + 1);
    }



  };

  const isCloudSync = global_file_path?.includes('Cloud Sync') ?? false;
  const headCells = getHeadCells(isCloudSync);

  const fetchUserInfo = async () => {
    try {
      const userInfoResponse = await axios.get<{
        first_name: string;
        last_name: string;
        phone_number: string;
        email: string;
        picture: string;
      }>(`${CONFIG.url}/users/getuserinfo/${username}/`);

      const { first_name, last_name, phone_number, email } = userInfoResponse.data;

      console.log('userResponse:', userInfoResponse.data);

      setFirstname(first_name);
      setLastname(last_name);
      setPhoneNumber(phone_number);
      setEmail(email);
      setPicture({
        content_type: 'image/jpeg',
        data: userInfoResponse.data.picture
      });
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };


  useEffect(() => {
    fetchUserInfo();
  }, [username]);

  const handleShareModalOpen = (fileName: string) => {
    setSelectedFileName(fileName);
    setIsShareModalOpen(true);
  };

  const handleShareModalClose = () => {
    setIsShareModalOpen(false);
  };

  const old_uploads = [
    {
      filename: 'family_deer.mp4',
      fileType: 'MP4',
      progress: 13.5,
      status: 'uploading' as 'uploading' | 'failed' | 'completed' | 'skipped',
      totalSize: 200,
      uploadedSize: 27,
      timeRemaining: 21
    },
    // ... other uploads
  ];

  const old_downloads = [
    {
      filename: 'family_deer.mp4',
      fileType: 'MP4',
      progress: 13.5,
      status: 'downloading' as 'downloading' | 'failed' | 'completed' | 'skipped',
      totalSize: 200,
      downloadedSize: 27,
      timeRemaining: 21
    },
  ];





  // Add new state for downloads
  const [downloads, setDownloads] = useState<{
    filename: string;
    fileType: string;
    progress: number;
    status: 'downloading' | 'completed' | 'failed' | 'skipped';
    totalSize: number;
    downloadedSize: number;
    timeRemaining?: number;
  }[]>([]);

  // Add effect to subscribe to download updates
  useEffect(() => {
    // Set up interval to check for download updates
    const downloadUpdateInterval = setInterval(() => {
      const currentDownloads = getDownloadsInfo();
      setDownloads(currentDownloads);
    }, 1000); // Check every second

    // Cleanup interval on unmount
    return () => clearInterval(downloadUpdateInterval);
  }, []);

  // Add new state for uploads
  const [uploads, setUploads] = useState<{
    filename: string;
    fileType: string;
    progress: number;
    status: 'uploading' | 'completed' | 'failed' | 'skipped';
    totalSize: number;
    uploadedSize: number;
    timeRemaining?: number;
  }[]>([]);

  // Add effect to subscribe to upload updates
  useEffect(() => {
    // Set up interval to check for upload updates
    const uploadUpdateInterval = setInterval(() => {
      const currentUploads = getUploadsInfo();
      setUploads(currentUploads);
    }, 1000); // Check every second

    // Cleanup interval on unmount
    return () => clearInterval(uploadUpdateInterval);
  }, []);

  return (
    // <Box sx={{ width: '100%', pl: 4, pr: 4, mt: 0, pt: 5 }}>
    <Box sx={{ width: '100%', pt: 0 }}>
      <Card variant="outlined" sx={{ borderTop: 0, borderLeft: 0, borderBottom: 0 }}>
        <CardContent sx={{ paddingBottom: '2px !important', paddingTop: '46px' }}>
          <Stack spacing={2} direction="row" sx={{ flexWrap: 'nowrap' }}>
            <Grid container spacing={0} sx={{ display: 'flex', flexWrap: 'nowrap', pt: 0 }}>
              <Grid item paddingRight={1}>
                <Tooltip title="Navigate back">
                  <Button
                    onClick={() =>
                      handlers.buttons.backButton(
                        global_file_path,
                        setGlobal_file_path,
                        backHistory,
                        setBackHistory,
                        setForwardHistory,
                      )
                    }
                    sx={{ paddingLeft: '4px', paddingRight: '4px', minWidth: '30px' }} // Adjust the left and right padding as needed
                  >
                    <NavigateBeforeOutlinedIcon fontSize="inherit" />
                  </Button>
                </Tooltip>
              </Grid>
              <Grid item paddingRight={1}>
                <Tooltip title="Navigate forward">
                  <Button
                    onClick={() =>
                      handlers.buttons.forwardButton(
                        global_file_path ?? '',
                        setGlobal_file_path,
                        backHistory,
                        setBackHistory,
                        forwardHistory,
                        setForwardHistory,
                      )
                    }
                    sx={{ paddingLeft: '4px', paddingRight: '4px', minWidth: '30px' }} // Adjust the left and right padding as needed
                  >
                    <NavigateNextOutlinedIcon fontSize="inherit" />
                  </Button>
                </Tooltip>
              </Grid>

              {/* <Grid item paddingRight={1}> */}
              {/*   <Tooltip title="New folder"> */}
              {/*     <Button */}
              {/*       onClick={() => handlers.buttons.addfolderButton( */}
              {/*         setDisableFetch, */}
              {/*         setIsAddingFolder, */}
              {/*         setNewFolderName, */}
              {/*         setFileRows */}
              {/*       )} */}
              {/*       sx={{ paddingLeft: '4px', paddingRight: '4px', minWidth: '30px' }} // Adjust the left and right padding as needed */}
              {/*     > */}
              {/*       <CreateNewFolderOutlinedIcon */}
              {/*         fontSize="inherit" */}
              {/*       /> */}
              {/*     </Button> */}
              {/*   </Tooltip> */}
              {/* </Grid> */}
              <Grid item paddingRight={1}>
                <Tooltip title="Sync">
                  <Button
                    onClick={handleSyncClick}
                    sx={{ paddingLeft: '4px', paddingRight: '4px', minWidth: '30px' }} // Adjust the left and right padding as needed
                  >
                    <SyncIcon fontSize="inherit" />
                  </Button>
                </Tooltip>
              </Grid>
              <Grid item paddingRight={1}>
                <Tooltip title="Scan">
                  <SyncButton />
                </Tooltip>
              </Grid>
              <Grid item paddingRight={1}>
                <Tooltip title="Upload">
                  <NewInputFileUploadButton />
                </Tooltip>
              </Grid>
              <Grid item paddingRight={1}>
                <Tooltip title="Download">
                  <Button
                    onClick={handleDownloadClick}
                    sx={{ paddingLeft: '4px', paddingRight: '4px', minWidth: '30px' }} // Adjust the left and right padding as needed
                  >
                    <DownloadIcon fontSize="inherit" />
                  </Button>
                </Tooltip>
              </Grid>

              <Grid item paddingRight={1}>
                <Tooltip title="Delete">
                  <Button
                    onClick={() => {
                      handlers.files.deleteFile(
                        setSelectedFileNames,
                        selectedFileNames,
                        global_file_path,
                        setdeleteLoading,
                        setIsAddingFolder,
                        setNewFolderName,
                        setDisableFetch,
                        username,
                        updates,
                        setUpdates,
                      );
                      setSelected([]);
                    }}
                    sx={{ paddingLeft: '4px', paddingRight: '4px', minWidth: '30px' }} // Adjust the left and right padding as needed
                  >
                    <DeleteIcon fontSize="inherit" />
                  </Button>
                </Tooltip>
              </Grid>
              <Divider orientation="vertical" flexItem />
              <Grid item paddingRight={1} paddingLeft={1}>
                <Tooltip title="Add to Sync">
                  <AddFileToSyncButton selectedFileNames={selectedFileNames} />
                </Tooltip>
              </Grid>
              <Grid item paddingRight={1}>
                <Tooltip title="Share File">
                  <ShareFileButton
                    selectedFileNames={selectedFileNames}
                    selectedFileInfo={selectedFileInfo}
                    onShare={() => handleShareModalOpen(selectedFileNames[0])}
                  />
                </Tooltip>
              </Grid>
            </Grid>
            <Grid container justifyContent="flex-end" alignItems="flex-end">
              <Grid item></Grid>
              <Grid item>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end' }}>
                  <Stack direction="row">
                    <UploadProgress uploads={uploads} />
                    <DownloadProgress downloads={downloads} />
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
      <Stack direction="row" spacing={0} sx={{ width: '100%', height: '100%', overflow: 'hidden' }}>
        <Stack>
          <Box display="flex" flexDirection="column" height="100%">
            <Card
              variant="outlined"
              sx={{ flexGrow: 0, height: '100%', overflow: 'hidden', borderLeft: 0, borderRight: 0 }}
            >
              <CardContent>
                <Grid container spacing={0} sx={{ flexGrow: 0, overflow: 'auto', maxHeight: 'calc(100vh - 120px)' }}>
                  <Grid item>
                    <FileTreeView />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>
        </Stack>
        <Card variant="outlined" sx={{ flexGrow: 1, height: '100%', width: '100%', overflow: 'hidden' }}>
          <CardContent sx={{ height: '100%', width: '100%', overflow: 'hidden', padding: 0 }}>
            <FileBreadcrumbs />
            {fileRows.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 5 }}>
                <FolderOpenIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h5" color="textSecondary">
                  No files available.
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Please upload a file to get started.
                </Typography>
              </Box>
            ) : (
              <>
                <TableContainer sx={{ maxHeight: 'calc(100vh - 180px)' }}> <Table aria-labelledby="tableTitle" size="small" stickyHeader>
                  <EnhancedTableHead
                    numSelected={selected.length}
                    order={order}
                    orderBy={orderBy}
                    onSelectAllClick={handleSelectAllClick}
                    onRequestSort={handleRequestSort}
                    rowCount={fileRows.length}
                  />
                  <TableBody>
                    {isLoading
                      ? Array.from(new Array(rowsPerPage)).map((_, index) => (
                        <TableRow key={`skeleton-${index}`}>
                          <TableCell padding="checkbox">
                            <Skeleton variant="rectangular" width={24} height={24} />
                          </TableCell>
                          <TableCell>
                            <Skeleton variant="text" width="100%" />
                          </TableCell>
                          <TableCell>
                            <Skeleton variant="text" width="100%" />
                          </TableCell>
                          <TableCell>
                            <Skeleton variant="text" width="100%" />
                          </TableCell>
                          <TableCell>
                            <Skeleton variant="text" width="100%" />
                          </TableCell>
                          <TableCell>
                            <Skeleton variant="text" width="100%" />
                          </TableCell>
                          <TableCell>
                            <Skeleton variant="text" width="100%" />
                          </TableCell>
                        </TableRow>
                      ))
                      : stableSort(fileRows, getComparator(order, orderBy))
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((row, index) => {
                          const isItemSelected = isSelected(row.id as number);
                          const labelId = `enhanced-table-checkbox-${index}`;

                          return (
                            <TableRow
                              hover
                              onClick={(event) => handleClick(event, row.id as number)}
                              role="checkbox"
                              aria-checked={isItemSelected}
                              tabIndex={-1}
                              key={row.id}
                              selected={isItemSelected}
                              onMouseEnter={() => setHoveredRowId(row.id as number)} // Track hover state
                              onMouseLeave={() => setHoveredRowId(null)} // Clear hover state
                            >
                              <TableCell sx={{ borderBottomColor: '#424242' }} padding="checkbox">
                                {hoveredRowId === row.id || isItemSelected ? ( // Only render Checkbox if row is hovered
                                  <Checkbox
                                    color="primary"
                                    size="small"
                                    checked={isItemSelected}
                                    inputProps={{ 'aria-labelledby': labelId }}
                                  />
                                ) : null}
                              </TableCell>

                              <TableCell
                                sx={{
                                  borderBottomColor: '#424242',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                                component="th"
                                id={labelId}
                                scope="row"
                                padding="normal"
                              >
                                <ButtonBase
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    handleFileNameClick(row.id as number);
                                  }}
                                  style={{ textDecoration: 'none' }}
                                >
                                  {row.file_name}
                                </ButtonBase>
                              </TableCell>

                              <TableCell
                                align="left"
                                padding="normal"
                                sx={{
                                  borderBottomColor: '#424242',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                {row.file_size}
                              </TableCell>

                              {(!isCloudSync) && (
                                <TableCell
                                  align="left"
                                  sx={{
                                    borderBottomColor: '#424242',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                  }}
                                >
                                  {row.kind}
                                </TableCell>
                              )}

                              {(!isCloudSync) && (
                                <TableCell
                                  align="left"
                                  sx={{
                                    borderBottomColor: '#424242',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                  }}
                                >
                                  {row.device_name}
                                </TableCell>
                              )}

                              {(!isCloudSync) && (
                                <TableCell
                                  align="left"
                                  padding="normal"
                                  sx={{
                                    borderBottomColor: '#424242',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    color:
                                      row.available === 'Available'
                                        ? '#1DB954'
                                        : row.available === 'Unavailable'
                                          ? 'red'
                                          : 'inherit', // Default color is 'inherit'
                                  }}
                                >
                                  {row.available}
                                </TableCell>
                              )}

                              <TableCell
                                align="left"
                                padding="normal"
                                sx={{
                                  borderBottomColor: '#424242',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                {row.is_public ? 'Public' : 'Private'}
                              </TableCell>

                              {isCloudSync && (
                                <TableCell
                                  align="left"
                                  padding="normal"
                                  onClick={(e) => e.stopPropagation()}
                                  sx={{
                                    borderBottomColor: '#424242',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                  }}
                                >
                                  <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    width: '75%',
                                    position: 'relative',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',  // Add subtle white border
                                    borderRadius: '2px',  // Optional: slight rounding of corners
                                  }}>
                                    <LinearProgress
                                      variant="determinate"
                                      value={(Array.isArray(row.device_ids) ? (row.device_ids.length / (devices?.length || 1)) * 100 : 0)}
                                      sx={{
                                        flexGrow: 1,
                                        height: 16,
                                        backgroundColor: 'transparent',
                                        borderRadius: '1px',  // Match the outer border radius
                                        '& .MuiLinearProgress-bar': {
                                          backgroundColor: (theme) => {
                                            const percentage = Array.isArray(row.device_ids) ? (row.device_ids.length / (devices?.length || 1)) * 100 : 0;
                                            if (percentage >= 80) return '#1DB954';
                                            if (percentage >= 50) return '#CD853F';
                                            return '#FF4444';
                                          }
                                        }
                                      }}
                                    />
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        position: 'absolute',
                                        width: '100%',
                                        textAlign: 'center',
                                        color: '#ffffff',
                                        mixBlendMode: 'normal'
                                      }}
                                    >
                                      {Array.isArray(row.device_ids) ?
                                        `${((row.device_ids.length / (devices?.length || 1)) * 100).toFixed(2)}%` :
                                        '0%'
                                      }
                                    </Typography>
                                  </Box>
                                </TableCell>
                              )}

                              {isCloudSync && (
                                <TableCell
                                  align="left"
                                  padding="normal"
                                  onClick={(e) => e.stopPropagation()}
                                  sx={{
                                    borderBottomColor: '#424242',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                  }}
                                >
                                  <Rating
                                    name={`priority-${row.id}`}
                                    value={Number(row.file_priority)}
                                    max={5}
                                    onChange={(event, newValue) => handlePriorityChange(row, newValue)}
                                    sx={{
                                      fontSize: '16px',
                                      '& .MuiRating-iconFilled': {
                                        color: (theme) => {
                                          const priority = Number(row.file_priority);
                                          if (priority >= 4) return '#FF9500';
                                          if (priority === 3) return '#FFCC00';
                                          return '#1DB954';
                                        }
                                      }
                                    }}
                                  />
                                </TableCell>
                              )}

                              {(!isCloudSync) && (
                                <TableCell
                                  padding="normal"
                                  align="right"
                                  sx={{
                                    borderBottomColor: '#424242',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                  }}
                                >
                                  {row.date_uploaded}
                                </TableCell>
                              )}
                            </TableRow>
                          );
                        })}
                  </TableBody>
                </Table>
                </TableContainer>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, 50, 100]}
                  component="div"
                  count={fileRows.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </>
            )}
          </CardContent>
        </Card>
      </Stack>
      <Dialog
        open={isShareModalOpen}
        onClose={handleShareModalClose}
        maxWidth="sm"
        fullWidth
      >
      </Dialog>
    </Box>
  );
}
