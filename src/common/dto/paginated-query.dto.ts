import { IsOptional, IsEnum, IsString, IsInt, Min, Max } from "class-validator";
import { Type } from "class-transformer";
import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  ValidationMessages,
  PAGINATION_CONSTANTS,
  PAGINATION_VALIDATION_MESSAGES,
  SortOrder,
} from "../constants";

/**
 * Base Paginated Query DTO
 *
 * Provides common pagination, search, and sorting functionality.
 * All resource-specific query DTOs should extend this class.
 *
 * @example
 * ```typescript
 * // In your module's DTO file
 * export enum ProductSortBy {
 *   CREATED_AT = BaseSortBy.CREATED_AT,
 *   UPDATED_AT = BaseSortBy.UPDATED_AT,
 *   NAME = "name",
 *   PRICE = "price",
 * }
 *
 * export class QueryProductDto extends PaginatedQueryDto<ProductSortBy> {
 *   sortBy?: ProductSortBy = ProductSortBy.CREATED_AT;
 *
 *   // Add resource-specific filters
 *   @ApiPropertyOptional({ description: "Filter by category" })
 *   @IsOptional()
 *   @IsString()
 *   category?: string;
 * }
 * ```
 */
export class PaginatedQueryDto<T extends string = string> {
  /**
   * Page number for pagination
   */
  @ApiPropertyOptional({
    description: "Page number for pagination",
    example: 1,
    minimum: PAGINATION_CONSTANTS.MIN_PAGE,
    default: PAGINATION_CONSTANTS.DEFAULT_PAGE,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: ValidationMessages.mustBeNumber("Page") })
  @Min(PAGINATION_CONSTANTS.MIN_PAGE, { message: PAGINATION_VALIDATION_MESSAGES.PAGE_MIN })
  page?: number = PAGINATION_CONSTANTS.DEFAULT_PAGE;

  /**
   * Number of items per page
   */
  @ApiPropertyOptional({
    description: "Number of items per page",
    example: PAGINATION_CONSTANTS.DEFAULT_LIMIT,
    minimum: PAGINATION_CONSTANTS.MIN_LIMIT,
    maximum: PAGINATION_CONSTANTS.MAX_LIMIT,
    default: PAGINATION_CONSTANTS.DEFAULT_LIMIT,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: ValidationMessages.mustBeNumber("Limit") })
  @Min(PAGINATION_CONSTANTS.MIN_LIMIT, { message: PAGINATION_VALIDATION_MESSAGES.LIMIT_MIN })
  @Max(PAGINATION_CONSTANTS.MAX_LIMIT, { message: PAGINATION_VALIDATION_MESSAGES.LIMIT_MAX })
  limit?: number = PAGINATION_CONSTANTS.DEFAULT_LIMIT;

  /**
   * Search term for filtering results
   * Override description in child classes for resource-specific context
   */
  @ApiPropertyOptional({
    description: "Search term for filtering results",
    example: "search query",
  })
  @IsOptional()
  @IsString({ message: ValidationMessages.mustBeString("Search") })
  search?: string;

  /**
   * Field to sort by
   * Child classes should define their own sortBy with resource-specific enum
   */
  sortBy?: T;

  /**
   * Sort order (ascending or descending)
   */
  @ApiPropertyOptional({
    description: "Sort order",
    enum: SortOrder,
    example: SortOrder.DESC,
    default: SortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(SortOrder, { message: PAGINATION_VALIDATION_MESSAGES.SORT_ORDER_INVALID })
  sortOrder?: SortOrder = SortOrder.DESC;
}
