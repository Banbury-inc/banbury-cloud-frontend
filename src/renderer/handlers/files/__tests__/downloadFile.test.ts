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
  const mockFileInfo = { id: 'file1' };
  const mockSetTasks = jest.fn();
  const mockSetTaskboxExpanded = jest.fn();
  const mockWebsocket = new WebSocket('ws://mock-url');
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
      mockFileInfo,
      mockTaskInfo,
      mockTasks,
      mockSetTasks,
      mockSetTaskboxExpanded,
      mockWebsocket,
    )).rejects.toEqual('No file selected');
  });

  test('should reject if no devices selected', async () => {
    await expect(downloadFile(
      mockUsername,
      mockFiles,
      [],
      mockFileInfo,
      mockTaskInfo,
      mockTasks,
      mockSetTasks,
      mockSetTaskboxExpanded,
      mockWebsocket,
    )).rejects.toEqual('No file selected');
  });

  test('should resolve when all transfers complete successfully', async () => {
    const downloadPromise = downloadFile(
      mockUsername,
      mockFiles,
      mockDevices,
      mockFileInfo,
      mockTaskInfo,
      mockTasks,
      mockSetTasks,
      mockSetTaskboxExpanded,
      mockWebsocket,
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
      mockFileInfo,
      mockTaskInfo,
      mockTasks,
      mockSetTasks,
      mockSetTaskboxExpanded,
      mockWebsocket,
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
      mockFileInfo,
      mockTaskInfo,
      mockTasks,
      mockSetTasks,
      mockSetTaskboxExpanded,
      mockWebsocket,
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
      mockFileInfo,
      mockTaskInfo,
      mockTasks,
      mockSetTasks,
      mockSetTaskboxExpanded,
      mockWebsocket,
    );

    jest.advanceTimersByTime(31000);

    await expect(downloadPromise).rejects.toEqual('timeout');

    jest.useRealTimers();
  });
}); 