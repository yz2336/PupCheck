type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export function checkRateLimit(
  key: string,
  maxPerDay: number
): { ok: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const existing = buckets.get(key);

  if (!existing || existing.resetAt < now) {
    const fresh = { count: 1, resetAt: now + dayMs };
    buckets.set(key, fresh);
    return { ok: true, remaining: maxPerDay - 1, resetAt: fresh.resetAt };
  }

  if (existing.count >= maxPerDay) {
    return { ok: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return {
    ok: true,
    remaining: maxPerDay - existing.count,
    resetAt: existing.resetAt,
  };
}
