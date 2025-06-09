import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

// Define a simplified user type based on auth.users
type LocalUser = {
  id: string;
  email?: string;
  username?: string;
  fullName?: string;
  avatar?: string;
  role?: string;
  subscriptionStatus?: string;
  email_confirmed_at?: Date | null;
  created_at?: Date;
  updated_at?: Date;
};

type AuthContextType = {
  user: LocalUser | null;
  supabaseUser: SupabaseUser | null;
  isLoading: boolean;
  isAuthLoaded: boolean;
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
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);
  const { toast } = useToast();

  // Convert Supabase user to local user format
  const convertSupabaseUser = (supabaseUser: SupabaseUser): LocalUser => {
    const username = supabaseUser.user_metadata?.preferred_username || 
                     supabaseUser.user_metadata?.username ||
                     supabaseUser.email?.split('@')[0] || 
                     'user';
    
    const fullName = supabaseUser.user_metadata?.full_name || 
                     supabaseUser.user_metadata?.name || 
                     supabaseUser.email?.split('@')[0] || 
                     'User';
    
    const subscriptionStatus = supabaseUser.email === 'sgshaji@gmail.com' ? 'active' : 'inactive';
    
    return {
      id: supabaseUser.id,
      email: supabaseUser.email,
      username,
      fullName,
      avatar: supabaseUser.user_metadata?.avatar_url || null,
      role: 'user',
      subscriptionStatus,
      email_confirmed_at: supabaseUser.email_confirmed_at ? new Date(supabaseUser.email_confirmed_at) : null,
      created_at: supabaseUser.created_at ? new Date(supabaseUser.created_at) : new Date(),
      updated_at: supabaseUser.updated_at ? new Date(supabaseUser.updated_at) : new Date()
    };
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
          setUser(convertSupabaseUser(session.user));
        }
      } catch (error) {
        console.error('❌ Error initializing auth:', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
          setIsAuthLoaded(true);
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
          console.log('👤 Valid session found, setting user:', session.user.email);
          setSupabaseUser(session.user);
          setUser(convertSupabaseUser(session.user));
          console.log('✅ User set from auth.users');
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
        title: "Error",
        description: error.message || "Failed to sign in",
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
            name: fullName,
          },
        },
      });

      if (error) throw error;

      toast({
        title: "Account created!",
        description: "Please check your email to verify your account.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create account",
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
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to sign in with Google",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to sign out",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
      setUser(null);
      setSupabaseUser(null);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      toast({
        title: "Password reset email sent",
        description: "Check your email for the password reset link.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send reset email",
        variant: "destructive",
      });
      throw error;
    }
  };

  const value = {
    user,
    supabaseUser,
    isLoading,
    isAuthLoaded,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useSupabaseAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useSupabaseAuth must be used within an AuthProvider");
  }
  return context;
} 