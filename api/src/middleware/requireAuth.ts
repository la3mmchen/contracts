// api/src/middleware/requireAuth.ts

import { Request, Response, NextFunction } from 'express';
import {
  isAuthEnabled,
  verifyToken,
  verifyApiToken,
  parseSessionCookie,
} from '../services/authService';

/**
 * Extract a machine-client API token from the request.
 *
 * Supports either `Authorization: Bearer <token>` or the `X-API-Key` header.
 */
const extractApiToken = (req: Request): string | undefined => {
  const authHeader = req.headers.authorization;
  if (authHeader && /^Bearer\s+/i.test(authHeader)) {
    return authHeader.replace(/^Bearer\s+/i, '').trim();
  }
  const apiKey = req.headers['x-api-key'];
  if (typeof apiKey === 'string' && apiKey.length > 0) {
    return apiKey.trim();
  }
  return undefined;
};

/**
 * Protects routes with either a shared-password session cookie (browser) or a
 * machine-client API token (automation).
 *
 * When APP_PASSWORD is not configured, auth is disabled and requests pass
 * through unchanged (backwards compatible with reverse-proxy basic-auth and
 * local development).
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!isAuthEnabled()) {
    return next();
  }

  // Machine clients: Authorization: Bearer <token> or X-API-Key.
  const apiToken = extractApiToken(req);
  if (apiToken && verifyApiToken(apiToken)) {
    return next();
  }

  // Browser clients: signed session cookie.
  const token = parseSessionCookie(req.headers.cookie);
  if (verifyToken(token)) {
    return next();
  }

  return res.status(401).json({ error: 'Authentication required' });
};
