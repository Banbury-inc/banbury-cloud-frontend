import { neuranet } from '../../neuranet'
import si from '../../../../dependency/systeminformation'
import axios from 'axios';
import os from 'os';
import fs from 'fs';
import path from 'path';
import { DateTime } from 'luxon';
import { handlers } from '../../handlers';
import { CONFIG } from '../../config/config';


export async function scanFilesystem(username: any) {

  const full_device_sync = CONFIG.full_device_sync; // Change this to your actual server IP

  // Determine the directory path based on the fullDeviceSync flag
  const directoryPath = full_device_sync ? os.homedir() : os.homedir() + "/BCloud";

  const bclouddirectoryName = "BCloud";
  const bclouddirectoryPath = os.homedir() + `/${bclouddirectoryName}`;

  // const directoryName = "BCloud";
  // const directoryPath = os.homedir() + `/${directoryName}`;


  let filesInfo: any[] = [];

  // Check if the directory exists, create if it does not and create a welcome text file
  if (!fs.existsSync(bclouddirectoryPath)) {
    fs.mkdirSync(bclouddirectoryPath, { recursive: true });
    const welcomeFilePath = path.join(bclouddirectoryPath, "welcome.txt");
    fs.writeFileSync(welcomeFilePath,
      "Welcome to Banbury Cloud! This is the directory that will contain all of the files " +
      "that you would like to have in the cloud and streamed throughout all of your devices. " +
      "You may place as many files in here as you would like, and they will appear on all of " +
      "your other devices."
    );
  }
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

  // Recursive function to get file info
  async function traverseDirectory(currentPath: any) {
    const files = fs.readdirSync(currentPath);
    for (const filename of files) {
      const filePath = path.join(currentPath, filename);
      const stats = fs.statSync(filePath);

      try {
        // Determine if it is a file or directory and push appropriate info to filesInfo
        const fileInfo = {
          "file_type": stats.isDirectory() ? "directory" : "file",
          "file_name": filename,
          "file_path": filePath,
          "date_uploaded": DateTime.fromMillis(stats.birthtimeMs).toFormat('yyyy-MM-dd HH:mm:ss'),
          "date_modified": DateTime.fromMillis(stats.mtimeMs).toFormat('yyyy-MM-dd HH:mm:ss'),
          "file_size": stats.isDirectory() ? 0 : stats.size,  // Size is 0 for directories
          "file_priority": 1,
          "file_parent": path.dirname(filePath),
          "original_device": os.hostname(),  // Assuming the current device name as the original device
          "kind": stats.isDirectory() ? 'Folder' : getFileKind(filename),

        };

        // await handlers.files.addFile(username, fileInfo);
        // if the length of filesInfo is more than 100, send the filesInfo to the server
        if (filesInfo.length > 1000) {
          await handlers.files.addFiles(username, filesInfo);
          console.log('Sent 1000 files to the server');
          // Clear the filesInfo array
          filesInfo = [];
        }

        // If it's a directory, recurse into it
        if (stats.isDirectory()) {
          await traverseDirectory(filePath);
        }
        filesInfo.push(fileInfo);
      }
      catch (error) {
        console.error('Error reading file:', error);

        // Skip to the next file
        continue
      }
    }

  }

  // Start processing the files and directories
  await traverseDirectory(directoryPath);

  // After traversing all directories, send the remaining files to the server
  if (filesInfo.length > 0) {
    await handlers.files.addFiles(username, filesInfo);
  }

  const result = 'success'

  return result;

}

