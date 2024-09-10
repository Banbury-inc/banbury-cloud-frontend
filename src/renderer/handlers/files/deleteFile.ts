
import fs from 'fs';
import path from 'path';
import { handlers } from '../index'; // Adjust the path according to your project structure

export async function deleteFile(
  selectedFileNames: string[],
  global_file_path: string | null,
  setdeleteLoading: (loading: boolean) => void,
  setIsAddingFolder: (adding: boolean) => void,
  setNewFolderName: (name: string) => void,
  setDisableFetch: (disable: boolean) => void,
  username: string | null,
  updates: number,
  setUpdates: (updates: number) => void
) {
  setdeleteLoading(true);
  const deletePromises: Promise<void>[] = [];  // Array to hold promises for deletion operations

  selectedFileNames.forEach((fileName: string) => {
    const currentPath: string = global_file_path ?? '';
    const filePath: string = path.join(currentPath, fileName);
    console.log(filePath);

    // Create a promise for each file operation and push it to the array
    const deletePromise = new Promise<void>((resolve, reject) => {
      fs.stat(filePath, (err: NodeJS.ErrnoException | null, stats: fs.Stats) => {
        if (err) {
          console.error(`Error reading file stats: ${err}`);
          reject(err);
          return;
        }
        if (stats.isDirectory()) {
          fs.rmdir(filePath, { recursive: true }, (err: NodeJS.ErrnoException | null) => {
            if (err) {
              console.error(`Error deleting directory: ${err}`);
              reject(err);
            } else {
              console.log(`Directory '${fileName}' deleted successfully at ${filePath}`);
              resolve();
            }
          });
        } else if (stats.isFile()) {
          fs.unlink(filePath, (err: NodeJS.ErrnoException | null) => {
            if (err) {
              console.error(`Error deleting file: ${err}`);
              reject(err);
            } else {
              console.log(`File '${fileName}' deleted successfully at ${filePath}`);
              resolve();
            }
          });
        }
      });
    });

    deletePromises.push(deletePromise);
  });

  try {
    // Wait for all delete operations to complete
    await Promise.all(deletePromises);
    console.log('All files deleted successfully.');
  } catch (error) {
    console.error('Error deleting files:', error);
  }

  setdeleteLoading(false);
  setIsAddingFolder(false);
  setNewFolderName("");
  setDisableFetch(false);

  // Run update devices function after all deletions are complete
  const update_result = await handlers.devices.updateDevice(username);
  console.log(update_result);
  setUpdates(updates + 1);
}
