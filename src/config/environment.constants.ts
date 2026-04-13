/**
 * Environment variable key constants
 * Central location for all env var names
 * Prevents typos and makes refactoring easier
 */

/**
 * Application environment variables
 */
export const ENV_KEYS = {
  // Application
  NODE_ENV: "NODE_ENV",
  PORT: "PORT",
  API_PREFIX: "API_PREFIX",

  // Database - PostgreSQL
  POSTGRES_USER: "POSTGRES_USER",
  POSTGRES_PASSWORD: "POSTGRES_PASSWORD",
  POSTGRES_DB: "POSTGRES_DB",
  POSTGRES_PORT: "POSTGRES_PORT",
  DATABASE_URL: "DATABASE_URL",

  // Redis Cache
  REDIS_HOST: "REDIS_HOST",
  REDIS_PORT: "REDIS_PORT",
  REDIS_PASSWORD: "REDIS_PASSWORD",

  // JWT Authentication
  JWT_SECRET: "JWT_SECRET",
  JWT_EXPIRES_IN: "JWT_EXPIRES_IN",
  JWT_REFRESH_SECRET: "JWT_REFRESH_SECRET",
  JWT_REFRESH_EXPIRES_IN: "JWT_REFRESH_EXPIRES_IN",

  // Pagination
  PAGINATION_DEFAULT_LIMIT: "PAGINATION_DEFAULT_LIMIT",
  PAGINATION_MAX_LIMIT: "PAGINATION_MAX_LIMIT",

  // Rate Limiting (Three-tier throttling)
  THROTTLE_SHORT_TTL: "THROTTLE_SHORT_TTL",
  THROTTLE_SHORT_LIMIT: "THROTTLE_SHORT_LIMIT",
  THROTTLE_MEDIUM_TTL: "THROTTLE_MEDIUM_TTL",
  THROTTLE_MEDIUM_LIMIT: "THROTTLE_MEDIUM_LIMIT",
  THROTTLE_LONG_TTL: "THROTTLE_LONG_TTL",
  THROTTLE_LONG_LIMIT: "THROTTLE_LONG_LIMIT",

  // Logging
  LOG_LEVEL: "LOG_LEVEL",
  LOG_FILE: "LOG_FILE",
  LOG_DIR: "LOG_DIR",
  LOG_FILE_MAX_SIZE: "LOG_FILE_MAX_SIZE",
  LOG_FILE_MAX_FILES: "LOG_FILE_MAX_FILES",
  LOG_TIMESTAMP_FORMAT: "LOG_TIMESTAMP_FORMAT",

  // CORS
  CORS_ORIGIN: "CORS_ORIGIN",

  // Helmet Security
  HELMET_CSP_DEFAULT_SRC: "HELMET_CSP_DEFAULT_SRC",
  HELMET_CSP_STYLE_SRC: "HELMET_CSP_STYLE_SRC",
  HELMET_CSP_SCRIPT_SRC: "HELMET_CSP_SCRIPT_SRC",
  HELMET_CSP_IMG_SRC: "HELMET_CSP_IMG_SRC",
  HELMET_CROSS_ORIGIN_EMBEDDER_POLICY: "HELMET_CROSS_ORIGIN_EMBEDDER_POLICY",

  // Health Checks
  HEALTH_MEMORY_HEAP_MB: "HEALTH_MEMORY_HEAP_MB",
  HEALTH_MEMORY_RSS_MB: "HEALTH_MEMORY_RSS_MB",
  HEALTH_DISK_THRESHOLD: "HEALTH_DISK_THRESHOLD",
  HEALTH_DISK_PATH: "HEALTH_DISK_PATH",

  // Swagger Documentation
  SWAGGER_ENABLED: "SWAGGER_ENABLED",
  SWAGGER_PATH: "SWAGGER_PATH",
} as const;

/**
 * Required environment variables
 * These must be set for the application to start
 */
export const REQUIRED_ENV_VARS = [
  ENV_KEYS.DATABASE_URL,
  ENV_KEYS.JWT_SECRET,
  ENV_KEYS.JWT_REFRESH_SECRET,
] as const;

/**
 * Optional environment variables with defaults
 */
export const OPTIONAL_ENV_VARS = {
  [ENV_KEYS.NODE_ENV]: "development",
  [ENV_KEYS.PORT]: "3000",
  [ENV_KEYS.API_PREFIX]: "api/v1",
  [ENV_KEYS.LOG_LEVEL]: "info",
  [ENV_KEYS.REDIS_HOST]: "localhost",
  [ENV_KEYS.REDIS_PORT]: "6379",
  [ENV_KEYS.SWAGGER_ENABLED]: "true",
  [ENV_KEYS.SWAGGER_PATH]: "docs",
  [ENV_KEYS.PAGINATION_DEFAULT_LIMIT]: "10",
  [ENV_KEYS.PAGINATION_MAX_LIMIT]: "100",
  [ENV_KEYS.CORS_ORIGIN]: "*", // Development only. Production must set explicit origins.
  [ENV_KEYS.LOG_DIR]: "logs",
  [ENV_KEYS.LOG_FILE]: "logs/app.log",
} as const;

/**
 * Environment variable validation helpers
 */
export const ENV_VALIDATORS = {
  isProduction: (env: string): boolean => env === "production",
  isDevelopment: (env: string): boolean => env === "development",
  isTest: (env: string): boolean => env === "test",
  isStaging: (env: string): boolean => env === "staging",
} as const;

/**
 * Type for environment keys
 */
export type EnvKey = (typeof ENV_KEYS)[keyof typeof ENV_KEYS];
