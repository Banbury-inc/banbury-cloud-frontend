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
    options: {
        setFirstname: (value: string) => void;
        setLastname: (value: string) => void;
        setFileRows: (value: DatabaseData[]) => void;
        setAllFiles: (value: DatabaseData[]) => void;
        set_Files: (value: any[]) => void;
        setIsLoading: (value: boolean) => void;
        cache: Map<string, DatabaseData[]>;
    },
) => {
    try {
        const fileInfoResponse = await axios.post<{ files: DatabaseData[]; }>(
            `${CONFIG.url}/get_files_from_filepath/${username}/`,
            {
                global_file_path: global_file_path
            }
        );

        // Create a Map of existing files using a unique identifier
        const uniqueFiles = new Map<string, DatabaseData>();
        
        // Use combination of file_path and device_name as unique identifier
        fileInfoResponse.data.files.forEach(file => {
            const uniqueKey = `${file.file_path}-${file.device_name}`;
            if (!uniqueFiles.has(uniqueKey)) {
                uniqueFiles.set(uniqueKey, file);
            }
        });

        // Convert Map back to array
        const dedupedFiles = Array.from(uniqueFiles.values());

        return dedupedFiles;

    } catch (error) {
        console.error('Error fetching data:', error);
        return [];
    } finally {
        options.setIsLoading(false);
    }
} 
