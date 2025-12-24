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

await client.connect();
export const db = drizzle(client, { schema });