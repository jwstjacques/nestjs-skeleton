import { CacheTTL } from "../common/cache/cache-keys.constants";

/**
 * Cache TTL configurations
 * Using centralized CacheTTL enum for consistency
 *
 * All TTL values are in milliseconds.
 */

// List endpoints (e.g., GET /tasks) - shorter TTL as data changes frequently
export const CACHE_TTL_LIST = CacheTTL.SHORT; // 60 seconds

// Single item endpoints (e.g., GET /tasks/:id) - longer TTL as individual items change less often
export const CACHE_TTL_SINGLE = CacheTTL.MEDIUM; // 5 minutes

// Re-export CacheTTL enum for convenience
export { CacheTTL } from "../common/cache/cache-keys.constants";
