import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Signs in a test user and returns an access token for authentication.
 * Requires TEST_USER_EMAIL and TEST_USER_PASSWORD in environment.
 */
export async function getTestAuthToken(): Promise<string> {
  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data, error } = await supabase.auth.signInWithPassword({
    email: process.env.TEST_USER_EMAIL!,
    password: process.env.TEST_USER_PASSWORD!,
  });
  if (error || !data.session) {
    throw new Error(error?.message);
  }
  return data.session.access_token;
}
