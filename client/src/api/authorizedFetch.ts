import { supabase } from "@/lib/supabase";

/**
 * A secure wrapper around fetch() that includes the user's Supabase access token.
 */
export async function authorizedFetch(input: RequestInfo, init: RequestInit = {}) {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  if (!token) {
    throw new Error("No access token found. User might not be authenticated.");
  }

  const headers = new Headers(init.headers || {});
  headers.set("Authorization", `Bearer ${token}`);

  return fetch(input, {
    ...init,
    headers,
  });
}
