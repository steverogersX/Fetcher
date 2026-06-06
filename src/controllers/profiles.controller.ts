import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { listProfiles, getAndSaveProfile } from '@/services/profile.service';
import { sendSuccess } from '@/utils/response';
import { logger } from '@/utils/logger';

const usernameParamSchema = z.object({
  id: z
    .string()
    .min(1)
    .max(39)
    .regex(/^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/, 'Invalid GitHub username format'),
});

export async function getAllProfilesFromDb(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const profiles = await listProfiles();
    sendSuccess(res, profiles);
  } catch (err) {
    next(err);
  }
}

export async function getProfileById(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id: username } = usernameParamSchema.parse(req.params);

    logger.info({ username, reqId: req.id }, 'Fetching GitHub profile');

    const profile = await getAndSaveProfile(username);

    logger.info({ username, reqId: req.id }, 'GitHub profile returned');

    sendSuccess(res, profile);
  } catch (err) {
    next(err);
  }
}
