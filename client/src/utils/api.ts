import { supabase } from "@/lib/supabase";

const API_BASE_URL = 'http://localhost:5000/api';

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  const baseHeaders: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  
  if (session?.access_token) {
    console.log('Adding auth token to request headers');
    // Use X-Auth-Token instead of Authorization to bypass proxy filtering
    baseHeaders['X-Auth-Token'] = session.access_token;
    console.log('Token preview:', session.access_token.substring(0, 20) + '...');
  } else {
    console.warn('No access token found in session');
    console.log('Session data:', session ? 'Session exists but no access_token' : 'No session');
  }
  
  return baseHeaders;
}

async function getAuthToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
}

export const api = {
  async get<T>(endpoint: string): Promise<T> {
    const token = await getAuthToken();
    let url = `${API_BASE_URL}${endpoint}`;
    
    // Add token as query parameter to bypass header filtering
    if (token) {
      const separator = endpoint.includes('?') ? '&' : '?';
      url += `${separator}auth_token=${encodeURIComponent(token)}`;
      console.log('Adding auth token as query parameter');
    } else {
      console.warn('No auth token available');
    }
    
    console.log('Making API request to:', url.replace(/auth_token=[^&]+/, 'auth_token=***'));
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      mode: 'cors'
    });
    
    if (!response.ok) {
      console.error('API request failed:', response.status, response.statusText);
      throw new Error(`API error: ${response.statusText}`);
    }
    return response.json();
  },

  async post<T>(endpoint: string, data?: any): Promise<T> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: data ? JSON.stringify(data) : undefined
    });
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    return response.json();
  },

  async put<T>(endpoint: string, data?: any): Promise<T> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers,
      body: data ? JSON.stringify(data) : undefined
    });
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    return response.json();
  },

  async delete<T>(endpoint: string): Promise<T> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers
    });
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    return response.json();
  }
}; 