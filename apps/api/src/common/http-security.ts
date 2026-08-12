import type { NextFunction, Request, Response } from 'express';

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const DEFAULT_CORS_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://equiprent.me:3000',
  'http://equiprent.me:3001',
];

export function getCorsOrigins(): string[] {
  const configuredOrigins =
    process.env.CORS_ORIGINS ?? process.env.FRONTEND_URL;

  if (!configuredOrigins) {
    return DEFAULT_CORS_ORIGINS;
  }

  return configuredOrigins
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export function securityHeaders(
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()',
  );
  next();
}

export function createRateLimitMiddleware() {
  const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60_000);
  const maxRequests = Number(process.env.RATE_LIMIT_MAX ?? 300);
  const clients = new Map<string, RateLimitEntry>();

  return (req: Request, res: Response, next: NextFunction): void => {
    if (req.method === 'OPTIONS') {
      next();
      return;
    }

    const now = Date.now();
    const key = getClientKey(req);
    const entry = clients.get(key);

    if (!entry || entry.resetAt <= now) {
      clients.set(key, {
        count: 1,
        resetAt: now + windowMs,
      });
      next();
      return;
    }

    entry.count += 1;

    if (entry.count > maxRequests) {
      const retryAfterSeconds = Math.ceil((entry.resetAt - now) / 1000);
      res.setHeader('Retry-After', retryAfterSeconds.toString());
      res.status(429).json({
        message: 'Too many requests, please try again later',
        statusCode: 429,
      });
      return;
    }

    next();
  };
}

function getClientKey(req: Request): string {
  const forwardedFor = req.headers['x-forwarded-for'];

  if (typeof forwardedFor === 'string') {
    return forwardedFor.split(',')[0]?.trim() || req.ip || 'unknown';
  }

  return req.ip || req.socket.remoteAddress || 'unknown';
}
