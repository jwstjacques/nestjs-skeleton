import { registerAs } from "@nestjs/config";
import { PaginationConfigSchema } from "../schemas/pagination.schema";

/**
 * Pagination Configuration Provider
 *
 * Loads and validates pagination settings from environment variables.
 * Uses Zod schema for runtime validation and type safety.
 *
 * Environment Variables:
 * - PAGINATION_DEFAULT_LIMIT: Default number of items per page
 * - PAGINATION_MAX_LIMIT: Maximum allowed items per page
 * - PAGINATION_DEFAULT_PAGE: Default page number (1-based)
 *
 * @returns Validated PaginationConfig object
 */
export default registerAs("pagination", () => {
  const config = {
    defaultLimit: process.env.PAGINATION_DEFAULT_LIMIT,
    maxLimit: process.env.PAGINATION_MAX_LIMIT,
    defaultPage: process.env.PAGINATION_DEFAULT_PAGE,
  };

  // Validate and parse with Zod schema
  // Throws detailed error if validation fails
  return PaginationConfigSchema.parse(config);
});
