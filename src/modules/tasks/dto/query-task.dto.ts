import { IsOptional, IsEnum, IsString, IsInt, Min, Max } from "class-validator";
import { Type } from "class-transformer";
import { TaskStatus, TaskPriority } from "@prisma/client";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { ValidationMessages } from "../../../common/constants";
import { TASK_VALIDATION_MESSAGES } from "../constants";

/**
 * Pagination defaults for DTOs
 * Note: These are static values used in decorators at build time.
 * Runtime pagination config is in paginationConfig provider.
 */
const PAGINATION_DEFAULTS = {
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

export enum SortOrder {
  ASC = "asc",
  DESC = "desc",
}

export enum TaskSortBy {
  CREATED_AT = "createdAt",
  UPDATED_AT = "updatedAt",
  DUE_DATE = "dueDate",
  TITLE = "title",
  PRIORITY = "priority",
  STATUS = "status",
}

/**
 * Query DTO for task filtering and pagination
 *
 * Uses PaginationConfig for limits
 */
export class QueryTaskDto {
  @ApiPropertyOptional({
    description: "Page number for pagination",
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: ValidationMessages.mustBeNumber("Page") })
  @Min(1, { message: TASK_VALIDATION_MESSAGES.PAGE_MIN })
  page?: number = 1;

  @ApiPropertyOptional({
    description: "Number of items per page",
    example: PAGINATION_DEFAULTS.DEFAULT_LIMIT,
    minimum: 1,
    maximum: PAGINATION_DEFAULTS.MAX_LIMIT,
    default: PAGINATION_DEFAULTS.DEFAULT_LIMIT,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: ValidationMessages.mustBeNumber("Limit") })
  @Min(1, { message: TASK_VALIDATION_MESSAGES.LIMIT_MIN })
  @Max(PAGINATION_DEFAULTS.MAX_LIMIT, { message: TASK_VALIDATION_MESSAGES.LIMIT_MAX })
  limit?: number = PAGINATION_DEFAULTS.DEFAULT_LIMIT;

  @ApiPropertyOptional({
    description: "Filter tasks by status",
    enum: TaskStatus,
    example: TaskStatus.TODO,
  })
  @IsOptional()
  @IsEnum(TaskStatus, { message: TASK_VALIDATION_MESSAGES.STATUS_INVALID })
  status?: TaskStatus;

  @ApiPropertyOptional({
    description: "Filter tasks by priority",
    enum: TaskPriority,
    example: TaskPriority.HIGH,
  })
  @IsOptional()
  @IsEnum(TaskPriority, { message: TASK_VALIDATION_MESSAGES.PRIORITY_INVALID })
  priority?: TaskPriority;

  @ApiPropertyOptional({
    description: "Search term for title or description",
    example: "documentation",
  })
  @IsOptional()
  @IsString({ message: ValidationMessages.mustBeString("Search") })
  search?: string;

  @ApiPropertyOptional({
    description: "Sort field",
    example: "createdAt",
    enum: ["createdAt", "updatedAt", "title", "priority", "status", "dueDate"],
  })
  @IsOptional()
  @IsEnum(TaskSortBy, { message: TASK_VALIDATION_MESSAGES.SORT_BY_INVALID })
  sortBy?: TaskSortBy = TaskSortBy.CREATED_AT;

  @ApiPropertyOptional({
    description: "Sort order",
    example: "desc",
    enum: ["asc", "desc"],
  })
  @IsOptional()
  @IsEnum(SortOrder, { message: TASK_VALIDATION_MESSAGES.SORT_ORDER_INVALID })
  sortOrder?: SortOrder = SortOrder.DESC;

  @IsOptional()
  @IsString({ message: ValidationMessages.mustBeString("User ID") })
  userId?: string;
}
