import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { sendSuccess } from '@/utils/response';
import { AppError } from '@/middleware/errorHandler';

export const itemsRouter = Router();

const createItemSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});

type Item = {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
};

const store = new Map<string, Item>();

itemsRouter.get('/', (_req: Request, res: Response): void => {
  sendSuccess(res, { items: Array.from(store.values()) });
});

itemsRouter.get('/:id', (req: Request<{ id: string }>, res: Response): void => {
  const item = store.get(req.params.id);
  if (item == null) {
    throw new AppError('Item not found', 404, 'NOT_FOUND');
  }
  sendSuccess(res, item);
});

itemsRouter.post(
  '/',
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      const body = createItemSchema.parse(req.body);
      const item: Item = {
        id: crypto.randomUUID(),
        name: body.name,
        ...(body.description != null && { description: body.description }),
        createdAt: new Date().toISOString(),
      };
      store.set(item.id, item);
      sendSuccess(res, item, 201);
    } catch (err) {
      next(err);
    }
  },
);

itemsRouter.delete('/:id', (req: Request<{ id: string }>, res: Response): void => {
  if (!store.has(req.params.id)) {
    throw new AppError('Item not found', 404, 'NOT_FOUND');
  }
  store.delete(req.params.id);
  sendSuccess(res, null, 204);
});
