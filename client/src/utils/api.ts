import { supabase } from "@/lib/supabase";

const API_BASE_URL = 'http://localhost:5000/api';

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  const baseHeaders: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  
  if (session?.access_token) {
    baseHeaders['Authorization'] = `Bearer ${session.access_token}`;
  }
  
  return baseHeaders;
}

export const api = {
  async get<T>(endpoint: string): Promise<T> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers
    });
    if (!response.ok) {
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