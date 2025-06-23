import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService, AuthUser } from '../lib/auth-service';
import { useToast } from './use-toast';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  resendConfirmation: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const isAuthenticated = !!user && user.emailConfirmed;

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        if (mounted) {
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = authService.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        if (session?.user) {
          const authUser: AuthUser = {
            id: session.user.id,
            email: session.user.email || '',
            fullName: session.user.user_metadata?.full_name || session.user.user_metadata?.name,
            emailConfirmed: !!session.user.email_confirmed_at,
          };
          setUser(authUser);
        } else {
          setUser(null);
        }
        
        setIsLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    setIsLoading(true);
    console.log('🚀 useAuth signUp called for:', email);
    
    try {
      const result = await authService.signUp({ email, password, fullName });
      console.log('📧 Auth service result:', result);
      
      if (result.error) {
        console.error('❌ Auth service error:', result.error);
        throw new Error(result.error);
      }

      console.log('✅ Signup successful, showing toast notification');
      
      if (result.needsEmailConfirmation) {
        console.log('📬 Email confirmation needed');
        toast({
          title: "Account Created Successfully!",
          description: "Please check your email inbox and click the verification link to activate your account. Then you can sign in.",
          duration: 8000, // Show for 8 seconds
        });
      } else {
        console.log('🎉 Account ready to use');
        toast({
          title: "Account Created Successfully!",
          description: "You can now access your dashboard.",
          duration: 5000,
        });
      }
    } catch (error: any) {
      console.error('💥 Signup failed:', error);
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const result = await authService.signIn({ email, password });
      
      if (result.error) {
        throw new Error(result.error);
      }

      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setIsLoading(true);
    try {
      const result = await authService.signInWithGoogle();
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      // Google OAuth will redirect, so we don't need to show a toast here
    } catch (error: any) {
      toast({
        title: "Google sign in failed",
        description: error.message,
        variant: "destructive",
      });
      setIsLoading(false);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log('Signing out user...');
      const result = await authService.signOut();
      
      if (result.error) {
        throw new Error(result.error);
      }

      // Clear user state immediately
      setUser(null);

      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });

      // Redirect to login page
      window.location.href = '/auth';
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast({
        title: "Sign out failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const result = await authService.resetPassword({ email });
      
      if (result.error) {
        throw new Error(result.error);
      }

      toast({
        title: "Password reset email sent",
        description: "Please check your email for instructions to reset your password.",
      });
    } catch (error: any) {
      toast({
        title: "Password reset failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const updatePassword = async (password: string) => {
    try {
      const result = await authService.updatePassword({ password });
      
      if (result.error) {
        throw new Error(result.error);
      }

      toast({
        title: "Password updated",
        description: "Your password has been successfully updated.",
      });
    } catch (error: any) {
      toast({
        title: "Password update failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const resendConfirmation = async (email: string) => {
    try {
      const result = await authService.resendConfirmation(email);
      
      if (result.error) {
        throw new Error(result.error);
      }

      toast({
        title: "Confirmation email sent",
        description: "Please check your email for the verification link.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to resend confirmation",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    updatePassword,
    resendConfirmation,
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