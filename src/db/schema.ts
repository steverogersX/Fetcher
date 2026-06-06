import { int, mysqlTable, varchar, text, timestamp } from 'drizzle-orm/mysql-core';

export const githubProfiles = mysqlTable('github_profiles', {
  githubId: int('github_id').primaryKey(),
  login: varchar('login', { length: 39 }).notNull().unique(),
  avatarUrl: varchar('avatar_url', { length: 500 }).notNull(),
  htmlUrl: varchar('html_url', { length: 500 }).notNull(),
  name: varchar('name', { length: 255 }),
  company: varchar('company', { length: 255 }),
  blog: varchar('blog', { length: 500 }),
  location: varchar('location', { length: 255 }),
  bio: text('bio'),
  email: varchar('email', { length: 254 }),
  publicRepos: int('public_repos').notNull().default(0),
  publicGists: int('public_gists').notNull().default(0),
  followers: int('followers').notNull().default(0),
  following: int('following').notNull().default(0),
  githubCreatedAt: timestamp('github_created_at').notNull(),
  githubUpdatedAt: timestamp('github_updated_at').notNull(),
  fetchedAt: timestamp('fetched_at').notNull().defaultNow(),
});

export type GithubProfileInsert = typeof githubProfiles.$inferInsert;
export type GithubProfileSelect = typeof githubProfiles.$inferSelect;
