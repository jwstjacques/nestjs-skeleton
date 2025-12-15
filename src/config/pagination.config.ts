import { registerAs } from "@nestjs/config";

/**
 * Pagination configuration constants
 */
export const PAGINATION_DEFAULTS = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  MIN_PAGE: 1,
  MIN_LIMIT: 1,
} as const;

// Export individual constants for backward compatibility
export const DEFAULT_PAGE = PAGINATION_DEFAULTS.DEFAULT_PAGE;
export const DEFAULT_LIMIT = PAGINATION_DEFAULTS.DEFAULT_LIMIT;
export const MAX_LIMIT = PAGINATION_DEFAULTS.MAX_LIMIT;

export default registerAs("pagination", () => ({
  defaultLimit: parseInt(process.env.PAGINATION_DEFAULT_LIMIT || "10", 10),
  maxLimit: parseInt(process.env.PAGINATION_MAX_LIMIT || "100", 10),
}));
