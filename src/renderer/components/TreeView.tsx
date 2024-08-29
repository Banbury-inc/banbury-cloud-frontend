
import * as React from 'react';
import { Typography, Box } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { TreeView, TreeItem } from '@mui/x-tree-view';
import GrainIcon from '@mui/icons-material/Grain';
import DevicesIcon from '@mui/icons-material/Devices';
import FolderIcon from '@mui/icons-material/Folder';
import ImageIcon from '@mui/icons-material/Image';
import VideocamIcon from '@mui/icons-material/Videocam';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import DescriptionIcon from '@mui/icons-material/Description';
import axios from 'axios';
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import * as utils from '../utils/';

interface FileData {
  id: number | string;
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

function buildTree(files: FileData[]): FileData[] {
  const deviceMap = new Map<string, FileData>();
  const roots: FileData[] = [];

  const coreNode: FileData = {
    id: 'core',
    fileType: 'directory',
    fileName: 'Core',
    dateUploaded: '',
    fileSize: '',
    filePath: '',
    kind: 'Core',
    fileParent: '',
    deviceID: '',
    deviceName: '',
    children: [],
    original_device: '',
  };

  files.forEach(file => {
    if (!deviceMap.has(file.original_device)) {
      const deviceNode: FileData = {
        id: `device-${file.original_device}`,
        fileType: 'directory',
        fileName: file.deviceName,
        dateUploaded: '',
        fileSize: '',
        filePath: '',
        kind: 'Device',
        fileParent: 'core',
        deviceID: file.deviceID,
        deviceName: file.deviceName,
        children: [],
        original_device: file.original_device,
      };
      deviceMap.set(file.original_device, deviceNode);
      coreNode.children!.push(deviceNode);
    }
  });

  files.forEach(file => {
    const deviceNode = deviceMap.get(file.original_device);
    if (deviceNode) {
      const parent = files.find(f => f.filePath === file.fileParent) || deviceNode;
      parent.children = parent.children || [];
      parent.children.push(file);
    }
  });

  roots.push(coreNode);
  return roots;
}

export default function CustomizedTreeView() {
  const { updates, setUpdates, global_file_path, global_file_path_device, username, setFirstname, setLastname, setGlobal_file_path, setGlobal_file_path_device } = useAuth();
  const [fileRows, setFileRows] = useState<FileData[]>([]);
  const [expanded, setExpanded] = useState<string[]>(['core']);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userInfoResponse = await axios.get<{
          first_name: string;
          last_name: string;
          phone_number: string;
          email: string;
        }>(`https://website2-v3xlkt54dq-uc.a.run.app/getuserinfo/${username}/`);

        const { first_name, last_name } = userInfoResponse.data;
        setFirstname(first_name);
        setLastname(last_name);

        const deviceInfoResponse = await axios.get<{
          devices: any[];
        }>(`https://website2-v3xlkt54dq-uc.a.run.app/getdeviceinfo/${username}/`);

        const { devices } = deviceInfoResponse.data;

        const fileInfoResponse = await axios.get<{
          files: any[];
        }>(`https://website2-v3xlkt54dq-uc.a.run.app/getfileinfo/${username}/`);

        const { files } = fileInfoResponse.data;

        const allFilesData = devices.flatMap((device: any, index: any) => {
          const deviceFiles = files.filter(file => file.device_name === device.device_name);
          return deviceFiles.map((file, fileIndex) => ({
            // id: index * 1000 + fileIndex,
            id: `device-${device.device_number}-file-${fileIndex}`,
            fileName: file.file_name,
            fileSize: utils.formatBytes(file.file_size),
            kind: file.kind,
            filePath: file.file_path,
            dateUploaded: file.date_uploaded,
            deviceID: (index + 1).toString(),
            deviceName: device.device_name,
            original_device: device.device_name,
            fileParent: file.file_parent,
            fileType: file.file_type,
          }));
        });

        setFileRows(buildTree(allFilesData));
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [updates]);

  const handleNodeSelect = useCallback((event: React.SyntheticEvent, nodeId: string) => {
    const findNodeById = (nodes: FileData[], id: string): FileData | null => {
      for (const node of nodes) {
        if (node.id.toString() === id) {
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
      if (global_file_path !== selectedNode.filePath || global_file_path_device !== selectedNode.deviceName) {
        setGlobal_file_path(selectedNode.filePath);
        setGlobal_file_path_device(selectedNode.deviceName);
      }
    }
  }, [fileRows, global_file_path, global_file_path_device, setGlobal_file_path, setGlobal_file_path_device]);

  const renderTreeItems = useCallback((nodes: FileData[]) => {
    return nodes.map((node) => (
      <TreeItem
        key={node.id}
        nodeId={node.id.toString()}
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
              {node.fileName}
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
  );
}
