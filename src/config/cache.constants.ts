/**
 * Cache TTL configuration constants loaded from environment variables.
 * These values are loaded at application startup and can be used in decorators.
 *
 * All TTL values are in milliseconds.
 */

// List endpoints (e.g., GET /tasks) - shorter TTL as data changes frequently
export const CACHE_TTL_LIST = parseInt(process.env.CACHE_TTL_LIST || "60000", 10);

// Single item endpoints (e.g., GET /tasks/:id) - longer TTL as individual items change less often
export const CACHE_TTL_SINGLE = parseInt(process.env.CACHE_TTL_SINGLE || "300000", 10);
