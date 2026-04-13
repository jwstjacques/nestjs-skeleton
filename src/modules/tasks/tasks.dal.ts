import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { Task, Prisma, TaskStatus, TaskPriority } from "@prisma/client";

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
    await this.prisma.$executeRaw`DELETE FROM "tasks" WHERE id = ${id}`;
  }

  /**
   * Count tasks grouped by status
   * @param where Filter criteria
   * @returns Array of status counts
   */
  async countByStatus(
    where: Prisma.TaskWhereInput,
  ): Promise<{ status: TaskStatus; _count: number }[]> {
    const results = await this.prisma.task.groupBy({
      by: ["status"],
      where: { ...where, deletedAt: null },
      _count: true,
    });

    return results.map((r) => ({
      status: r.status,
      _count: typeof r._count === "number" ? r._count : (r._count as { _all: number })._all,
    }));
  }

  /**
   * Count tasks grouped by priority
   * @param where Filter criteria
   * @returns Array of priority counts
   */
  async countByPriority(
    where: Prisma.TaskWhereInput,
  ): Promise<{ priority: TaskPriority; _count: number }[]> {
    const results = await this.prisma.task.groupBy({
      by: ["priority"],
      where: { ...where, deletedAt: null },
      _count: true,
    });

    return results.map((r) => ({
      priority: r.priority,
      _count: typeof r._count === "number" ? r._count : (r._count as { _all: number })._all,
    }));
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

  /**
   * Execute operations within a Prisma interactive transaction
   * @param fn Transaction callback receiving a transaction client
   * @returns Result of the transaction callback
   */
  async transaction<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
    return this.prisma.$transaction(fn);
  }

  /**
   * Find the next due task for a user (v2 API)
   * Returns the task with the nearest upcoming due date
   * Only includes active tasks (TODO or IN_PROGRESS)
   * @param userId User ID
   * @returns Next due task or null
   */
  async findNextDueTask(userId: string): Promise<Task | null> {
    const now = new Date();

    return this.prisma.task.findFirst({
      where: {
        userId,
        deletedAt: null,
        dueDate: {
          gte: now,
        },
        status: {
          in: [TaskStatus.TODO, TaskStatus.IN_PROGRESS],
        },
      },
      orderBy: {
        dueDate: "asc",
      },
    });
  }
}
