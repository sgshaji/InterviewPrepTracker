import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
neonConfig.webSocketConstructor = ws;

async function addDatabaseIndexes() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is required');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    console.log('🔍 Adding database indexes for performance optimization...');
    
    // Check existing indexes first
    const checkIndexesQuery = `
      SELECT indexname, tablename, indexdef 
      FROM pg_indexes 
      WHERE tablename IN ('applications', 'preparation_sessions', 'interviews', 'assessments', 'reminders')
      ORDER BY tablename, indexname;
    `;
    
    const existingIndexes = await pool.query(checkIndexesQuery);
    console.log('\n📊 Current indexes:');
    existingIndexes.rows.forEach(row => {
      console.log(`  ${row.tablename}.${row.indexname}`);
    });

    // Add performance indexes
    const indexes = [
      {
        name: 'idx_applications_user_id',
        table: 'applications',
        sql: 'CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);'
      },
      {
        name: 'idx_applications_date_applied',
        table: 'applications', 
        sql: 'CREATE INDEX IF NOT EXISTS idx_applications_date_applied ON applications(date_applied DESC);'
      },
      {
        name: 'idx_applications_user_date',
        table: 'applications',
        sql: 'CREATE INDEX IF NOT EXISTS idx_applications_user_date ON applications(user_id, date_applied DESC);'
      },
      {
        name: 'idx_applications_status',
        table: 'applications',
        sql: 'CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(job_status);'
      },
      {
        name: 'idx_preparation_sessions_user_id',
        table: 'preparation_sessions',
        sql: 'CREATE INDEX IF NOT EXISTS idx_preparation_sessions_user_id ON preparation_sessions(user_id);'
      },
      {
        name: 'idx_preparation_sessions_date',
        table: 'preparation_sessions',
        sql: 'CREATE INDEX IF NOT EXISTS idx_preparation_sessions_date ON preparation_sessions(date DESC);'
      },
      {
        name: 'idx_interviews_user_id',
        table: 'interviews',
        sql: 'CREATE INDEX IF NOT EXISTS idx_interviews_user_id ON interviews(user_id);'
      },
      {
        name: 'idx_interviews_application_id',
        table: 'interviews',
        sql: 'CREATE INDEX IF NOT EXISTS idx_interviews_application_id ON interviews(application_id);'
      },
      {
        name: 'idx_assessments_user_id',
        table: 'assessments',
        sql: 'CREATE INDEX IF NOT EXISTS idx_assessments_user_id ON assessments(user_id);'
      },
      {
        name: 'idx_reminders_user_id',
        table: 'reminders',
        sql: 'CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON reminders(user_id);'
      }
    ];

    console.log('\n🔄 Adding performance indexes...');
    let addedCount = 0;

    for (const index of indexes) {
      try {
        await pool.query(index.sql);
        console.log(`✅ Added index: ${index.name} on ${index.table}`);
        addedCount++;
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`⚠️  Index ${index.name} already exists`);
        } else {
          console.error(`❌ Failed to add index ${index.name}:`, error.message);
        }
      }
    }

    console.log(`\n🎉 Database optimization complete! Added ${addedCount} new indexes.`);
    console.log('📈 Your queries should now be much faster, especially:');
    console.log('   - Loading applications by user');
    console.log('   - Sorting by date applied');
    console.log('   - Filtering by job status');
    console.log('   - Loading preparation sessions');
    
  } catch (error) {
    console.error('❌ Error adding indexes:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the script
addDatabaseIndexes();