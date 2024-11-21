import { downloadFileSyncFiles } from '../downloadFileSyncFiles';

describe('downloadFileSyncFiles', () => {
  it('should download files from online devices', async () => {
    // Mock data
    const username = 'testUser';
    const download_queue = [
      {
        device_id: 'device1',
        proposed_device_id: 'device2',
        file_name: 'test1.txt'
      },
      {
        device_id: 'device3',
        proposed_device_id: 'device4',
        file_name: 'test2.txt'
      }
    ];
    
    const devices = [
      { id: 'device1', name: 'Device 1', online: true },
      { id: 'device2', name: 'Device 2', online: false },
      { id: 'device3', name: 'Device 3', online: true },
      { id: 'device4', name: 'Device 4', online: false }
    ];

    const taskInfo = { /* add relevant task info */ };

    const result = await downloadFileSyncFiles(
      username,
      download_queue,
      devices,
      taskInfo,
      undefined,
      undefined,
      undefined,
    );

    // Assertions
    expect(result).toEqual(['test1.txt', 'test2.txt']);
  });

  it('should handle empty download queue', async () => {
    const result = await downloadFileSyncFiles('testUser', [], [], {}, undefined, undefined, undefined);
    expect(result).toEqual([]);
  });

  it('should handle offline devices', async () => {
    const download_queue = [{
      device_id: 'device1',
      proposed_device_id: 'device2',
      file_name: 'test.txt'
    }];
    
    const devices = [
      { id: 'device1', name: 'Device 1', online: false },
      { id: 'device2', name: 'Device 2', online: false }
    ];

    const result = await downloadFileSyncFiles('testUser', download_queue, devices, {}, undefined, undefined, undefined);
    expect(result).toEqual([]);
  });
}); 