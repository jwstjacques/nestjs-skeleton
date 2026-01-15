import { registerAs } from "@nestjs/config";
import { PaginationConfigSchema } from "../schemas/pagination.schema";
import { PAGINATION_CONSTANTS } from "../../common/constants";

/**
 * Pagination Configuration Provider
 *
 * Loads and validates pagination settings from environment variables.
 * Uses Zod schema for runtime validation and type safety.
 *
 * Fallback values are sourced from PAGINATION_CONSTANTS to ensure consistency
 * across the application (DTOs, validators, and runtime config).
 *
 * Environment Variables (optional - defaults from PAGINATION_CONSTANTS):
 * - PAGINATION_DEFAULT_LIMIT: Default number of items per page (default: PAGINATION_CONSTANTS.DEFAULT_LIMIT = 10)
 * - PAGINATION_MAX_LIMIT: Maximum allowed items per page (default: PAGINATION_CONSTANTS.MAX_LIMIT = 100)
 * - PAGINATION_DEFAULT_PAGE: Default page number (default: PAGINATION_CONSTANTS.DEFAULT_PAGE = 1)
 *
 * @returns Validated PaginationConfig object
 */
export default registerAs("pagination", () => {
  const config = {
    defaultLimit: String(PAGINATION_CONSTANTS.DEFAULT_LIMIT),
    maxLimit: String(PAGINATION_CONSTANTS.MAX_LIMIT),
    defaultPage: String(PAGINATION_CONSTANTS.DEFAULT_PAGE),
  };

  // Validate and parse with Zod schema
  // Throws detailed error if validation fails
  return PaginationConfigSchema.parse(config);
});
