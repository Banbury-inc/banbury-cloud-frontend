import React, { useEffect, useState } from 'react';
import os from 'os';
import Stack from '@mui/material/Stack';
import { join } from 'path';
import { shell } from 'electron';
import isEqual from 'lodash/isEqual';
import axios from 'axios';
import { useMediaQuery } from '@mui/material';
import ButtonBase from '@mui/material/ButtonBase';
import Box from '@mui/material/Box';
import { readdir, stat } from 'fs/promises';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import Table from '@mui/material/Table';
import DownloadIcon from '@mui/icons-material/Download';
import TableBody from '@mui/material/TableBody';
import DevicesIcon from '@mui/icons-material/Devices';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import CreateNewFolderOutlinedIcon from '@mui/icons-material/CreateNewFolderOutlined';
import { Skeleton } from '@mui/material';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import GrainIcon from '@mui/icons-material/Grain';
import Typography from '@mui/material/Typography';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Checkbox from '@mui/material/Checkbox';
import Tooltip from '@mui/material/Tooltip';
import DeleteIcon from '@mui/icons-material/Delete';
import { visuallyHidden } from '@mui/utils';
import { CardContent, Container } from "@mui/material";
import NewInputFileUploadButton from '../newuploadfilebutton';
import AccountMenuIcon from '../common/AccountMenuIcon';
import AddToQueueIcon from '@mui/icons-material/AddToQueue';
import { useAuth } from '../../context/AuthContext';
import Card from '@mui/material/Card';
import NavigateBeforeOutlinedIcon from '@mui/icons-material/NavigateBeforeOutlined';
import NavigateNextOutlinedIcon from '@mui/icons-material/NavigateNextOutlined';
import TextField from '@mui/material/TextField';
import { handlers } from '../../handlers';
import * as utils from '../../utils';
import CustomizedTreeView from '../TreeView';
import path from 'path';
import fs from 'fs';
import { neuranet } from '../../neuranet';
import { fileWatcherEmitter } from '../../neuranet/device/watchdog';
import TaskBox from '../TaskBox';
import TaskBoxButton from '../TaskBoxButton';

import SyncIcon from '@mui/icons-material/Sync';


// Simplified data interface to match your file structure
interface DatabaseData {
  id: number;
  file_name: string;
  kind: string;
  date_uploaded: string;
  file_size: string;
  file_path: string;
  deviceID: string;
  device_name: string;
  helpers: number;
  available: string;
}


const headCells: HeadCell[] = [
  { id: 'file_name', numeric: false, label: 'Name', isVisibleOnSmallScreen: true },
  { id: 'file_size', numeric: false, label: 'Size', isVisibleOnSmallScreen: true },
  { id: 'kind', numeric: false, label: 'Kind', isVisibleOnSmallScreen: true },
  { id: 'device_name', numeric: false, label: 'Location', isVisibleOnSmallScreen: false },
  { id: 'available', numeric: false, label: 'Status', isVisibleOnSmallScreen: false },
  { id: 'date_uploaded', numeric: true, label: 'Date Uploaded', isVisibleOnSmallScreen: false },
];

type Order = 'asc' | 'desc';

interface HeadCell {
  disablePadding?: boolean;
  id: keyof DatabaseData;
  label: string;
  numeric: boolean;
  isVisibleOnSmallScreen: boolean;
}

interface EnhancedTableProps {
  numSelected: number;
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof DatabaseData) => void;
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void;
  order: Order;
  orderBy: keyof DatabaseData;
  rowCount: number;
}

// Move the breadcrumbs out of the TableHead component and create a new component
function FileBreadcrumbs() {
  const { files, global_file_path, global_file_path_device } = useAuth();
  const pathSegments = global_file_path ? global_file_path.split('/').filter(Boolean) : [];

  const handleBreadcrumbClick = (path: string) => {
    console.info(`Navigate to: ${path}`);
    // Set global_file_path or navigate logic here
  };

  return (
    <div style={{ padding: '8px 16px' }}>
      <Breadcrumbs aria-label="breadcrumb">
        <Link
          underline="hover"
          color="inherit"
          href="#"
          onClick={() => handleBreadcrumbClick('/')}
          style={{ display: 'flex', alignItems: 'center' }}
        >
          <GrainIcon style={{ marginRight: 5 }} fontSize="inherit" />
          Core
        </Link>
        {global_file_path_device && (
          <Link
            underline="hover"
            color="inherit"
            href="#"
            onClick={() => handleBreadcrumbClick(global_file_path_device)}
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <DevicesIcon style={{ marginRight: 5 }} fontSize="inherit" />
            {global_file_path_device}
          </Link>
        )}
        {pathSegments.map((segment, index) => {
          const pathUpToSegment = '/' + pathSegments.slice(0, index + 1).join('/');
          return (
            <Link
              key={index}
              underline="hover"
              color="inherit"
              href="#"
              onClick={() => handleBreadcrumbClick(pathUpToSegment)}
              style={{ display: 'flex', alignItems: 'center' }}
            >
              {segment}
            </Link>
          );
        })}
      </Breadcrumbs>
    </div>
  );
}

function EnhancedTableHead(props: EnhancedTableProps) {
  const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } = props;
  const isSmallScreen = useMediaQuery('(max-width:960px)');
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


const file_name: string = 'mmills_database_snapshot.json';
const directory_name: string = 'BCloud';
const directory_path: string = path.join(os.homedir(), directory_name);
const snapshot_json: string = path.join(directory_path, file_name);

export default function Files() {
  const isSmallScreen = useMediaQuery('(max-width:960px)');
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof DatabaseData>('file_name');
  const [selected, setSelected] = useState<readonly number[]>([]);
  const [selectedFileNames, setSelectedFileNames] = useState<string[]>([]);
  const [selectedDeviceNames, setSelectedDeviceNames] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredRowId, setHoveredRowId] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [dense, setDense] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(100);
  const [fileRows, setFileRows] = useState<DatabaseData[]>([]); // State for storing fetched file data
  const [allFiles, setAllFiles] = useState<DatabaseData[]>([]);
  const { global_file_path, global_file_path_device, setGlobal_file_path } = useAuth();
  const [isAddingFolder, setIsAddingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [disableFetch, setDisableFetch] = useState(false);
  const { updates, setUpdates, tasks, setTasks, username, first_name, last_name, devices, setFirstname, setLastname, setDevices, redirect_to_login, setredirect_to_login, taskbox_expanded, setTaskbox_expanded } = useAuth();
  const getSelectedFileNames = () => {
    return selected.map(id => {
      const file = fileRows.find(file => file.id === id);
      return file ? file.file_name : null;
    }).filter(file_name => file_name !== null); // Filter out any null values if a file wasn't found
  };


  useEffect(() => {
    const fetchData_with_api = async () => {
      try {


        // Step 1: Fetch user information
        const userInfoResponse = await axios.get<{
          first_name: string;
          last_name: string;
          phone_number: string;
          email: string;
        }>(`https://website2-389236221119.us-central1.run.app/getuserinfo/${username}/`);

        const { first_name, last_name } = userInfoResponse.data;
        setFirstname(first_name);
        setLastname(last_name);

        // Step 2: Fetch device information
        const deviceInfoResponse = await axios.get<{
          devices: any[];
        }>(`https://website2-389236221119.us-central1.run.app/getdeviceinfo/${username}/`);

        const { devices } = deviceInfoResponse.data;


        let files: DatabaseData[] = [];

        // set files to the value of snapshot_json if it exists
        if (fs.existsSync(snapshot_json)) {
          const snapshot = fs.readFileSync(snapshot_json, 'utf-8');
          files = JSON.parse(snapshot);
          console.log('Loaded snapshot from file:', snapshot_json);
          console.log('Snapshot:', files);
        }

        // Combine devices with their associated files
        let allFilesData = devices.flatMap((device, index) => {
          const deviceFiles = files.filter(file => file.device_name === device.device_name);
          return deviceFiles.map((file, fileIndex) => ({
            id: index * 1000 + fileIndex,
            file_name: file.file_name,
            file_size: file.file_size,
            kind: file.kind,
            file_path: file.file_path,
            date_uploaded: file.date_uploaded,
            deviceID: (index + 1).toString(), // Convert deviceID to string
            device_name: device.device_name,
            helpers: 0,
            available: device.online ? "Available" : "Unavailable",
          }));
        });

        console.log(allFilesData);

        setAllFiles(allFilesData); if (!disableFetch) {
          setAllFiles(allFilesData);
        }

        console.log("Local file data loaded")
        setIsLoading(false);

        // Step 3: Fetch files for all devices
        const fileInfoResponse = await axios.get<{
          files: any[];
        }>(`https://website2-389236221119.us-central1.run.app/getfileinfo/${username}/`);



        files = fileInfoResponse.data.files;

        // initialize files as an empty array

        // // save files as a json
        fs.writeFileSync(snapshot_json, JSON.stringify(files, null, 2), 'utf-8');

        allFilesData = devices.flatMap((device, index) => {
          const deviceFiles = files.filter(file => file.device_name === device.device_name);
          return deviceFiles.map((file, fileIndex) => ({
            id: index * 1000 + fileIndex,
            file_name: file.file_name,
            file_size: file.file_size,
            kind: file.kind,
            file_path: file.file_path,
            date_uploaded: file.date_uploaded,
            deviceID: (index + 1).toString(), // Convert deviceID to string
            device_name: device.device_name,
            helpers: 0,
            available: device.online ? "Available" : "Unavailable",
          }));
        });

        setAllFiles(allFilesData); if (!disableFetch) {
          setAllFiles(allFilesData);
        }

        console.log("API file data loaded")
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
      }
    };

    fetchData_with_api();
  }, [username, disableFetch, updates]);


  const fetchData = async (username: string | null, disableFetch: boolean, setFirstname: any, setLastname: any, setAllFiles: any, setIsLoading: any) => {
    try {
      // Step 1: Fetch user information
      const userInfoResponse = await axios.get<{
        first_name: string;
        last_name: string;
        phone_number: string;
        email: string;
      }>(`https://website2-389236221119.us-central1.run.app/getuserinfo/${username}/`);

      const { first_name, last_name } = userInfoResponse.data;
      setFirstname(first_name);
      setLastname(last_name);

      // Step 2: Fetch device information
      const deviceInfoResponse = await axios.get<{
        devices: any[];
      }>(`https://website2-389236221119.us-central1.run.app/getdeviceinfo/${username}/`);

      const { devices } = deviceInfoResponse.data;

      let files: DatabaseData[] = [];

      // Load snapshot from the JSON file if it exists
      if (fs.existsSync(snapshot_json)) {
        const snapshot = fs.readFileSync(snapshot_json, 'utf-8');
        files = JSON.parse(snapshot);
        console.log('Loaded snapshot from file:', snapshot_json);
        console.log('Snapshot:', files);
      }

      // Combine devices with their associated files
      let allFilesData = devices.flatMap((device, index) => {
        const deviceFiles = files.filter(file => file.device_name === device.device_name);
        return deviceFiles.map((file, fileIndex) => ({
          id: index * 1000 + fileIndex,
          file_name: file.file_name,
          fileSize: file.file_size,
          kind: file.kind,
          file_path: file.file_path,
          date_uploaded: file.date_uploaded,
          deviceID: (index + 1).toString(), // Convert deviceID to string
          device_name: device.device_name,
          helpers: 0,
          available: device.online ? "Available" : "Unavailable",
        }));
      });

      if (!disableFetch) {
        setAllFiles(allFilesData);
      }

      console.log("Local file data loaded");

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleFileChange = () => {
      console.log('File changed, fetching data...');
      fetchData(username, disableFetch, setFirstname, setLastname, setAllFiles, setIsLoading);
    };

    fileWatcherEmitter.on('fileChanged', handleFileChange);

    return () => {
      fileWatcherEmitter.off('fileChanged', handleFileChange);
    };
  }, [username, disableFetch]);


  // useEffect(() => {
  //   let intervalId: NodeJS.Timeout;
  //   const fetchData = async () => {
  //     try {
  //       // Step 1: Fetch user information
  //       const userInfoResponse = await axios.get<{
  //         first_name: string;
  //         last_name: string;
  //         phone_number: string;
  //         email: string;

  //       }>(`https://website2-389236221119.us-central1.run.app/getuserinfo/${username}/`);

  //       const { first_name, last_name } = userInfoResponse.data;
  //       setFirstname(first_name);
  //       setLastname(last_name);

  //       // Step 2: Fetch device information
  //       const deviceInfoResponse = await axios.get<{
  //         devices: any[];
  //       }>(`https://website2-389236221119.us-central1.run.app/getdeviceinfo/${username}/`);
  //       const { devices } = deviceInfoResponse.data;

  //       // Step 3: Fetch files for all devices
  //       const fileInfoResponse = await axios.get<{
  //         files: any[];
  //       }>(`https://website2-389236221119.us-central1.run.app/getfileinfo/${username}/`);


  //       let files: DatabaseData[] = [];

  //       let newFiles = fileInfoResponse.data.files;


  //       // Combine devices with their associated files
  //       const allFilesData = devices.flatMap((device, index) => {
  //         const deviceFiles = files.filter(file => file.device_name === device.device_name);
  //         return deviceFiles.map((file, fileIndex) => ({
  //           id: index * 1000 + fileIndex,
  //           file_name: file.file_name,
  //           fileSize: file.fileSize,
  //           kind: file.kind,
  //           filePath: file.filePath,
  //           dateUploaded: file.dateUploaded,
  //           deviceID: (index + 1).toString(), // Convert deviceID to string
  //           device_name: device.device_name,
  //           helpers: 0,
  //           available: device.online ? "Available" : "Unavailable",
  //         }));
  //       });

  //       setAllFiles(allFilesData); if (!disableFetch) {
  //         setAllFiles(allFilesData);
  //       }
  //     } catch (error) {
  //       console.error('Error fetching data:', error);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };


  //   fetchData();
  //   intervalId = setInterval(fetchData, 50000);
  //   return () => clearInterval(intervalId);
  // }, [username, disableFetch, allFiles]); // Include allFiles in the dependency array


  useEffect(() => {
    const pathToShow = global_file_path || '/';
    const pathSegments = pathToShow.split('/').filter(Boolean).length;

    const filteredFiles = allFiles.filter(file => {
      if (!global_file_path && !global_file_path_device) {
        return true; // Show all files
      }

      if (!global_file_path && global_file_path_device) {
        return file.device_name === global_file_path_device; // Show all files for the specified device
      }

      // Add a check to ensure filePath is defined
      if (!file.file_path) {
        return false; // Skip files with undefined filePath
      }

      const fileSegments = file.file_path.split('/').filter(Boolean).length;
      const isInSameDirectory = file.file_path.startsWith(pathToShow) && fileSegments === pathSegments + 1;
      const isFile = file.file_path === pathToShow && file.kind !== 'Folder';

      return isInSameDirectory || isFile;
    });

    setFileRows(filteredFiles);

  }, [global_file_path, global_file_path_device, allFiles]);


  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: keyof DatabaseData,
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
    const file_name = fileRows.find(file => file.id === id)?.file_name;
    const newSelectedFileNames = newSelected
      .map(id => fileRows.find(file => file.id === id)?.file_name)
      .filter(name => name !== undefined) as string[];
    console.log(newSelectedFileNames);
    const newSelectedFilePaths = newSelected
      .map(id => fileRows.find(file => file.id === id)?.file_path)
      .filter(name => name !== undefined) as string[];
    console.log(newSelectedFilePaths[0]);
    const directoryName = "BCloud";
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
        let response = await handlers.files.downloadFile(username ?? '', selectedFileNames, selectedDeviceNames, taskInfo);
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

    const file_name = fileRows.find(file => file.id === id)?.file_name;
    const device_name = fileRows.find(file => file.id === id)?.device_name;
    const newSelectedFileNames = newSelected.map(id => fileRows.find(file => file.id === id)?.file_name).filter(name => name !== undefined) as string[];
    const newSelectedDeviceNames = newSelected.map(id => fileRows.find(file => file.id === id)?.device_name).filter(name => name !== undefined) as string[];
    setSelectedFileNames(newSelectedFileNames);
    setSelectedDeviceNames(newSelectedDeviceNames);
    console.log(newSelectedFileNames)
    console.log(selectedFileNames)

  };


  const [selectedfiles, setSelectedFiles] = useState<readonly number[]>([]);

  const handleDownloadClick = async () => {
    setSelectedFiles(selected);
    console.log(selectedFileNames)
    console.log("handling download click")

    let task_description = 'Downloading ' + selectedFileNames.join(', ');
    let taskInfo = await neuranet.sessions.addTask(username ?? '', task_description, tasks, setTasks);
    setTaskbox_expanded(true);

    let response = await handlers.files.downloadFile(username ?? '', selectedFileNames, selectedDeviceNames, taskInfo);

    if (response === 'No file selected') {
      let task_result = await neuranet.sessions.failTask(username ?? '', taskInfo, response, tasks, setTasks);
    }
    if (response === 'success') {
      let task_result = await neuranet.sessions.completeTask(username ?? '', taskInfo, tasks, setTasks);
    }

    console.log(response)



    setSelected([]);
  };


  const handleAddDeviceClick = async () => {
    // Here, we are specifically adding the task after the device has been created
    // Because the database will not know what device to add it to, as the device does not 
    // exist yet


    console.log("handling add device click")

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
    console.log("handling sync click")
    // let result = handlers.files.addFile(username ?? '');
    let task_description = 'Scanning filesystem';
    let taskInfo = await neuranet.sessions.addTask(username ?? '', task_description, tasks, setTasks);
    setTaskbox_expanded(true);

    let result = await neuranet.device.scanFilesystem(username ?? '')

    if (result === 'success') {
      let task_result = await neuranet.sessions.completeTask(username ?? '', taskInfo, tasks, setTasks);
      setUpdates(updates + 1);
    }
    console.log(result)
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

  return (
    // <Box sx={{ width: '100%', pl: 4, pr: 4, mt: 0, pt: 5 }}>
    <Box sx={{ width: '100%', pt: 0 }}>

      <Card variant='outlined' sx={{ borderTop: 0, borderLeft: 0, borderBottom: 0 }}>
        <CardContent sx={{ paddingBottom: '2px !important', paddingTop: '46px' }}>
          <Stack spacing={2} direction="row" sx={{ flexWrap: 'nowrap' }}>
            <Grid container spacing={0} sx={{ display: 'flex', flexWrap: 'nowrap', pt: 0 }}>
              <Grid item paddingRight={1}>
                <Tooltip title="Navigate back">
                  <Button
                    onClick={() => handlers.buttons.backButton(
                      global_file_path,
                      setGlobal_file_path,
                      backHistory,
                      setBackHistory,
                      setForwardHistory
                    )}



                    sx={{ paddingLeft: '4px', paddingRight: '4px', minWidth: '30px' }} // Adjust the left and right padding as needed
                  >
                    <NavigateBeforeOutlinedIcon
                      fontSize="inherit"
                    />
                  </Button>
                </Tooltip>
              </Grid>
              <Grid item paddingRight={1}>
                <Tooltip title="Navigate forward">
                  <Button
                    onClick={() => handlers.buttons.forwardButton(
                      global_file_path ?? '',
                      setGlobal_file_path,
                      backHistory,
                      setBackHistory,
                      forwardHistory,
                      setForwardHistory
                    )}

                    sx={{ paddingLeft: '4px', paddingRight: '4px', minWidth: '30px' }} // Adjust the left and right padding as needed
                  >
                    <NavigateNextOutlinedIcon
                      fontSize="inherit"
                    />
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
                    <SyncIcon
                      fontSize="inherit"
                    />
                  </Button>
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
                    <DownloadIcon
                      fontSize="inherit"
                    />
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
                    }
                    }
                    sx={{ paddingLeft: '4px', paddingRight: '4px', minWidth: '30px' }} // Adjust the left and right padding as needed
                  >
                    <DeleteIcon
                      fontSize="inherit"
                    />
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
        <Stack>
          <Box display="flex" flexDirection="column" height="100%">
            <Card variant="outlined" sx={{ flexGrow: 1, height: '100%', overflow: 'hidden', borderLeft: 0, borderRight: 0 }}>
              <CardContent>
                <Grid container spacing={4} sx={{ flexGrow: 1, overflow: 'auto', maxHeight: 'calc(100vh - 120px)' }}>
                  <Grid item>
                    <CustomizedTreeView />
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
                <TableContainer sx={{ maxHeight: 'calc(100vh - 180px)' }}>
                  <Table
                    aria-labelledby="tableTitle"
                    size="small"
                    stickyHeader
                  >
                    <EnhancedTableHead
                      numSelected={selected.length}
                      order={order}
                      orderBy={orderBy}
                      onSelectAllClick={handleSelectAllClick}
                      onRequestSort={handleRequestSort}
                      rowCount={fileRows.length}
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
                      ) : (
                        stableSort(fileRows, getComparator(order, orderBy))
                          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                          .map((row, index) => {
                            const isItemSelected = isSelected(row.id);
                            const labelId = `enhanced-table-checkbox-${index}`;

                            return (
                              <TableRow
                                hover
                                onClick={(event) => handleClick(event, row.id)}
                                role="checkbox"
                                aria-checked={isItemSelected}
                                tabIndex={-1}
                                key={row.id}
                                selected={isItemSelected}
                                onMouseEnter={() => setHoveredRowId(row.id)} // Track hover state
                                onMouseLeave={() => setHoveredRowId(null)} // Clear hover state
                              >
                                <TableCell sx={{ borderBottomColor: "#424242" }} padding="checkbox">
                                  {hoveredRowId === row.id || isItemSelected ? ( // Only render Checkbox if row is hovered
                                    <Checkbox
                                      color="primary"
                                      checked={isItemSelected}
                                      inputProps={{ 'aria-labelledby': labelId }}
                                    />
                                  ) : null}
                                </TableCell>

                                <TableCell
                                  sx={{
                                    borderBottomColor: "#424242",
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                  }}
                                  component="th"
                                  id={labelId}
                                  scope="row"
                                  padding="normal"
                                >
                                  {row.kind === "Folder" && isAddingFolder && row.file_name === "" ? (
                                    <TextField
                                      value={newFolderName}
                                      size="small"
                                      onChange={(e) => setNewFolderName(e.target.value)}
                                      onBlur={() => handlers.keybinds.foldernameSave(
                                        newFolderName,
                                        setIsAddingFolder,
                                        setUpdates,
                                        updates,
                                        global_file_path ?? '',
                                        setFileRows,
                                        setNewFolderName,
                                        setDisableFetch,
                                        username
                                      )}
                                      onKeyPress={handleKeyPress}
                                      placeholder="Enter folder name"
                                      fullWidth
                                      autoFocus
                                    />
                                  ) : (
                                    <ButtonBase
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        handleFileNameClick(row.id);
                                      }}
                                      style={{ textDecoration: 'none' }}
                                    >
                                      {row.file_name}
                                    </ButtonBase>
                                  )}
                                </TableCell>

                                <TableCell
                                  align="left"
                                  padding="normal"
                                  sx={{
                                    borderBottomColor: "#424242",
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                  }}
                                >
                                  {row.file_size}
                                </TableCell>

                                <TableCell align="left" sx={{
                                  borderBottomColor: "#424242",
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}>
                                  {row.kind}
                                </TableCell>

                                {(!isSmallScreen || headCells.find(cell => cell.id === 'device_name')?.isVisibleOnSmallScreen) && (
                                  <TableCell align="left" sx={{
                                    borderBottomColor: "#424242",
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                  }}>
                                    {row.device_name}
                                  </TableCell>
                                )}

                                {(!isSmallScreen || headCells.find(cell => cell.id === 'available')?.isVisibleOnSmallScreen) && (
                                  <TableCell
                                    align="left"
                                    padding="normal"
                                    sx={{
                                      borderBottomColor: "#424242",
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      color: row.available === "Available" ? '#1DB954' : row.available === "Unavailable" ? 'red' : 'inherit',  // Default color is 'inherit'
                                    }}
                                  >
                                    {row.available}
                                  </TableCell>
                                )}

                                {(!isSmallScreen || headCells.find(cell => cell.id === 'date_uploaded')?.isVisibleOnSmallScreen) && (
                                  <TableCell
                                    padding="normal"
                                    align="right"
                                    sx={{
                                      borderBottomColor: "#424242",
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
                          })
                      )}
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
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50, 100]}
              component="div"
              count={fileRows.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </CardContent>
        </Card>
      </Stack>
    </Box >

  );
}
