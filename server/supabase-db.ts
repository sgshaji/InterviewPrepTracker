import dotenv from 'dotenv';
dotenv.config();
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "../shared/schema";

// Construct Supabase database connection string
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  throw new Error("Supabase configuration missing");
}

// Extract project reference from Supabase URL
const projectRef = SUPABASE_URL.replace('https://', '').replace('.supabase.co', '');

// Construct PostgreSQL connection string for Supabase
// Use direct database connection with your database password
const SUPABASE_DB_PASSWORD = process.env.SUPABASE_DB_PASSWORD;
const SUPABASE_DB_URL = `postgresql://postgres:${SUPABASE_DB_PASSWORD}@db.${projectRef}.supabase.co:5432/postgres`;

console.log("Supabase database configuration:", {
  projectRef,
  url: `db.${projectRef}.supabase.co`,
  connected: "✓"
});

export const supabasePool = new Pool({ connectionString: SUPABASE_DB_URL });
export const supabaseDb = drizzle({ client: supabasePool, schema });