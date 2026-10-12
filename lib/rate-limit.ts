interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 60; // per IP per window

// Prevent unbounded growth in long-lived processes.
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt < now) buckets.delete(key);
  }
}, WINDOW_MS).unref?.();

/**
 * Simple in-memory fixed-window rate limiter (~60 req/min/IP).
 * Returns true when the request is allowed, false when it should be rejected.
 */
export function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const bucket = buckets.get(ip);

  if (!bucket || bucket.resetAt < now) {
    buckets.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  bucket.count += 1;
  return bucket.count > MAX_REQUESTS;
}

export function rateLimitHeaders(): HeadersInit {
  return { "X-RateLimit-Limit": String(MAX_REQUESTS) };
}
