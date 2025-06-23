import dotenv from 'dotenv';
dotenv.config();

// Use Supabase REST API to fetch data directly
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  throw new Error("Supabase REST API configuration missing");
}

// Ensure service key is properly typed
const serviceKey: string = SUPABASE_SERVICE_KEY;

const SUPABASE_API_URL = `${SUPABASE_URL}/rest/v1`;

console.log("🔗 Using Supabase REST API for data access");
console.log("API URL:", SUPABASE_API_URL);

// Fetch applications for a specific user
export async function fetchUserApplications(userId: string) {
  try {
    const response = await fetch(`${SUPABASE_API_URL}/applications?user_id=eq.${userId}&select=*`, {
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Supabase API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`✅ Found ${data.length} applications for user ${userId}`);
    return data;
    
  } catch (error: any) {
    console.error("❌ Failed to fetch applications:", error.message);
    throw error;
  }
}

// Fetch interviews for a specific user
export async function fetchUserInterviews(userId: string) {
  try {
    const response = await fetch(`${SUPABASE_API_URL}/interviews?user_id=eq.${userId}&select=*`, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Supabase API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`✅ Found ${data.length} interviews for user ${userId}`);
    return data;
    
  } catch (error: any) {
    console.error("❌ Failed to fetch interviews:", error.message);
    throw error;
  }
}

// Fetch preparation sessions for a specific user
export async function fetchUserPreparationSessions(userId: string) {
  try {
    const response = await fetch(`${SUPABASE_API_URL}/preparation_sessions?user_id=eq.${userId}&select=*`, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Supabase API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`✅ Found ${data.length} preparation sessions for user ${userId}`);
    return data;
    
  } catch (error: any) {
    console.error("❌ Failed to fetch preparation sessions:", error.message);
    throw error;
  }
}

// Test the connection
export async function testSupabaseAPI() {
  try {
    const response = await fetch(`${SUPABASE_API_URL}/applications?limit=1`, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`API test failed: ${response.status} ${response.statusText}`);
    }

    console.log("🎉 Supabase REST API connection successful");
    return true;
    
  } catch (error: any) {
    console.error("❌ Supabase REST API test failed:", error.message);
    throw error;
  }
}