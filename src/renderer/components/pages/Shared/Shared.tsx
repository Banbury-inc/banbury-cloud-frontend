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
import RemoveFileFromSyncButton from './components/remove_file_from_sync_button/remove_file_from_sync_button';
import FileTreeView from './components/NewTreeView/FileTreeView';
import NewInputFileUploadButton from '../../newuploadfilebutton';
import TaskBoxButton from '../../common/notifications/NotificationsButton';
import { fetchDeviceData } from './utils/fetchDeviceData';
import { FileBreadcrumbs } from './components/FileBreadcrumbs';
import { DatabaseData, Order } from './types/index';


import SyncIcon from '@mui/icons-material/Sync';
import AddFileToSyncButton from '../../common/add_file_to_sync_button';
import { EnhancedTableProps, HeadCell } from './types';
import { useFileData } from './hooks/useFileData';
import { newUseFileData } from './hooks/newUseFileData';
import Rating from '@mui/material/Rating';
import { CONFIG } from '../../../config/config';
import { fetchFileSyncData } from './utils/fetchFileSyncData';


const getHeadCells = (isCloudSync: boolean): HeadCell[] => [
  { id: 'file_name', numeric: false, label: 'Name', isVisibleOnSmallScreen: true, isVisibleNotOnCloudSync: true },
  { id: 'file_size', numeric: false, label: 'Size', isVisibleOnSmallScreen: true, isVisibleNotOnCloudSync: true },
  { id: 'kind', numeric: false, label: 'Kind', isVisibleOnSmallScreen: true, isVisibleNotOnCloudSync: true },
  { id: 'available', numeric: false, label: 'Status', isVisibleOnSmallScreen: false, isVisibleNotOnCloudSync: true },
  { id: 'original_device', numeric: false, label: 'Original Device', isVisibleOnSmallScreen: true, isVisibleNotOnCloudSync: true },
  { id: 'owner', numeric: false, label: 'Owner', isVisibleOnSmallScreen: true, isVisibleNotOnCloudSync: true },
  { id: 'date_modified', numeric: false, label: 'Last Modified', isVisibleOnSmallScreen: true, isVisibleNotOnCloudSync: true },
  { id: 'date_uploaded', numeric: false, label: 'Date Uploaded', isVisibleOnSmallScreen: true, isVisibleNotOnCloudSync: true },
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

export default function Shared() {
  const isSmallScreen = useMediaQuery('(max-width:960px)');
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof DatabaseData>('file_name');
  const [selected, setSelected] = useState<readonly string[]>([]);
  const [selectedFileNames, setSelectedFileNames] = useState<string[]>([]);
  const [selectedDeviceNames, setSelectedDeviceNames] = useState<string[]>([]);
  const [selectedFileInfo, setSelectedFileInfo] = useState<any[]>([]);
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);
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
    sync_files,
    first_name,
    last_name,
    devices,
    setFirstname,
    setLastname,
    setDevices,
    setSyncFiles,
    redirect_to_login,
    setredirect_to_login,
    taskbox_expanded,
    setTaskbox_expanded,
  } = useAuth();
  const getSelectedFileNames = () => {
    return selected
      .map((id) => {
        const file = sharedFiles.find((file: any) => file.id === id);
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



  let { isLoading, allFiles, sharedFiles, setSharedFiles } = newUseFileData(
    username,
    disableFetch,
    updates,
    global_file_path,
    global_file_path_device,
    setFirstname,
    setLastname,
    devices,
    setDevices,
  );


  const handleFinish = () => {
    setSelected([]);
    setSelectedFileNames([]);
    setUpdates(updates + 1);
  };




  const handleRequestSort = (event: React.MouseEvent<unknown>, property: keyof DatabaseData) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = sharedFiles.map((n: any) => n.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleFileNameClick = async (id: string) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: readonly string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
    }
    const file_name = sharedFiles.find((file: any) => file.id === id)?.file_name;
    const newSelectedFileNames = newSelected
      .map((id) => sharedFiles.find((file: any) => file.id === id)?.file_name)
      .filter((name) => name !== undefined) as string[];
    console.log(newSelectedFileNames);
    const newSelectedFilePaths = newSelected
      .map((id) => sharedFiles.find((file: any) => file.id === id)?.file_path)
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


  const handleClick = (event: React.MouseEvent<unknown>, id: string) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: readonly string[] = [];

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

    const file_name = sharedFiles.find((file: any) => file._id === id)?.file_name;
    const newSelectedFileNames = newSelected
      .map((id) => sharedFiles.find((file: any) => file._id === id)?.file_name)
      .filter((name) => name !== undefined) as string[];
    const newSelectedDeviceNames = newSelected
      .map((id) => sharedFiles.find((file: any) => file._id === id)?.device_name)
      .filter((name) => name !== undefined) as string[];
    setSelectedFileNames(newSelectedFileNames);
    setSelectedDeviceNames(newSelectedDeviceNames);
    console.log(newSelectedFileNames);
    console.log(selectedFileNames);
  };


  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const isSelected = (id: string) => selected.indexOf(id) !== -1;

  // Avoid a layout jump when reaching the last page with empty rows.
  // Calculate empty rows for pagination
  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - sharedFiles.length) : 0;

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
      }>(`${CONFIG.url}/users/getuserinfo/${username}/`);

      const { first_name, last_name } = userInfoResponse.data;
      setFirstname(first_name);
      setLastname(last_name);
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };


  useEffect(() => {
    fetchUserInfo();
  }, [username]);

  console.log('Shared files in table:', sharedFiles);

  return (
    // <Box sx={{ width: '100%', pl: 4, pr: 4, mt: 0, pt: 5 }}>
    <Box sx={{ width: '100%', pt: 0 }}>
      <Card variant="outlined" sx={{ borderTop: 0, borderLeft: 0, borderBottom: 0 }}>
        <CardContent sx={{ paddingBottom: '2px !important', paddingTop: '46px' }}>
          <Stack spacing={2} direction="row" sx={{ flexWrap: 'nowrap' }}>
            <Grid container spacing={0} sx={{ display: 'flex', flexWrap: 'nowrap', pt: 0 }}>

              <Grid item paddingRight={1}>
                <RemoveFileFromSyncButton
                  selectedFileNames={selectedFileNames}
                  onFinish={handleFinish}
                />
              </Grid>
            </Grid>
            <Grid container justifyContent="flex-end" alignItems="flex-end">
              <Grid item></Grid>
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
      <Stack direction="row" spacing={0} sx={{ width: '100%', height: 'calc(100vh - 76px)', overflow: 'hidden' }}>
        <Stack>
          <Box display="flex" flexDirection="column" height="100%">
            <Card
              variant="outlined"
              sx={{ flexGrow: 1, height: '100%', overflow: 'hidden', borderLeft: 0, borderRight: 0 }}
            >
              <CardContent>
                <Grid container spacing={4} sx={{ flexGrow: 1, overflow: 'auto', maxHeight: 'calc(100vh - 120px)' }}>
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
            {sharedFiles.length === 0 ? (
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
                    rowCount={sharedFiles.length}
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
                      : stableSort(sharedFiles, getComparator(order, orderBy))
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((row, index) => {
                          const isItemSelected = isSelected(row._id as string);
                          const labelId = `enhanced-table-checkbox-${index}`;
                          return (
                            <TableRow
                              hover
                              onClick={(event) => handleClick(event, row._id as string)}
                              role="checkbox"
                              aria-checked={isItemSelected}
                              tabIndex={-1}
                              key={row._id}
                              selected={isItemSelected}
                              onMouseEnter={() => setHoveredRowId(row._id as string)}
                              onMouseLeave={() => setHoveredRowId(null)}
                            >
                              <TableCell sx={{ borderBottomColor: '#424242' }} padding="checkbox">
                                {hoveredRowId === row._id || isItemSelected ? (
                                  <Checkbox
                                    color="primary"
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
                                    handleFileNameClick(row._id as string);
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
                                {typeof row.kind === 'string'
                                  ? row.kind.charAt(0).toUpperCase() + row.kind.slice(1)
                                  : String(row.kind)}
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
                                {row.available}
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
                                {row.original_device}
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
                                {row.owner}
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
                                {row.date_uploaded}
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
                                {row.date_modified}
                              </TableCell>


                            </TableRow>
                          );
                        })}
                  </TableBody>
                </Table>
                </TableContainer>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, 50, 100]}
                  component="div"
                  count={sharedFiles.length}
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
    </Box>
  );
}
