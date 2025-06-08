import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { User as LocalUser } from "@shared/schema";

type AuthContextType = {
  user: LocalUser | null;
  supabaseUser: SupabaseUser | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Sync Supabase user with local database
  const syncUserWithDatabase = async (supabaseUser: SupabaseUser) => {
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      
      if (!token) {
        console.error('❌ No access token available for sync');
        return;
      }

      console.log('🔄 Syncing user with database:', {
        email: supabaseUser.email,
        id: supabaseUser.id,
        hasToken: !!token
      });

      const response = await fetch('/api/auth/sync-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id: supabaseUser.id,
          email: supabaseUser.email,
          name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || 'User',
          avatar: supabaseUser.user_metadata?.avatar_url,
          provider: supabaseUser.app_metadata?.provider
        })
      });

      console.log('📡 Sync response status:', response.status);

      if (response.ok) {
        const localUser = await response.json();
        console.log('✅ Local user created/updated:', localUser.email);
        setUser(localUser);
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to sync user with database:', response.status, errorText);
        // Don't throw error - let auth continue even if sync fails
      }
    } catch (error) {
      console.error('💥 Error syncing user:', error);
      // Don't throw error - let auth continue even if sync fails
    }
  };

  // Initialize auth state
  useEffect(() => {
    let mounted = true;
    
    const initializeAuth = async () => {
      try {
        // Check for OAuth callback parameters first
        const url = window.location.href;
        const hasOAuthParams = url.includes("code=") || url.includes("access_token=") || url.includes("#access_token=");
        
        if (hasOAuthParams) {
          console.log('🔄 OAuth callback detected, waiting for session...');
          // Give Supabase time to process the OAuth callback
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        // Get initial session
        const { data: { session } } = await supabase.auth.getSession();
        console.log('🔍 Initial session check:', { 
          hasSession: !!session, 
          userEmail: session?.user?.email,
          hasOAuthParams 
        });
        
        if (session?.user && mounted) {
          setSupabaseUser(session.user);
          await syncUserWithDatabase(session.user);
        }
      } catch (error) {
        console.error('❌ Error initializing auth:', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();
    
    return () => {
      mounted = false;
    };
  }, []);

  // Listen for auth changes (separate from initialization)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', { 
          event, 
          userEmail: session?.user?.email,
          hasSession: !!session,
          sessionValid: session?.expires_at ? new Date(session.expires_at * 1000) > new Date() : false 
        });
        
        if (event === 'SIGNED_OUT') {
          console.log('🚪 User signed out - clearing state');
          setSupabaseUser(null);
          setUser(null);
          setIsLoading(false);
          return;
        }
        
        if (session?.user) {
          console.log('👤 Valid session found, syncing user:', session.user.email);
          setSupabaseUser(session.user);
          try {
            await syncUserWithDatabase(session.user);
            console.log('✅ User sync completed');
          } catch (error) {
            console.error('❌ Failed to sync user:', error);
          }
        } else {
          console.log('🚫 No valid session');
          setSupabaseUser(null);
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Timeout fallback to prevent infinite loading
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      console.log('⏰ Forcing loading to false after 3 seconds');
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, []);

  // Debug: Log current session and client config
  useEffect(() => {
    console.log('🔧 Supabase client config:', {
      url: import.meta.env.VITE_SUPABASE_URL,
      anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing',
      supabaseInstance: supabase ? '✅ Initialized' : '❌ Not initialized'
    });
    supabase.auth.getSession().then((result) => {
      console.log('📋 Current session:', result);
    });
    
    supabase.auth.getSession().then((session) => {
      console.log("✅ Current Supabase session:", session);
    });
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Welcome back!",
        description: "You have been signed in successfully.",
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

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;

      toast({
        title: "Check your email",
        description: "We've sent you a confirmation link to complete your registration.",
      });
    } catch (error: any) {
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

  const signInWithGoogle = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });

      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Google sign in failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setSupabaseUser(null);
      
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Sign out failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;

      toast({
        title: "Password reset sent",
        description: "Check your email for the password reset link.",
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

  return (
    <AuthContext.Provider
      value={{
        user,
        supabaseUser,
        isLoading,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useSupabaseAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useSupabaseAuth must be used within an AuthProvider");
  }
  return context;
} 