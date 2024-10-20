import { neuranet } from '../src/renderer/neuranet';
import { test_device_info } from '../src/renderer/neuranet/device/test_device_info';

test('hello world', () => {
  expect('hello world').toBe('hello world')
});

test_device_info();

