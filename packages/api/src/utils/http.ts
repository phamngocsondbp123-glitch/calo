import type { Request, Response, NextFunction } from 'express';
import { ZodError, type ZodSchema } from 'zod';

export class HttpError extends Error { constructor(public status: number, message: string) { super(message); } }
export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) => (req: Request, res: Response, next: NextFunction) => void fn(req, res, next).catch(next);
export function validate<T>(schema: ZodSchema<T>, data: unknown): T { return schema.parse(data); }
export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (error instanceof ZodError) return res.status(422).json({ message: 'Validation failed', issues: error.flatten() });
  if (error instanceof HttpError) return res.status(error.status).json({ message: error.message });
  console.error(error);
  return res.status(500).json({ message: 'Internal server error' });
}
