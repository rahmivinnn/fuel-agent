import { db } from './database';
import { sql } from 'drizzle-orm';

export async function initializeDatabase() {
  try {
    console.log('🔍 Checking database connection...');
    
    // Test connection
    await db.execute(sql`SELECT 1`);
    console.log('✅ Database connected successfully');
    
    // Check if tables exist
    const tableCheck = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    const existingTables = tableCheck.rows?.map((row: any) => row.table_name) || [];
    const requiredTables = [
      'customers', 'orders', 'fuel_friends', 'vehicles', 
      'fuel_stations', 'payment_methods', 'wallets', 
      'transactions', 'notifications', 'chat_messages', 
      'reviews', 'products', 'order_items'
    ];
    
    const missingTables = requiredTables.filter(table => !existingTables.includes(table));
    
    if (missingTables.length > 0) {
      console.log('⚠️  Missing tables:', missingTables.join(', '));
      console.log('💡 Run: npm run db:push to create missing tables');
    } else {
      console.log('✅ All required tables exist');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    return false;
  }
}