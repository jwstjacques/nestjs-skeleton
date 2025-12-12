import { IsOptional, IsEnum, IsString, IsInt, Min, Max } from "class-validator";
import { Type } from "class-transformer";
import { TaskStatus, TaskPriority } from "@prisma/client";
import { ApiPropertyOptional } from "@nestjs/swagger";

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

const MAX_LIMIT = parseInt(process.env.PAGINATION_MAX_LIMIT || "100", 10);
const DEFAULT_LIMIT = parseInt(process.env.PAGINATION_DEFAULT_LIMIT || "10", 10);

/**
 * Query DTO for task filtering and pagination
 *
 * Uses environment variables for configuration:
 * - PAGINATION_MAX_LIMIT: Maximum items per page (default: 100)
 * - PAGINATION_DEFAULT_LIMIT: Default items per page (default: 10)
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
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: "Number of items per page",
    example: 10,
    minimum: 1,
    maximum: MAX_LIMIT,
    default: DEFAULT_LIMIT,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_LIMIT)
  limit?: number = MAX_LIMIT;

  @ApiPropertyOptional({
    description: "Filter tasks by status",
    enum: TaskStatus,
    example: TaskStatus.TODO,
  })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiPropertyOptional({
    description: "Filter tasks by priority",
    enum: TaskPriority,
    example: TaskPriority.HIGH,
  })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @ApiPropertyOptional({
    description: "Search term for title or description",
    example: "documentation",
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: "Sort field",
    example: "createdAt",
    enum: ["createdAt", "updatedAt", "title", "priority", "status", "dueDate"],
  })
  @IsOptional()
  @IsEnum(TaskSortBy)
  sortBy?: TaskSortBy = TaskSortBy.CREATED_AT;

  @ApiPropertyOptional({
    description: "Sort order",
    example: "desc",
    enum: ["asc", "desc"],
  })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;

  @IsOptional()
  @IsString()
  userId?: string;
}
