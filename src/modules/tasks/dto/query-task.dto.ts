import { IsOptional, IsEnum, IsString } from "class-validator";
import { TaskStatus, TaskPriority } from "@prisma/client";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { BaseSortByFields, SortOrder, ValidationMessages } from "../../../common/constants";
import { PaginatedQueryDto } from "../../../common/dto";
import { TASK_VALIDATION_MESSAGES } from "../constants";

/**
 * Task-specific sortable fields (as const pattern)
 * Extends BaseSortByFields (createdAt, updatedAt) with task-specific fields
 */
export const TaskSortBy = {
  ...BaseSortByFields, // CREATED_AT, UPDATED_AT
  DUE_DATE: "dueDate",
  TITLE: "title",
  PRIORITY: "priority",
  STATUS: "status",
} as const;

/**
 * Type derived from TaskSortBy constant
 * Ensures type safety: "createdAt" | "updatedAt" | "dueDate" | "title" | "priority" | "status"
 */
export type TaskSortBy = (typeof TaskSortBy)[keyof typeof TaskSortBy];

/**
 * Query DTO for task filtering and pagination
 *
 * Extends PaginatedQueryDto for common pagination, search, and sorting.
 * Adds task-specific filters (status, priority).
 */
export class QueryTaskDto extends PaginatedQueryDto<TaskSortBy> {
  /**
   * Filter tasks by status
   */
  @ApiPropertyOptional({
    description: "Filter tasks by status",
    enum: TaskStatus,
    example: TaskStatus.TODO,
  })
  @IsOptional()
  @IsEnum(TaskStatus, { message: TASK_VALIDATION_MESSAGES.STATUS_INVALID })
  status?: TaskStatus;

  /**
   * Filter tasks by priority
   */
  @ApiPropertyOptional({
    description: "Filter tasks by priority",
    enum: TaskPriority,
    example: TaskPriority.HIGH,
  })
  @IsOptional()
  @IsEnum(TaskPriority, { message: TASK_VALIDATION_MESSAGES.PRIORITY_INVALID })
  priority?: TaskPriority;

  /**
   * Sort field for tasks
   * Overrides base class to use TaskSortBy type
   */
  @ApiPropertyOptional({
    description: "Sort field",
    example: TaskSortBy.CREATED_AT,
    enum: Object.values(TaskSortBy), // Convert const object to array for Swagger
    default: TaskSortBy.CREATED_AT,
  })
  @IsOptional()
  @IsEnum(Object.values(TaskSortBy), { message: TASK_VALIDATION_MESSAGES.SORT_BY_INVALID })
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
