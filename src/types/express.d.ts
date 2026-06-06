import type { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      id: string;
    }
  }
}

export type TypedRequest<
  P = Record<string, string>,
  ResBody = unknown,
  ReqBody = unknown,
  Q = Record<string, string>,
> = Request<P, ResBody, ReqBody, Q>;
