import { Injectable, Logger } from "@nestjs/common";
import { Task, Prisma, TaskStatus, TaskPriority } from "@prisma/client";
import { CreateTaskDto, UpdateTaskDto, QueryTaskDto, PaginatedTasksResponseDto } from "./dto";
import { TaskNotFoundException } from "../../common/exceptions";
import { TasksDal } from "./tasks.dal";

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(private readonly tasksDal: TasksDal) {}

  async create(createTaskDto: CreateTaskDto, userId: string): Promise<Task> {
    this.logger.log(`Creating task for user ${userId}`);

    const task = await this.tasksDal.create({
      ...createTaskDto,
      user: { connect: { id: userId } },
      dueDate: createTaskDto.dueDate ? new Date(createTaskDto.dueDate) : null,
    });

    this.logger.log(`Task created with ID: ${task.id}`);

    return task;
  }

  /**
   * Find all tasks with pagination and filters
   */
  async findAll(query: QueryTaskDto): Promise<PaginatedTasksResponseDto> {
    const { page = 1, limit = 10, status, priority, search, sortBy, sortOrder, userId } = query;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.TaskWhereInput = {
      deletedAt: null,
    };

    if (userId) {
      where.userId = userId;
    }

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Build order by clause
    const orderBy: Prisma.TaskOrderByWithRelationInput = {};

    if (sortBy) {
      orderBy[sortBy] = sortOrder || "desc";
    }

    // Execute queries
    const [tasks, total] = await Promise.all([
      this.tasksDal.findMany(where, skip, limit, orderBy),
      this.tasksDal.count(where),
    ]);

    this.logger.log(`Found ${tasks.length} tasks out of ${total} total`);

    return new PaginatedTasksResponseDto(tasks, total, page, limit);
  }

  /**
   * Find one task by ID
   */
  async findOne(id: string): Promise<Task> {
    const task = await this.tasksDal.findUnique(id);

    if (!task) {
      throw new TaskNotFoundException(id);
    }

    return task;
  }

  /**
   * Update a task
   */
  async update(id: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
    // Verify task exists
    await this.findOne(id);

    this.logger.log(`Updating task ${id}`);

    const updateData: Prisma.TaskUpdateInput = {
      ...updateTaskDto,
    };

    // Convert date strings to Date objects
    if (updateTaskDto.dueDate) {
      updateData.dueDate = new Date(updateTaskDto.dueDate);
    }

    if (updateTaskDto.completedAt) {
      updateData.completedAt = new Date(updateTaskDto.completedAt);
    }

    // Auto-set completedAt when status changes to COMPLETED
    if (updateTaskDto.status === TaskStatus.COMPLETED && !updateTaskDto.completedAt) {
      updateData.completedAt = new Date();
    }

    // Clear completedAt when status changes from COMPLETED
    if (updateTaskDto.status && updateTaskDto.status !== TaskStatus.COMPLETED) {
      updateData.completedAt = null;
    }

    const task = await this.tasksDal.update(id, updateData);

    this.logger.log(`Task ${id} updated successfully`);

    return task;
  }

  /**
   * Soft delete a task
   */
  async remove(id: string): Promise<Task> {
    // Verify task exists
    await this.findOne(id);

    this.logger.log(`Soft deleting task ${id}`);

    const task = await this.tasksDal.softDelete(id);

    this.logger.log(`Task ${id} soft deleted successfully`);

    return task;
  }

  /**
   * Hard delete a task (use with caution)
   */
  async hardRemove(id: string): Promise<void> {
    this.logger.warn(`Hard deleting task ${id}`);

    await this.tasksDal.delete(id);

    this.logger.warn(`Task ${id} permanently deleted`);
  }

  /**
   * Get task statistics for a user
   */
  async getStatistics(userId?: string): Promise<object> {
    const where: Prisma.TaskWhereInput = {
      deletedAt: null,
    };

    if (userId) {
      where.userId = userId;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const [total, byStatus, byPriority, overdue] = await Promise.all([
      this.tasksDal.count(where),
      this.tasksDal.groupBy({
        by: ["status"],
        where,
        _count: true,
      }),
      this.tasksDal.groupBy({
        by: ["priority"],
        where,
        _count: true,
      }),
      this.tasksDal.countOverdue(userId),
    ]);

    type GroupByResult = {
      status?: TaskStatus;
      priority?: TaskPriority;
      _count: number;
    };

    return {
      total,
      byStatus: (byStatus as GroupByResult[]).reduce(
        (acc: Record<string, number>, curr) => {
          if (curr.status) {
            acc[curr.status] = curr._count;
          }

          return acc;
        },
        {} as Record<string, number>,
      ),
      byPriority: (byPriority as GroupByResult[]).reduce(
        (acc: Record<string, number>, curr) => {
          if (curr.priority) {
            acc[curr.priority as string] = curr._count;
          }

          return acc;
        },
        {} as Record<string, number>,
      ),
      overdue,
    };
  }
}
