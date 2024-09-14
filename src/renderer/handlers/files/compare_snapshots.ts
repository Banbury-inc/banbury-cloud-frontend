
import fs from 'fs';
import path from 'path';
import os from 'os';

interface File {
  id: number;
  file_name: string;
  kind: string;
  file_path: string;
  date_uploaded: string;
  date_modified: string;
  deviceID: string;
  original_device: string;
}

interface Actions {
  add: {
    files: {
      file_name: string;
      file_path: string;
    }[];
  };
  remove: {
    files: {
      file_name: string;
      file_path: string;
    }[];
  };
}

// Function to read and parse a JSON file
function readSnapshot(filePath: string): File[] | null {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data) as File[];
  } catch (error) {
    console.error(`Error reading or parsing the file: ${filePath}`, error);
    return null;
  }
}

// Function to compare files
function compareSnapshots(serverFiles: File[], clientFiles: File[]): Actions {
  const actions: Actions = {
    add: {
      files: []
    },
    remove: {
      files: []
    }
  };

  // Step 1: Compare files that are on the client but not on the server -> Add to server
  clientFiles.forEach((clientFile: File) => {
    const correspondingServerFile = serverFiles.find(
      (serverFile: File) =>
        serverFile.file_name === clientFile.file_name &&
        serverFile.file_path === clientFile.file_path
    );

    if (!correspondingServerFile) {
      actions.add.files.push({
        file_name: clientFile.file_name,
        file_path: clientFile.file_path
      });
    }
  });

  // Step 2: Compare files that are on the server but not on the client -> Remove from server
  serverFiles.forEach((serverFile: File) => {
    const correspondingClientFile = clientFiles.find(
      (clientFile: File) =>
        clientFile.file_name === serverFile.file_name &&
        clientFile.file_path === serverFile.file_path
    );

    if (!correspondingClientFile) {
      actions.remove.files.push({
        file_name: serverFile.file_name,
        file_path: serverFile.file_path
      });
    }
  });

  return actions;
}

// Function to load both snapshots and compare them
function compare_snapshots() {
  const bcloudDirectory = path.join(os.homedir(), 'BCloud'); // Path to the BCloud directory
  const serverSnapshotPath = path.join(bcloudDirectory, 'mmills_database_snapshot.json'); // Server snapshot file
  const clientSnapshotPath = path.join(bcloudDirectory, 'mmills_snapshot.json'); // Client snapshot file

  const serverFiles = readSnapshot(serverSnapshotPath);
  const clientFiles = readSnapshot(clientSnapshotPath);

  if (!serverFiles || !clientFiles) {
    console.error('Failed to load snapshots.');
    return;
  }

  // Log snapshots to check their contents
  console.log('Server Snapshot:', JSON.stringify(serverFiles, null, 2));
  console.log('Client Snapshot:', JSON.stringify(clientFiles, null, 2));

  const comparisonResult = compareSnapshots(serverFiles, clientFiles);
  console.log('Comparison Result:', comparisonResult);

  // Save the comparison result to a JSON file
  const comparisonFilePath = path.join(bcloudDirectory, 'comparison_result.json');
  fs.writeFileSync(comparisonFilePath, JSON.stringify(comparisonResult, null, 2));
  //
}

// Run the comparison
compare_snapshots();
