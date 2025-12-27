import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
import * as schema from "@shared/schema";

const { Client } = pkg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

// Connect to database
client.connect().then(() => {
  console.log('Database connected');
  
  // Auto-push schema in development
  if (process.env.NODE_ENV === 'development') {
    console.log('⚠️  Development mode: Run "npm run db:push" to sync schema changes');
  }
}).catch(console.error);

export const db = drizzle(client, { schema });