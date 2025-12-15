/**
 * Database connection and operation constants
 */

/**
 * Database connection status values
 */
export enum DatabaseStatus {
  CONNECTED = "connected",
  DISCONNECTED = "disconnected",
  CONNECTING = "connecting",
  ERROR = "error",
  IDLE = "idle",
}

/**
 * Connection configuration
 */
export const DB_CONNECTION = {
  /** Connection timeout in milliseconds */
  TIMEOUT: 5000,

  /** Maximum connection pool size */
  MAX_POOL_SIZE: 10,

  /** Minimum connection pool size */
  MIN_POOL_SIZE: 2,

  /** Connection idle timeout */
  IDLE_TIMEOUT: 30000,

  /** Maximum number of connection retries */
  MAX_RETRIES: 3,

  /** Delay between retries in milliseconds */
  RETRY_DELAY: 1000,
} as const;

/**
 * Query configuration
 */
export const DB_QUERY = {
  /** Health check query */
  HEALTH_CHECK: "SELECT 1",

  /** Default query timeout in milliseconds */
  DEFAULT_TIMEOUT: 30000,

  /** Slow query threshold in milliseconds */
  SLOW_QUERY_THRESHOLD: 1000,

  /** Maximum query execution time */
  MAX_EXECUTION_TIME: 60000,
} as const;

/**
 * Transaction configuration
 */
export const DB_TRANSACTION = {
  /** Default transaction timeout */
  DEFAULT_TIMEOUT: 30000,

  /** Maximum transaction timeout */
  MAX_TIMEOUT: 60000,

  /** Transaction isolation levels */
  ISOLATION_LEVELS: {
    READ_UNCOMMITTED: "ReadUncommitted",
    READ_COMMITTED: "ReadCommitted",
    REPEATABLE_READ: "RepeatableRead",
    SERIALIZABLE: "Serializable",
  },
} as const;

/**
 * Prisma-specific constants
 */
export const PRISMA_CONFIG = {
  /** Log levels to enable */
  LOG_LEVELS: ["query", "info", "warn", "error"] as const,

  /** Log queries slower than this threshold */
  LOG_SLOW_QUERIES_MS: 1000,

  /** Error message prefixes */
  ERROR_PREFIXES: {
    UNIQUE_CONSTRAINT: "Unique constraint failed",
    FOREIGN_KEY: "Foreign key constraint failed",
    NOT_FOUND: "Record to update not found",
  },
} as const;
