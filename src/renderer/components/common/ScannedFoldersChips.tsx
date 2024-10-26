import React from 'react';
import { Stack, Chip } from '@mui/material';

export default function ScannedFoldersChips({ scanned_folders }: { scanned_folders: string[] }) {
  // Handler to delete a folder from the list if needed
  const handleDeleteFolder = (folderToDelete: string) => {
    // Implement your delete functionality here
    console.log("Deleting folder:", folderToDelete);
  };

  return (
    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', mt: 2 }}>
      {scanned_folders.map((folder, index) => (
        <Chip
          key={index}
          label={folder}
          onDelete={() => handleDeleteFolder(folder)}  // Optional delete handler
          color="primary"
          variant="outlined"
        />
      ))}
    </Stack>
  );
}

