import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function autoSyncDatabase() {
  // Skip auto-sync only in strict production
  if (process.env.NODE_ENV === 'production' && process.env.AUTO_SYNC !== 'true') {
    console.log('⚠️  Production mode: Skipping auto-sync for safety');
    return;
  }

  try {
    console.log('🔄 Auto-syncing database schema...');
    
    const { stdout, stderr } = await execAsync('npx drizzle-kit push:pg');
    
    if (stderr && !stderr.includes('No schema changes')) {
      console.log('📊 Database schema updated:', stderr);
    } else {
      console.log('✅ Database schema is up to date');
    }
    
    if (stdout) {
      console.log(stdout);
    }
    
  } catch (error: any) {
    console.error('❌ Auto-sync failed:', error.message);
    // Don't crash the app, just log the error
  }
}