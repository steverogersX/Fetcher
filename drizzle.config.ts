import { defineConfig } from 'drizzle-kit';
import { env } from './src/config/env';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'mysql',
  dbCredentials: env.MYSQL_URL
    ? { url: env.MYSQL_URL }
    : {
        host: env.DB_HOST,
        port: env.DB_PORT,
        user: env.DB_USER,
        password: env.DB_PASSWORD,
        database: env.DB_NAME,
      },
});
