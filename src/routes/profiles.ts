import { Router } from 'express';
import { getAllProfiles, getProfileById } from '@/controllers/profiles.controller';

export const profilesRouter = Router();

profilesRouter.get('/', getAllProfiles);
profilesRouter.get('/:id', getProfileById);
