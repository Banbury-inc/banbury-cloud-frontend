interface UploadInfo {
  filename: string;
  fileType: string;
  progress: number;
  status: 'uploading' | 'completed' | 'failed' | 'skipped';
  totalSize: number;
  uploadedSize: number;
  timeRemaining?: number;
}

let uploadsInfo: UploadInfo[] = [];

export function addUploadsInfo(newUploads: UploadInfo[]): UploadInfo[] {
  newUploads.forEach(newUpload => {
    const existingUploadIndex = uploadsInfo.findIndex(
      upload => upload.filename === newUpload.filename
    );

    if (existingUploadIndex !== -1) {
      // Update existing upload
      uploadsInfo[existingUploadIndex] = {
        ...uploadsInfo[existingUploadIndex],
        ...newUpload,
        progress: (newUpload.uploadedSize / newUpload.totalSize) * 100
      };
    } else {
      // Add new upload
      uploadsInfo.push({
        ...newUpload,
        progress: (newUpload.uploadedSize / newUpload.totalSize) * 100
      });
    }
  });

  return [...uploadsInfo];
}

export function getUploadsInfo(): UploadInfo[] {
  return [...uploadsInfo];
}

export function clearUploadsInfo() {
  uploadsInfo = [];
} 