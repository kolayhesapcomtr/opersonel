import { Request, Response, NextFunction } from 'express';
import { log } from '../common/logger';
import { ResponseHelper } from '../common/response';

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 400,
    public isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Log error
  log.error('Error occurred:', err);

  // Handle known operational errors
  if (err instanceof AppError) {
    return ResponseHelper.error(res, err.message, err.statusCode);
  }

  // Handle Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    return ResponseHelper.error(res, 'Database error occurred', 400);
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    return ResponseHelper.error(res, err.message, 400);
  }

  // Handle unknown errors
  if (process.env.NODE_ENV === 'development') {
    return ResponseHelper.serverError(res, err.message);
  }

  return ResponseHelper.serverError(res);
};

// 404 handler
export const notFoundHandler = (req: Request, res: Response) => {
  return ResponseHelper.notFound(res, `Route ${req.originalUrl} not found`);
};
