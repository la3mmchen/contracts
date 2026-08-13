// api/src/middleware/requireIngestAuth.ts

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import {
  isAuthEnabled,
  verifyToken,
  verifyApiToken,
  parseSessionCookie,
} from '../services/authService';

/**
 * Extract a machine-client token from `Authorization: Bearer <token>` or the
 * `X-API-Key` header. Mirrors the extraction logic in `requireAuth`.
 */
const extractToken = (req: Request): string | undefined => {
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

const timingSafeEqual = (a: string, b: string): boolean => {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) {
    crypto.timingSafeEqual(aBuf, aBuf);
    return false;
  }
  return crypto.timingSafeEqual(aBuf, bBuf);
};

/**
 * Verify a candidate token against the dedicated INGEST_TOKEN env var.
 *
 * INGEST_TOKEN is a purpose-scoped credential for the document-ingestion
 * webhook so it can be handed to external scanners/DMS (Paperless, Papra) and
 * rotated independently of the interactive login password (APP_PASSWORD) and
 * the general automation token (API_TOKEN).
 */
const verifyIngestToken = (candidate: string): boolean => {
  const expected = process.env.INGEST_TOKEN || '';
  if (!expected || !candidate) return false;
  return timingSafeEqual(candidate, expected);
};

/**
 * Protects the ingestion webhook.
 *
 * Accepts, in order:
 *   1. A dedicated INGEST_TOKEN (Bearer or X-API-Key)
 *   2. The general API_TOKEN (Bearer or X-API-Key)
 *   3. A valid browser session cookie
 *
 * When neither APP_PASSWORD, API_TOKEN nor INGEST_TOKEN is configured, auth is
 * disabled (consistent with the rest of the app / reverse-proxy setups).
 */
export const requireIngestAuth = (req: Request, res: Response, next: NextFunction) => {
  const hasIngestToken = Boolean(process.env.INGEST_TOKEN && process.env.INGEST_TOKEN.length > 0);

  // If nothing is configured at all, stay backwards-compatible and let it pass.
  if (!hasIngestToken && !isAuthEnabled()) {
    return next();
  }

  const token = extractToken(req);
  if (token && (verifyIngestToken(token) || verifyApiToken(token))) {
    return next();
  }

  // Fall back to a browser session (someone triggering it from the app).
  const sessionToken = parseSessionCookie(req.headers.cookie);
  if (verifyToken(sessionToken)) {
    return next();
  }

  return res.status(401).json({ error: 'Authentication required' });
};
