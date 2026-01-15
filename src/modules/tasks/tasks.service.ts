import { Injectable, Logger, ForbiddenException } from "@nestjs/common";
import { Task, Prisma, TaskStatus, TaskPriority, UserRole } from "@prisma/client";
import { CreateTaskDto, UpdateTaskDto, QueryTaskDto, PaginatedTasksResponseDto } from "./dto";
import { TaskNotFoundException, TaskForbiddenException } from "./exceptions";
import { TasksDal } from "./tasks.dal";

interface UserContext {
  id: string;
  role: UserRole;
}

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(private readonly tasksDal: TasksDal) {}

  async create(createTaskDto: CreateTaskDto, user: UserContext): Promise<Task> {
    this.logger.log(`Creating task for user ${user.id}`);

    const task = await this.tasksDal.create({
      ...createTaskDto,
      user: { connect: { id: user.id } },
      dueDate: createTaskDto.dueDate ? new Date(createTaskDto.dueDate) : null,
    });

    this.logger.log(`Task created with ID: ${task.id}`);

    return task;
  }

  /**
   * Find all tasks with pagination and filters
   * Admins see all tasks, users see only their own
   */
  async findAll(query: QueryTaskDto, user: UserContext): Promise<PaginatedTasksResponseDto> {
    const { page = 1, limit = 10, status, priority, search, sortBy, sortOrder } = query;

    const skip = (page - 1) * limit;

    // Build where clause - admins see all, users see only their own
    const where: Prisma.TaskWhereInput = {
      deletedAt: null,
      // Only filter by userId if user is not an admin
      ...(user.role !== UserRole.ADMIN && { userId: user.id }),
    };

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

    const userInfo = user.role === UserRole.ADMIN ? "all users" : `user ${user.id}`;

    this.logger.log(`Found ${tasks.length} tasks out of ${total} total for ${userInfo}`);

    return new PaginatedTasksResponseDto(tasks, total, page, limit);
  }

  /**
   * Find one task by ID
   * Admins can access any task, users only their own
   */
  async findOne(id: string, user: UserContext): Promise<Task> {
    const task = await this.tasksDal.findUnique(id);

    if (!task) {
      throw new TaskNotFoundException(id);
    }

    // Verify user owns the task (unless admin)
    if (user.role !== UserRole.ADMIN && task.userId !== user.id) {
      throw new TaskForbiddenException(id);
    }

    return task;
  }

  /**
   * Update a task
   * Admins can update any task, users only their own
   */
  async update(id: string, updateTaskDto: UpdateTaskDto, user: UserContext): Promise<Task> {
    // Verify task exists and user has access
    await this.findOne(id, user);

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
   * Admins can delete any task, users only their own
   */
  async remove(id: string, user: UserContext): Promise<Task> {
    // Verify task exists and user has access
    await this.findOne(id, user);

    this.logger.log(`Soft deleting task ${id}`);

    const task = await this.tasksDal.softDelete(id);

    this.logger.log(`Task ${id} soft deleted successfully`);

    return task;
  }

  /**
   * Hard delete a task (admin only - called via purge endpoint)
   */
  async purge(id: string): Promise<void> {
    this.logger.warn(`Hard deleting task ${id}`);

    await this.tasksDal.delete(id);

    this.logger.warn(`Task ${id} permanently deleted`);
  }

  /**
   * Get task statistics
   * Admins see stats for all tasks, users only their own
   */
  async getStatistics(user: UserContext): Promise<object> {
    const where: Prisma.TaskWhereInput = {
      deletedAt: null,
      // Only filter by userId if user is not an admin
      ...(user.role !== UserRole.ADMIN && { userId: user.id }),
    };

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
      // For overdue, we need to handle admin case differently
      user.role === UserRole.ADMIN
        ? this.tasksDal.count({
            ...where,
            status: { not: TaskStatus.COMPLETED },
            dueDate: { lt: new Date() },
          })
        : this.tasksDal.countOverdue(user.id),
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

  /**
   * Find the next due task for a user (v2 API)
   * Returns the task with the nearest upcoming due date
   * Only includes active tasks (TODO or IN_PROGRESS)
   */
  async findNextDueTask(userId: string): Promise<Task | null> {
    this.logger.log(`Finding next due task for user ${userId}`);

    const task = await this.tasksDal.findNextDueTask(userId);

    if (!task) {
      this.logger.debug(`No upcoming tasks found for user ${userId}`);

      return null;
    }

    this.logger.log(`Found next due task ${task.id} for user ${userId}`);

    return task;
  }

  /**
   * Find one task by ID with permission checks (v2 API)
   * User must be the task owner or an admin
   */
  async findOneWithPermissions(id: string, user: { id: string; role: string }): Promise<Task> {
    this.logger.log(`Finding task ${id} for user ${user.id} (with permission check)`);

    const task = await this.tasksDal.findUnique(id);

    if (!task) {
      throw new TaskNotFoundException(id);
    }

    // Permission check: user must be task owner or admin
    const isOwner = task.userId === user.id;
    const isAdmin = user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      this.logger.warn(
        `Access denied: User ${user.id} attempted to access task ${id} owned by ${task.userId}`,
      );
      throw new ForbiddenException("You do not have permission to access this task");
    }

    this.logger.log(`Task ${id} retrieved successfully by user ${user.id}`);

    return task;
  }
}
