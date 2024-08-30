import React, { useEffect, useState, useRef } from 'react';
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
import { useAuth } from '../../context/AuthContext';
import Card from '@mui/material/Card';
import NavigateBeforeOutlinedIcon from '@mui/icons-material/NavigateBeforeOutlined';
import NavigateNextOutlinedIcon from '@mui/icons-material/NavigateNextOutlined';
import TextField from '@mui/material/TextField';
import { handlers } from '../../handlers';
import * as utils from '../../utils';
import CustomizedTreeView from '../TreeView';
import { neuranet } from '../../neuranet';
import TaskBox from '../TaskBox';


// Simplified data interface to match your file structure
interface FileData {
  id: number;
  fileName: string;
  kind: string;
  dateUploaded: string;
  fileSize: string;
  filePath: string;
  deviceID: string;
  deviceName: string;
  helpers: number;
  available: string;
}


const headCells: HeadCell[] = [
  { id: 'fileName', numeric: false, label: 'Name', isVisibleOnSmallScreen: true },
  { id: 'fileSize', numeric: false, label: 'Size', isVisibleOnSmallScreen: true },
  { id: 'kind', numeric: false, label: 'Kind', isVisibleOnSmallScreen: true },
  { id: 'deviceName', numeric: false, label: 'Location', isVisibleOnSmallScreen: false },
  { id: 'available', numeric: true, label: 'Status', isVisibleOnSmallScreen: false },
  { id: 'dateUploaded', numeric: true, label: 'Date Uploaded', isVisibleOnSmallScreen: false },
];

type Order = 'asc' | 'desc';

interface HeadCell {
  disablePadding?: boolean;
  id: keyof FileData;
  label: string;
  numeric: boolean;
  isVisibleOnSmallScreen: boolean;
}

interface EnhancedTableProps {
  numSelected: number;
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof FileData) => void;
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void;
  order: Order;
  orderBy: keyof FileData;
  rowCount: number;
}

function EnhancedTableHead(props: EnhancedTableProps) {
  const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } = props;
  const isSmallScreen = useMediaQuery('(max-width:960px)');
  const createSortHandler = (property: keyof FileData) => (event: React.MouseEvent<unknown>) => {
    onRequestSort(event, property);
  };

  const { global_file_path, global_file_path_device } = useAuth();  // Assuming global_file_path is available via context
  const pathSegments = global_file_path ? global_file_path.split('/').filter(Boolean) : []; // Split and remove empty segments safely

  // Function to handle breadcrumb click, might need more logic to actually navigate
  const handleBreadcrumbClick = (path: string) => {
    console.info(`Navigate to: ${path}`);
    // Set global_file_path or navigate logic here
  };

  return (
    <TableHead>
      <TableRow>
        <TableCell colSpan={headCells.length + 1} style={{ padding: 0 }}>
          <div style={{ display: 'flex', width: '100%' }}>
            <Breadcrumbs aria-label="breadcrumb" style={{ flexGrow: 1 }}>
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
              {global_file_path_device && (  // Only render if global_file_path_device has a value
                <Link
                  underline="hover"
                  color="inherit"
                  href="#"
                  onClick={() => handleBreadcrumbClick(global_file_path_device)}  // Pass the device path to the handler
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
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            color="secondary"
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



export default function Files() {
  const isSmallScreen = useMediaQuery('(max-width:960px)');
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof FileData>('fileName');
  const [selected, setSelected] = useState<readonly number[]>([]);
  const [selectedFileNames, setSelectedFileNames] = useState<string[]>([]);
  const [selectedDeviceNames, setSelectedDeviceNames] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredRowId, setHoveredRowId] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [dense, setDense] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(100);
  const [fileRows, setFileRows] = useState<FileData[]>([]); // State for storing fetched file data
  const [allFiles, setAllFiles] = useState<FileData[]>([]);
  const { global_file_path, global_file_path_device, setGlobal_file_path } = useAuth();
  const [isAddingFolder, setIsAddingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [disableFetch, setDisableFetch] = useState(false);
  const { updates, setUpdates, username, first_name, last_name, devices, setFirstname, setLastname, setDevices, redirect_to_login, setredirect_to_login } = useAuth();

  const getSelectedFileNames = () => {
    return selected.map(id => {
      const file = fileRows.find(file => file.id === id);
      return file ? file.fileName : null;
    }).filter(fileName => fileName !== null); // Filter out any null values if a file wasn't found
  };

  console.log(username)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Step 1: Fetch user information
        const userInfoResponse = await axios.get<{
          first_name: string;
          last_name: string;
          phone_number: string;
          email: string;
        }>(`https://website2-v3xlkt54dq-uc.a.run.app/getuserinfo/${username}/`);

        const { first_name, last_name } = userInfoResponse.data;
        setFirstname(first_name);
        setLastname(last_name);

        // Step 2: Fetch device information
        const deviceInfoResponse = await axios.get<{
          devices: any[];
        }>(`https://website2-v3xlkt54dq-uc.a.run.app/getdeviceinfo/${username}/`);

        const { devices } = deviceInfoResponse.data;

        // Step 3: Fetch files for all devices
        const fileInfoResponse = await axios.get<{
          files: any[];
        }>(`https://website2-v3xlkt54dq-uc.a.run.app/getfileinfo/${username}/`);

        const { files } = fileInfoResponse.data;

        // Combine devices with their associated files
        const allFilesData = devices.flatMap((device, index) => {
          const deviceFiles = files.filter(file => file.device_name === device.device_name);
          return deviceFiles.map((file, fileIndex) => ({
            id: index * 1000 + fileIndex,
            fileName: file.file_name,
            fileSize: utils.formatBytes(file.file_size),
            kind: file.kind,
            filePath: file.file_path,
            dateUploaded: file.date_uploaded,
            deviceID: (index + 1).toString(), // Convert deviceID to string
            deviceName: device.device_name,
            helpers: 0,
            available: device.online ? "Available" : "Unavailable",
          }));
        });

        setAllFiles(allFilesData); if (!disableFetch) {
          setAllFiles(allFilesData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [username, disableFetch]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    const fetchData = async () => {
      try {
        // Step 1: Fetch user information
        const userInfoResponse = await axios.get<{
          first_name: string;
          last_name: string;
          phone_number: string;
          email: string;

        }>(`https://website2-v3xlkt54dq-uc.a.run.app/getuserinfo/${username}/`);

        const { first_name, last_name } = userInfoResponse.data;
        setFirstname(first_name);
        setLastname(last_name);

        // Step 2: Fetch device information
        const deviceInfoResponse = await axios.get<{
          devices: any[];
        }>(`https://website2-v3xlkt54dq-uc.a.run.app/getdeviceinfo/${username}/`);
        const { devices } = deviceInfoResponse.data;

        // Step 3: Fetch files for all devices
        const fileInfoResponse = await axios.get<{
          files: any[];
        }>(`https://website2-v3xlkt54dq-uc.a.run.app/getfileinfo/${username}/`);
        const { files } = fileInfoResponse.data;

        // Combine devices with their associated files
        const allFilesData = devices.flatMap((device, index) => {
          const deviceFiles = files.filter(file => file.device_name === device.device_name);
          return deviceFiles.map((file, fileIndex) => ({
            id: index * 1000 + fileIndex,
            fileName: file.file_name,
            fileSize: utils.formatBytes(file.file_size),
            kind: file.kind,
            filePath: file.file_path,
            dateUploaded: file.date_uploaded,
            deviceID: (index + 1).toString(), // Convert deviceID to string
            deviceName: device.device_name,
            helpers: 0,
            available: device.online ? "Available" : "Unavailable",
          }));
        });

        setAllFiles(allFilesData); if (!disableFetch) {
          setAllFiles(allFilesData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };


    fetchData();
    intervalId = setInterval(fetchData, 50000);
    return () => clearInterval(intervalId);
  }, [username, disableFetch, allFiles]); // Include allFiles in the dependency array


  useEffect(() => {
    const pathToShow = global_file_path || '/';
    const pathSegments = pathToShow.split('/').filter(Boolean).length;

    const filteredFiles = allFiles.filter(file => {
      if (!global_file_path && !global_file_path_device) {
        return true; // Show all files
      }

      if (!global_file_path && global_file_path_device) {
        return file.deviceName === global_file_path_device; // Show all files for the specified device
      }

      const fileSegments = file.filePath.split('/').filter(Boolean).length;
      const isInSameDirectory = file.filePath.startsWith(pathToShow) && fileSegments === pathSegments + 1;
      const isFile = file.filePath === pathToShow && file.kind !== 'Folder';

      return isInSameDirectory || isFile;
    });

    setFileRows(filteredFiles);

  }, [global_file_path, global_file_path_device, allFiles]);


  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: keyof FileData,
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

    const fileName = fileRows.find(file => file.id === id)?.fileName;
    const newSelectedFileNames = newSelected
      .map(id => fileRows.find(file => file.id === id)?.fileName)
      .filter(name => name !== undefined) as string[];

    console.log(newSelectedFileNames);

    const newSelectedFilePaths = newSelected
      .map(id => fileRows.find(file => file.id === id)?.filePath)
      .filter(name => name !== undefined) as string[];

    console.log(newSelectedFilePaths[0]);




    // Assuming the directory structure is based on `BCloud` in user's home directory
    //
    const directoryName = "BCloud";
    const directoryPath = join(os.homedir(), directoryName);


    let fileFound = false;
    let folderFound = false;
    let filePath = '';

    try {

      const fileStat = await stat(newSelectedFilePaths[0]);
      if (fileStat.isFile()) {
        fileFound = true;
        console.log(`File '${fileName}' found in directory.`);
      }
      if (fileStat.isDirectory()) {
        folderFound = true;
        setGlobal_file_path(newSelectedFilePaths[0]);
      }
      if (fileFound) {
        // Send an IPC message to the main process to handle opening the file
        console.log(`Opening file '${fileName}'...`);
        shell.openPath(newSelectedFilePaths[0]);
      }
      if (folderFound) {
        // Send an IPC message to the main process to handle opening the file
        console.log(`Opening folder '${fileName}'...`);
        // shell.openPath(newSelectedFilePaths[0]);
      } else {
        console.error(`File '${fileName}' not found in directory.`);
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

    const fileName = fileRows.find(file => file.id === id)?.fileName;
    const deviceName = fileRows.find(file => file.id === id)?.deviceName;
    const newSelectedFileNames = newSelected.map(id => fileRows.find(file => file.id === id)?.fileName).filter(name => name !== undefined) as string[];
    const newSelectedDeviceNames = newSelected.map(id => fileRows.find(file => file.id === id)?.deviceName).filter(name => name !== undefined) as string[];
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
    let result = handlers.files.downloadFile(selectedFileNames, selectedDeviceNames);
    console.log(result)
  };
  const handleAddDeviceClick = async () => {
    console.log("handling add device click")
    let result = handlers.devices.addDevice(username ?? '');
    console.log(result)
  };
  const handleSyncClick = async () => {
    console.log("handling sync click")
    // let result = handlers.files.addFile(username ?? '');
    let result = neuranet.device.directory_info(username)
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

              <Grid item paddingRight={1}>
                <Tooltip title="New folder">
                  <Button
                    onClick={() => handlers.buttons.addfolderButton(
                      setDisableFetch,
                      setIsAddingFolder,
                      setNewFolderName,
                      setFileRows
                    )}
                    sx={{ paddingLeft: '4px', paddingRight: '4px', minWidth: '30px' }} // Adjust the left and right padding as needed
                  >
                    <CreateNewFolderOutlinedIcon
                      fontSize="inherit"
                    />
                  </Button>
                </Tooltip>
              </Grid>
              <Grid item paddingRight={1}>
                <Tooltip title="Sync">
                  <Button
                    onClick={handleSyncClick}
                    sx={{ paddingLeft: '4px', paddingRight: '4px', minWidth: '30px' }} // Adjust the left and right padding as needed
                  >
                    <CreateNewFolderOutlinedIcon
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
                <Tooltip title="Add Device">
                  <Button
                    onClick={handleAddDeviceClick}
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
                    onClick={() => handlers.files.deleteFile(
                      selectedFileNames,
                      global_file_path,
                      setdeleteLoading,
                      setIsAddingFolder,
                      setNewFolderName,
                      setDisableFetch,
                      username,
                      updates,
                      setUpdates,
                    )}
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
                    <AccountMenuIcon />
                  </Stack>
                </Box>
              </Grid>


            </Grid>
          </Stack>
        </CardContent>
      </Card>
      <Stack direction="row" spacing={0} sx={{ width: '100%', height: '95vh', overflow: 'hidden' }}>
        <Stack>
          <Box display="flex" flexDirection="column" height="100vh">
            <Card variant="outlined" sx={{ height: '100%', overflow: 'auto', borderLeft: 0, borderRight: 0 }}>
              <CardContent>
                <Grid container spacing={4}>
                  <Grid item>
                    <CustomizedTreeView />
                  </Grid>

                </Grid>
              </CardContent>
            </Card>
          </Box>
          <Box>
            <Card variant="outlined" sx={{ overflow: 'auto', borderLeft: 0, borderRight: 0 }}>
              <CardContent sx={{ paddingBottom: '2px !important', paddingTop: '2px !important' }}>
                <Grid container spacing={2}>
                  <Grid item>
                    <TaskBox />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>
        </Stack>
        <Card variant="outlined" sx={{ flexGrow: 1, height: '100%', width: '100%', overflow: 'hidden' }}>
          <CardContent sx={{ height: '100%', width: '100%', overflow: 'auto' }}>
            <Box my={0}>
              <TableContainer sx={{ maxHeight: '90%', overflowY: 'auto', overflowX: 'auto' }}>
                <Table aria-labelledby="tableTitle" size="small">
                  <EnhancedTableHead numSelected={selected.length}
                    order={order}
                    orderBy={orderBy}
                    onSelectAllClick={handleSelectAllClick}
                    onRequestSort={handleRequestSort}
                    rowCount={fileRows.length}
                  />
                  <TableBody>
                    {
                      isLoading ? (
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
                                onMouseLeave={() => setHoveredRowId(null)} // Clear hover state                onMouseEnter={() => setHoveredRowId(row.id)} // Track hover state
                                sx={{
                                  '&:hover .checkbox': {
                                    opacity: 1, // Show the checkbox on hover
                                  }
                                }}
                              >
                                <TableCell sx={{ borderBottomColor: "#424242" }} padding="checkbox">
                                  {hoveredRowId === row.id ? ( // Only render Checkbox if row is hovered
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
                                  {row.kind === "Folder" && isAddingFolder && row.fileName === "" ? (
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
                                      {row.fileName}
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
                                  }}>{row.fileSize}</TableCell>

                                <TableCell align="left" sx={{
                                  borderBottomColor: "#424242",
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',


                                }} >{row.kind}</TableCell>

                                {(!isSmallScreen || headCells.find(cell => cell.id === 'deviceName')?.isVisibleOnSmallScreen) && (
                                  <TableCell align="left" sx={{
                                    borderBottomColor: "#424242",
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',


                                  }} >{row.deviceName}
                                  </TableCell>
                                )}



                                {(!isSmallScreen || headCells.find(cell => cell.id === 'available')?.isVisibleOnSmallScreen) && (
                                  <TableCell
                                    align="right"
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

                                {(!isSmallScreen || headCells.find(cell => cell.id === 'dateUploaded')?.isVisibleOnSmallScreen) && (
                                  <TableCell
                                    padding="normal"
                                    align="right" sx={{

                                      borderBottomColor: "#424242",
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                    }} >{row.dateUploaded}</TableCell>
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
            </Box>
          </CardContent>
        </Card>
      </Stack>
    </Box >

  );
}
