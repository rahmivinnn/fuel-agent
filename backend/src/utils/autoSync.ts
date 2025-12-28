import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function autoSyncDatabase() {
  // Disable auto-sync completely
  console.log('⚠️  Auto-sync disabled');
  return;
}