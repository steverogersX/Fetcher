import { drizzle } from 'drizzle-orm/mysql2';
import { migrate } from 'drizzle-orm/mysql2/migrator';
import mysql from 'mysql2/promise';
import { env } from '@/config/env';
import * as schema from './schema';

const pool = mysql.createPool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
});

export const db = drizzle(pool, { schema, mode: 'default' });

export async function runMigrations(): Promise<void> {
  await migrate(db, { migrationsFolder: './drizzle' });
}
