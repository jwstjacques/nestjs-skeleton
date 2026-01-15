import { HttpStatus, INestApplication } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "../../../src/app.module";
import { PrismaService } from "../../../src/database/prisma.service";
import { TaskStatus } from "@prisma/client";
import { TestCleanup } from "../../utils/test-cleanup";
import { Setup, AuthHelper, TestDataFactory } from "../../utils";

describe("Tasks v2 API (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let cleanup: TestCleanup;

  beforeAll(async () => {
    // Use Setup helper to create app
    app = await Setup.createTestApp([AppModule]);

    prisma = app.get<PrismaService>(PrismaService);
    cleanup = new TestCleanup(prisma);
  });

  afterAll(async () => {
    await cleanup.cleanupAll();
    await Setup.closeTestApp(app);
  });

  describe("GET /api/v2/tasks/next-due-date?_t=${Date.now()}", () => {
    let userId: string;
    let accessToken: string;

    beforeAll(async () => {
      // Create user specific to this describe block
      const { accessToken: token, user } = await AuthHelper.registerUser(app);

      accessToken = token;
      userId = user.id;
      cleanup.trackUser(userId);
    });

    beforeEach(async () => {
      // Clean up tasks BEFORE each test to ensure isolation
      await prisma.task.deleteMany({ where: { userId } });
    });

    describe("Success", () => {
      it("should return the task with nearest upcoming due date", async () => {
        // Create multiple tasks with different due dates
        await prisma.task.create({
          data: {
            title: "Task 1",
            dueDate: TestDataFactory.getFutureDate(5),
            status: TaskStatus.TODO,
            userId,
          },
        });

        const task2 = await prisma.task.create({
          data: {
            title: "Task 2",
            dueDate: TestDataFactory.getFutureDate(2),
            status: TaskStatus.TODO,
            userId,
          },
        });

        await prisma.task.create({
          data: {
            title: "Task 3",
            dueDate: TestDataFactory.getFutureDate(10),
            status: TaskStatus.IN_PROGRESS,
            userId,
          },
        });

        const response = await request(app.getHttpServer())
          .get(`/api/v2/tasks/next-due-date?_t=${Date.now()}`)
          .set("Authorization", `Bearer ${accessToken}`);

        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body.data.id).toBe(task2.id); // Nearest date (2 days from now)
        expect(response.body.data.title).toBe(task2.title);
      });

      it("should return null when no upcoming tasks exist", async () => {
        await prisma.task.create({
          data: {
            title: "Past Task",
            dueDate: TestDataFactory.getPastDate(5),
            status: TaskStatus.TODO,
            userId,
          },
        });

        const response = await request(app.getHttpServer())
          .get(`/api/v2/tasks/next-due-date?_t=${Date.now()}`) // Cache buster
          .set("Authorization", `Bearer ${accessToken}`);

        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body.data).toBeNull();
      });

      it("should only return tasks with status TODO or IN_PROGRESS", async () => {
        // Create tasks with different statuses
        await prisma.task.create({
          data: {
            title: "Completed Task",
            dueDate: TestDataFactory.getFutureDate(2),
            status: TaskStatus.COMPLETED,
            userId,
          },
        });
        await prisma.task.create({
          data: {
            title: "Cancelled Task",
            dueDate: TestDataFactory.getFutureDate(3),
            status: TaskStatus.CANCELLED,
            userId,
          },
        });
        const todoTask = await prisma.task.create({
          data: {
            title: "Todo Task",
            dueDate: TestDataFactory.getFutureDate(4),
            status: TaskStatus.TODO,
            userId,
          },
        });

        const response = await request(app.getHttpServer())
          .get(`/api/v2/tasks/next-due-date?_t=${Date.now()}`)
          .set("Authorization", `Bearer ${accessToken}`);

        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body.data.id).toBe(todoTask.id); // Should skip COMPLETED and CANCELLED
        expect(response.body.data.status).toBe(TaskStatus.TODO);
      });

      it("should return null when user has a task without due date", async () => {
        await prisma.task.create({
          data: {
            title: "No Due Date Task",
            dueDate: null,
            status: TaskStatus.TODO,
            userId,
          },
        });

        const response = await request(app.getHttpServer())
          .get(`/api/v2/tasks/next-due-date?_t=${Date.now()}`)
          .set("Authorization", `Bearer ${accessToken}`);

        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body.data).toBeNull(); // No due date means no "next due date"
      });

      it("should return null when only task with future due date is COMPLETED", async () => {
        await prisma.task.create({
          data: {
            title: "Completed Future Task",
            dueDate: TestDataFactory.getFutureDate(10),
            status: TaskStatus.COMPLETED,
            userId,
          },
        });

        const response = await request(app.getHttpServer())
          .get(`/api/v2/tasks/next-due-date?_t=${Date.now()}`)
          .set("Authorization", `Bearer ${accessToken}`);

        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body.data).toBeNull(); // COMPLETED tasks are excluded
      });

      it("should return null when only task with future due date is CANCELLED", async () => {
        // Create only cancelled task with future due date
        await prisma.task.create({
          data: {
            title: "Cancelled Future Task",
            dueDate: TestDataFactory.getFutureDate(10),
            status: TaskStatus.CANCELLED,
            userId,
          },
        });

        const response = await request(app.getHttpServer())
          .get(`/api/v2/tasks/next-due-date?_t=${Date.now()}`)
          .set("Authorization", `Bearer ${accessToken}`);

        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body.data).toBeNull(); // CANCELLED tasks are excluded
      });

      it("should return 2nd task when first task is COMPLETED", async () => {
        // Create two tasks, first is completed
        await prisma.task.create({
          data: {
            title: "Completed Task First",
            dueDate: TestDataFactory.getFutureDate(5),
            status: TaskStatus.COMPLETED,
            userId,
          },
        });
        const activeTask = await prisma.task.create({
          data: {
            title: "Active Task Second",
            dueDate: TestDataFactory.getFutureDate(8),
            status: TaskStatus.TODO,
            userId,
          },
        });

        const response = await request(app.getHttpServer())
          .get(`/api/v2/tasks/next-due-date?_t=${Date.now()}`)
          .set("Authorization", `Bearer ${accessToken}`);

        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body.data.id).toBe(activeTask.id); // Should skip COMPLETED task
        expect(response.body.data.status).toBe(TaskStatus.TODO);
      });

      it("should return IN_PROGRESS task when it has nearest due date", async () => {
        await prisma.task.create({
          data: {
            title: "Todo Task",
            dueDate: TestDataFactory.getFutureDate(8),
            status: TaskStatus.TODO,
            userId,
          },
        });
        const inProgressTask = await prisma.task.create({
          data: {
            title: "In Progress Task",
            dueDate: TestDataFactory.getFutureDate(5),
            status: TaskStatus.IN_PROGRESS,
            userId,
          },
        });

        const response = await request(app.getHttpServer())
          .get(`/api/v2/tasks/next-due-date?_t=${Date.now()}`)
          .set("Authorization", `Bearer ${accessToken}`);

        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body.data.id).toBe(inProgressTask.id); // IN_PROGRESS is valid
        expect(response.body.data.status).toBe(TaskStatus.IN_PROGRESS);
      });
    });

    describe("Failure", () => {
      it("should require authentication", async () => {
        const response = await request(app.getHttpServer()).get(
          `/api/v2/tasks/next-due-date?_t=${Date.now()}`,
        );

        expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
      });
    });
  });

  describe("GET /api/v2/tasks/:id - Permission Checks", () => {
    let userId: string;
    let adminUserId: string;
    let accessToken: string;
    let adminAccessToken: string;

    beforeAll(async () => {
      // Create users specific to this describe block
      const { accessToken: token, user } = await AuthHelper.registerUser(app);

      accessToken = token;
      userId = user.id;
      cleanup.trackUser(userId);

      const { accessToken: adminToken, user: adminUser } = await AuthHelper.createAdminUser(app);

      adminAccessToken = adminToken;
      adminUserId = adminUser.id;
      cleanup.trackUser(adminUserId);
    });

    beforeEach(async () => {
      // Clean up tasks BEFORE each test to ensure isolation
      await prisma.task.deleteMany({ where: { userId: { in: [userId, adminUserId] } } });
    });

    describe("Success", () => {
      it("should allow owner to access their task", async () => {
        const task = await prisma.task.create({
          data: {
            title: "Owner Task",
            status: TaskStatus.TODO,
            userId,
          },
        });

        const response = await request(app.getHttpServer())
          .get(`/api/v2/tasks/${task.id}`)
          .set("Authorization", `Bearer ${accessToken}`);

        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body.data.id).toBe(task.id);
      });

      it("should allow admin to access any task", async () => {
        const task = await prisma.task.create({
          data: {
            title: "Regular User Task",
            status: TaskStatus.TODO,
            userId, // Regular user's task
          },
        });

        const response = await request(app.getHttpServer())
          .get(`/api/v2/tasks/${task.id}`)
          .set("Authorization", `Bearer ${adminAccessToken}`); // Admin accessing

        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body.data.id).toBe(task.id);
      });
    });

    describe("Failure", () => {
      it("should deny non-owner/non-admin access", async () => {
        const task = await prisma.task.create({
          data: {
            title: "Admin Task",
            status: TaskStatus.TODO,
            userId: adminUserId, // Admin's task
          },
        });

        const response = await request(app.getHttpServer())
          .get(`/api/v2/tasks/${task.id}`)
          .set("Authorization", `Bearer ${accessToken}`); // Regular user trying to access

        expect(response.status).toBe(HttpStatus.FORBIDDEN);
        expect(response.body.message).toContain("permission");
      });

      it("should return 404 for non-existent task", async () => {
        const nonExistentId = TestDataFactory.generateInvalidCuid();

        const response = await request(app.getHttpServer())
          .get(`/api/v2/tasks/${nonExistentId}`)
          .set("Authorization", `Bearer ${accessToken}`);

        expect(response.status).toBe(HttpStatus.NOT_FOUND);
      });

      it("should require authentication", async () => {
        const task = await prisma.task.create({
          data: {
            title: "Test Task",
            status: TaskStatus.TODO,
            userId,
          },
        });

        const response = await request(app.getHttpServer()).get(`/api/v2/tasks/${task.id}`);

        expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
      });
    });
  });
});
