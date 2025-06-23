import dotenv from 'dotenv';
dotenv.config();
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "../shared/schema";

// Clean Supabase database connection setup
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_DB_PASSWORD = process.env.SUPABASE_DB_PASSWORD;

if (!SUPABASE_URL || !SUPABASE_DB_PASSWORD) {
  console.error("Missing Supabase configuration:");
  console.error("- VITE_SUPABASE_URL:", SUPABASE_URL ? "✓ Set" : "✗ Missing");
  console.error("- SUPABASE_DB_PASSWORD:", SUPABASE_DB_PASSWORD ? "✓ Set" : "✗ Missing");
  throw new Error("Supabase configuration incomplete");
}

// Extract project reference from Supabase URL
const projectRef = SUPABASE_URL.replace('https://', '').replace('.supabase.co', '');

// Try the standard PostgreSQL connection format without project-specific username
const connectionOptions = [
  // Standard format with username postgres
  `postgresql://postgres:${SUPABASE_DB_PASSWORD}@aws-0-us-west-1.pooler.supabase.com:6543/postgres`,
  // Alternative port
  `postgresql://postgres:${SUPABASE_DB_PASSWORD}@aws-0-us-west-1.pooler.supabase.com:5432/postgres`
];

console.log("🔍 Testing Supabase database connections...");
console.log("Project reference:", projectRef);

let supabasePool: Pool | null = null;
let connectionString = '';

// Test each connection option
for (const connStr of connectionOptions) {
  try {
    console.log(`Testing connection: ${connStr.replace(SUPABASE_DB_PASSWORD, '[PASSWORD]')}`);
    
    const testPool = new Pool({ 
      connectionString: connStr,
      ssl: false // Try without SSL first
    });
    
    // Test the connection
    const client = await testPool.connect();
    await client.query('SELECT 1');
    client.release();
    
    console.log("✅ Connection successful!");
    supabasePool = testPool;
    connectionString = connStr;
    break;
    
  } catch (error: any) {
    console.log(`❌ Connection failed: ${error.message}`);
    
    // Try with SSL if first attempt failed
    if (error.message.includes('SSL') || error.message.includes('ENOTFOUND')) {
      try {
        console.log("Retrying with SSL enabled...");
        const testPoolSSL = new Pool({ 
          connectionString: connStr,
          ssl: { rejectUnauthorized: false }
        });
        
        const client = await testPoolSSL.connect();
        await client.query('SELECT 1');
        client.release();
        
        console.log("✅ Connection successful with SSL!");
        supabasePool = testPoolSSL;
        connectionString = connStr;
        break;
        
      } catch (sslError: any) {
        console.log(`❌ SSL connection also failed: ${sslError.message}`);
      }
    }
  }
}

if (!supabasePool) {
  console.error("❌ All Supabase connection attempts failed");
  throw new Error("Could not establish Supabase database connection");
}

console.log("🎉 Supabase database connection established");
console.log("Using connection:", connectionString.replace(SUPABASE_DB_PASSWORD, '[PASSWORD]'));

export const supabaseDb = drizzle({ client: supabasePool, schema });
export { supabasePool };