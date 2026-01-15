/**
 * Cache TTL (Time To Live) Constants
 *
 * Defines standard cache duration values in milliseconds.
 * These are static values that don't change based on environment.
 *
 * @module config/constants
 */

/**
 * Cache TTL (Time To Live) configurations in milliseconds
 *
 * These values define standard cache durations used throughout the application.
 * Actual cache TTL can be configured via environment variables in cache.config.ts
 */
export enum CacheTTL {
  /** 30 seconds - For frequently changing data */
  VERY_SHORT = 30_000,

  /** 1 minute - For dynamic lists */
  SHORT = 60_000,

  /** 5 minutes - For semi-static data */
  MEDIUM = 300_000,

  /** 15 minutes - For relatively stable data */
  LONG = 900_000,

  /** 30 minutes - For stats and aggregations */
  VERY_LONG = 1_800_000,

  /** 1 hour - For rarely changing data */
  HOUR = 3_600_000,

  /** 1 day - For static data */
  DAY = 86_400_000,
}
