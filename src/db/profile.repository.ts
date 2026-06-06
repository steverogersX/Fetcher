import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { githubProfiles, type GithubProfileInsert, type GithubProfileSelect } from '@/db/schema';
import type { GithubProfile } from '@/types/github';

function toInsert(profile: GithubProfile): GithubProfileInsert {
  return {
    githubId: profile.id,
    login: profile.login,
    avatarUrl: profile.avatarUrl,
    htmlUrl: profile.htmlUrl,
    name: profile.name,
    company: profile.company,
    blog: profile.blog,
    location: profile.location,
    bio: profile.bio,
    email: profile.email,
    publicRepos: profile.publicRepos,
    publicGists: profile.publicGists,
    followers: profile.followers,
    following: profile.following,
    githubCreatedAt: new Date(profile.createdAt),
    githubUpdatedAt: new Date(profile.updatedAt),
  };
}

export async function upsertProfile(profile: GithubProfile): Promise<void> {
  const values = toInsert(profile);
  const { githubId: _pk, ...updateValues } = values;

  await db
    .insert(githubProfiles)
    .values(values)
    .onDuplicateKeyUpdate({ set: { ...updateValues, fetchedAt: new Date() } });
}

export async function findAllProfiles(): Promise<GithubProfileSelect[]> {
  return db.select().from(githubProfiles).orderBy(githubProfiles.login);
}

export async function findProfileByLogin(login: string): Promise<GithubProfileSelect | null> {
  const rows = await db
    .select()
    .from(githubProfiles)
    .where(eq(githubProfiles.login, login))
    .limit(1);

  return rows[0] ?? null;
}
