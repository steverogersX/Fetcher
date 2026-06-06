import { z } from 'zod';

export const githubProfileSchema = z.object({
  login: z.string(),
  id: z.number().int().positive(),
  avatarUrl: z.string().url(),
  htmlUrl: z.string().url(),
  name: z.string().nullable(),
  company: z.string().nullable(),
  blog: z.string().nullable(),
  location: z.string().nullable(),
  bio: z.string().nullable(),
  email: z.email().nullable(),
  publicRepos: z.number().int().nonnegative(),
  publicGists: z.number().int().nonnegative(),
  followers: z.number().int().nonnegative(),
  following: z.number().int().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type GithubProfile = z.infer<typeof githubProfileSchema>;
