import { jest } from '@jest/globals';
import * as files from '../../files';


test('save_snapshot returns a string', async () => {
  const result = await files.save_snapshot('test');
  expect(result).toBe('success');
}); 

test('get_snapshot returns a string', async () => {
  const result = await files.get_snapshot('test');
  expect(result).toBe('success');
}); 

test('compare_snapshots returns a string', async () => {
  const result = await files.compare_snapshots();
  expect(result).toBe('success');
}); 