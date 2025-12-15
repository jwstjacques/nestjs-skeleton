import { registerAs } from "@nestjs/config";
import { CacheConfigSchema } from "../schemas/cache.schema";

/**
 * Cache Configuration Provider
 *
 * Loads and validates Redis connection and cache TTL settings from environment variables.
 * Uses Zod schema for runtime validation and type safety.
 *
 * Environment Variables:
 * - REDIS_HOST: Redis server host
 * - REDIS_PORT: Redis server port
 * - REDIS_PASSWORD: Redis authentication password (optional)
 * - REDIS_DB: Redis database number
 * - CACHE_TTL_VERY_SHORT: Very short cache duration (ms)
 * - CACHE_TTL_SHORT: Short cache duration (ms)
 * - CACHE_TTL_MEDIUM: Medium cache duration (ms)
 * - CACHE_TTL_LONG: Long cache duration (ms)
 * - CACHE_TTL_VERY_LONG: Very long cache duration (ms)
 * - CACHE_TTL_HOUR: Hour cache duration (ms)
 * - CACHE_TTL_DAY: Day cache duration (ms)
 *
 * @returns Validated CacheConfig object
 */
export default registerAs("cache", () => {
  const config = {
    redis: {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      password: process.env.REDIS_PASSWORD,
      db: process.env.REDIS_DB,
    },
    ttl: {
      veryShort: process.env.CACHE_TTL_VERY_SHORT,
      short: process.env.CACHE_TTL_SHORT,
      medium: process.env.CACHE_TTL_MEDIUM,
      long: process.env.CACHE_TTL_LONG,
      veryLong: process.env.CACHE_TTL_VERY_LONG,
      hour: process.env.CACHE_TTL_HOUR,
      day: process.env.CACHE_TTL_DAY,
    },
  };

  // Validate and parse with Zod schema
  // Throws detailed error if validation fails
  return CacheConfigSchema.parse(config);
});
