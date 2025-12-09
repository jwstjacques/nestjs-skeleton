import { IsOptional, IsEnum, IsString, IsInt, Min, Max } from "class-validator";
import { Type } from "class-transformer";
import { TaskStatus, TaskPriority } from "@prisma/client";

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
 * Uses environment variables for configuration:
 * - PAGINATION_MAX_LIMIT: Maximum items per page (default: 100)
 * - PAGINATION_DEFAULT_LIMIT: Default items per page (default: 10)
 */
export class QueryTaskDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(parseInt(process.env.PAGINATION_MAX_LIMIT || "100", 10))
  limit?: number = parseInt(process.env.PAGINATION_DEFAULT_LIMIT || "10", 10);

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(TaskSortBy)
  sortBy?: TaskSortBy = TaskSortBy.CREATED_AT;

  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;

  @IsOptional()
  @IsString()
  userId?: string;
}
