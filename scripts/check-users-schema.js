import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function checkUsersSchema() {
  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: false
    });

    const db = drizzle(pool);

    // Check if avatar column exists
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'avatar';
    `);

    if (result.rows.length > 0) {
      console.log('✅ Avatar column exists in users table:', result.rows[0]);
    } else {
      console.log('❌ Avatar column does not exist in users table');
      
      // Add the avatar column
      console.log('Attempting to add avatar column...');
      await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar TEXT;');
      console.log('✅ Successfully added avatar column to users table');
    }

    await pool.end();
  } catch (error) {
    console.error('Error checking users schema:', error);
    process.exit(1);
  }
}

checkUsersSchema();
