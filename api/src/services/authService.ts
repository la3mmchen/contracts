import crypto from 'crypto';

/**
 * Stateless, HMAC-signed session tokens for single-shared-password auth.
 *
 * A token is `base64url(payloadJson).base64url(hmacSha256(payload, secret))`.
 * No server-side session store is needed: validity is proven by the signature
 * and an embedded expiry timestamp.
 */

const COOKIE_NAME = 'contracts_session';
const DEFAULT_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

interface TokenPayload {
  // "subject" - fixed for shared-password auth, kept for future extensibility
  sub: string;
  // issued-at (seconds) and expiry (seconds), unix epoch
  iat: number;
  exp: number;
}

const base64url = (input: Buffer | string): string =>
  Buffer.from(input).toString('base64url');

const getSecret = (): string => {
  const secret = process.env.SESSION_SECRET;
  if (secret && secret.length > 0) {
    return secret;
  }
  // Fall back to the password so the app still works if only APP_PASSWORD is set.
  // Signing with the password means changing the password invalidates sessions.
  const password = process.env.APP_PASSWORD;
  if (password && password.length > 0) {
    return `derived:${password}`;
  }
  // Last-resort ephemeral secret (auth is disabled in this case anyway).
  return 'insecure-development-secret';
};

const sign = (payload: string): string =>
  crypto.createHmac('sha256', getSecret()).update(payload).digest('base64url');

/**
 * Auth is only enforced when APP_PASSWORD is configured. This keeps local
 * development and the demo build working without extra setup, and is
 * backwards-compatible with existing deployments that rely on reverse-proxy
 * basic-auth.
 */
export const isAuthEnabled = (): boolean =>
  Boolean(process.env.APP_PASSWORD && process.env.APP_PASSWORD.length > 0);

const timingSafeEqual = (a: string, b: string): boolean => {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) {
    // Compare against itself to keep timing roughly constant, then fail.
    crypto.timingSafeEqual(aBuf, aBuf);
    return false;
  }
  return crypto.timingSafeEqual(aBuf, bBuf);
};

/** Verify a submitted plaintext password against APP_PASSWORD. */
export const verifyPassword = (candidate: string): boolean => {
  const expected = process.env.APP_PASSWORD || '';
  if (!expected) return false;
  return timingSafeEqual(candidate, expected);
};

/**
 * Verify a machine-client API token against API_TOKEN.
 *
 * This is a separate credential from the interactive APP_PASSWORD so that
 * automation (backup cron, CI, scripts) can authenticate with a token that can
 * be rotated independently of the human login password. Sent as
 * `Authorization: Bearer <token>` or the `X-API-Key` header.
 */
export const verifyApiToken = (candidate: string): boolean => {
  const expected = process.env.API_TOKEN || '';
  if (!expected || !candidate) return false;
  return timingSafeEqual(candidate, expected);
};


/** Create a signed session token valid for maxAgeSeconds. */
export const createToken = (maxAgeSeconds: number = DEFAULT_MAX_AGE_SECONDS): string => {
  const now = Math.floor(Date.now() / 1000);
  const payload: TokenPayload = {
    sub: 'shared',
    iat: now,
    exp: now + maxAgeSeconds,
  };
  const encodedPayload = base64url(JSON.stringify(payload));
  const signature = sign(encodedPayload);
  return `${encodedPayload}.${signature}`;
};

/** Validate a token's signature and expiry. Returns true if valid. */
export const verifyToken = (token: string | undefined): boolean => {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [encodedPayload, signature] = parts;

  const expectedSignature = sign(encodedPayload);
  if (!timingSafeEqual(signature, expectedSignature)) return false;

  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, 'base64url').toString('utf8')
    ) as TokenPayload;
    const now = Math.floor(Date.now() / 1000);
    return typeof payload.exp === 'number' && payload.exp > now;
  } catch {
    return false;
  }
};

/** Read the session token from a Cookie header value. */
export const parseSessionCookie = (cookieHeader: string | undefined): string | undefined => {
  if (!cookieHeader) return undefined;
  const pairs = cookieHeader.split(';');
  for (const pair of pairs) {
    const index = pair.indexOf('=');
    if (index === -1) continue;
    const name = pair.slice(0, index).trim();
    if (name === COOKIE_NAME) {
      return decodeURIComponent(pair.slice(index + 1).trim());
    }
  }
  return undefined;
};

/** Build a Set-Cookie header string for a session token. */
export const buildSessionCookie = (
  token: string,
  maxAgeSeconds: number = DEFAULT_MAX_AGE_SECONDS
): string => {
  const attrs = [
    `${COOKIE_NAME}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${maxAgeSeconds}`,
  ];
  if (process.env.NODE_ENV === 'production') {
    attrs.push('Secure');
  }
  return attrs.join('; ');
};

/** Build a Set-Cookie header string that clears the session cookie. */
export const buildClearSessionCookie = (): string => {
  const attrs = [
    `${COOKIE_NAME}=`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=0',
  ];
  if (process.env.NODE_ENV === 'production') {
    attrs.push('Secure');
  }
  return attrs.join('; ');
};

export const SESSION_COOKIE_NAME = COOKIE_NAME;
