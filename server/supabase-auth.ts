import { createClient } from '@supabase/supabase-js';
import type { NextFunction, Request, Response } from 'express';

// Extend Express types
declare global {
  namespace Express {
    interface User {
      id: string;
      email?: string;
      username?: string;
      fullName?: string | null;
      avatar?: string | null;
      role?: string;
      subscriptionStatus?: string;
      email_confirmed_at?: Date | null;
      created_at?: Date;
      updated_at?: Date;
    }
    
    interface Request {
      user?: User;
      auth?: {
        userId: string;
        email?: string;
        provider?: string;
      };
    }
  }
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: Express.User;
    auth?: {
      userId: string;
      email?: string;
      provider?: string;
    };
  }
}

declare module 'express' {
  interface Request {
    user?: Express.User;
    auth?: {
      userId: string;
      email?: string;
      provider?: string;
    };
  }
}

// Define ExpressRequest type for request handlers
type ExpressRequest = Request & {
  user?: Express.User;
  auth?: {
    userId: string;
    email?: string;
    provider?: string;
  };
};

// Initialize Supabase admin client for server-side operations
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export function setupSupabaseAuth(app: any) {
  // Auth callback handler (for OAuth redirects)
  app.get("/auth/callback", (_: any, res: any) => {
    // Redirect to the main app after OAuth
    res.redirect("/");
  });
}

// Helper function to extract user metadata from auth user
const getUserFromAuthUser = (authUser: any): Express.User => {
  const username = authUser.user_metadata?.preferred_username || 
                   authUser.user_metadata?.username ||
                   authUser.email?.split('@')[0] || 
                   'user';
  
  const fullName = authUser.user_metadata?.full_name || 
                   authUser.user_metadata?.name || 
                   authUser.email?.split('@')[0] || 
                   'New User';
  
  const subscriptionStatus = authUser.email === 'sgshaji@gmail.com' ? 'active' : 'inactive';
  
  return {
    id: authUser.id,
    email: authUser.email,
    username,
    fullName,
    avatar: authUser.user_metadata?.avatar_url || null,
    role: 'user',
    subscriptionStatus,
    email_confirmed_at: authUser.email_confirmed_at ? new Date(authUser.email_confirmed_at) : null,
    created_at: authUser.created_at ? new Date(authUser.created_at) : new Date(),
    updated_at: authUser.updated_at ? new Date(authUser.updated_at) : new Date()
  };
};

// Middleware to authenticate requests using Supabase JWT
export const requireAuth = async (req: ExpressRequest, res: Response, next: NextFunction) => {
  try {
    // Authentication via multiple methods (bypasses header filtering in Replit environment)
    
    let token = req.query.auth_token as string;
    
    // Check request body for POST requests with X-HTTP-Method-Override
    if (!token && req.body && req.body.auth_token) {
      token = req.body.auth_token;
      console.log('Auth middleware - token found in request body');
    }
    
    if (!token) {
      // Fallback to X-Auth-Token header
      token = req.headers['x-auth-token'] as string;
    }
    
    if (!token) {
      // Fallback to Authorization header
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    if (!token) {
      console.log('Auth middleware - no valid token found');
      return res.status(401).json({ error: 'No token provided' });
    }

    console.log('Auth middleware - token found, length:', token.length, 'starts with:', token.substring(0, 10));

    // Verify the JWT and get the auth user
    const { data: { user: authUser }, error } = await supabaseAdmin.auth.getUser(token);

    if (error) {
      console.error('Auth middleware - token verification failed:', error.message);
      return res.status(401).json({ error: 'Invalid token' });
    }

    if (!authUser) {
      console.log('Auth middleware - no user found in token');
      return res.status(401).json({ error: 'Invalid token' });
    }

    console.log('Auth middleware - user authenticated:', authUser.email);

    // Convert auth user to Express user format
    const user = getUserFromAuthUser(authUser);
    
    // Set user on request for subsequent middleware
    req.user = user;
    req.auth = {
      userId: authUser.id,
      email: authUser.email,
      provider: authUser.app_metadata?.provider || 'email'
    };

    next();
  } catch (error) {
    console.error('Error in requireAuth middleware:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

// Utility functions for getting user information
export const getCurrentUserId = (req: ExpressRequest): string | null => {
  return req.auth?.userId || req.user?.id || null;
};

export const getCurrentUser = async (req: ExpressRequest): Promise<Express.User | null> => {
  return req.user || null;
};