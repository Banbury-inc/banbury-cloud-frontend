// Type for download info
export interface DownloadInfo {
  filename: string;
  fileType: string;
  progress: number;
  status: 'downloading' | 'completed' | 'failed' | 'skipped';
  totalSize: number;
  downloadedSize: number;
  timeRemaining?: number;
}

// Store for active downloads
let activeDownloads: DownloadInfo[] = [];

// Function to add or update downloads
export function addDownloadsInfo(downloads: DownloadInfo[]): DownloadInfo[] {
  downloads.forEach(download => {
    const existingIndex = activeDownloads.findIndex(d => d.filename === download.filename);
    if (existingIndex >= 0) {
      activeDownloads[existingIndex] = download;
    } else {
      activeDownloads.push(download);
    }
  });

  // Remove completed downloads after a delay
  activeDownloads = activeDownloads.filter(
    download => download.status === 'downloading' || 
    download.status === 'failed' ||
    (download.status === 'completed' && download.progress < 100)
  );

  return [...activeDownloads];
}

// Function to get current downloads
export function getDownloadsInfo(): DownloadInfo[] {
  return [...activeDownloads];
}

// Function to clear downloads (optional)
export function clearDownloadsInfo(): void {
  activeDownloads = [];
}