import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export function uploadFile(file_path: any, global_file_path: any) {

  const directory_name: string = "BCloud";
  const directory_path: string = path.join(os.homedir(), directory_name);
  console.log("directory_path", directory_path);
  console.log("file_path", file_path);
  console.log("global_file_path", global_file_path);

  try {
    fs.copyFileSync(file_path, path.join(directory_path, path.basename(file_path)));
    console.log(`File copied successfully to ${directory_name}`);
  } catch (error) {
    console.log(`Error copying file: ${error}`);
  }

  return '';
}


