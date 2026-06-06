import { createApp } from '@/app';
import { env } from '@/config/env';
import { runMigrations } from '@/db';
import { logger } from '@/utils/logger';

process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'Uncaught exception');
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.fatal({ reason }, 'Unhandled rejection');
  process.exit(1);
});

async function bootstrap(): Promise<void> {
  logger.info('Running database migrations');
  await runMigrations();
  logger.info('Database migrations complete');

  const app = createApp();

  const server = app.listen(env.PORT, env.HOST, () => {
    logger.info({ port: env.PORT, host: env.HOST, env: env.NODE_ENV }, 'Server started');
  });

  function shutdown(signal: string): void {
    logger.info({ signal }, 'Shutdown signal received');

    server.close((err) => {
      if (err != null) {
        logger.error({ err }, 'Error during server close');
        process.exit(1);
      }
      logger.info('Server closed gracefully');
      process.exit(0);
    });

    setTimeout(() => {
      logger.warn('Forced shutdown after timeout');
      process.exit(1);
    }, 10_000).unref();
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((err) => {
  logger.fatal({ err }, 'Server failed to start');
  process.exit(1);
});
