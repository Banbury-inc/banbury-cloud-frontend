import { neuranet } from "../../../neuranet";
import { useAuth } from "../../../context/AuthContext";
import { useAlert } from "../../../context/AlertContext";
import { Button } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import React from "react";
import { handlers } from "../../../handlers";

interface DeleteFileButtonProps {
  selectedFileNames: string[];
  global_file_path: string;
  setSelectedFileNames: (files: string[]) => void;
  setdeleteLoading: (loading: boolean) => void;
  setIsAddingFolder: (adding: boolean) => void;
  setNewFolderName: (name: string) => void;
  setDisableFetch: (disable: boolean) => void;
  updates: number;
  setUpdates: (updates: number) => void;
  setSelected: (selected: readonly number[]) => void;
  setTaskbox_expanded: (expanded: boolean) => void;
  tasks: any[];
  setTasks: (tasks: any[]) => void;
  websocket: WebSocket;
}

export default function DeleteFileButton({ 
  selectedFileNames,
  global_file_path,
  setSelectedFileNames,
  setdeleteLoading,
  setIsAddingFolder,
  setNewFolderName,
  setDisableFetch,
  updates,
  setUpdates,
  setSelected,
  setTaskbox_expanded,
  tasks,
  setTasks,
  websocket
}: DeleteFileButtonProps) {
  const { username } = useAuth();
  const { showAlert } = useAlert();

  const handleDeleteClick = async () => {
    try {
      if (selectedFileNames.length === 0) {
        showAlert('Delete failed', ['Please select file to delete'], 'warning');
        return;
      }

      let task_description = 'Deleting ' + selectedFileNames.join(', ');
      let taskInfo = await neuranet.sessions.addTask(username ?? '', task_description, tasks, setTasks);
      setTaskbox_expanded(true);

      const response = await handlers.files.deleteFile(
        setSelectedFileNames,
        selectedFileNames,
        global_file_path,
        setdeleteLoading,
        setIsAddingFolder,
        setNewFolderName,
        setDisableFetch,
        username,
        updates,
        setUpdates,
      ) as string;

      if (response === 'No file selected' || response === 'file_not_found') {
        await neuranet.sessions.failTask(username ?? '', taskInfo, response, tasks, setTasks);
        showAlert(`Delete failed: ${response}`, ['error']);
      } else if (response === 'success') {
        await neuranet.sessions.completeTask(username ?? '', taskInfo, tasks, setTasks);
        showAlert('Delete completed successfully', ['success']);
      }

      setSelected([]);
    } catch (error) {
      console.error('Delete error:', error);
      showAlert('Delete failed. Please try again.', ['error']);
      setSelected([]);
    }
  };

  return (
    <Button
      onClick={handleDeleteClick}
      sx={{ paddingLeft: '4px', paddingRight: '4px', minWidth: '30px' }}
    >
      <DeleteIcon fontSize="inherit" />
    </Button>
  );
}
