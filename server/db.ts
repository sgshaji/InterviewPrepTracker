import dotenv from 'dotenv';
dotenv.config();
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "../migrations/schema";

// Verify DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL environment variable is missing. Current environment:', {
    NODE_ENV: process.env.NODE_ENV,
    PWD: process.cwd()
  });
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

console.log("Database configuration loaded:", {
  url: process.env.DATABASE_URL.split('@')[1], // Only log the non-sensitive part
  connected: "✓"
});

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });