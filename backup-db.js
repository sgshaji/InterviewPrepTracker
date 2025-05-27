import { exec } from 'child_process';
import { promisify } from 'util';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const execAsync = promisify(exec);

async function backupDatabase() {
  try {
    console.log('Starting database backup...');
    
    // Get the database URL from environment
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error('DATABASE_URL not found in environment variables');
    }

    // Create backup directory if it doesn't exist
    if (!fs.existsSync('./backups')) {
      fs.mkdirSync('./backups');
    }

    // Generate backup filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = `./backups/backup-${timestamp}.sql`;

    // Construct pg_dump command
    const command = `pg_dump "${dbUrl}" > "${backupFile}"`;

    console.log('Executing backup command...');
    const { stdout, stderr } = await execAsync(command);
    
    if (stderr) {
      console.error('Backup process stderr:', stderr);
    }
    
    if (stdout) {
      console.log('Backup process stdout:', stdout);
    }

    // Verify the backup file was created
    if (fs.existsSync(backupFile)) {
      const stats = fs.statSync(backupFile);
      console.log(`✅ Backup completed successfully!`);
      console.log(`Backup file: ${backupFile}`);
      console.log(`File size: ${(stats.size / 1024).toFixed(2)} KB`);
    } else {
      throw new Error('Backup file was not created');
    }

  } catch (error) {
    console.error('❌ Backup failed:', error);
    console.log('\nTroubleshooting tips:');
    console.log('1. Make sure pg_dump is installed on your system');
    console.log('2. Verify your DATABASE_URL is correct');
    console.log('3. Check if you have write permissions in the current directory');
  }
}

backupDatabase(); 