import { downloadFile } from '../downloadFile';
import { neuranet } from '../../../neuranet';

// Mock the neuranet module
jest.mock('../../../neuranet', () => ({
  neuranet: {
    device: {
      createWebSocketConnection: jest.fn(),
      download_request: jest.fn(),
    },
  },
}));

describe('downloadFile', () => {
  // Test setup
  const mockUsername = 'testUser';
  const mockFiles = ['file1.txt', 'file2.txt'];
  const mockDevices = ['device1', 'device2'];
  const mockTaskInfo = { id: 'task1' };
  const mockTasks: any[] = [];
  const mockSetTasks = jest.fn();
  const mockSetTaskboxExpanded = jest.fn();
  
  // Mock WebSocket
  let mockSocket: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSocket = {
      onmessage: null,
      onerror: null,
      onclose: null,
    };
    
    // Setup createWebSocketConnection mock
    (neuranet.device.createWebSocketConnection as jest.Mock).mockImplementation(
      (username, device, taskInfo, tasks, setTasks, setTaskbox, callback) => {
        callback(mockSocket);
      }
    );
  });

  test('should reject if no files selected', async () => {
    await expect(downloadFile(
      mockUsername,
      [],
      mockDevices,
      mockTaskInfo,
      mockTasks,
      mockSetTasks,
      mockSetTaskboxExpanded
    )).rejects.toEqual('No file selected');
  });

  test('should reject if no devices selected', async () => {
    await expect(downloadFile(
      mockUsername,
      mockFiles,
      [],
      mockTaskInfo,
      mockTasks,
      mockSetTasks,
      mockSetTaskboxExpanded
    )).rejects.toEqual('No file selected');
  });

  test('should resolve when all transfers complete successfully', async () => {
    const downloadPromise = downloadFile(
      mockUsername,
      mockFiles,
      mockDevices,
      mockTaskInfo,
      mockTasks,
      mockSetTasks,
      mockSetTaskboxExpanded
    );

    // Simulate successful transfers for all file/device combinations
    mockFiles.forEach(() => {
      mockDevices.forEach(() => {
        mockSocket.onmessage({ 
          data: JSON.stringify({ message: 'File transfer complete' })
        });
      });
    });

    await expect(downloadPromise).resolves.toEqual('success');
  });

  test('should reject on file not found', async () => {
    const downloadPromise = downloadFile(
      mockUsername,
      mockFiles,
      mockDevices,
      mockTaskInfo,
      mockTasks,
      mockSetTasks,
      mockSetTaskboxExpanded
    );

    mockSocket.onmessage({
      data: JSON.stringify({ message: 'File not found' })
    });

    await expect(downloadPromise).rejects.toEqual('file_not_found');
  });

  test('should reject on connection error', async () => {
    const downloadPromise = downloadFile(
      mockUsername,
      mockFiles,
      mockDevices,
      mockTaskInfo,
      mockTasks,
      mockSetTasks,
      mockSetTaskboxExpanded
    );

    mockSocket.onerror();

    await expect(downloadPromise).rejects.toEqual('connection_error');
  });

  test('should reject on timeout', async () => {
    jest.useFakeTimers();
    
    const downloadPromise = downloadFile(
      mockUsername,
      mockFiles,
      mockDevices,
      mockTaskInfo,
      mockTasks,
      mockSetTasks,
      mockSetTaskboxExpanded
    );

    jest.advanceTimersByTime(31000);

    await expect(downloadPromise).rejects.toEqual('timeout');
    
    jest.useRealTimers();
  });
}); 