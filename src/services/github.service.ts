import { z } from 'zod';
import { RequestError } from '@octokit/request-error';
import { octokit } from '@/lib/github';
import { AppError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';
import { githubProfileSchema, type GithubProfile } from '@/types/github';

export async function fetchGithubProfile(username: string): Promise<GithubProfile> {
  try {
    const { data } = await octokit.rest.users.getByUsername({ username });

    logger.info({ username, githubId: data.id }, 'GitHub profile fetched');

    const result = githubProfileSchema.safeParse({
      login: data.login,
      id: data.id,
      avatarUrl: data.avatar_url,
      htmlUrl: data.html_url,
      name: data.name ?? null,
      company: data.company ?? null,
      blog: data.blog ?? null,
      location: data.location ?? null,
      bio: data.bio ?? null,
      email: data.email ?? null,
      publicRepos: data.public_repos,
      publicGists: data.public_gists,
      followers: data.followers,
      following: data.following,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    });

    if (!result.success) {
      logger.error(
        { username, issues: z.prettifyError(result.error) },
        'GitHub response failed schema validation',
      );
      throw new AppError('Unexpected GitHub API response shape', 502, 'GITHUB_RESPONSE_INVALID');
    }

    return result.data;
  } catch (err) {
    if (err instanceof RequestError) {
      logger.warn({ username, status: err.status, message: err.message }, 'GitHub API error');

      if (err.status === 404) {
        throw new AppError(`GitHub user '${username}' not found`, 404, 'GITHUB_USER_NOT_FOUND');
      }

      if (err.status === 403 || err.status === 429) {
        const resetAt = err.response?.headers['x-ratelimit-reset'];
        const resetDate = resetAt != null ? new Date(Number(resetAt) * 1000).toISOString() : null;
        throw new AppError(
          `GitHub API rate limit exceeded${resetDate != null ? `. Resets at ${resetDate}` : ''}`,
          429,
          'GITHUB_RATE_LIMIT',
        );
      }

      if (err.status === 401) {
        throw new AppError('GitHub token is invalid or expired', 502, 'GITHUB_AUTH_ERROR');
      }

      if (err.status >= 500) {
        throw new AppError('GitHub API is unavailable', 502, 'GITHUB_UNAVAILABLE');
      }

      throw new AppError(`GitHub API error: ${err.message}`, 502, 'GITHUB_API_ERROR');
    }

    throw err;
  }
}
