import { neuranet } from '../../neuranet';
import { handlers } from '../../handlers';
import os from 'os';
import path from 'path';
import fs from 'fs';

export async function update_database_files(username: string) {

  let files_to_add_array: any[] = [];
  let files_to_remove_array: any[] = [];
  // Save the snapshot
  let result = await handlers.files.save_snapshot(username);
  if (result === 'success') {

    // Get the snapshot
    result = await handlers.files.get_snapshot(username);
    if (result === 'success') {

      // Compare the snapshots
      result = await handlers.files.compare_snapshots();
      if (result === 'success') {
        const bcloudDirectory = path.join(os.homedir(), 'BCloud'); // Path to the BCloud directory
        const snapshotComparisonPath = path.join(bcloudDirectory, 'comparison_result.json'); // Server snapshot file

        try {
          // Read the comparison result JSON file and parse it
          const data = fs.readFileSync(snapshotComparisonPath, 'utf8');
          const comparisonResult = JSON.parse(data);

          // Now you can use `comparisonResult` variable for further logic
          console.log(comparisonResult); // For debugging

          const files_to_add = comparisonResult.add.files;
          const files_to_remove = comparisonResult.remove.files;

          console.log('Files to add:', files_to_add);
          console.log('Files to remove:', files_to_remove);

          for (const file in files_to_add) {
            files_to_add_array.push(file);
          }

          for (const file in files_to_remove) {
            files_to_remove_array.push(file);
          }

        } catch (error) {
          console.error('Error reading comparison result:', error);
          return 'error';
        }

        // Add files to the database

        if (files_to_add_array.length > 0) {
          const result = await neuranet.files.addFiles(username, files_to_add_array);
          if (result === 'success') {
            console.log('Files added successfully');
          }
        }
        else {
          console.log('No files to add');
          const result = 'success';
        }
        if (files_to_remove_array.length > 0) {
          const result = await neuranet.files.removeFiles(username, files_to_remove_array);
          if (result === 'success') {
            console.log('Files removed successfully');
          }
        }
        else {
          console.log('No files to remove');
          const result = 'success';
        }


      } else {
        return 'error';  // Return error if compare_snapshots fails
      }
    } else {
      return 'error';  // Return error if get_snapshot fails
    }
  } else {
    return 'error';  // Return error if save_snapshot fails
  }
}

// Call the function with a username
update_database_files('mmills');
