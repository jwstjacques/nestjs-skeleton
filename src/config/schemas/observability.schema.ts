import { z } from "zod";

/**
 * Observability Configuration Schema
 *
 * Defines and validates observability settings including:
 * - Logging configuration
 * - Health check thresholds
 */
export const ObservabilityConfigSchema = z.object({
  /**
   * Logging configuration
   */
  logging: z.object({
    /**
     * Log level
     * @default 'info'
     */
    level: z.enum(["error", "warn", "info", "debug", "verbose"]).default("info"),

    /**
     * Log directory
     * @default 'logs'
     */
    dir: z.string().default("logs"),

    /**
     * Maximum size of a log file in bytes (10MB default)
     * @default 10485760
     */
    fileMaxSize: z.coerce.number().int().min(0).default(10_485_760),

    /**
     * Maximum number of log files to keep
     * @default 5
     */
    fileMaxFiles: z.coerce.number().int().min(1).default(5),

    /**
     * Timestamp format for log entries
     * @default 'YYYY-MM-DD HH:mm:ss'
     */
    timestampFormat: z.string().default("YYYY-MM-DD HH:mm:ss"),

    /**
     * Application log filename
     * @default 'application.log'
     */
    appLogFilename: z.string().default("application.log"),

    /**
     * Error log filename
     * @default 'error.log'
     */
    errorLogFilename: z.string().default("error.log"),
  }),

  /**
   * Health check thresholds
   */
  health: z.object({
    /**
     * Memory heap threshold in MB
     * @default 150
     */
    memoryHeapMB: z.coerce.number().int().min(0).default(150),

    /**
     * Memory RSS threshold in MB
     * @default 300
     */
    memoryRssMB: z.coerce.number().int().min(0).default(300),

    /**
     * Disk usage threshold (0.0 - 1.0, where 0.9 = 90% full)
     * @default 0.9
     */
    diskThreshold: z.coerce.number().min(0).max(1).default(0.9),

    /**
     * Disk path to check
     * @default '/'
     */
    diskPath: z.string().default("/"),
  }),
});

/**
 * Type-safe Observability Configuration
 * Inferred from ObservabilityConfigSchema
 */
export type ObservabilityConfig = z.infer<typeof ObservabilityConfigSchema>;
