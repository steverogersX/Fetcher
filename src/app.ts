import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import { env } from '@/config/env';
import { requestId } from '@/middleware/requestId';
import { httpLogger } from '@/middleware/httpLogger';
import { rateLimiter } from '@/middleware/rateLimiter';
import { errorHandler, notFoundHandler } from '@/middleware/errorHandler';
import { healthRouter } from '@/routes/health';
import { itemsRouter } from '@/routes/items';
import { profilesRouter } from '@/routes/profiles';
import { docsRouter } from '@/routes/docs';

export function createApp(): express.Application {
  const app = express();

  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  app.use(requestId);
  app.use(httpLogger);
  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGINS === '*' ? '*' : env.CORS_ORIGINS.split(','),
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
    }),
  );
  app.use(compression());
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));
  app.use(rateLimiter);

  app.use('/health', healthRouter);
  app.use('/api/v1/items', itemsRouter);
  app.use('/api/v1/profiles', profilesRouter);
  app.use('/docs', docsRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
