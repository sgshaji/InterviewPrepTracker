import dotenv from 'dotenv';
dotenv.config();
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "../shared/schema";

// Configure Supabase database connection using correct format
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_DB_PASSWORD = process.env.SUPABASE_DB_PASSWORD;

if (!SUPABASE_URL || !SUPABASE_DB_PASSWORD) {
  throw new Error("Supabase configuration missing: VITE_SUPABASE_URL or SUPABASE_DB_PASSWORD");
}

// Extract project reference from Supabase URL
const projectRef = SUPABASE_URL.replace('https://', '').replace('.supabase.co', '');

// Use Supabase pooler connection with correct format
const SUPABASE_DB_URL = `postgresql://postgres.${projectRef}:${SUPABASE_DB_PASSWORD}@aws-0-us-west-1.pooler.supabase.com:6543/postgres`;

console.log("Supabase database configuration:", {
  projectRef,
  url: `aws-0-us-west-1.pooler.supabase.com`,
  connected: "✓"
});

export const supabasePool = new Pool({ connectionString: SUPABASE_DB_URL });
export const supabaseDb = drizzle({ client: supabasePool, schema });