import { DatabaseData } from '../types';

export function buildTree(files: DatabaseData[]): DatabaseData[] {



  // Build final tree
  const allFilesData = files.flatMap((file, fileIndex) => ({
    id: `device-${file.deviceID}-file-${fileIndex}`,
    file_type: file.file_type,
    file_name: file.file_name,
    file_size: file.file_size,
    file_path: file.file_path,
    kind: file.kind,
    helpers: file.helpers,
    date_uploaded: file.date_uploaded,
    deviceID: file.deviceID,
    device_name: file.device_name,
    file_parent: file.file_parent,
    original_device: file.original_device,
    available: file.available,
  }));





  const fileMap = new Map<string, DatabaseData>();


  // Create only the "Shared" node
  const sharedNode: DatabaseData = {
    _id: 'Shared',
    id: 'Shared',
    file_type: 'directory',
    file_name: 'Shared',
    file_size: '',
    file_path: '',
    kind: 'SharedFolder',
    file_parent: '', // Remove Core as parent
    date_uploaded: '',
    helpers: 0,
    available: '',
    deviceID: '',
    device_name: '',
    children: [],
    original_device: '',
  };

  files.forEach((file, index) => {
    // Skip files without a device name
    if (!file.device_name) {
      return;
    }

    // Modify the path check to look for Cloud Sync files
    if (file.file_path.includes('Shared/')) { // Modified condition
      // Create a file node directly under Cloud Sync
      const fileNode: DatabaseData = {
        _id: file._id,
        id: file._id,
        file_type: file.file_type,
        file_name: file.file_path.split('/').pop() || '',
        file_size: file.file_size,
        file_path: file.file_path,
        kind: file.kind,
        file_parent: 'Shared',
        date_uploaded: file.date_uploaded,
        helpers: file.helpers,
        available: file.available,
        deviceID: file.deviceID,
        device_name: file.device_name,
        original_device: file.original_device,
      };
      sharedNode.children!.push(fileNode);
    }
  });

  // Return only the Shared node
  return [sharedNode];
}


