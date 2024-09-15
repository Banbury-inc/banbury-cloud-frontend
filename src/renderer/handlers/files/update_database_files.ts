import { neuranet } from '../../neuranet';
import { handlers } from '../../handlers';
import os from 'os';
import path from 'path';
import fs from 'fs';

export async function update_database_files(username: string) {
  let files_to_add: any[] = [];
  let files_to_remove: any[] = [];

  try {
    // Save the snapshot
    let result = await handlers.files.save_snapshot(username);
    if (result !== 'success') throw new Error('Failed to save snapshot');

    // Get the snapshot
    result = await handlers.files.get_snapshot(username);
    if (result !== 'success') throw new Error('Failed to get snapshot');

    // Compare the snapshots
    result = await handlers.files.compare_snapshots();
    if (result !== 'success') throw new Error('Failed to compare snapshots');

    const bcloudDirectory = path.join(os.homedir(), 'BCloud');
    const snapshotComparisonPath = path.join(bcloudDirectory, 'comparison_result.json');

    // Read and parse the comparison result JSON file
    const data = fs.readFileSync(snapshotComparisonPath, 'utf8');
    const comparisonResult = JSON.parse(data);

    // Extract files to add and remove
    files_to_add = comparisonResult.add?.files.map((file: any) => ({
      file_type: file.file_type,
      file_name: file.file_name,
      file_path: file.file_path,
      date_uploaded: file.date_uploaded,
      date_modified: file.date_modified,
      file_size: file.file_size,
      file_priority: file.file_priority,
      file_parent: file.file_parent,
      original_device: file.original_device,
      kind: file.kind,
    })) || [];

    files_to_remove = comparisonResult.remove?.files.map((file: any) => ({
      file_name: file.file_name,
      file_path: file.file_path,
    })) || [];

    // console.log('Files to add:', files_to_add);
    // console.log('Files to remove:', files_to_remove);

    // Add files to the database if available
    if (files_to_add.length > 0) {
      result = await neuranet.files.addFiles(username, files_to_add);
      if (result === 'success') {
        console.log('Files added successfully');
      } else {
        console.error('Error adding files');
      }
    } else {
      console.log('No files to add');
    }

    // Remove files if available
    if (files_to_remove.length > 0) {
      const device_name = os.hostname();
      result = await neuranet.files.removeFiles(username, device_name, files_to_remove);
      if (result === 'success') {
        console.log('Files removed successfully');
      } else {
        console.error('Error removing files');
      }
    } else {
      console.log('No files to remove');
    }

    return 'success';

  } catch (error) {
    console.error('Error updating database files: ', error);
    return 'error';
  }
}

// Call the function with a username
update_database_files('mmills');

