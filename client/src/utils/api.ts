import { supabase } from "@/lib/supabase";

const API_BASE_URL = 'http://localhost:5000/api';

// Remove unused function - authentication now uses query parameters

async function getAuthToken(): Promise<string | null> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error getting session:', error);
      return null;
    }
    
    if (!session?.access_token) {
      console.warn('No access token in session');
      return null;
    }
    
    console.log('Retrieved token, length:', session.access_token.length);
    return session.access_token;
  } catch (error) {
    console.error('Error in getAuthToken:', error);
    return null;
  }
}

export const api = {
  async get<T>(endpoint: string): Promise<T> {
    const token = await getAuthToken();
    
    if (!token) {
      console.warn('No auth token available');
      throw new Error('No authentication token available');
    }
    
    console.log('Retrieved token, length:', token.length, 'starts with:', token.substring(0, 20) + '...');
    
    // Use X-Auth-Token header instead of query parameters to avoid URL length limits
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': token
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
    
    if (!token) {
      throw new Error('No authentication token available');
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': token
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