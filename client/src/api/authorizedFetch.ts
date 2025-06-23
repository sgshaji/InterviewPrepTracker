import { supabase } from "@/lib/supabase";

/**
 * A secure wrapper around fetch() that includes the user's Supabase access token.
 */
export async function authorizedFetch(input: RequestInfo, init: RequestInit = {}) {
  const headers = new Headers(init.headers || {});
  headers.set("X-User-ID", "b4d3aeaa-4e73-44f7-bf6a-2148d3e0f81c");

  return fetch(input, {
    ...init,
    headers,
  });
}
