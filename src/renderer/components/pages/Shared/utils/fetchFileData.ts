import axios from 'axios';
import fs from 'fs';
import { DatabaseData } from '../components/NewTreeView/types';
import { useState } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { CONFIG } from '../../../../config/config';

export const fetchFileData = async (
    username: string,
    disableFetch: boolean,
    snapshot_json: string,
    global_file_path: string,
    {
        setFirstname,
        setLastname,
        setFileRows,
        setAllFiles,
        set_Files,
        setIsLoading,
        cache,
        existingFiles,
    }: {
        setFirstname: (name: string) => void;
        setLastname: (name: string) => void;
        setFileRows: (rows: DatabaseData[]) => void;
        setAllFiles: (files: DatabaseData[]) => void;
        set_Files: (files: any[]) => void;
        setIsLoading: (loading: boolean) => void;
        cache: Map<string, DatabaseData[]>;
        existingFiles: DatabaseData[];
    }
) => {
    try {
        const fileInfoResponse = await axios.post<{ files: DatabaseData[]; }>(
            `${CONFIG.url}/files/get_files_from_filepath/${username}/`,
            {
                global_file_path: global_file_path
            }
        );

        // Filter out files that already exist before returning
        const existingFileKeys = new Set(
            existingFiles.map(file => `${file.file_path}-${file.device_name}`)
        );

        const uniqueNewFiles = fileInfoResponse.data.files.filter(file => 
            !existingFileKeys.has(`${file.file_path}-${file.device_name}`)
        );

        return uniqueNewFiles;

    } catch (error) {
        console.error('Error fetching data:', error);
        return [];
    } finally {
        setIsLoading(false);
    }
} 
