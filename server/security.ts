import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import { Express } from 'express';
import dotenv from 'dotenv';

// Load env
dotenv.config();

// Determine if we are in development mode
const isDev = process.env.NODE_ENV === 'development';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://bzukbciiqwdckzmwarku.supabase.co';

// Security headers configuration
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", supabaseUrl, "https://*.supabase.co", "wss://*.supabase.co", "https://logo.clearbit.com", "https://ui-avatars.com"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", supabaseUrl, "https://*.supabase.co"],
      imgSrc: ["'self'", "data:", "https:", "*.clearbit.com", "*.ui-avatars.com", "*.logo.dev", "https://logo.clearbit.com"],
      fontSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'self'", supabaseUrl, "https://*.supabase.co", "https://accounts.google.com"],
      frameAncestors: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: { policy: "unsafe-none" },
  crossOriginResourcePolicy: { policy: "cross-origin" },
});

// Rate limiting configuration
export const rateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: isDev ? 10000 : parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // Much higher in dev
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// API rate limiting (more strict)
export const apiRateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: isDev ? 10000 : 50, // Much higher in dev
  message: "Too many API requests, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// CORS configuration
export const corsOptions = cors({
  origin: true, // Allow all origins in development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // 24 hours
});

// Setup all security middleware
export function setupSecurity(app: Express) {
  // Basic security headers
  app.use(securityHeaders);
  
  // CORS
  app.use(corsOptions);
  
  // Rate limiting
  app.use(rateLimiter);
  app.use('/api/', apiRateLimiter);
  
  // Trust proxy
  app.set('trust proxy', 1);
  
  // Disable X-Powered-By header
  app.disable('x-powered-by');
}