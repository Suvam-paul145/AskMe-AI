/**
 * AskMe AI — Lightweight IP Rate Limiter
 * Provides sliding-window burst control per client IP to prevent DoS scraping.
 */

interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Clean up stale IP records every 5 minutes to prevent memory leaks in persisted runtime environments
if (typeof global !== "undefined") {
  const globalWithInterval = global as typeof globalThis & { rateLimitCleanupInterval?: NodeJS.Timeout };
  if (!globalWithInterval.rateLimitCleanupInterval) {
    globalWithInterval.rateLimitCleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [ip, record] of rateLimitStore.entries()) {
        const activeTimestamps = record.timestamps.filter((t) => now - t < 60000);
        if (activeTimestamps.length === 0) {
          rateLimitStore.delete(ip);
        } else {
          record.timestamps = activeTimestamps;
        }
      }
    }, 300000); // 5 minutes
  }
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Enforce rate limits on incoming API requests based on IP address
 * @param ip Client IP address
 * @param limit Max allowed requests within window
 * @param windowMs Window duration in milliseconds (default: 60000ms / 1 min)
 */
export function rateLimit(
  ip: string,
  limit: number,
  windowMs: number = 60000
): RateLimitResult {
  const now = Date.now();
  const cleanIp = ip.trim() || "anonymous";

  let record = rateLimitStore.get(cleanIp);
  if (!record) {
    record = { timestamps: [] };
    rateLimitStore.set(cleanIp, record);
  }

  // Filter out timestamps outside the sliding window
  record.timestamps = record.timestamps.filter((t) => now - t < windowMs);

  if (record.timestamps.length >= limit) {
    const oldestTimestamp = record.timestamps[0];
    const timeUntilReset = oldestTimestamp ? Math.max(0, windowMs - (now - oldestTimestamp)) : windowMs;
    return {
      success: false,
      limit,
      remaining: 0,
      reset: Math.ceil(timeUntilReset / 1000), // in seconds
    };
  }

  record.timestamps.push(now);
  return {
    success: true,
    limit,
    remaining: limit - record.timestamps.length,
    reset: Math.ceil(windowMs / 1000),
  };
}
