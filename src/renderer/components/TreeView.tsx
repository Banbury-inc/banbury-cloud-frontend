
import * as React from 'react';
import { Typography, Box } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { TreeView, TreeItem } from '@mui/x-tree-view';
import GrainIcon from '@mui/icons-material/Grain';
import DevicesIcon from '@mui/icons-material/Devices';
import FolderIcon from '@mui/icons-material/Folder';
import ImageIcon from '@mui/icons-material/Image';
import VideocamIcon from '@mui/icons-material/Videocam'; import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import DescriptionIcon from '@mui/icons-material/Description';

import { fileWatcherEmitter } from '../neuranet/device/watchdog';

import axios from 'axios';
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import * as utils from '../utils/';
import fs from 'fs';
import path from 'path';
import os from 'os';

interface FileData {
  id: string;
  fileType: string;
  fileName: string;
  dateUploaded: string;
  fileSize: string;
  filePath: string;
  fileParent: string;
  kind: string;
  deviceID: string;
  deviceName: string;
  children?: FileData[];
  original_device: string;
}

// Simplified data interface to match your file structure
interface DatabaseData {
  id: string;
  file_name: string;
  kind: string;
  date_uploaded: string;
  file_size: string;
  file_path: string;
  file_type: string;
  deviceID: string;
  device_name: string;
  helpers: number;
  available: string;
  file_parent: string;
  children?: DatabaseData[];
  original_device: string;
}



const EventEmitter = require('events');




function getIconForKind(kind: string) {
  switch (kind) {
    case 'Core':
      return <GrainIcon style={{ marginRight: 5 }} fontSize="inherit" />;
    case 'Device':
      return <DevicesIcon style={{ marginRight: 5 }} fontSize="inherit" />;
    case 'Folder':
      return <FolderIcon style={{ marginRight: 5 }} fontSize="inherit" />;
    case 'Image':
      return <ImageIcon style={{ marginRight: 5 }} fontSize="inherit" />;
    case 'Video':
      return <VideocamIcon style={{ marginRight: 5 }} fontSize="inherit" />;
    case 'Audio':
      return <AudiotrackIcon style={{ marginRight: 5 }} fontSize="inherit" />;
    case 'Document':
      return <DescriptionIcon style={{ marginRight: 5 }} fontSize="inherit" />;
    default:
      return <FolderIcon style={{ marginRight: 5 }} fontSize="inherit" />;
  }
}




function buildTree(files: DatabaseData[]): DatabaseData[] {
  const fileMap = new Map<string, DatabaseData>();

  // Create the root "Core" node
  const coreNode: DatabaseData = {
    id: 'core',
    file_type: 'directory',
    file_name: 'Core',
    file_size: '',
    file_path: '',
    kind: 'Core',
    file_parent: '',
    date_uploaded: '',
    helpers: 0,
    available: '',
    deviceID: '',
    device_name: `Unnamed Device `,
    children: [],
    original_device: '',
  };

  // Group files by a unique device identifier based on the device name
  const devicesMap = new Map<string, DatabaseData>();

  files.forEach((file, index) => {
    // Create a unique key based on the device name
    const uniqueDeviceKey = file.device_name || `Unnamed-Device-${index}`;

    if (!devicesMap.has(uniqueDeviceKey)) {
      // Create a device node if it doesn't already exist in the map
      const deviceNode: DatabaseData = {
        id: `device-${uniqueDeviceKey.replace(/\s+/g, '-')}`, // Replace spaces with dashes for a cleaner ID
        file_type: 'directory',
        file_name: file.device_name || `Unnamed Device ${index}`,
        date_uploaded: '',
        file_size: '',
        file_path: '',
        helpers: 0,
        available: '',
        kind: 'Device',
        file_parent: 'core',
        deviceID: file.deviceID || `undefined-${index}`,
        device_name: file.device_name || `Unnamed Device ${index}`,
        children: [],
        original_device: file.original_device,
      };
      devicesMap.set(uniqueDeviceKey, deviceNode);
    }

    // Get the device node from the map
    const deviceNode = devicesMap.get(uniqueDeviceKey);

    // Create or update the file structure under the device node
    const filePathParts = file.file_path.split('/').filter(Boolean);
    let currentNode = deviceNode;

    filePathParts.forEach((part, partIndex) => {
      // Determine if this part of the path is the last one (i.e., the actual file or the last directory in the path)
      const isLastPart = partIndex === filePathParts.length - 1;

      // Check if the current part already exists as a child node of the current directory
      const existingNode = currentNode!.children?.find(child => child.file_name === part);

      if (existingNode) {
        // If the part exists, set it as the current node to continue building the path
        currentNode = existingNode;
      } else {
        // If the part doesn't exist, create a new node for this part
        const newNode: DatabaseData = {
          id: `${uniqueDeviceKey.replace(/\s+/g, '-')}-${part}-${partIndex}`,
          file_type: isLastPart ? file.file_type : 'directory', // Set as 'directory' if it's not the last part
          file_name: part, // Name the node after the current part of the path
          date_uploaded: '',
          file_size: '',
          helpers: 0,
          available: '',
          // Only use the original file's path for the new node if it's the last part (actual file or directory)
          file_path: isLastPart ? file.file_path : `${currentNode!.file_path}/${part}`,
          kind: isLastPart ? file.kind : 'Folder', // If it's the last part, use the file's kind, otherwise 'Folder'
          file_parent: currentNode!.id, // Set the current node's ID as the parent
          deviceID: file.deviceID || `undefined-${index}`, // Use the device ID, or a placeholder if undefined
          device_name: file.device_name || `Unnamed Device ${index}`, // Use the device name, or a placeholder if undefined
          children: isLastPart && file.file_type !== 'directory' ? undefined : [], // Initialize children unless it's the last part and not a directory
          original_device: file.original_device,
        };

        // Add the newly created node to the current node's children
        currentNode!.children?.push(newNode);
        // Update currentNode to the new node to continue building the path
        currentNode = newNode;
      }

      // If this is the last part and it's a directory, push the file object itself as a child
      // if (isLastPart && file.fileType === 'directory') {
      // currentNode!.children?.push(file);
      // }
    });
  });

  // Add all device nodes to the core node's children
  devicesMap.forEach(deviceNode => {
    coreNode.children!.push(deviceNode);
  });

  // Return the tree with "Core" as the root
  return [coreNode];
}






export default function CustomizedTreeView() {
  const { updates, files, set_Files, setUpdates, global_file_path, global_file_path_device, username, setFirstname, setLastname, setGlobal_file_path, setGlobal_file_path_device } = useAuth();
  const [fileRows, setFileRows] = useState<DatabaseData[]>([]);
  const [expanded, setExpanded] = useState<string[]>(['core']);
  const [allFiles, setAllFiles] = useState<DatabaseData[]>([]);
  const [disableFetch, setDisableFetch] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const file_name: string = 'mmills_database_snapshot.json';
  const directory_name: string = 'BCloud';
  const directory_path: string = path.join(os.homedir(), directory_name);
  const snapshot_json: string = path.join(directory_path, file_name);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    const fetchData = async () => {
      try {
        const userInfoResponse = await axios.get<{
          first_name: string;
          last_name: string;
          phone_number: string;
          email: string;
        }>(`https://website2-389236221119.us-central1.run.app/getuserinfo/${username}/`);

        const { first_name, last_name } = userInfoResponse.data;
        setFirstname(first_name);
        setLastname(last_name);

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

        let allFilesData = devices.flatMap((device: any, index: any) => {
          const deviceFiles = files.filter(file => file.device_name === device.device_name);
          return deviceFiles.map((file, fileIndex) => ({
            id: `device-${device.device_number}-file-${fileIndex}`,
            file_type: file.file_type,
            file_name: file.file_name,
            file_size: file.file_size,
            file_path: file.file_path,
            kind: file.kind,
            date_uploaded: file.date_uploaded,
            helpers: file.helpers,
            deviceID: device.device_number,
            device_name: device.device_name,
            file_parent: file.file_parent,
            original_device: file.original_device,
            available: device.online ? "Available" : "Unavailable",
          }));
        });




        const fileInfoResponse = await axios.get<{
          files: any[];
        }>(`https://website2-389236221119.us-central1.run.app/getfileinfo/${username}/`);

        files = fileInfoResponse.data.files;

        allFilesData = devices.flatMap((device: any, index: any) => {
          const deviceFiles = files.filter(file => file.device_name === device.device_name);
          return deviceFiles.map((file, fileIndex) => ({
            id: `device-${device.device_number}-file-${fileIndex}`,
            file_type: file.file_type,
            file_name: file.file_name,
            file_size: file.file_size,
            file_path: file.file_path,
            kind: file.kind,
            helpers: file.helpers,
            date_uploaded: file.date_uploaded,
            deviceID: device.device_number,
            device_name: device.device_name,
            file_parent: file.file_parent,
            original_device: file.original_device,
            available: device.online ? "Available" : "Unavailable",
          }));
        });


        setFileRows([]);
        setFileRows(buildTree(allFilesData));

        setAllFiles(allFilesData); if (!disableFetch) {
          setAllFiles(allFilesData);
        }

        set_Files(allFilesData);

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };



    fetchData();



  }, [username, disableFetch, updates]); // Include allFiles in the dependency array


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



      const allFilesData = devices.flatMap((device: any, index: any) => {
        const deviceFiles = files.filter(file => file.device_name === device.device_name);
        return deviceFiles.map((file, fileIndex) => ({
          id: `device-${device.device_number}-file-${fileIndex}`,
          file_type: file.file_type,
          file_name: file.file_name,
          file_size: file.file_size,
          file_path: file.file_path,
          kind: file.kind,
          helpers: file.helpers,
          date_uploaded: file.date_uploaded,
          deviceID: device.device_number,
          device_name: device.device_name,
          file_parent: file.file_parent,
          original_device: file.original_device,
          available: device.online ? "Available" : "Unavailable",
        }));
      });



      setFileRows([]);
      setFileRows(buildTree(allFilesData));

      setAllFiles(allFilesData); if (!disableFetch) {
        setAllFiles(allFilesData);
      }

      set_Files(allFilesData);



      console.log("Local file data loaded");

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleFileChange = () => {
      console.log('File changed, fetching data from file tree...');
      setIsLoading(true);
      fetchData(username, disableFetch, setFirstname, setLastname, setAllFiles, setIsLoading);

    };

    fileWatcherEmitter.on('fileChanged', handleFileChange);

    return () => {
      fileWatcherEmitter.off('fileChanged', handleFileChange);
    };
  }, [username, disableFetch]);





  const handleNodeSelect = (event: React.SyntheticEvent, nodeId: string) => {
    const findNodeById = (nodes: DatabaseData[], id: any): DatabaseData | null => {
      for (const node of nodes) {
        if (node.id === id) {
          return node;
        }
        if (node.children) {
          const childNode = findNodeById(node.children, id);
          if (childNode) {
            return childNode;
          }
        }
      }
      return null;
    };

    const selectedNode = findNodeById(fileRows, nodeId);
    if (selectedNode) {
      console.log('Selected node file path:', selectedNode.file_path);
      console.log('Selected node device name:', selectedNode.device_name);

      if (global_file_path !== selectedNode.file_path || global_file_path_device !== selectedNode.device_name) {
        // Set the global file path and device
        setGlobal_file_path(selectedNode.file_path);
        setGlobal_file_path_device(selectedNode.device_name);

        // Log the node information but not the global_file_path (since it's async)
        console.log('Setting global file path:', selectedNode.file_path);
      }
    }
  };

  // Monitor changes to global_file_path in useEffect
  useEffect(() => {
    if (global_file_path) {
      console.log('Global file path has been updated:', global_file_path);
    }
  }, [global_file_path]);

  useEffect(() => {
    if (global_file_path_device) {
      console.log('Global file path device has been updated:', global_file_path_device);
    }
  }, [global_file_path_device]);

  const renderTreeItems = useCallback((nodes: DatabaseData[]) => {
    return nodes.map((node) => (
      <TreeItem
        key={node.id}
        nodeId={node.id}
        label={
          <Box sx={{ display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
            {getIconForKind(node.kind)}
            <Typography
              variant="inherit"
              sx={{
                ml: 1,
                mt: 0.5,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: 'calc(100% - 24px)',
              }}

            >
              {node.file_name}
            </Typography>
          </Box>
        }
      >
        {node.children && renderTreeItems(node.children)}
      </TreeItem>
    ));
  }, []);

  return (
    <Box sx={{ width: 300, height: '100%', overflow: 'auto' }}>
      <TreeView
        aria-label="file system navigator"
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
        sx={{ width: '100%', flexGrow: 1, overflow: 'auto' }}
        onNodeSelect={handleNodeSelect}
      >
        {renderTreeItems(fileRows)}
      </TreeView>
    </Box>
  )

}



