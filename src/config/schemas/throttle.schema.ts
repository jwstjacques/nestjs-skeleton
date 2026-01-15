import { z } from "zod";

/**
 * Throttle (Rate Limiting) Configuration Schema
 *
 * Defines and validates rate limiting settings for different durations.
 * Each throttle tier has a TTL (time window) and limit (max requests).
 *
 * TTL values are in milliseconds.
 */
export const ThrottleConfigSchema = z.object({
  /**
   * Short-term rate limiting (for frequent endpoints)
   */
  short: z.object({
    /**
     * Time window in milliseconds
     * @default 1000 (1 second)
     */
    ttl: z.coerce.number().int().min(0).default(1000),

    /**
     * Maximum requests per time window
     * @default 10
     */
    limit: z.coerce.number().int().min(0).default(10),
  }),

  /**
   * Medium-term rate limiting (for standard endpoints)
   */
  medium: z.object({
    /**
     * Time window in milliseconds
     * @default 10000 (10 seconds)
     */
    ttl: z.coerce.number().int().min(0).default(10_000),

    /**
     * Maximum requests per time window
     * @default 20
     */
    limit: z.coerce.number().int().min(0).default(20),
  }),

  /**
   * Long-term rate limiting (for resource-intensive endpoints)
   */
  long: z.object({
    /**
     * Time window in milliseconds
     * @default 60000 (1 minute)
     */
    ttl: z.coerce.number().int().min(0).default(60_000),

    /**
     * Maximum requests per time window
     * @default 100
     */
    limit: z.coerce.number().int().min(0).default(100),
  }),

  /**
   * Strict rate limiting (for sensitive endpoints like login)
   */
  strict: z.object({
    /**
     * Time window in milliseconds
     * @default 900000 (15 minutes)
     */
    ttl: z.coerce.number().int().min(0).default(900_000),

    /**
     * Maximum requests per time window
     * @default 5
     */
    limit: z.coerce.number().int().min(0).default(5),
  }),
});

/**
 * Type-safe Throttle Configuration
 * Inferred from ThrottleConfigSchema
 */
export type ThrottleConfig = z.infer<typeof ThrottleConfigSchema>;
