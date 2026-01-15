import { registerAs } from "@nestjs/config";
import { ObservabilityConfigSchema } from "../schemas/observability.schema";

/**
 * Observability Configuration Provider
 *
 * Loads and validates logging and health check settings from environment variables.
 * Uses Zod schema for runtime validation and type safety.
 *
 * Environment Variables:
 * Logging:
 * - LOG_LEVEL: Logging level (error|warn|info|debug|verbose)
 * - LOG_DIR: Directory for log files
 * - LOG_FILE_MAX_SIZE: Maximum size of a log file in bytes
 * - LOG_FILE_MAX_FILES: Maximum number of log files to keep
 * - LOG_TIMESTAMP_FORMAT: Timestamp format for log entries
 * - LOG_APP_FILENAME: Application log filename
 * - LOG_ERROR_FILENAME: Error log filename
 *
 * Health:
 * - HEALTH_MEMORY_HEAP_MB: Memory heap threshold in MB
 * - HEALTH_MEMORY_RSS_MB: Memory RSS threshold in MB
 * - HEALTH_DISK_THRESHOLD: Disk usage threshold (0.0-1.0)
 * - HEALTH_DISK_PATH: Disk path to check
 *
 * @returns Validated ObservabilityConfig object
 */
export default registerAs("observability", () => {
  const config = {
    logging: {
      level: process.env.LOG_LEVEL,
      dir: process.env.LOG_DIR,
      fileMaxSize: process.env.LOG_FILE_MAX_SIZE,
      fileMaxFiles: process.env.LOG_FILE_MAX_FILES,
      timestampFormat: process.env.LOG_TIMESTAMP_FORMAT,
      appLogFilename: process.env.LOG_APP_FILENAME,
      errorLogFilename: process.env.LOG_ERROR_FILENAME,
    },
    health: {
      memoryHeapMB: process.env.HEALTH_MEMORY_HEAP_MB,
      memoryRssMB: process.env.HEALTH_MEMORY_RSS_MB,
      diskThreshold: process.env.HEALTH_DISK_THRESHOLD,
      diskPath: process.env.HEALTH_DISK_PATH,
    },
  };

  // Validate and parse with Zod schema
  // Throws detailed error if validation fails
  return ObservabilityConfigSchema.parse(config);
});
