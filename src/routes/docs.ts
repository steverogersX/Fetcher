import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import { openApiSpec } from '@/docs/openapi';

export const docsRouter = Router();

docsRouter.use('/', swaggerUi.serve);
docsRouter.get('/', swaggerUi.setup(openApiSpec));
