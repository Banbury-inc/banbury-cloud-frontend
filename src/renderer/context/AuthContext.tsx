import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AuthContextType {
  username: string | null;
  password: string | null;
  first_name: string | null;
  last_name: string | null;
  updates: number;
  devices: any[] | null;
  files: any[] | [];
  sync_files: any[] | [];
  tasks: any[] | null;
  fileRows: any[];
  global_file_path: string | null;
  global_file_path_device: string | null;
  websocket: WebSocket | null;
  setUsername: (username: string | null) => void;
  setUpdates: (updates: number) => void;
  setPassword: (password: string | null) => void;
  setFirstname: (first_name: string | null) => void;
  setLastname: (last_name: string | null) => void;
  setGlobal_file_path: (global_file_path: string | null) => void;
  setGlobal_file_path_device: (global_file_path_device: string | null) => void;
  setFileRows: (fileRows: any[]) => void;
  setDevices: (devices: any[] | null) => void;
  set_Files: (files: any[] | []) => void;
  setSyncFiles: (sync_files: any[] | []) => void;
  setTasks: (tasks: any[] | null) => void;
  setSocket: (socket: WebSocket) => void;
  isAuthenticated: boolean; // Change the type to boolean directly
  redirect_to_login: boolean;
  setredirect_to_login: (redict_to_login: boolean) => void;
  taskbox_expanded: boolean; setTaskbox_expanded: (taskbox_expanded: boolean) => void;
  run_receiver: boolean
  files_is_loading: boolean
  setrun_receiver: (run_receiver: boolean) => void;
  setFilesIsLoading: (files_is_loading: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [username, setUser] = useState<string | null>(null);
  const [password, setPass] = useState<string | null>(null);
  const [first_name, setFirst] = useState<string | null>(null);
  const [last_name, setLast] = useState<string | null>(null);
  const [updates, setUp] = useState<number>(1);
  const [devices, setDev] = useState<any[] | null>(null);
  const [files, setFi] = useState<any[] | any[]>([]);
  const [sync_files, setSyncFiles] = useState<any[] | any[]>([]);
  const [tasks, setTa] = useState<any[] | null>(null);
  const [fileRows, setFiles] = useState<any[]>([]);
  const [global_file_path, setFile] = useState<string | null>(null);
  const [global_file_path_device, setFile_Device] = useState<string | null>(null);
  const [redirect_to_login, setredirect_to_login] = useState<boolean>(false); // Add redirect_to_login state
  const [taskbox_expanded, setTaskbox_expanded] = useState<boolean>(false); // Add redirect_to_login state
  const [run_receiver, setrun_receiver] = useState<boolean>(false); // Add redirect_to_login state
  const [files_is_loading, setFilesIsLoading] = useState<boolean>(false); // Add redirect_to_login state
  const [websocket, setWebsocket] = useState<WebSocket | null>(null);

  const setUsername = (username: string | null) => {
    setUser(username);
  };
  const setPassword = (password: string | null) => {
    setPass(password);
  };
  const setFirstname = (first_name: string | null) => {
    setFirst(first_name);
  };
  const setGlobal_file_path = (global_file_path: string | null) => {
    setFile(global_file_path);
  };
  const setGlobal_file_path_device = (global_file_path_device: string | null) => {
    setFile_Device(global_file_path_device);
  };
  const setLastname = (last_name: string | null) => {
    setLast(last_name);
  };
  const setUpdates = (updates: number) => {
    setUp(updates);
  };
  const setDevices = (devices: any[] | null) => {
    setDev(devices);
  };
  const set_Files = (files: any[] | []) => {
    setFi(files);
  };
  const setSync_Files = (sync_files: any[] | []) => {
    setSyncFiles(sync_files);
  };

  const setTasks = (tasks: any[] | null) => {
    setTa(tasks);
  };

  const setFileRows = (fileRows: any[] | []) => {
    setFiles(fileRows);
  };
  const setSocket = (socket: WebSocket) => {
    setWebsocket(socket)
  }





  const isAuthenticated = !!username;

  return (
    <AuthContext.Provider value={{
      username,
      password,
      first_name,
      last_name,
      devices,
      files,
      sync_files,
      tasks,
      fileRows,
      global_file_path,
      global_file_path_device,
      files_is_loading,
      updates,
      websocket,
      setUsername,
      setPassword,
      setFirstname,
      setLastname,
      setDevices,
      set_Files,
      setSyncFiles,
      setTasks,
      setFileRows,
      setGlobal_file_path,
      setUpdates,
      setGlobal_file_path_device,
      setFilesIsLoading,
      setSocket,
      isAuthenticated,
      redirect_to_login,
      setredirect_to_login,
      taskbox_expanded,
      setTaskbox_expanded,
      run_receiver,
      setrun_receiver,


    }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

