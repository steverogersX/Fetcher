import type { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import { logger } from '@/utils/logger';
import { sendError } from '@/utils/response';
import { env } from '@/config/env';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(message: string, statusCode: number, code: string) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

export function notFoundHandler(req: Request, res: Response): void {
  sendError(res, `Route ${req.method} ${req.path} not found`, 'NOT_FOUND', 404);
}

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ZodError) {
    sendError(res, z.prettifyError(err), 'VALIDATION_ERROR', 422);
    return;
  }

  if (err instanceof AppError) {
    sendError(res, err.message, err.code, err.statusCode);
    return;
  }

  logger.error({ err, reqId: req.id }, 'Unhandled error');

  const message = env.NODE_ENV === 'production' ? 'Internal server error' : String(err);
  sendError(res, message, 'INTERNAL_ERROR', 500);
}
