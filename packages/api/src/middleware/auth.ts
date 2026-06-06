import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { HttpError } from '../utils/http.js';

declare global { namespace Express { interface Request { user?: { id: string; role: 'user' | 'admin' } } } }

export function signToken(payload: { id: string; role: 'user' | 'admin' }) { return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn } as jwt.SignOptions); }
export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return next(new HttpError(401, 'Authentication required'));
  try { req.user = jwt.verify(header.slice(7), env.jwtSecret) as { id: string; role: 'user' | 'admin' }; next(); } catch { next(new HttpError(401, 'Invalid or expired token')); }
}
export function requireAdmin(req: Request, _res: Response, next: NextFunction) { if (req.user?.role !== 'admin') return next(new HttpError(403, 'Admin access required')); next(); }
