
import fs from 'fs';
import path from 'path';
import { handlers } from '../index'; // Adjust the path according to your project structure

export async function foldernameSave(
  newFolderName: string,
  setIsAddingFolder: (adding: boolean) => void,
  setUpdates: (updates: number) => void,
  updates: number,
  global_file_path: string | undefined,
  setFileRows: (callback: (prevFileRows: any[]) => any[]) => void,
  setNewFolderName: (name: string) => void,
  setDisableFetch: (disable: boolean) => void,
  username: string | null
) {
  if (newFolderName.trim() === "") {
    setIsAddingFolder(false);
    setUpdates(updates + 1);
    return; // Exit if the folder name is empty
  }

  const currentPath = global_file_path ?? '';
  const newFolderPath = path.join(currentPath, newFolderName);

  // Attempt to create the folder on the filesystem or backend here
  try {
    if (!fs.existsSync(newFolderPath)) {
      fs.mkdirSync(newFolderPath);
      console.log(`Folder created at ${newFolderPath}`);

      // Update the temporary folder row to reflect the new folder
      setFileRows(prevFileRows => prevFileRows.map(row =>
        row.kind === "Folder" && row.fileName === ""
          ? { ...row, fileName: newFolderName, filePath: newFolderPath }
          : row
      ));
    }
  } catch (error) {
    console.error('Error creating folder:', error);
  }

  console.log(updates);
  setIsAddingFolder(false);
  setNewFolderName("");
  setDisableFetch(false);

  const update_result = await handlers.devices.updateDevices(username);
  console.log(update_result);
  setUpdates(updates + 1);
}
