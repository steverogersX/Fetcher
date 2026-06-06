import { Octokit } from 'octokit';
import { env } from '@/config/env';

export const octokit = new Octokit(env.GITHUB_TOKEN != null ? { auth: env.GITHUB_TOKEN } : {});
