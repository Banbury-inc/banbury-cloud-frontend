import chokidar from 'chokidar';
import { CONFIG } from '../../config/config';
import os from 'os';
import path from 'path';
import { handlers } from '../../handlers';
import fs from 'fs';
import si from '../../../../dependency/systeminformation'
import { DateTime } from 'luxon';


function getFileKind(filename: string) {
  const ext = path.extname(filename).toLowerCase();
  const fileTypes: { [key: string]: string } = {
    '.png': 'Image',
    '.jpg': 'Image',
    '.JPG': 'Image',
    '.jpeg': 'Image',
    '.gi': 'Image',
    '.bmp': 'Image',
    '.svg': 'Image',
    '.mp4': 'Video',
    '.mov': 'Video',
    '.webm': 'Video',
    '.avi': 'Video',
    '.mkv': 'Video',
    '.wmv': 'Video',
    '.flv': 'Video',
    '.mp3': 'Audio',
    '.wav': 'Audio',
    '.aac': 'Audio',
    '.flac': 'Audio',
    '.ogg': 'Audio',
    '.wma': 'Audio',
    '.pdf': 'Document',
    '.doc': 'Document',
    '.docx': 'Document',
    '.xls': 'Document',
    '.xlsx': 'Document',
    '.ppt': 'Document',
    '.pptx': 'Document',
    '.txt': 'Text',
    '.csv': 'Data',
    '.json': 'Data',
    '.xml': 'Data',
    '.zip': 'Archive',
    '.rar': 'Archive',
    '.7z': 'Archive',
    '.tar': 'Archive',
    '.gz': 'Archive',
    '.exe': 'Executable',
    '.dll': 'Executable',
    '.sh': 'Script',
    '.cpp': 'Script',
    '.ts': 'Script',
    '.bat': 'Script',
    '.rs': 'Script',
    '.py': 'Script',
    '.js': 'Script',
    '.html': 'Web',
    '.css': 'Web',
    // Add more file extensions as needed
  };
  return fileTypes[ext] || 'unknown';
}



// Function that gets triggered when a new file is added
function onFileAdded(filePath: string, username: string) {
  console.log(`New file added: ${filePath}`);

  const stats = fs.statSync(filePath);

  const fileInfo = {
    "file_type": stats.isDirectory() ? "directory" : "file",
    "file_name": path.basename(filePath),
    "file_path": filePath,
    "date_uploaded": DateTime.fromMillis(stats.birthtimeMs).toFormat('yyyy-MM-dd HH:mm:ss'),
    "date_modified": DateTime.fromMillis(stats.mtimeMs).toFormat('yyyy-MM-dd HH:mm:ss'),
    "file_size": stats.isDirectory() ? 0 : stats.size,  // Size is 0 for directories
    "file_priority": 1,
    "file_parent": path.dirname(filePath),
    "original_device": os.hostname(),  // Assuming the current device name as the original device
    "kind": stats.isDirectory() ? 'Folder' : getFileKind(filePath),

  };

  console.log('File Info:', fileInfo);

  // Call the handler to add files
  handlers.files.addFile(username, fileInfo);
}

// Function that gets triggered when a new file is added
function onFileDeleted(filePath: string, username: string) {
  console.log(`New file added: ${filePath}`);

  const stats = fs.statSync(filePath);

  let filesInfo: any[] = [];
  const fileInfo = {
    "file_type": stats.isDirectory() ? "directory" : "file",
    "file_name": path.basename(filePath),
    "file_path": filePath,
    "date_uploaded": DateTime.fromMillis(stats.birthtimeMs).toFormat('yyyy-MM-dd HH:mm:ss'),
    "date_modified": DateTime.fromMillis(stats.mtimeMs).toFormat('yyyy-MM-dd HH:mm:ss'),
    "file_size": stats.isDirectory() ? 0 : stats.size,  // Size is 0 for directories
    "file_priority": 1,
    "file_parent": path.dirname(filePath),
    "original_device": os.hostname(),  // Assuming the current device name as the original device
    "kind": stats.isDirectory() ? 'Folder' : getFileKind(filePath),

  };

  filesInfo.push(fileInfo);

  console.log('File Info:', fileInfo);

  // Call the handler to add files
  handlers.files.addFiles(username, fileInfo);

  filesInfo = [];
}



// Function to handle file change events
export function detectFileChanges(directoryPath: string, username: string) {
  // Initialize the watcher
  const watcher = chokidar.watch(directoryPath, {
    persistent: true,
    ignoreInitial: false, // Whether to ignore adding events when starting
    depth: 10, // How deep to traverse directories
  });

  // Event listeners
  watcher
    .on('add', (filePath) => {
      console.log(`File added: ${filePath}`);
      onFileAdded(filePath, username); // Call the onFileAdded function
    })
    .on('change', (filePath) => console.log(`File changed: ${filePath}`))
    .on('unlink', (filePath) => console.log(`File removed: ${filePath}`))
    .on('addDir', (filePath) => console.log(`Directory added: ${filePath}`))
    .on('unlinkDir', (filePath) => console.log(`Directory removed: ${filePath}`))
    .on('error', (error) => console.error('Error watching files:', error))
    .on('ready', () => console.log('Initial scan complete. Ready for file changes.'));
}

// Usage Example
const fullDeviceSync = CONFIG.full_device_sync;
const bcloudDirectoryPath = fullDeviceSync ? os.homedir() : path.join(os.homedir(), 'BCloud');

// Start detecting file changes
detectFileChanges(bcloudDirectoryPath, 'mmills');

