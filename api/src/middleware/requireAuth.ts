// api/src/middleware/requireAuth.ts

import { Request, Response, NextFunction } from 'express';
import { isAuthEnabled, verifyToken, parseSessionCookie } from '../services/authService';

/**
 * Protects routes with the shared-password session cookie.
 *
 * When APP_PASSWORD is not configured, auth is disabled and requests pass
 * through unchanged (backwards compatible with reverse-proxy basic-auth and
 * local development).
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!isAuthEnabled()) {
    return next();
  }

  const token = parseSessionCookie(req.headers.cookie);
  if (verifyToken(token)) {
    return next();
  }

  return res.status(401).json({ error: 'Authentication required' });
};
