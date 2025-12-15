import { z } from "zod";

/**
 * Cache Configuration Schema
 *
 * Defines and validates Redis connection settings and cache TTL values.
 * TTL values are in milliseconds.
 */
export const CacheConfigSchema = z.object({
  /**
   * Redis connection settings
   */
  redis: z.object({
    /**
     * Redis host
     * @default 'localhost'
     */
    host: z.string().default("localhost"),

    /**
     * Redis port (1-65535)
     * @default 6379
     */
    port: z.coerce.number().int().min(1).max(65535).default(6379),

    /**
     * Redis password (optional)
     */
    password: z.string().optional(),

    /**
     * Redis database number (0-15 typically)
     * @default 0
     */
    db: z.coerce.number().int().min(0).default(0),
  }),

  /**
   * Cache Time-To-Live values (in milliseconds)
   */
  ttl: z.object({
    /**
     * Very short cache duration (30 seconds)
     * @default 30000
     */
    veryShort: z.coerce.number().int().min(0).default(30_000),

    /**
     * Short cache duration (1 minute)
     * @default 60000
     */
    short: z.coerce.number().int().min(0).default(60_000),

    /**
     * Medium cache duration (5 minutes)
     * @default 300000
     */
    medium: z.coerce.number().int().min(0).default(300_000),

    /**
     * Long cache duration (15 minutes)
     * @default 900000
     */
    long: z.coerce.number().int().min(0).default(900_000),

    /**
     * Very long cache duration (30 minutes)
     * @default 1800000
     */
    veryLong: z.coerce.number().int().min(0).default(1_800_000),

    /**
     * Hour cache duration (1 hour)
     * @default 3600000
     */
    hour: z.coerce.number().int().min(0).default(3_600_000),

    /**
     * Day cache duration (24 hours)
     * @default 86400000
     */
    day: z.coerce.number().int().min(0).default(86_400_000),
  }),
});

/**
 * Type-safe Cache Configuration
 * Inferred from CacheConfigSchema
 */
export type CacheConfig = z.infer<typeof CacheConfigSchema>;
