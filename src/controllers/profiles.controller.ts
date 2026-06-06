import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { fetchGithubProfile } from '@/services/github.service';
import { sendSuccess } from '@/utils/response';
import { logger } from '@/utils/logger';

const usernameParamSchema = z.object({
  id: z
    .string()
    .min(1)
    .max(39)
    .regex(/^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/, 'Invalid GitHub username format'),
});

export function getAllProfiles(_req: Request, _res: Response): void {
  // TODO: implement
}

export async function getProfileById(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id: username } = usernameParamSchema.parse(req.params);

    logger.info({ username, reqId: req.id }, 'Fetching GitHub profile');

    const profile = await fetchGithubProfile(username);

    logger.info({ username, reqId: req.id }, 'GitHub profile returned');

    sendSuccess(res, profile);
  } catch (err) {
    next(err);
  }
}
