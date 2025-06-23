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

// Static user for sgshaji@gmail.com - using real Supabase user ID
const STATIC_USER_ID = 'b4d3aeaa-4e73-44f7-bf6a-2148d3e0f81c';
const STATIC_USER: Express.User = {
  id: STATIC_USER_ID,
  email: 'sgshaji@gmail.com',
  username: 'sgshaji',
  fullName: 'S G Shaji',
  avatar: null,
  role: 'user',
  subscriptionStatus: 'active',
  email_confirmed_at: new Date(),
  created_at: new Date(),
  updated_at: new Date()
};

export function setupSupabaseAuth(app: any) {
  // Auth callback handler (for OAuth redirects)
  app.get("/auth/callback", (_: any, res: any) => {
    // Redirect to the main app after OAuth
    res.redirect("/");
  });
}

// Simplified authentication middleware for static user
export const requireAuth = async (req: ExpressRequest, res: Response, next: NextFunction) => {
  try {
    // Check for X-User-ID header
    const userId = req.headers['x-user-id'] as string;
    
    if (!userId) {
      console.log('Auth middleware - no X-User-ID header found');
      return res.status(401).json({ error: 'No user ID provided' });
    }

    // Verify it matches our static user
    if (userId !== STATIC_USER_ID) {
      console.log('Auth middleware - invalid user ID:', userId);
      return res.status(401).json({ error: 'Invalid user ID' });
    }

    console.log('Auth middleware - authenticated static user:', STATIC_USER.email);

    // Set user on request for subsequent middleware
    req.user = STATIC_USER;
    req.auth = {
      userId: STATIC_USER_ID,
      email: STATIC_USER.email,
      provider: 'static'
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