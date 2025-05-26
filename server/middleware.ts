import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { body, validationResult } from "express-validator";

// Error handling middleware
export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Global error handler
export const errorHandler = (error: any, req: Request, res: Response, next: NextFunction) => {
  console.error('API Error:', error);

  // Zod validation errors
  if (error instanceof z.ZodError) {
    return res.status(400).json({
      message: "Invalid request data",
      errors: error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))
    });
  }

  // Database errors
  if (error.code === '23503') {
    return res.status(400).json({
      message: "Referenced record not found",
      error: "Foreign key constraint violation"
    });
  }

  if (error.code === '23505') {
    return res.status(409).json({
      message: "Record already exists",
      error: "Unique constraint violation"
    });
  }

  // Default error response
  res.status(500).json({
    message: "Internal server error",
    error: process.env.NODE_ENV === 'development' ? error.message : "Something went wrong"
  });
};

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const method = req.method;
    const url = req.url;
    
    console.log(`${method} ${url} ${status} - ${duration}ms`);
  });
  
  next();
};

// Validation middleware factory
export const validateRequest = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid request data",
          errors: error.errors
        });
      }
      next(error);
    }
  };
};

// SQL Injection Protection Middleware
export const sanitizeInput = [
  body('*').trim().escape(),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: "Input validation failed",
        details: errors.array(),
      });
    }
    next();
  }
];

// Enhanced validation for database queries with SQL injection protection
export const validateDatabaseInput = (schema: z.ZodSchema) => {
  return [
    body('*').trim().escape(), // Sanitize all inputs
    (req: Request, res: Response, next: NextFunction) => {
      try {
        // SQL injection patterns to detect and block
        const dangerousPatterns = [
          /(\b(ALTER|CREATE|DELETE|DROP|EXEC(UTE)?|INSERT|MERGE|SELECT|UNION|UPDATE)\b)/gi,
          /(\'|(\'\')|(\-\-)|(\;))/g,
          /(\b(OR|AND)\b.*\b(=|>|<|\!=)\b)/gi,
          /(\bUNION\b.*\bSELECT\b)/gi,
          /(\bSELECT\b.*\bFROM\b)/gi,
        ];
        
        const checkForSQLInjection = (obj: any): boolean => {
          if (typeof obj === 'string') {
            return dangerousPatterns.some(pattern => pattern.test(obj));
          }
          if (typeof obj === 'object' && obj !== null) {
            return Object.values(obj).some(value => checkForSQLInjection(value));
          }
          return false;
        };

        // Check request body and query parameters
        if (checkForSQLInjection(req.body) || checkForSQLInjection(req.query)) {
          console.warn('Potential SQL injection attempt blocked:', {
            ip: req.ip,
            body: req.body,
            query: req.query,
            timestamp: new Date().toISOString()
          });
          
          return res.status(400).json({
            error: "Security violation detected",
            message: "Request blocked for containing potentially malicious content"
          });
        }

        // Validate with Zod schema
        schema.parse(req.body);
        next();
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({
            error: "Validation error",
            details: error.errors,
          });
        }
        next(error);
      }
    }
  ];
};