import type { Response } from 'express';
import type { ApiError, ApiSuccess } from '@/types/api';

export function sendSuccess<T>(res: Response, data: T, statusCode = 200): void {
  const body: ApiSuccess<T> = { success: true, data };
  res.status(statusCode).json(body);
}

export function sendError(
  res: Response,
  message: string,
  code: string,
  statusCode = 500,
  details?: unknown,
): void {
  const body: ApiError = { success: false, error: { message, code, details } };
  res.status(statusCode).json(body);
}
