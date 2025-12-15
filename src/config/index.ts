/**
 * Central configuration exports
 * Single import point for all configuration
 *
 * @example
 * ```typescript
 * import { CONFIG, API_PATH, CacheTTL } from '@/config';
 * ```
 */

// API Configuration
export * from "./api.constants";
export * from "./environment.constants";

// Feature Configuration
export * from "./cache.constants";
export * from "./health.constants";
export * from "./logger.constants";
export * from "./throttler.constants";

// Config providers
export { default as paginationConfig } from "./pagination.config";
export { default as throttlerConfig } from "./throttler.config";

// Config functions
export { createSwaggerConfig } from "./swagger.config";
export { createHelmetConfig } from "./helmet.config";

// Re-export commonly used values for convenience
import { DEFAULT_PORT, API_PATH, SWAGGER_PATH } from "./api.constants";
import { CACHE_TTL_LIST, CACHE_TTL_SINGLE } from "./cache.constants";
import { THROTTLE_SHORT_TTL, THROTTLE_SHORT_LIMIT } from "./throttler.constants";

/**
 * Consolidated configuration object
 * Quick access to commonly used config values
 */
export const CONFIG = {
  api: {
    port: DEFAULT_PORT,
    path: API_PATH,
    swaggerPath: SWAGGER_PATH,
  },
  cache: {
    listTtl: CACHE_TTL_LIST,
    singleTtl: CACHE_TTL_SINGLE,
  },
  throttle: {
    ttl: THROTTLE_SHORT_TTL,
    limit: THROTTLE_SHORT_LIMIT,
  },
} as const;

/**
 * Type for the CONFIG object
 */
export type AppConfig = typeof CONFIG;
