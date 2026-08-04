// Rate limiting for login attempts.
//
// PRODUCTION WARNING: the in-memory fallback below is NOT safe to rely on
// as your only defense on Vercel or any serverless host. Each serverless
// instance has its own memory, so:
//   - A cold start wipes the counters (a fresh instance = fresh limits).
//   - Under real traffic, multiple instances run concurrently, each with
//     its own counter — an attacker effectively gets maxAttempts PER
//     instance, not maxAttempts total.
// For a single-admin site with low traffic this is still a real deterrent
// against a lone casual attacker, but treat it as a basic safeguard, not
// a production guarantee.
//
// PERSISTENT PRODUCTION OPTION (recommended once this is live): set
// UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN (free tier at
// upstash.com, no credit card required) and this file automatically
// switches to using Upstash's Redis over REST — a real shared counter
// every instance reads/writes, so the limit is enforced correctly no
// matter how many instances Vercel spins up. No new npm package needed;
// it's plain fetch() calls to Upstash's REST API. If those two env vars
// aren't set, this silently falls back to the in-memory version above.

type RateLimitResult = { allowed: boolean; retryAfterSeconds?: number };

const memoryStore = new Map<string, { count: number; resetAt: number }>();

function checkRateLimitInMemory(
  key: string,
  maxAttempts: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const entry = memoryStore.get(key);

  if (!entry || now > entry.resetAt) {
    memoryStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (entry.count >= maxAttempts) {
    return { allowed: false, retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000) };
  }

  entry.count += 1;
  return { allowed: true };
}

async function checkRateLimitUpstash(
  key: string,
  maxAttempts: number,
  windowMs: number,
  url: string,
  token: string
): Promise<RateLimitResult> {
  const windowSeconds = Math.ceil(windowMs / 1000);
  const headers = { Authorization: `Bearer ${token}` };

  const incrRes = await fetch(`${url}/incr/${encodeURIComponent(key)}`, { headers });
  if (!incrRes.ok) throw new Error(`Upstash INCR failed: ${incrRes.status}`);
  const { result: count } = (await incrRes.json()) as { result: number };

  if (count === 1) {
    // First hit for this key — start the expiry window. If this call fails,
    // the key just never expires until Upstash's own eviction; not ideal,
    // but it fails safe (over-blocking, never under-blocking).
    await fetch(`${url}/expire/${encodeURIComponent(key)}/${windowSeconds}`, { headers }).catch(
      () => undefined
    );
  }

  if (count > maxAttempts) {
    const ttlRes = await fetch(`${url}/ttl/${encodeURIComponent(key)}`, { headers });
    const { result: ttl } = ttlRes.ok
      ? ((await ttlRes.json()) as { result: number })
      : { result: windowSeconds };
    return { allowed: false, retryAfterSeconds: ttl > 0 ? ttl : windowSeconds };
  }

  return { allowed: true };
}

export async function checkRateLimit(
  key: string,
  maxAttempts: number,
  windowMs: number
): Promise<RateLimitResult> {
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (upstashUrl && upstashToken) {
    try {
      return await checkRateLimitUpstash(key, maxAttempts, windowMs, upstashUrl, upstashToken);
    } catch {
      // If Upstash is unreachable, fail over to the in-memory limiter rather
      // than letting the error block logins entirely.
      return checkRateLimitInMemory(key, maxAttempts, windowMs);
    }
  }

  return checkRateLimitInMemory(key, maxAttempts, windowMs);
}