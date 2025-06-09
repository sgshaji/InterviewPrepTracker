import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import { Express } from 'express';
import dotenv from 'dotenv';

// Load env
dotenv.config();

// Determine if we are in development mode
const isDev = process.env.NODE_ENV === 'development';

const supabaseUrl: string = process.env.VITE_SUPABASE_URL || 'https://bzukbciiqwdckzmwarku.supabase.co';

// Security headers configuration
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", supabaseUrl],
      imgSrc: ["'self'", "data:", "https:", "*.clearbit.com", "*.ui-avatars.com", "*.logo.dev"],
      connectSrc: ["'self'", supabaseUrl],
      fontSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'self'", supabaseUrl, "https://accounts.google.com"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: { policy: "unsafe-none" },
  crossOriginResourcePolicy: { policy: "cross-origin" },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: "sameorigin" }, // Changed from "deny" to "sameorigin"
  hidePoweredBy: true,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  ieNoOpen: true,
  noSniff: true,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  xssFilter: true
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
  origin: process.env.CORS_ORIGIN || 'http://localhost:5000',
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