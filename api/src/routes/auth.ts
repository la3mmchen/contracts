// api/src/routes/auth.ts

import { Router, Request, Response } from 'express';
import {
  isAuthEnabled,
  verifyPassword,
  createToken,
  verifyToken,
  parseSessionCookie,
  buildSessionCookie,
  buildClearSessionCookie,
} from '../services/authService';

export const authRoutes = Router();

// GET /api/auth/status - Report whether auth is enabled and the caller is authenticated
authRoutes.get('/status', (req: Request, res: Response) => {
  const enabled = isAuthEnabled();
  if (!enabled) {
    return res.json({ authEnabled: false, authenticated: true });
  }
  const token = parseSessionCookie(req.headers.cookie);
  return res.json({ authEnabled: true, authenticated: verifyToken(token) });
});

// POST /api/auth/login - Exchange the shared password for a session cookie
authRoutes.post('/login', (req: Request, res: Response) => {
  if (!isAuthEnabled()) {
    // Nothing to log into; treat as already authenticated.
    return res.json({ authenticated: true, authEnabled: false });
  }

  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  if (!password || !verifyPassword(password)) {
    return res.status(401).json({ error: 'Invalid password' });
  }

  const token = createToken();
  res.setHeader('Set-Cookie', buildSessionCookie(token));
  return res.json({ authenticated: true, authEnabled: true });
});

// POST /api/auth/logout - Clear the session cookie
authRoutes.post('/logout', (req: Request, res: Response) => {
  res.setHeader('Set-Cookie', buildClearSessionCookie());
  return res.json({ authenticated: false });
});
