import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: any[];
}

export class ResponseHelper {
  static success<T>(res: Response, data: T, message?: string, statusCode = 200) {
    const response: ApiResponse<T> = {
      success: true,
      data,
      message,
    };
    return res.status(statusCode).json(response);
  }

  static created<T>(res: Response, data: T, message = 'Resource created successfully') {
    return this.success(res, data, message, 201);
  }

  static error(res: Response, error: string, statusCode = 400, errors?: any[]) {
    const response: ApiResponse = {
      success: false,
      error,
      errors,
    };
    return res.status(statusCode).json(response);
  }

  static unauthorized(res: Response, message = 'Unauthorized') {
    return this.error(res, message, 401);
  }

  static forbidden(res: Response, message = 'Forbidden') {
    return this.error(res, message, 403);
  }

  static notFound(res: Response, message = 'Resource not found') {
    return this.error(res, message, 404);
  }

  static serverError(res: Response, message = 'Internal server error') {
    return this.error(res, message, 500);
  }
}
