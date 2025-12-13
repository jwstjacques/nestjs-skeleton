/**
 * Throttler configuration constants loaded from environment variables.
 * These values are loaded at application startup and can be used in decorators.
 *
 * Note: While decorators are evaluated at compile-time, these constants are
 * evaluated at runtime during module initialization, allowing us to use .env values.
 */

// Short: Burst protection (1 second window)
export const THROTTLE_SHORT_TTL = parseInt(process.env.THROTTLE_SHORT_TTL || "1000", 10);
export const THROTTLE_SHORT_LIMIT = parseInt(process.env.THROTTLE_SHORT_LIMIT || "10", 10);

// Medium: Sustained usage (10 second window)
export const THROTTLE_MEDIUM_TTL = parseInt(process.env.THROTTLE_MEDIUM_TTL || "10000", 10);
export const THROTTLE_MEDIUM_LIMIT = parseInt(process.env.THROTTLE_MEDIUM_LIMIT || "50", 10);

// Long: Overall limit (1 minute window)
export const THROTTLE_LONG_TTL = parseInt(process.env.THROTTLE_LONG_TTL || "60000", 10);
export const THROTTLE_LONG_LIMIT = parseInt(process.env.THROTTLE_LONG_LIMIT || "200", 10);
