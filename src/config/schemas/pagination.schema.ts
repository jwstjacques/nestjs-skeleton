import { z } from "zod";

/**
 * Pagination Configuration Schema
 *
 * Defines and validates pagination defaults and limits for list endpoints.
 */
export const PaginationConfigSchema = z.object({
  /**
   * Default number of items per page
   * @default 10
   */
  defaultLimit: z.coerce.number().int().min(1).default(10),

  /**
   * Maximum allowed items per page
   * @default 100
   */
  maxLimit: z.coerce.number().int().min(1).default(100),

  /**
   * Default page number
   * @default 1
   */
  defaultPage: z.coerce.number().int().min(1).default(1),
});

/**
 * Type-safe Pagination Configuration
 * Inferred from PaginationConfigSchema
 */
export type PaginationConfig = z.infer<typeof PaginationConfigSchema>;
