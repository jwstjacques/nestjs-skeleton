/**
 * Log Level Enum
 *
 * Defines the available log levels for Winston logger.
 * Aligned with Winston's default log levels (NPM standard).
 */
export enum LogLevel {
  /** Fatal errors that may cause application to crash */
  ERROR = "error",

  /** Warning messages for potentially harmful situations */
  WARN = "warn",

  /** General informational messages about application flow */
  INFO = "info",

  /** HTTP request/response logging */
  HTTP = "http",

  /** Detailed debugging information */
  VERBOSE = "verbose",

  /** Fine-grained debugging information */
  DEBUG = "debug",

  /** Most detailed logging (includes all messages) */
  SILLY = "silly",
}

/**
 * Utility class for log level operations
 */
export class LogLevelUtil {
  /**
   * Valid log level values for validation
   */
  private static readonly VALID_LEVELS = new Set([
    "error",
    "warn",
    "info",
    "http",
    "verbose",
    "debug",
    "silly",
  ]);

  /**
   * Check if a string is a valid log level
   *
   * @param level - The string to check
   * @returns True if the string is a valid log level
   */
  static isValidLevel(level: string): boolean {
    return this.VALID_LEVELS.has(level.toLowerCase());
  }

  /**
   * Get log level from environment variable with validation
   *
   * @param envValue - The environment variable value
   * @param defaultLevel - The default level to use if invalid
   * @returns A valid log level
   */
  static fromEnv(envValue: string | undefined, defaultLevel: LogLevel = LogLevel.INFO): LogLevel {
    if (!envValue) {
      return defaultLevel;
    }

    const normalizedValue = envValue.toLowerCase();

    if (this.isValidLevel(normalizedValue)) {
      return normalizedValue as LogLevel;
    }

    console.warn(
      `Invalid log level "${envValue}". Using default "${defaultLevel}". Valid levels: error, warn, info, http, verbose, debug, silly`,
    );

    return defaultLevel;
  }
}
