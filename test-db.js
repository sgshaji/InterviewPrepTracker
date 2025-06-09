import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function testDatabaseConnection() {
  try {
    console.log('Testing database connection...');
    const dbUrl = process.env.DATABASE_URL;
    
    // Safely log the URL format without exposing credentials
    const urlParts = dbUrl.split('@');
    if (urlParts.length === 2) {
      const [credentials, rest] = urlParts;
      console.log('Database URL format:');
      console.log(`- Protocol: ${credentials.split('://')[0]}://`);
      console.log(`- Host: ${rest.split('/')[0]}`);
      console.log(`- Database: ${rest.split('/')[1]}`);
    }
    
    const pool = new Pool({
      connectionString: dbUrl,
      ssl: {
        rejectUnauthorized: false
      }
    });
    
    console.log('\n1. Testing basic connection...');
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful!');
    console.log('Current database time:', result.rows[0].now);
    
    console.log('\n2. Checking database schema...');
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('\nFound tables:');
    tables.rows.forEach(table => {
      console.log(`- ${table.table_name}`);
    });

    // Test data in key tables
    console.log('\n3. Checking data in key tables...');
    
    // Check applications table
    const applications = await pool.query('SELECT COUNT(*) as count FROM applications');
    console.log(`Applications count: ${applications.rows[0].count}`);

    // Check preparation_sessions table
    const prepSessions = await pool.query('SELECT COUNT(*) as count FROM preparation_sessions');
    console.log(`Preparation sessions count: ${prepSessions.rows[0].count}`);

    // Check interviews table
    const interviews = await pool.query('SELECT COUNT(*) as count FROM interviews');
    console.log(`Interviews count: ${interviews.rows[0].count}`);

    // Check assessments table
    const assessments = await pool.query('SELECT COUNT(*) as count FROM assessments');
    console.log(`Assessments count: ${assessments.rows[0].count}`);

    // Check reminders table
    const reminders = await pool.query('SELECT COUNT(*) as count FROM reminders');
    console.log(`Reminders count: ${reminders.rows[0].count}`);

    await pool.end();
    console.log('\n✅ All database checks completed successfully!');
    console.log('\n📝 Note: User data is now managed through Supabase auth.users table');
    
  } catch (error) {
    console.error('\n❌ Database test failed:', error);
    console.log('\nTroubleshooting tips:');
    console.log('1. Verify the database URL is correct');
    console.log('2. Check if the database server is running');
    console.log('3. Ensure your IP is allowed in the database firewall');
    console.log('4. Verify the username and password are correct');
  }
}

testDatabaseConnection(); 