import { neuranet } from '../../neuranet';
import os from 'os';
import fs from 'fs';
import path from 'path';
import { DateTime } from 'luxon';
import { handlers } from '../../handlers';
import { CONFIG } from '../../config/config';

export async function scanFilesystem(username: string): Promise<string> {
  const fullDeviceSync = CONFIG.full_device_sync;
  const skipDotFiles = CONFIG.skip_dot_files;
  const scanSelectedFolders = CONFIG.scan_selected_folders;

  let directoriesToScan: string[] = [];

  if (scanSelectedFolders) {
    // Get the array of scanned folders from get_scanned_folders
    const response = await neuranet.device.get_scanned_folders(username);
    if (typeof response === 'object' && 'result' in response && response.result === 'success') {
      if ('scanned_folders' in response && Array.isArray(response.scanned_folders)) {
        directoriesToScan = response.scanned_folders;
      } else {
        console.log('No valid folders returned from get_scanned_folders.');
        return 'No valid folders to scan';
      }
    } else {
      console.log('Failed to get scanned folders.');
      return 'Failed to get scanned folders';
    }
    
    if (directoriesToScan.length === 0) {
      console.log('No folders selected for scanning.');
      return 'No folders to scan';
    }
  } else {
    // If not scanning selected folders, use the default directory
    const defaultDirectory = fullDeviceSync ? os.homedir() : path.join(os.homedir(), 'BCloud');
    directoriesToScan = [defaultDirectory];
  }

  let filesInfo: any[] = [];

  // Function to get file kind (unchanged)
  function getFileKind(filename: string): string {
    const ext = path.extname(filename).toLowerCase();
    const fileTypes: { [key: string]: string } = {
      '.png': 'Image',
      '.jpg': 'Image',
      '.jpeg': 'Image',
      '.gif': 'Image',
      '.bmp': 'Image',
      '.svg': 'Image',
      '.mp4': 'Video',
      '.mov': 'Video',
      '.avi': 'Video',
      '.mp3': 'Audio',
      '.wav': 'Audio',
      '.pdf': 'Document',
      '.doc': 'Document',
      '.docx': 'Document',
      '.txt': 'Text',
      // Add more file types as needed
    };
    return fileTypes[ext] || 'Unknown';
  }

  // Modified traverseDirectory function to handle multiple directories
  async function traverseDirectory(currentPath: string): Promise<void> {
    if (!fs.existsSync(currentPath)) {
      console.log(`Directory does not exist: ${currentPath}`);
      return;
    }

    const files = fs.readdirSync(currentPath);

    for (const filename of files) {
      const filePath = path.join(currentPath, filename);
      const stats = fs.statSync(filePath);


      // Skip dot directories if configured to do so
      if (skipDotFiles && filename.startsWith('.')) continue;

      try {
        const fileInfo = {
          file_type: stats.isDirectory() ? 'directory' : 'file',
          file_name: filename,
          file_path: filePath,
          date_uploaded: DateTime.fromMillis(stats.birthtimeMs).toFormat('yyyy-MM-dd HH:mm:ss'),
          date_modified: DateTime.fromMillis(stats.mtimeMs).toFormat('yyyy-MM-dd HH:mm:ss'),
          file_size: stats.isDirectory() ? 0 : stats.size,
          file_priority: 1,
          file_parent: path.dirname(filePath),
          original_device: os.hostname(),
          kind: stats.isDirectory() ? 'Folder' : getFileKind(filename),
        };

        filesInfo.push(fileInfo);
        console.log('Added file to filesInfo:', fileInfo);

        // Send files to the server in batches of 1000
        if (filesInfo.length >= 1000) {
          await handlers.files.addFiles(username, filesInfo);
          filesInfo = [];
        }

        // Recursively traverse subdirectories
        if (stats.isDirectory()) {
          await traverseDirectory(filePath);
        }
      } catch (error) {
        console.error(`Error reading file ${filePath}:`, error);
        // Continue with the next file
        continue;
      }
    }
  }

  // Traverse all directories in the directoriesToScan array
  for (const directory of directoriesToScan) {
    await traverseDirectory(directory);
  }

  // After traversing all directories, send any remaining files to the server
  if (filesInfo.length > 0) {
    await handlers.files.addFiles(username, filesInfo);
  }

  return 'success';
}
