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

import { fileWatcherEmitter } from '../../../../../neuranet/device/watchdog';

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import os from 'os';

const file_name: string = 'treeview_data_snapshot.json';
const directory_name: string = 'BCloud';
const directory_path: string = path.join(os.homedir(), directory_name);
const snapshot_json: string = path.join(directory_path, file_name);
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../../../../context/AuthContext';
import * as utils from '../../../../../utils';
import { buildTree } from './utils/buildTree';
import { fetchFileData } from '../../utils/fetchFileData'
import { DatabaseData } from './types';
import { fetchFileSyncData } from '../../utils/fetchFileSyncData';



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



export default function FileTreeView() {
  const { updates, files, set_Files, setUpdates, global_file_path, global_file_path_device, username, setFirstname, setLastname, setGlobal_file_path, setGlobal_file_path_device } = useAuth();
  const [fileRows, setFileRows] = useState<DatabaseData[]>([]);
  const [expanded, setExpanded] = useState<string[]>(['core']);
  const [allFiles, setAllFiles] = useState<DatabaseData[]>([]);
  const [disableFetch, setDisableFetch] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchedFiles, setFetchedFiles] = useState<DatabaseData[]>([]);

  const file_name: string = 'mmills_database_snapshot.json';
  const directory_name: string = 'BCloud';
  const directory_path: string = path.join(os.homedir(), directory_name);
  const snapshot_json: string = path.join(directory_path, file_name);

  const cache = new Map<string, DatabaseData[]>();



  useEffect(() => {
    const fetchAndUpdateFiles = async () => {
      const new_files = await fetchFileData(
        username || '',
        disableFetch,
        snapshot_json,
        global_file_path || '',
        {
          setFirstname,
          setLastname,
          setFileRows,
          setAllFiles,
          set_Files,
          setIsLoading,
          cache,
        },
      );


    const new_synced_files = await fetchFileSyncData(
      username || '',
      disableFetch,
      snapshot_json,
      global_file_path || '',
      {
        setFirstname,
        setLastname,
        setFileRows,
        setAllFiles,
        set_Files,
        setIsLoading,
        cache,
      },
    );


      if (new_files) {
        let updatedFiles: DatabaseData[] = [];
        if (new_synced_files) { 
          updatedFiles = [...fetchedFiles, ...new_files, ...new_synced_files];
        } else {
          updatedFiles = [...fetchedFiles, ...new_files];
        }
        setFetchedFiles(updatedFiles);
        
        const treeData = buildTree(updatedFiles);
        setFileRows(treeData);
        if (!disableFetch) {
          setAllFiles(treeData);
        }
        set_Files(updatedFiles);
      }
    };

    fetchAndUpdateFiles();
  }, [username, disableFetch, updates, global_file_path]);


  useEffect(() => {
    const handleFileChange = async () => {
      const new_files = await fetchFileData(
        username || '',
        disableFetch,
        snapshot_json,
        global_file_path || '',
        {
          setFirstname,
          setLastname,
          setFileRows,
          setAllFiles,
          set_Files,
          setIsLoading,
          cache,
        },
      );

      if (new_files) {
        const updatedFiles = [...fetchedFiles, ...new_files];
        setFetchedFiles(updatedFiles);
        
        const treeData = buildTree(updatedFiles);
        setFileRows(treeData);
        if (!disableFetch) {
          setAllFiles(treeData);
        }
        set_Files(updatedFiles);
      }
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
      // Don't set path for root core node
      if (selectedNode.id === 'Core') {
        setGlobal_file_path(selectedNode.id);
        setGlobal_file_path_device('');
        return;
      }
      // Don't set path for main Devices or Cloud Sync nodes
      if (selectedNode.id === 'Devices' || selectedNode.id === 'Cloud Sync') {
        setGlobal_file_path(`Core/${selectedNode.id}`);
        setGlobal_file_path_device('');
        return;
      }

      let newFilePath = '';
      // If it's a device node (direct child of 'Devices')
      if (selectedNode.file_parent === 'Devices') {
        newFilePath = `Core/Devices/${selectedNode.file_name}`;
      } 
      // For files and folders under devices
      else if (selectedNode.file_path) {
        newFilePath = `Core/Devices/${selectedNode.device_name}${selectedNode.file_path}`;
      }
      // Set the global file path and device
      setGlobal_file_path(newFilePath);
      setGlobal_file_path_device(selectedNode.device_name);
      // Log the node information
      console.log('Setting global file path:', newFilePath);
      console.log('Setting device name:', selectedNode.device_name);


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



