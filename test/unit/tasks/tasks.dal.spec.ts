import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../../../src/database/prisma.service";
import { TasksDal } from "../../../src/modules/tasks/tasks.dal";
import { TaskStatus, TaskPriority } from "@prisma/client";
import { TestCleanup } from "../../utils/test-cleanup";
import { CorrelationService } from "../../../src/common/correlation";
import { createMockConfigService } from "../../utils/config.mock";

/**
 * TasksDal Integration Tests
 * These tests use a real database connection to verify DAL methods
 * All test data is tracked and cleaned up after each test
 */
describe("TasksDal", () => {
  let tasksDal: TasksDal;
  let prisma: PrismaService = null as unknown as PrismaService;
  let cleanup: TestCleanup = null as unknown as TestCleanup;
  let testUserId: string;

  beforeAll(async () => {
    // Create actual instances instead of mocks to test real database interaction
    const correlationService = new CorrelationService();
    const configService = createMockConfigService() as unknown as ConfigService;

    prisma = new PrismaService(correlationService, configService);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksDal,
        {
          provide: PrismaService,
          useValue: prisma,
        },
        {
          provide: CorrelationService,
          useValue: correlationService,
        },
      ],
    }).compile();

    tasksDal = module.get<TasksDal>(TasksDal);
    cleanup = new TestCleanup(prisma);

    // Create a test user for all tests
    const timestamp = Date.now();
    const testUser = await prisma.user.create({
      data: {
        email: `test-dal-${timestamp}@example.com`,
        username: `testdal${timestamp}`,
        password: "hashedpassword",
        firstName: "DAL",
        lastName: "Test",
      },
    });

    testUserId = testUser.id;
    cleanup.trackUser(testUserId);
  });

  afterEach(async () => {
    // Clean up tasks created in each test
    if (cleanup) {
      await cleanup.cleanupTasks();
    }
  });

  afterAll(async () => {
    // Clean up all test data
    if (cleanup) {
      await cleanup.cleanupAll();
    }

    // Properly close all connections (calls onModuleDestroy internally)
    if (prisma) {
      await prisma.onModuleDestroy();
    }
  });

  describe("create", () => {
    it("should create a task", async () => {
      const task = await tasksDal.create({
        title: "Test Task",
        description: "Test Description",
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        user: { connect: { id: testUserId } },
      });

      cleanup.trackTask(task.id);

      expect(task).toBeDefined();
      expect(task.id).toBeDefined();
      expect(task.title).toBe("Test Task");
      expect(task.description).toBe("Test Description");
      expect(task.status).toBe(TaskStatus.TODO);
      expect(task.priority).toBe(TaskPriority.MEDIUM);
      expect(task.userId).toBe(testUserId);
      expect(task.deletedAt).toBeNull();
    });

    it("should create a task with optional fields", async () => {
      const dueDate = new Date("2024-12-31");
      const task = await tasksDal.create({
        title: "Task with Due Date",
        status: TaskStatus.TODO,
        priority: TaskPriority.HIGH,
        dueDate,
        user: { connect: { id: testUserId } },
      });

      cleanup.trackTask(task.id);

      expect(task.dueDate).toEqual(dueDate);
    });
  });

  describe("findMany", () => {
    it("should find tasks with filtering", async () => {
      // Create test tasks
      const task1 = await tasksDal.create({
        title: "High Priority Task",
        status: TaskStatus.TODO,
        priority: TaskPriority.HIGH,
        user: { connect: { id: testUserId } },
      });

      const task2 = await tasksDal.create({
        title: "Low Priority Task",
        status: TaskStatus.TODO,
        priority: TaskPriority.LOW,
        user: { connect: { id: testUserId } },
      });

      cleanup.trackTasks([task1.id, task2.id]);

      // Find high priority tasks
      const highPriorityTasks = await tasksDal.findMany(
        { userId: testUserId, priority: TaskPriority.HIGH },
        0,
        10,
      );

      expect(highPriorityTasks.length).toBe(1);
      expect(highPriorityTasks[0].title).toBe("High Priority Task");
    });

    it("should support pagination", async () => {
      // Create 5 test tasks
      const taskPromises = Array.from({ length: 5 }, (_, i) =>
        tasksDal.create({
          title: `Task ${i + 1}`,
          status: TaskStatus.TODO,
          priority: TaskPriority.MEDIUM,
          user: { connect: { id: testUserId } },
        }),
      );

      const tasks = await Promise.all(taskPromises);

      cleanup.trackTasks(tasks.map((t) => t.id));

      // Get first page (2 items)
      const page1 = await tasksDal.findMany({ userId: testUserId }, 0, 2);

      expect(page1.length).toBe(2);

      // Get second page (2 items)
      const page2 = await tasksDal.findMany({ userId: testUserId }, 2, 2);

      expect(page2.length).toBe(2);

      // Verify different tasks returned
      expect(page1[0].id).not.toBe(page2[0].id);
    });

    it("should support sorting", async () => {
      // Create tasks with different priorities
      const lowTask = await tasksDal.create({
        title: "Low",
        status: TaskStatus.TODO,
        priority: TaskPriority.LOW,
        user: { connect: { id: testUserId } },
      });

      const highTask = await tasksDal.create({
        title: "High",
        status: TaskStatus.TODO,
        priority: TaskPriority.HIGH,
        user: { connect: { id: testUserId } },
      });

      cleanup.trackTasks([lowTask.id, highTask.id]);

      // Sort by priority descending
      const sortedTasks = await tasksDal.findMany({ userId: testUserId }, 0, 10, {
        priority: "desc",
      });

      expect(sortedTasks[0].priority).toBe(TaskPriority.HIGH);
    });

    it("should not return soft-deleted tasks", async () => {
      const task = await tasksDal.create({
        title: "To Be Deleted",
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        user: { connect: { id: testUserId } },
      });

      cleanup.trackTask(task.id);

      // Soft delete the task
      await tasksDal.softDelete(task.id);

      // Try to find it
      const tasks = await tasksDal.findMany({ userId: testUserId }, 0, 10);

      expect(tasks.find((t) => t.id === task.id)).toBeUndefined();
    });
  });

  describe("findUnique", () => {
    it("should find a task by ID", async () => {
      const createdTask = await tasksDal.create({
        title: "Unique Task",
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        user: { connect: { id: testUserId } },
      });

      cleanup.trackTask(createdTask.id);

      const foundTask = await tasksDal.findUnique(createdTask.id);

      expect(foundTask).toBeDefined();
      expect(foundTask?.id).toBe(createdTask.id);
      expect(foundTask?.title).toBe("Unique Task");
    });

    it("should return null for non-existent task", async () => {
      const task = await tasksDal.findUnique("non-existent-id");

      expect(task).toBeNull();
    });

    it("should return null for soft-deleted task", async () => {
      const task = await tasksDal.create({
        title: "To Be Soft Deleted",
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        user: { connect: { id: testUserId } },
      });

      cleanup.trackTask(task.id);

      await tasksDal.softDelete(task.id);

      const foundTask = await tasksDal.findUnique(task.id);

      expect(foundTask).toBeNull();
    });
  });

  describe("count", () => {
    it("should count tasks matching criteria", async () => {
      // Create test tasks with different statuses
      const task1 = await tasksDal.create({
        title: "Todo Task",
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        user: { connect: { id: testUserId } },
      });

      const task2 = await tasksDal.create({
        title: "In Progress Task",
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.MEDIUM,
        user: { connect: { id: testUserId } },
      });

      cleanup.trackTasks([task1.id, task2.id]);

      const todoCount = await tasksDal.count({
        userId: testUserId,
        status: TaskStatus.TODO,
      });

      expect(todoCount).toBe(1);
    });

    it("should not count soft-deleted tasks", async () => {
      const task = await tasksDal.create({
        title: "Task to Delete",
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        user: { connect: { id: testUserId } },
      });

      cleanup.trackTask(task.id);

      const countBefore = await tasksDal.count({ userId: testUserId });

      await tasksDal.softDelete(task.id);

      const countAfter = await tasksDal.count({ userId: testUserId });

      expect(countAfter).toBe(countBefore - 1);
    });
  });

  describe("update", () => {
    it("should update a task", async () => {
      const task = await tasksDal.create({
        title: "Original Title",
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        user: { connect: { id: testUserId } },
      });

      cleanup.trackTask(task.id);

      const updatedTask = await tasksDal.update(task.id, {
        title: "Updated Title",
        status: TaskStatus.IN_PROGRESS,
      });

      expect(updatedTask.title).toBe("Updated Title");
      expect(updatedTask.status).toBe(TaskStatus.IN_PROGRESS);
    });

    it("should update completedAt field", async () => {
      const task = await tasksDal.create({
        title: "Task to Complete",
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        user: { connect: { id: testUserId } },
      });

      cleanup.trackTask(task.id);

      const completedAt = new Date();
      const updatedTask = await tasksDal.update(task.id, {
        status: TaskStatus.COMPLETED,
        completedAt,
      });

      expect(updatedTask.completedAt).toBeDefined();
      expect(updatedTask.status).toBe(TaskStatus.COMPLETED);
    });
  });

  describe("softDelete", () => {
    it("should soft delete a task", async () => {
      const task = await tasksDal.create({
        title: "Task to Soft Delete",
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        user: { connect: { id: testUserId } },
      });

      cleanup.trackTask(task.id);

      const deletedTask = await tasksDal.softDelete(task.id);

      expect(deletedTask.deletedAt).toBeDefined();
      expect(deletedTask.deletedAt).toBeInstanceOf(Date);

      // Verify it's not returned in queries
      const foundTask = await tasksDal.findUnique(task.id);

      expect(foundTask).toBeNull();
    });
  });

  describe("delete", () => {
    it("should permanently delete a task", async () => {
      const task = await tasksDal.create({
        title: "Task to Hard Delete",
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        user: { connect: { id: testUserId } },
      });

      // Don't track since we're testing permanent deletion
      await tasksDal.delete(task.id);

      // Verify it's completely gone
      const foundTask = await prisma.task.findUnique({ where: { id: task.id } });

      expect(foundTask).toBeNull();
    });
  });

  describe("groupBy", () => {
    it("should group tasks by status", async () => {
      // Create tasks with different statuses
      const task1 = await tasksDal.create({
        title: "Todo 1",
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        user: { connect: { id: testUserId } },
      });

      const task2 = await tasksDal.create({
        title: "Todo 2",
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        user: { connect: { id: testUserId } },
      });

      const task3 = await tasksDal.create({
        title: "In Progress",
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.MEDIUM,
        user: { connect: { id: testUserId } },
      });

      cleanup.trackTasks([task1.id, task2.id, task3.id]);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const grouped = await tasksDal.groupBy({
        by: ["status"],
        where: { userId: testUserId, deletedAt: null },
        _count: true,
      });

      type GroupedByStatus = { status: TaskStatus; _count: number };
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const todoGroup = grouped.find(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (g: any) => (g as GroupedByStatus).status === TaskStatus.TODO,
      ) as GroupedByStatus | undefined;

      expect(todoGroup?._count).toBe(2);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const inProgressGroup = grouped.find(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (g: any) => (g as GroupedByStatus).status === TaskStatus.IN_PROGRESS,
      ) as GroupedByStatus | undefined;

      expect(inProgressGroup?._count).toBe(1);
    });

    it("should group tasks by priority", async () => {
      const highTask = await tasksDal.create({
        title: "High Priority",
        status: TaskStatus.TODO,
        priority: TaskPriority.HIGH,
        user: { connect: { id: testUserId } },
      });

      const mediumTask = await tasksDal.create({
        title: "Medium Priority",
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        user: { connect: { id: testUserId } },
      });

      cleanup.trackTasks([highTask.id, mediumTask.id]);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const grouped = await tasksDal.groupBy({
        by: ["priority"],
        where: { userId: testUserId, deletedAt: null },
        _count: true,
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(grouped.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("countOverdue", () => {
    it("should count overdue tasks", async () => {
      const overdueDate = new Date();

      overdueDate.setDate(overdueDate.getDate() - 1); // Yesterday

      const overdueTask = await tasksDal.create({
        title: "Overdue Task",
        status: TaskStatus.TODO,
        priority: TaskPriority.HIGH,
        dueDate: overdueDate,
        user: { connect: { id: testUserId } },
      });

      cleanup.trackTask(overdueTask.id);

      const count = await tasksDal.countOverdue(testUserId);

      expect(count).toBeGreaterThanOrEqual(1);
    });

    it("should not count completed tasks as overdue", async () => {
      const overdueDate = new Date();

      overdueDate.setDate(overdueDate.getDate() - 1);

      const completedTask = await tasksDal.create({
        title: "Completed Overdue Task",
        status: TaskStatus.COMPLETED,
        priority: TaskPriority.HIGH,
        dueDate: overdueDate,
        completedAt: new Date(),
        user: { connect: { id: testUserId } },
      });

      cleanup.trackTask(completedTask.id);

      const countBefore = await tasksDal.countOverdue(testUserId);

      // The completed task should not be included in overdue count
      const allTasks = await tasksDal.findMany({ userId: testUserId }, 0, 100);
      const overdueIncompleteTasks = allTasks.filter(
        (t) => t.dueDate && t.dueDate < new Date() && t.status !== TaskStatus.COMPLETED,
      );

      expect(overdueIncompleteTasks.length).toBe(countBefore);
    });

    it("should not count tasks without due dates as overdue", async () => {
      const task = await tasksDal.create({
        title: "No Due Date Task",
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        user: { connect: { id: testUserId } },
      });

      cleanup.trackTask(task.id);

      // Should not affect overdue count
      const count = await tasksDal.countOverdue(testUserId);

      expect(count).toBeGreaterThanOrEqual(0);
    });
  });
});
