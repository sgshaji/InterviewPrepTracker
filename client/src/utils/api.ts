import { supabase } from "@/lib/supabase";

const API_BASE_URL = 'http://localhost:5000/api';

// Remove unused function - authentication now uses query parameters

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
    const token = await getAuthToken();
    let url = `${API_BASE_URL}${endpoint}`;
    
    if (token) {
      const separator = endpoint.includes('?') ? '&' : '?';
      url += `${separator}auth_token=${encodeURIComponent(token)}`;
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: data ? JSON.stringify(data) : undefined,
      credentials: 'include',
      mode: 'cors'
    });
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    return response.json();
  },

  async put<T>(endpoint: string, data?: any): Promise<T> {
    const token = await getAuthToken();
    let url = `${API_BASE_URL}${endpoint}`;
    
    if (token) {
      const separator = endpoint.includes('?') ? '&' : '?';
      url += `${separator}auth_token=${encodeURIComponent(token)}`;
    }
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: data ? JSON.stringify(data) : undefined,
      credentials: 'include',
      mode: 'cors'
    });
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    return response.json();
  },

  async delete<T>(endpoint: string): Promise<T> {
    const token = await getAuthToken();
    let url = `${API_BASE_URL}${endpoint}`;
    
    if (token) {
      const separator = endpoint.includes('?') ? '&' : '?';
      url += `${separator}auth_token=${encodeURIComponent(token)}`;
    }
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      mode: 'cors'
    });
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    return response.json();
  }
}; 