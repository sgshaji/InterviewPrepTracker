import { supabase } from './supabase';
import { User } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  email: string;
  fullName?: string;
  emailConfirmed: boolean;
}

export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface ResetPasswordData {
  email: string;
}

export interface UpdatePasswordData {
  password: string;
}

class AuthService {
  // Get current user session
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        return null;
      }

      return {
        id: user.id,
        email: user.email || '',
        fullName: user.user_metadata?.full_name || user.user_metadata?.name,
        emailConfirmed: !!user.email_confirmed_at,
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // Get current session
  async getCurrentSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      return { session, error };
    } catch (error) {
      console.error('Error getting session:', error);
      return { session: null, error };
    }
  }

  // Sign up with email and password
  async signUp(data: SignUpData) {
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            name: data.fullName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        },
      });

      if (error) {
        // Handle specific Supabase errors
        if (error.message.includes('User already registered')) {
          throw new Error('An account with this email already exists. Please sign in instead.');
        }
        if (error.message.includes('Email rate limit exceeded')) {
          throw new Error('Too many signup attempts. Please wait a few minutes before trying again.');
        }
        if (error.message.includes('Invalid email')) {
          throw new Error('Please enter a valid email address.');
        }
        throw error;
      }

      return {
        user: authData.user,
        session: authData.session,
        needsEmailConfirmation: !authData.user?.email_confirmed_at,
        error: null
      };
    } catch (error: any) {
      console.error('Signup error:', error);
      return {
        user: null,
        session: null,
        needsEmailConfirmation: false,
        error: error.message || 'Failed to create account'
      };
    }
  }

  // Sign in with email and password
  async signIn(data: SignInData) {
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) throw error;

      return {
        user: authData.user,
        session: authData.session,
        error: null
      };
    } catch (error: any) {
      console.error('Sign in error:', error);
      return {
        user: null,
        session: null,
        error: error.message || 'Failed to sign in'
      };
    }
  }

  // Sign in with Google OAuth
  async signInWithGoogle() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      console.error('Google sign in error:', error);
      return {
        data: null,
        error: error.message || 'Failed to sign in with Google'
      };
    }
  }

  // Send password reset email
  async resetPassword(data: ResetPasswordData) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });

      if (error) throw error;

      return { error: null };
    } catch (error: any) {
      console.error('Password reset error:', error);
      return {
        error: error.message || 'Failed to send password reset email'
      };
    }
  }

  // Update password (for reset flow)
  async updatePassword(data: UpdatePasswordData) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password
      });

      if (error) throw error;

      return { error: null };
    } catch (error: any) {
      console.error('Password update error:', error);
      return {
        error: error.message || 'Failed to update password'
      };
    }
  }

  // Sign out
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;

      return { error: null };
    } catch (error: any) {
      console.error('Sign out error:', error);
      return {
        error: error.message || 'Failed to sign out'
      };
    }
  }

  // Listen to auth state changes
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }

  // Resend email confirmation
  async resendConfirmation(email: string) {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) throw error;

      return { error: null };
    } catch (error: any) {
      console.error('Resend confirmation error:', error);
      return {
        error: error.message || 'Failed to resend confirmation email'
      };
    }
  }
}

export const authService = new AuthService();