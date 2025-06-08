import { Express } from "express";
import { storage } from "./storage";
import { createClient } from "@supabase/supabase-js";
import { User as LocalUser } from "@shared/schema";

// Initialize Supabase admin client for server-side operations
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!
);

export function setupSupabaseAuth(app: Express) {
  // Sync Supabase user with local database
  app.post("/api/auth/sync-user", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or invalid authorization header' });
      }

      const token = authHeader.split(' ')[1];
      
      // Verify the JWT token with Supabase
      const { data: { user: supabaseUser }, error } = await supabaseAdmin.auth.getUser(token);
      
      if (error || !supabaseUser) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      const { email, id: supabaseId } = supabaseUser;
      const { name, avatar, provider } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      // Check if user exists in local database
      let localUser = await storage.getUserByEmail(email);
      
      if (!localUser) {
        // Create new user in local database
        const username = email.split('@')[0]; // Use email prefix as username
        localUser = await storage.createUser({
          username,
          email,
          name: name || username,
          password: 'oauth_user', // Placeholder for OAuth users
          role: 'user',
          subscriptionStatus: email === 'sgshaji@gmail.com' ? 'active' : 'inactive'
        });
        
        console.log(`✅ Created new user: ${email} (Local ID: ${localUser.id})`);
      } else {
        // Update existing user info if needed
        if (localUser.name !== name && name) {
          // Could add an update method to storage if needed
          console.log(`ℹ️ User exists: ${email} (Local ID: ${localUser.id})`);
        }
      }

      // Store Supabase ID mapping for future reference
      // You might want to add a supabase_id column to your users table
      
      res.json({
        id: localUser.id,
        username: localUser.username,
        email: localUser.email,
        name: localUser.name,
        role: localUser.role,
        subscriptionStatus: localUser.subscriptionStatus,
        supabaseId
      });

    } catch (error) {
      console.error('Error syncing user:', error);
      res.status(500).json({ error: 'Failed to sync user' });
    }
  });

  // Auth callback handler (for OAuth redirects)
  app.get("/auth/callback", (req, res) => {
    // Redirect to the main app after OAuth
    res.redirect("/");
  });
}

// Middleware to authenticate requests using Supabase JWT
export async function requireSupabaseAuth(req: any, res: any, next: any) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing authorization header' });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify the JWT token with Supabase
    const { data: { user: supabaseUser }, error } = await supabaseAdmin.auth.getUser(token);
    
    if (error || !supabaseUser) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Get local user from database
    const localUser = await storage.getUserByEmail(supabaseUser.email!);
    
    if (!localUser) {
      return res.status(401).json({ error: 'User not found in local database' });
    }

    // Attach user info to request
    req.user = localUser;
    req.supabaseUser = supabaseUser;
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
}

// Helper function to get current user ID from request
export function getCurrentUserId(req: any): number {
  if (!req.user) {
    throw new Error('User not authenticated');
  }
  return req.user.id;
} 