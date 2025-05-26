import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
neonConfig.webSocketConstructor = ws;

async function updateEmptyRoles() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is required');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    console.log('🔍 Checking for applications with empty role fields...');
    
    // First, let's see ALL applications and their role titles
    const allQuery = `
      SELECT id, company_name, role_title, 
             LENGTH(role_title) as role_length,
             CASE 
               WHEN role_title IS NULL THEN 'NULL'
               WHEN role_title = '' THEN 'EMPTY_STRING'
               WHEN TRIM(role_title) = '' THEN 'WHITESPACE_ONLY'
               ELSE 'HAS_VALUE'
             END as status
      FROM applications 
      ORDER BY id DESC
      LIMIT 20
    `;
    
    console.log('📊 Recent applications and their role status:');
    const allResult = await pool.query(allQuery);
    allResult.rows.forEach((row, index) => {
      console.log(`${index + 1}. ID: ${row.id}, Company: ${row.company_name || 'N/A'}, Role: "${row.role_title || 'NULL'}" (${row.status})`);
    });

    // Now check for applications that need updating
    const checkQuery = `
      SELECT id, company_name, role_title 
      FROM applications 
      WHERE role_title IS NULL OR role_title = '' OR TRIM(role_title) = '' OR role_title = 'undefined'
    `;
    
    const checkResult = await pool.query(checkQuery);
    console.log(`📊 Found ${checkResult.rows.length} applications with empty role fields`);
    
    if (checkResult.rows.length === 0) {
      console.log('✅ All applications already have role titles!');
      return;
    }

    // Show the records that will be updated
    console.log('\n📋 Applications to be updated:');
    checkResult.rows.forEach((row, index) => {
      console.log(`${index + 1}. ID: ${row.id}, Company: ${row.company_name || 'N/A'}, Current Role: "${row.role_title || 'EMPTY'}"`);
    });

    // Update empty role fields to "Senior Product Manager"
    const updateQuery = `
      UPDATE applications 
      SET role_title = 'Senior Product Manager'
      WHERE role_title IS NULL OR role_title = '' OR TRIM(role_title) = '' OR role_title = 'undefined'
    `;
    
    console.log('\n🔄 Updating empty role fields to "Senior Product Manager"...');
    const updateResult = await pool.query(updateQuery);
    
    console.log(`✅ Successfully updated ${updateResult.rowCount} applications!`);
    console.log('🎉 All empty role fields are now set to "Senior Product Manager"');
    
  } catch (error) {
    console.error('❌ Error updating roles:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the script
updateEmptyRoles();