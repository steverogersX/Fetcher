import { fetchGithubProfile } from '@/services/github.service';
import { upsertProfile, findAllProfiles } from '@/db/profile.repository';
import { AppError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';
import type { GithubProfile } from '@/types/github';
import type { GithubProfileSelect } from '@/db/schema';

export async function listProfiles(): Promise<GithubProfileSelect[]> {
  try {
    return await findAllProfiles();
  } catch (err) {
    logger.error({ err }, 'Failed to fetch profiles from database');
    throw new AppError('Failed to retrieve profiles', 503, 'DB_READ_ERROR');
  }
}

export async function getAndSaveProfile(username: string): Promise<GithubProfile> {
  const profile = await fetchGithubProfile(username);

  try {
    await upsertProfile(profile);
    logger.info({ username, githubId: profile.id }, 'GitHub profile persisted');
  } catch (err) {
    logger.error({ username, githubId: profile.id, err }, 'Failed to persist GitHub profile');
    throw new AppError('Failed to persist profile data', 503, 'DB_WRITE_ERROR');
  }

  return profile;
}
