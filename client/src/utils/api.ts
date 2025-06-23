import { supabase } from "@/lib/supabase";

const API_BASE_URL = 'http://localhost:5000/api';

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  const baseHeaders: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  
  if (session?.access_token) {
    console.log('Adding auth token to request headers');
    baseHeaders['Authorization'] = `Bearer ${session.access_token}`;
    console.log('Token preview:', session.access_token.substring(0, 20) + '...');
  } else {
    console.warn('No access token found in session');
    console.log('Session data:', session ? 'Session exists but no access_token' : 'No session');
  }
  
  return baseHeaders;
}

export const api = {
  async get<T>(endpoint: string): Promise<T> {
    const headers = await getAuthHeaders();
    console.log('Making API request to:', `${API_BASE_URL}${endpoint}`);
    console.log('Request headers:', Object.keys(headers));
    console.log('Has Authorization header:', 'Authorization' in headers);
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers,
      credentials: 'include'
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