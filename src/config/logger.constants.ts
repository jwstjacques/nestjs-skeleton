import * as path from "path";
import { LogLevel, LogLevelUtil } from "../common/enums";

/**
 * Logger Configuration Constants
 *
 * These constants define the logging behavior including file rotation,
 * directory paths, and timestamp formatting.
 */

/**
 * Directory where log files will be stored
 * @default "logs" directory in project root
 */
export const LOG_DIR = process.env.LOG_DIR || path.join(process.cwd(), "logs");

/**
 * Maximum size of a single log file in bytes before rotation
 * @default 10485760 (10MB)
 */
export const LOG_FILE_MAX_SIZE = parseInt(process.env.LOG_FILE_MAX_SIZE || "10485760", 10);

/**
 * Maximum number of log files to retain during rotation
 * Older files are automatically deleted
 * @default 5
 */
export const LOG_FILE_MAX_FILES = parseInt(process.env.LOG_FILE_MAX_FILES || "5", 10);

/**
 * Timestamp format used in log entries
 * @default "YYYY-MM-DD HH:mm:ss"
 */
export const LOG_TIMESTAMP_FORMAT = process.env.LOG_TIMESTAMP_FORMAT || "YYYY-MM-DD HH:mm:ss";

/**
 * Log level for the application
 * Uses LogLevelUtil to validate and provide safe defaults
 * @default LogLevel.INFO
 */
export const APP_LOG_LEVEL: LogLevel = LogLevelUtil.fromEnv(process.env.LOG_LEVEL, LogLevel.INFO);
