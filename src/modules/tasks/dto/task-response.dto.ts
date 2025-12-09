import { Task, TaskStatus, TaskPriority } from "@prisma/client";
import { Exclude, Expose, Type } from "class-transformer";

export class TaskResponseDto {
  @Expose()
  id!: string;

  @Expose()
  title!: string;

  @Expose()
  description!: string | null;

  @Expose()
  status!: TaskStatus;

  @Expose()
  priority!: TaskPriority;

  @Expose()
  dueDate!: Date | null;

  @Expose()
  completedAt!: Date | null;

  @Expose()
  userId!: string;

  @Expose()
  createdAt!: Date;

  @Expose()
  updatedAt!: Date;

  @Exclude()
  deletedAt!: Date | null;

  constructor(partial: Partial<Task>) {
    Object.assign(this, partial);
  }
}

export class PaginatedTasksResponseDto {
  @Expose()
  @Type(() => TaskResponseDto)
  data!: TaskResponseDto[];

  @Expose()
  meta!: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };

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
