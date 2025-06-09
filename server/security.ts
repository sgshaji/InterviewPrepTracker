import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import { Express } from 'express';
import dotenv from 'dotenv';

// Load env
dotenv.config();

// Determine if we are in development mode
const isDev = process.env.NODE_ENV === 'development';

// Security headers configuration - with CSP completely disabled for now
export const securityHeaders = helmet({
  contentSecurityPolicy: false, // Disable CSP completely
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: { policy: "unsafe-none" },
  crossOriginResourcePolicy: { policy: "cross-origin" },
  dnsPrefetchControl: { allow: true },
  frameguard: false, // Disable frameguard to allow frames
  hidePoweredBy: true,
  hsts: isDev ? false : {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  ieNoOpen: true,
  noSniff: true,
  referrerPolicy: { policy: "no-referrer-when-downgrade" },
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

// CORS configuration - allow all origins in development
export const corsOptions = cors({
  origin: true, // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // 24 hours
});

// Setup all security middleware
export function setupSecurity(app: Express) {
  // CORS
  app.use(corsOptions);
  
  // Basic security headers (with CSP disabled)
  app.use(securityHeaders);
  
  // Rate limiting
  app.use(rateLimiter);
  app.use('/api/', apiRateLimiter);
  
  // Trust proxy
  app.set('trust proxy', 1);
  
  // Disable X-Powered-By header
  app.disable('x-powered-by');
}