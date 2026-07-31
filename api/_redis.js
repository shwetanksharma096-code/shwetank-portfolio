/**
 * Shared Redis client singleton for all API route handlers.
 * Import `getRedis` in each handler instead of duplicating the connection logic.
 */
import Redis from 'ioredis';

let redis;

export function getRedis() {
  if (!redis && process.env.REDIS_URL) {
    redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      connectTimeout: 10000,
    });
  }
  return redis;
}

/** Default admin password used as fallback when none is stored in Redis yet */
export const DEFAULT_ADMIN_PASSWORD = 'shwetank@2024';
