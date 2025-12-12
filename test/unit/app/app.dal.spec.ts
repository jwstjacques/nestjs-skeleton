import { Test, TestingModule } from "@nestjs/testing";
import { PrismaService } from "../../../src/database/prisma.service";
import { AppDal } from "../../../src/app.dal";
import { TaskStatus, TaskPriority } from "@prisma/client";
import { TestCleanup } from "../../utils/test-cleanup";

/**
 * AppDal Integration Tests
 * These tests use a real database connection to verify DAL methods
 * All test data is tracked and cleaned up after each test
 */
describe("AppDal", () => {
  let appDal: AppDal;
  let prisma: PrismaService;
  let cleanup: TestCleanup;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppDal, PrismaService],
    }).compile();

    appDal = module.get<AppDal>(AppDal);
    prisma = module.get<PrismaService>(PrismaService);
    cleanup = new TestCleanup(prisma);
  });

  afterEach(async () => {
    // Clean up test data created in each test
    await cleanup.cleanupAll();
  });

  afterAll(async () => {
    // Properly close all connections
    await prisma.onModuleDestroy();
  });

  describe("checkDatabaseConnection", () => {
    it("should successfully execute a database query", async () => {
      await expect(appDal.checkDatabaseConnection()).resolves.toBeUndefined();
    });

    it("should complete without errors when database is connected", async () => {
      // This test verifies the connection works without throwing
      const result = await appDal.checkDatabaseConnection();

      expect(result).toBeUndefined();
    });
  });

  describe("getUserCount", () => {
    it("should return a valid user count", async () => {
      const count = await appDal.getUserCount();

      expect(typeof count).toBe("number");
      expect(count).toBeGreaterThanOrEqual(0);
    });

    it("should return correct count of users", async () => {
      const timestamp = Date.now();

      // Create test users
      const user1 = await prisma.user.create({
        data: {
          email: `user1-${timestamp}@example.com`,
          username: `user1${timestamp}`,
          password: "password",
          firstName: "User",
          lastName: "One",
        },
      });

      cleanup.trackUser(user1.id);

      const user2 = await prisma.user.create({
        data: {
          email: `user2-${timestamp}@example.com`,
          username: `user2${timestamp}`,
          password: "password",
          firstName: "User",
          lastName: "Two",
        },
      });

      cleanup.trackUser(user2.id);

      const count = await appDal.getUserCount();

      expect(count).toBeGreaterThanOrEqual(2);
    });
  });

  describe("getTaskCount", () => {
    it("should return a valid task count", async () => {
      const count = await appDal.getTaskCount();

      expect(typeof count).toBe("number");
      expect(count).toBeGreaterThanOrEqual(0);
    });

    it("should return correct count of tasks", async () => {
      const timestamp = Date.now();

      // Create a test user
      const user = await prisma.user.create({
        data: {
          email: `task-user-${timestamp}@example.com`,
          username: `taskuser${timestamp}`,
          password: "password",
          firstName: "Task",
          lastName: "User",
        },
      });

      cleanup.trackUser(user.id);

      // Create test tasks
      const task1 = await prisma.task.create({
        data: {
          title: "Task 1",
          description: "Description 1",
          status: TaskStatus.TODO,
          priority: TaskPriority.MEDIUM,
          userId: user.id,
        },
      });

      cleanup.trackTask(task1.id);

      const task2 = await prisma.task.create({
        data: {
          title: "Task 2",
          description: "Description 2",
          status: TaskStatus.IN_PROGRESS,
          priority: TaskPriority.HIGH,
          userId: user.id,
        },
      });

      cleanup.trackTask(task2.id);

      const count = await appDal.getTaskCount();

      expect(count).toBeGreaterThanOrEqual(2);
    });

    it("should include soft-deleted tasks in count", async () => {
      const timestamp = Date.now();

      // Create a test user
      const user = await prisma.user.create({
        data: {
          email: `deleted-task-user-${timestamp}@example.com`,
          username: `deletedtaskuser${timestamp}`,
          password: "password",
          firstName: "Deleted",
          lastName: "User",
        },
      });

      cleanup.trackUser(user.id);

      // Create a task and soft delete it
      const task = await prisma.task.create({
        data: {
          title: "Task to Delete",
          description: "Description",
          status: TaskStatus.TODO,
          priority: TaskPriority.LOW,
          userId: user.id,
        },
      });

      cleanup.trackTask(task.id);

      // Soft delete the task
      await prisma.task.update({
        where: { id: task.id },
        data: { deletedAt: new Date() },
      });

      const count = await appDal.getTaskCount();

      expect(count).toBeGreaterThanOrEqual(1);
    });
  });

  describe("getTasksByStatus", () => {
    it("should return an array of status groups", async () => {
      const result = await appDal.getTasksByStatus();

      expect(Array.isArray(result)).toBe(true);
      result.forEach((group) => {
        expect(group).toHaveProperty("status");
        expect(group).toHaveProperty("_count");
        expect(typeof group._count).toBe("number");
      });
    });

    it("should group tasks by status correctly", async () => {
      const timestamp = Date.now();

      // Create a test user
      const user = await prisma.user.create({
        data: {
          email: `status-user-${timestamp}@example.com`,
          username: `statususer${timestamp}`,
          password: "password",
          firstName: "Status",
          lastName: "User",
        },
      });

      cleanup.trackUser(user.id);

      // Create tasks with different statuses
      const task1 = await prisma.task.create({
        data: {
          title: "TODO Task 1",
          status: TaskStatus.TODO,
          priority: TaskPriority.MEDIUM,
          userId: user.id,
        },
      });

      cleanup.trackTask(task1.id);

      const task2 = await prisma.task.create({
        data: {
          title: "TODO Task 2",
          status: TaskStatus.TODO,
          priority: TaskPriority.LOW,
          userId: user.id,
        },
      });

      cleanup.trackTask(task2.id);

      const task3 = await prisma.task.create({
        data: {
          title: "IN_PROGRESS Task",
          status: TaskStatus.IN_PROGRESS,
          priority: TaskPriority.HIGH,
          userId: user.id,
        },
      });

      cleanup.trackTask(task3.id);

      const task4 = await prisma.task.create({
        data: {
          title: "COMPLETED Task",
          status: TaskStatus.COMPLETED,
          priority: TaskPriority.MEDIUM,
          userId: user.id,
        },
      });

      cleanup.trackTask(task4.id);

      const result = await appDal.getTasksByStatus();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);

      // Find the status groups
      const todoGroup = result.find((group) => group.status === TaskStatus.TODO);
      const inProgressGroup = result.find((group) => group.status === TaskStatus.IN_PROGRESS);
      const completedGroup = result.find((group) => group.status === TaskStatus.COMPLETED);

      expect(todoGroup).toBeDefined();
      expect(todoGroup?._count).toBeGreaterThanOrEqual(2);

      expect(inProgressGroup).toBeDefined();
      expect(inProgressGroup?._count).toBeGreaterThanOrEqual(1);

      expect(completedGroup).toBeDefined();
      expect(completedGroup?._count).toBeGreaterThanOrEqual(1);
    });

    it("should return correct _count for each status", async () => {
      const timestamp = Date.now();

      // Create a test user
      const user = await prisma.user.create({
        data: {
          email: `count-user-${timestamp}@example.com`,
          username: `countuser${timestamp}`,
          password: "password",
          firstName: "Count",
          lastName: "User",
        },
      });

      cleanup.trackUser(user.id);

      // Create multiple tasks with same status
      const tasks = await Promise.all([
        prisma.task.create({
          data: {
            title: "Task 1",
            status: TaskStatus.TODO,
            priority: TaskPriority.MEDIUM,
            userId: user.id,
          },
        }),
        prisma.task.create({
          data: {
            title: "Task 2",
            status: TaskStatus.TODO,
            priority: TaskPriority.MEDIUM,
            userId: user.id,
          },
        }),
        prisma.task.create({
          data: {
            title: "Task 3",
            status: TaskStatus.TODO,
            priority: TaskPriority.MEDIUM,
            userId: user.id,
          },
        }),
      ]);

      tasks.forEach((task) => cleanup.trackTask(task.id));

      const result = await appDal.getTasksByStatus();
      const todoGroup = result.find((group) => group.status === TaskStatus.TODO);

      expect(todoGroup).toBeDefined();
      expect(todoGroup?._count).toBeGreaterThanOrEqual(3);
    });
  });
});
