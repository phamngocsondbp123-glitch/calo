import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({ message: 'Validation failed', issues: err.flatten() });
  }

  if (err instanceof HttpError) {
    return res.status(err.status).json({ message: err.message });
  }

  const message = err instanceof Error ? err.message : 'Unexpected server error';
  return res.status(500).json({ message });
}
