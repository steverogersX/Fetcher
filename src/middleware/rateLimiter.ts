import rateLimit from 'express-rate-limit';
import { env } from '@/config/env';
import type { ApiError } from '@/types/api';

export const rateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  handler(_req, res) {
    const body: ApiError = {
      success: false,
      error: { message: 'Too many requests', code: 'RATE_LIMIT_EXCEEDED' },
    };
    res.status(429).json(body);
  },
});
