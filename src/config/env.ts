import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  HOST: z.string().default('0.0.0.0'),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(15 * 60 * 1000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
  CORS_ORIGINS: z.string().default('*'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  GITHUB_TOKEN: z.string().min(1).optional(),
  // Production (Railway): set MYSQL_URL and the individual DB_* vars are ignored
  MYSQL_URL: z.string().url().optional(),
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.coerce.number().int().positive().default(3306),
  DB_USER: z.string().default('fetcher'),
  DB_PASSWORD: z.string().default('fetcher'),
  DB_NAME: z.string().default('fetcher'),
});

export type Env = z.infer<typeof envSchema>;

function parseEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const formatted = result.error.format();
    console.error('Invalid environment variables:', JSON.stringify(formatted, null, 2));
    process.exit(1);
  }

  return result.data;
}

export const env = parseEnv();
