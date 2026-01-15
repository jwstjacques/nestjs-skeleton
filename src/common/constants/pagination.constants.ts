/**
 * Common Pagination Constants
 *
 * Provides reusable constants for pagination across all modules.
 * These are static values used in decorators and DTOs at build time.
 *
 * For runtime configuration, see: src/config/providers/pagination.config.ts
 *
 * @example
 * ```typescript
 * // In a DTO
 * import { SortOrder, BaseSortBy } from '../../../common/constants';
 *
 * @Max(PAGINATION_CONSTANTS.MAX_LIMIT)
 * limit?: number = PAGINATION_CONSTANTS.DEFAULT_LIMIT;
 *
 * // Extend base sort fields with entity-specific fields
 * export enum ProductSortBy {
 *   CREATED_AT = BaseSortBy.CREATED_AT,
 *   UPDATED_AT = BaseSortBy.UPDATED_AT,
 *   NAME = "name",
 *   PRICE = "price",
 * }
 *
 * // In Swagger decorators
 * @ApiQuery(PAGINATION_SWAGGER_QUERIES.page())
 * @ApiQuery(PAGINATION_SWAGGER_QUERIES.limit())
 * ```
 */

/**
 * Core pagination values
 * Should match defaults in pagination.config.ts
 */
export const PAGINATION_CONSTANTS = {
  /** Default page number */
  DEFAULT_PAGE: 1,

  /** Default number of items per page */
  DEFAULT_LIMIT: 10,

  /** Maximum allowed items per page */
  MAX_LIMIT: 100,

  /** Minimum page number */
  MIN_PAGE: 1,

  /** Minimum items per page */
  MIN_LIMIT: 1,
} as const;

/**
 * Standard sort order enum
 * Used across all paginated endpoints
 */
export enum SortOrder {
  ASC = "asc",
  DESC = "desc",
}

/**
 * Base sortable fields common to all entities (as const object)
 * Modules can spread this into their own sort fields
 *
 * @example
 * ```typescript
 * // In your module's DTO (as const pattern)
 * export const ProductSortBy = {
 *   ...BaseSortByFields,  // Includes createdAt, updatedAt
 *   NAME: "name",
 *   PRICE: "price",
 * } as const;
 *
 * export type ProductSortBy = typeof ProductSortBy[keyof typeof ProductSortBy];
 * ```
 */
export const BaseSortByFields = {
  CREATED_AT: "createdAt",
  UPDATED_AT: "updatedAt",
} as const;

/**
 * @deprecated Use BaseSortByFields instead for better type inference
 * Base sortable fields enum (legacy)
 * Kept for backwards compatibility
 */
export enum BaseSortBy {
  CREATED_AT = "createdAt",
  UPDATED_AT = "updatedAt",
}

/**
 * Swagger/OpenAPI descriptions for pagination parameters
 * Can be customized per module by passing options
 */
export const PAGINATION_SWAGGER_DESCRIPTIONS = {
  page: (defaultPage?: number) =>
    `Page number (default: ${defaultPage ?? PAGINATION_CONSTANTS.DEFAULT_PAGE})`,

  limit: (defaultLimit?: number, maxLimit?: number) =>
    `Items per page (default: ${defaultLimit ?? PAGINATION_CONSTANTS.DEFAULT_LIMIT}, max: ${maxLimit ?? PAGINATION_CONSTANTS.MAX_LIMIT})`,

  sortBy: (defaultField?: string) => `Field to sort by (default: ${defaultField ?? "createdAt"})`,

  sortOrder: (defaultOrder?: "ASC" | "DESC") =>
    `Sort order: ascending (ASC) or descending (DESC) (default: ${defaultOrder ?? "DESC"})`,

  search: (fields?: string) =>
    fields
      ? `Search term to filter results (searches: ${fields})`
      : "Search term to filter results",
} as const;

/**
 * Reusable Swagger @ApiQuery configurations for pagination
 *
 * @example
 * ```typescript
 * // Basic usage (uses defaults)
 * @ApiQuery(PAGINATION_SWAGGER_QUERIES.page())
 * @ApiQuery(PAGINATION_SWAGGER_QUERIES.limit())
 *
 * // Customized examples
 * @ApiQuery(PAGINATION_SWAGGER_QUERIES.page({ example: 2 }))
 * @ApiQuery(PAGINATION_SWAGGER_QUERIES.limit({ example: 20, max: 50 }))
 * ```
 */
export const PAGINATION_SWAGGER_QUERIES = {
  /**
   * Page number query parameter
   */
  page: (options?: { example?: number; default?: number }) => ({
    name: "page",
    required: false,
    type: Number,
    description: PAGINATION_SWAGGER_DESCRIPTIONS.page(options?.default),
    example: options?.example ?? PAGINATION_CONSTANTS.DEFAULT_PAGE,
  }),

  /**
   * Limit (items per page) query parameter
   */
  limit: (options?: { example?: number; default?: number; max?: number }) => ({
    name: "limit",
    required: false,
    type: Number,
    description: PAGINATION_SWAGGER_DESCRIPTIONS.limit(
      options?.default,
      options?.max ?? PAGINATION_CONSTANTS.MAX_LIMIT,
    ),
    example: options?.example ?? PAGINATION_CONSTANTS.DEFAULT_LIMIT,
  }),

  /**
   * Sort order query parameter
   */
  sortOrder: (options?: { example?: "ASC" | "DESC"; default?: "ASC" | "DESC" }) => ({
    name: "sortOrder",
    required: false,
    enum: ["ASC", "DESC"],
    description: PAGINATION_SWAGGER_DESCRIPTIONS.sortOrder(options?.default),
    example: options?.example,
  }),

  /**
   * Sort field query parameter
   * Requires enum of sortable fields
   */
  sortBy: (options: {
    enum: string[];
    default?: string;
    example?: string;
    description?: string;
  }) => ({
    name: "sortBy",
    required: false,
    enum: options.enum,
    description: options.description ?? PAGINATION_SWAGGER_DESCRIPTIONS.sortBy(options.default),
    example: options.example,
  }),

  /**
   * Search query parameter
   */
  search: (options?: { example?: string; fields?: string; description?: string }) => ({
    name: "search",
    required: false,
    type: String,
    description: options?.description ?? PAGINATION_SWAGGER_DESCRIPTIONS.search(options?.fields),
    example: options?.example,
  }),
} as const;

/**
 * Common validation messages for pagination
 */
export const PAGINATION_VALIDATION_MESSAGES = {
  PAGE_MIN: `Page must be at least ${PAGINATION_CONSTANTS.MIN_PAGE}`,
  PAGE_MUST_BE_NUMBER: "Page must be a number",
  LIMIT_MIN: `Limit must be at least ${PAGINATION_CONSTANTS.MIN_LIMIT}`,
  LIMIT_MAX: `Limit must not exceed ${PAGINATION_CONSTANTS.MAX_LIMIT}`,
  LIMIT_MUST_BE_NUMBER: "Limit must be a number",
  SORT_ORDER_INVALID: "Sort order must be either ASC or DESC",
} as const;
