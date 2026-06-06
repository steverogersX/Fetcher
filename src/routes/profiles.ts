import { Router } from 'express';
import { getAllProfilesFromDb, getProfileById } from '@/controllers/profiles.controller';

export const profilesRouter = Router();

profilesRouter.get('/', getAllProfilesFromDb);
profilesRouter.get('/:id', getProfileById);
