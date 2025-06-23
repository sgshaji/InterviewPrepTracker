import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { db } from '../server/db.js';
import { applications } from '../shared/schema.js';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fetchAndImportRealData() {
  try {
    console.log('Connecting to your Supabase database...');
    
    // Fetch your real applications data from Supabase
    const { data: realApplications, error } = await supabase
      .from('applications')
      .select('*')
      .eq('user_id', 'b4d3aeaa-4e73-44f7-bf6a-2f48d3e0f8fc');

    if (error) {
      console.error('Error fetching data from Supabase:', error);
      return;
    }

    if (!realApplications || realApplications.length === 0) {
      console.log('No applications found in your Supabase database');
      return;
    }

    console.log(`Found ${realApplications.length} real applications in your Supabase database`);
    
    // Clear existing sample data
    await db.delete(applications).where(eq(applications.userId, 'b4d3aeaa-4e73-44f7-bf6a-2f48d3e0f8fc'));
    
    // Import your real data
    for (const app of realApplications) {
      const mappedApp = {
        userId: app.user_id,
        companyName: app.company_name,
        roleTitle: app.role_title,
        dateApplied: app.date_applied,
        jobStatus: app.job_status,
        applicationStage: app.application_stage,
        resumeVersion: app.resume_version,
        modeOfApplication: app.mode_of_application,
        roleUrl: app.role_url,
        followUpDate: app.follow_up_date,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await db.insert(applications).values(mappedApp);
    }
    
    console.log('Successfully imported your real application data');
    console.log('Companies:', realApplications.map(app => app.company_name).join(', '));
    
  } catch (error) {
    console.error('Failed to fetch real data:', error);
  }
}

fetchAndImportRealData();