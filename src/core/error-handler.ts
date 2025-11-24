import { NextFunction, Request, Response } from 'express';
import { logger } from './logger.js';

export class HandlerException extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true,
  ) {
    super(message);
    Object.setPrototypeOf(this, HandlerException.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export function errorHandler(
  err: Error | HandlerException,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (err instanceof HandlerException) {
    logger.warn('Application error', {
      statusCode: err.statusCode,
      message: err.message,
      path: req.path,
      method: req.method,
    });

    return res.status(err.statusCode).json({
      error: err.message,
      statusCode: err.statusCode,
    });
  }

  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  res.status(500).json({
    error: 'Internal server error',
    statusCode: 500,
  });
}

export function asyncHandler(
  fn: (req: any, res: Response, next?: NextFunction) => Promise<any>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
