import { Router } from 'express';
import type { Request, Response } from 'express';
import { sendSuccess } from '@/utils/response';

export const healthRouter = Router();

type HealthPayload = {
  status: 'ok';
  uptime: number;
  timestamp: string;
};

healthRouter.get('/', (_req: Request, res: Response): void => {
  const payload: HealthPayload = {
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  };
  sendSuccess(res, payload);
});
