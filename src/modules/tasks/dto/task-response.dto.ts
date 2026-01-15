import { Task, TaskStatus, TaskPriority } from "@prisma/client";
import { Exclude, Expose, Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

@Exclude()
export class TaskResponseDto {
  @ApiProperty({
    description: "Unique identifier of the task",
    example: "clxyz123456789",
  })
  @Expose()
  id!: string;

  @ApiProperty({
    description: "Title of the task",
    example: "Complete project documentation",
  })
  @Expose()
  title!: string;

  @ApiPropertyOptional({
    description: "Detailed description of the task",
    example: "Write comprehensive documentation for all API endpoints",
  })
  @Expose()
  description!: string | null;

  @ApiProperty({
    description: "Current status of the task",
    enum: TaskStatus,
    example: TaskStatus.IN_PROGRESS,
  })
  @Expose()
  status!: TaskStatus;

  @ApiProperty({
    description: "Priority level of the task",
    enum: TaskPriority,
    example: TaskPriority.HIGH,
  })
  @Expose()
  priority!: TaskPriority;

  @ApiPropertyOptional({
    description: "Due date of the task",
    example: "2025-12-31T23:59:59.000Z",
    type: Date,
  })
  @Expose()
  @Type(() => Date)
  dueDate!: Date | null;

  @ApiPropertyOptional({
    description: "Timestamp when the task was completed",
    example: "2025-12-10T15:30:00.000Z",
    type: Date,
  })
  @Expose()
  @Type(() => Date)
  completedAt!: Date | null;

  @ApiProperty({
    description: "User ID who owns the task",
    example: "cluserid123456",
  })
  @Expose()
  userId!: string;

  @ApiProperty({
    description: "Timestamp when the task was created",
    example: "2025-12-10T08:00:00.000Z",
    type: Date,
  })
  @Expose()
  @Type(() => Date)
  createdAt!: Date;

  @ApiProperty({
    description: "Timestamp when the task was last updated",
    example: "2025-12-10T09:15:00.000Z",
    type: Date,
  })
  @Expose()
  @Type(() => Date)
  updatedAt!: Date;

  @Exclude()
  deletedAt!: Date | null;

  constructor(partial: Partial<Task>) {
    Object.assign(this, partial);
  }
}

export class PaginationMetaDto {
  @ApiProperty({ description: "Total number of items", example: 42 })
  total!: number;

  @ApiProperty({ description: "Current page number", example: 1 })
  page!: number;

  @ApiProperty({ description: "Number of items per page", example: 10 })
  limit!: number;

  @ApiProperty({ description: "Total number of pages", example: 5 })
  totalPages!: number;

  @ApiProperty({ description: "Whether there is a next page", example: true })
  hasNextPage!: boolean;

  @ApiProperty({ description: "Whether there is a previous page", example: false })
  hasPrevPage!: boolean;
}

export class PaginatedTasksResponseDto {
  @ApiProperty({
    description: "Array of tasks",
    type: [TaskResponseDto],
  })
  @Expose()
  @Type(() => TaskResponseDto)
  data!: TaskResponseDto[];

  @ApiProperty({
    description: "Pagination metadata",
    type: PaginationMetaDto,
  })
  @Expose()
  meta!: PaginationMetaDto;

  constructor(tasks: Task[], total: number, page: number, limit: number) {
    this.data = tasks.map((task) => new TaskResponseDto(task));
    const totalPages = Math.ceil(total / limit);

    this.meta = {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }
}
