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

// Static user for sgshaji@gmail.com
const STATIC_USER: AuthUser = {
  id: '550e8400-e29b-41d4-a716-446655440000',
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