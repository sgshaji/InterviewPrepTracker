const API_BASE_URL = '/api';

// Static authentication for sgshaji@gmail.com - using real Supabase user ID
const STATIC_USER_ID = 'b4d3aeaa-4e73-44f7-bf6a-2148d3e0f81c';

export const api = {
  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-User-ID': STATIC_USER_ID
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
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-ID': STATIC_USER_ID
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
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-User-ID': STATIC_USER_ID
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
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-User-ID': STATIC_USER_ID
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