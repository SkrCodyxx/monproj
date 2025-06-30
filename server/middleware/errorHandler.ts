// Placeholder for Error Handling Middleware (Express)
import { Request, Response, NextFunction } from 'express';

interface ErrorResponse {
  message: string;
  stack?: string; // Only in development
  errors?: any; // For validation errors or specific error details
  statusCode?: number;
}

// This middleware should be the last piece of middleware added to your Express app
const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  // Log the error for debugging (consider using a more robust logger like Winston or Pino)
  console.error('ERROR:', err.message);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  const statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode) || 500;

  const response: ErrorResponse = {
    message: err.message || 'An unexpected error occurred',
    // stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  };

  // Add stack in development only for easier debugging, but ensure it's not in the response object itself for security.
  // The console.error above already logs it.

  // Handle specific error types if needed
  // For example, Mongoose validation errors, Zod errors, etc.
  if (err.name === 'ValidationError') { // Example for Mongoose or similar ORM
    response.message = 'Validation Failed';
    // @ts-ignore
    response.errors = Object.values(err.errors).map((e: any) => e.message);
    // statusCode = 400; // Usually validation errors are 400
  }

  // If Zod error (you'll need to check how Zod errors are structured)
  // if (err.issues) { // Zod errors often have an 'issues' array
  //   response.message = "Input validation failed";
  //   response.errors = err.issues.map((issue: any) => ({ path: issue.path.join('.'), message: issue.message }));
  //   // statusCode = 400;
  // }


  // Avoid sending sensitive error details to the client in production
  if (process.env.NODE_ENV === 'production' && !err.isOperational) {
    response.message = 'Something went wrong on the server.';
  }

  // Ensure statusCode is set if not already
  res.status(statusCode).json(response);
};

export default errorHandler;

// You can also create custom error classes
export class CustomAPIError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational; // Distinguish operational errors from programming errors
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends CustomAPIError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

export class BadRequestError extends CustomAPIError {
  constructor(message = 'Bad request') {
    super(message, 400);
  }
}

export class UnauthorizedError extends CustomAPIError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

export class ForbiddenError extends CustomAPIError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}
