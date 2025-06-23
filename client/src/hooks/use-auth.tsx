import React, { createContext, useContext } from 'react';

export interface AuthUser {
  id: string;
  email: string;
  fullName?: string;
  emailConfirmed: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signUp: () => Promise<void>;
  signIn: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: () => Promise<void>;
  updatePassword: () => Promise<void>;
  resendConfirmation: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Static user for sgshaji@gmail.com - using real Supabase user ID
const STATIC_USER: AuthUser = {
  id: 'b4d3aeaa-4e73-44f7-bf6a-2148d3e0f81c',
  email: 'sgshaji@gmail.com',
  fullName: 'S G Shaji',
  emailConfirmed: true,
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const value: AuthContextType = {
    user: STATIC_USER,
    isLoading: false,
    isAuthenticated: true,
    signUp: async () => {},
    signIn: async () => {},
    signInWithGoogle: async () => {},
    signOut: async () => {},
    resetPassword: async () => {},
    updatePassword: async () => {},
    resendConfirmation: async () => {},
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}