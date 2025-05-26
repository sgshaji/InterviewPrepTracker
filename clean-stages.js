import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
neonConfig.webSocketConstructor = ws;

async function cleanupStageData() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is required');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    console.log('🔍 Checking for applications with invalid stage values...');
    
    // Check current problematic stages
    const checkQuery = `
      SELECT id, company_name, application_stage, job_status
      FROM applications 
      WHERE application_stage IN ('Rejected', 'Applied') OR application_stage IS NULL
      ORDER BY id DESC
    `;
    
    const checkResult = await pool.query(checkQuery);
    console.log(`📊 Found ${checkResult.rows.length} applications with invalid stage values`);
    
    if (checkResult.rows.length === 0) {
      console.log('✅ All application stages are already valid!');
      return;
    }

    // Show the records that will be updated
    console.log('\n📋 Applications to be updated:');
    checkResult.rows.forEach((row, index) => {
      console.log(`${index + 1}. ID: ${row.id}, Company: ${row.company_name || 'N/A'}, Current Stage: "${row.application_stage || 'NULL'}", Status: "${row.job_status}"`);
    });

    // Update invalid stage values
    console.log('\n🔄 Cleaning up stage values...');
    
    // 1. Change "Applied" stage to "In Review"
    const updateAppliedQuery = `
      UPDATE applications 
      SET application_stage = 'In Review'
      WHERE application_stage = 'Applied'
    `;
    
    const appliedResult = await pool.query(updateAppliedQuery);
    console.log(`✅ Updated ${appliedResult.rowCount} applications from "Applied" stage to "In Review"`);
    
    // 2. Change "Rejected" stage to "In Review" (these should have status "Rejected" instead)
    const updateRejectedQuery = `
      UPDATE applications 
      SET application_stage = 'In Review'
      WHERE application_stage = 'Rejected'
    `;
    
    const rejectedResult = await pool.query(updateRejectedQuery);
    console.log(`✅ Updated ${rejectedResult.rowCount} applications from "Rejected" stage to "In Review"`);
    
    // 3. Handle NULL stages
    const updateNullQuery = `
      UPDATE applications 
      SET application_stage = 'In Review'
      WHERE application_stage IS NULL
    `;
    
    const nullResult = await pool.query(updateNullQuery);
    console.log(`✅ Updated ${nullResult.rowCount} applications from NULL stage to "In Review"`);
    
    // 4. Update old stage names to new ones
    const updateMappings = [
      { old: 'HM Round', new: 'Hiring Manager Round' },
      { old: 'Case Study', new: 'Case Study/Assignment' },
      { old: 'Panel', new: 'Panel Interview' }
    ];
    
    for (const mapping of updateMappings) {
      const updateQuery = `
        UPDATE applications 
        SET application_stage = $1
        WHERE application_stage = $2
      `;
      
      const result = await pool.query(updateQuery, [mapping.new, mapping.old]);
      if (result.rowCount > 0) {
        console.log(`✅ Updated ${result.rowCount} applications from "${mapping.old}" to "${mapping.new}"`);
      }
    }
    
    console.log('\n🎉 All stage values have been cleaned up successfully!');
    console.log('📋 Valid stages now are: No Callback, In Review, HR Round, Hiring Manager Round, Case Study/Assignment, Panel Interview, Final Round, Offer');
    
  } catch (error) {
    console.error('❌ Error cleaning up stages:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the script
cleanupStageData();