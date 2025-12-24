import dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../types/schema';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required');
}

const pool = new Pool({
  connectionString,
  ssl: false // Disable SSL for local PostgreSQL
});

export const db = drizzle(pool, { schema });

export * from '../types/schema';