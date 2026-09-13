import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  code?:       number;
  errors?:     any;
  keyValue?:   Record<string, any>;
}

export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  let statusCode = err.statusCode || 500;
  let message    = err.message || 'Internal Server Error';

  // Mongoose duplicate key
  if (err.code === 11000 && err.keyValue) {
    const field = Object.keys(err.keyValue)[0];
    message    = `${field.charAt(0).toUpperCase() + field.slice(1)} is already taken.`;
    statusCode  = 400;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError' && err.errors) {
    const messages = Object.values(err.errors).map((e: any) => e.message);
    message    = messages.join(', ');
    statusCode = 400;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError')  { message = 'Invalid token.';        statusCode = 401; }
  if (err.name === 'TokenExpiredError')  { message = 'Token has expired.';    statusCode = 401; }
  if (err.name === 'CastError')          { message = 'Resource not found.';   statusCode = 404; }

  if (process.env.NODE_ENV !== 'production') {
    console.error('[Error]', err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export const asyncHandler = (fn: Function) =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);
