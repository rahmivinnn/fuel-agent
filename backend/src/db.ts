import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
import * as schema from "@shared/schema";
import { autoSyncDatabase } from "./utils/autoSync";

const { Client } = pkg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

// Connect to database
client.connect().then(async () => {
  console.log('Database connected');
  
  // Auto-sync schema on startup (development only)
  await autoSyncDatabase();
  
}).catch(console.error);

export const db = drizzle(client, { schema });