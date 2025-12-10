import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { Task, Prisma, TaskStatus } from "@prisma/client";

/**
 * Data Access Layer for Tasks
 * Encapsulates all Prisma operations for the Tasks resource
 * Provides database-agnostic interface for task operations
 */
@Injectable()
export class TasksDal {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new task
   * @param data Task creation data
   * @returns Created task
   */
  async create(data: Prisma.TaskCreateInput): Promise<Task> {
    return this.prisma.task.create({ data });
  }

  /**
   * Find many tasks with filtering, pagination, and sorting
   * @param where Filter criteria
   * @param skip Number of records to skip
   * @param take Number of records to take
   * @param orderBy Sort order
   * @returns Array of tasks
   */
  async findMany(
    where: Prisma.TaskWhereInput,
    skip: number,
    take: number,
    orderBy?: Prisma.TaskOrderByWithRelationInput,
  ): Promise<Task[]> {
    return this.prisma.task.findMany({
      where: { ...where, deletedAt: null },
      skip,
      take,
      orderBy,
    });
  }

  /**
   * Find a single task by ID
   * @param id Task ID
   * @returns Task or null if not found
   */
  async findUnique(id: string): Promise<Task | null> {
    return this.prisma.task.findUnique({
      where: { id, deletedAt: null },
    });
  }

  /**
   * Count tasks matching criteria
   * @param where Filter criteria
   * @returns Count of matching tasks
   */
  async count(where: Prisma.TaskWhereInput): Promise<number> {
    return this.prisma.task.count({
      where: { ...where, deletedAt: null },
    });
  }

  /**
   * Update a task
   * @param id Task ID
   * @param data Update data
   * @returns Updated task
   */
  async update(id: string, data: Prisma.TaskUpdateInput): Promise<Task> {
    return this.prisma.task.update({
      where: { id },
      data,
    });
  }

  /**
   * Soft delete a task
   * @param id Task ID
   * @returns Soft-deleted task
   */
  async softDelete(id: string): Promise<Task> {
    return this.prisma.task.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Hard delete a task (permanent deletion)
   * @param id Task ID
   */
  async delete(id: string): Promise<void> {
    await this.prisma.task.delete({
      where: { id },
    });
  }

  /**
   * Group tasks by a field for statistics
   * Note: Uses explicit any due to Prisma's complex conditional types
   * that don't work well with wrapper methods. The runtime behavior
   * and return types are still properly typed by Prisma.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  groupBy(args: any): any {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.prisma.task.groupBy(args);
  }

  /**
   * Count overdue tasks
   * @param userId Optional user ID to filter by
   * @returns Count of overdue tasks
   */
  async countOverdue(userId?: string): Promise<number> {
    const where: Prisma.TaskWhereInput = {
      deletedAt: null,
      status: { not: TaskStatus.COMPLETED },
      dueDate: { lt: new Date() },
      ...(userId && { userId }),
    };

    return this.prisma.task.count({ where });
  }
}
