import pinoHttp from 'pino-http';
import { logger } from '@/utils/logger';

export const httpLogger = pinoHttp({
  logger,
  genReqId: (req) => (req as Express.Request).id,
  customLogLevel(_req, res, err) {
    if (err != null || res.statusCode >= 500) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
  serializers: {
    req(req: { method: string; url: string; id: string }) {
      return { method: req.method, url: req.url, id: req.id };
    },
  },
});
