import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

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