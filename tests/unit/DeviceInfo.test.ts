import * as os from 'os';
import si from '../../dependency/systeminformation';
import axios from 'axios';
import * as Receiver from '../../src/renderer/components/scripts/receiver';
import * as DeviceInfo from '../../src/renderer/components/scripts/device/deviceInfo';

jest.mock('os');

describe('get_device_name', () => {
  it('should return the hostname of the device', () => {
    // Mock the os.hostname method to return a specific value
    const mockHostname = 'mocked-hostname';
    (os.hostname as jest.Mock).mockReturnValue(mockHostname);

    const hostname = DeviceInfo.get_device_name();

    expect(hostname).toBe(mockHostname);
  });
});

jest.mock('systeminformation');

describe('get_storage_capacity', () => {
  it('should return the total storage capacity in GB', async () => {
    // Mock the si.fsSize method to return a controlled value
    const mockFsSizeData: si.Systeminformation.FsSizeData[] = [
      {
        fs: '/dev/disk1',
        type: 'APFS',
        size: 500 * 1024 * 1024 * 1024, // 500 GB
        used: 300 * 1024 * 1024 * 1024, // 300 GB used
        available: 200 * 1024 * 1024 * 1024, // 200 GB available
        mount: '/',
        use: 60, // percentage used
        rw: true // read/write flag
      },
      {
        fs: '/dev/disk2',
        type: 'APFS',
        size: 300 * 1024 * 1024 * 1024, // 300 GB
        used: 150 * 1024 * 1024 * 1024, // 150 GB used
        available: 150 * 1024 * 1024 * 1024, // 150 GB available
        mount: '/Volumes/Data',
        use: 50, // percentage used
        rw: true // read/write flag
      }
    ];

    (si.fsSize as jest.Mock).mockResolvedValue(mockFsSizeData);

    const totalCapacity = await DeviceInfo.get_storage_capacity();

    expect(totalCapacity).toBeCloseTo(800); // 800 GB
  });

  it('should handle errors thrown by si.fsSize', async () => {
    const mockError = new Error('Disk read error');

    (si.fsSize as jest.Mock).mockRejectedValue(mockError);

    await expect(DeviceInfo.get_storage_capacity()).rejects.toThrow('Disk read error');
  });
});

describe('get_gpu_usage', () => {
  it('should return the average GPU utilization', async () => {
    // Mock the si.graphics method to return a controlled value
    const mockGraphicsData: si.Systeminformation.GraphicsData = {
      controllers: [
        {
          vendor: 'NVIDIA',
          model: 'GeForce GTX 1050',
          bus: 'PCI Express',
          vram: 4096,
          vramDynamic: true,
          utilizationGpu: 50
        },
        {
          vendor: 'AMD',
          model: 'Radeon RX 580',
          bus: 'PCI Express',
          vram: 8192,
          vramDynamic: true,
          utilizationGpu: 75
        }
      ],
      displays: []
    };

    (si.graphics as jest.Mock).mockResolvedValue(mockGraphicsData);

    const gpuUsage = await DeviceInfo.get_gpu_usage();

    expect(gpuUsage).toBe(62.5); // (50 + 75) / 2
  });

  it('should handle errors thrown by si.graphics', async () => {
    const mockError = new Error('GPU read error');

    (si.graphics as jest.Mock).mockRejectedValue(mockError);

    await expect(DeviceInfo.get_gpu_usage()).rejects.toThrow('GPU read error');
  });
});




jest.mock('axios');

describe('get_ip_address', () => {
  it('should return the IP address when the API call is successful', async () => {
    // Mock the axios.get method to return a controlled value
    const mockIpInfo = { origin: '123.45.67.89,123.45.67.90' };
    (axios.get as jest.Mock).mockResolvedValue({ data: mockIpInfo });

    const ipAddress = await DeviceInfo.get_ip_address();

    expect(ipAddress).toBe('123.45.67.89');
  });

  it('should return "Unknown" if the API call fails', async () => {
    (axios.get as jest.Mock).mockRejectedValue(new Error('Network error'));

    const ipAddress = await DeviceInfo.get_ip_address();

    expect(ipAddress).toBe('Unknown');
  });

  it('should return "Unknown" if the origin field is not available', async () => {
    // Mock the axios.get method to return an empty data object
    (axios.get as jest.Mock).mockResolvedValue({ data: {} });

    const ipAddress = await DeviceInfo.get_ip_address();

    expect(ipAddress).toBe('Unknown');
  });
});
