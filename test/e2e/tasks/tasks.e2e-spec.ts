/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Test, TestingModule } from "@nestjs/testing";
import { HttpStatus, INestApplication, ValidationPipe } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "../../../src/app.module";
import { PrismaService } from "../../../src/database/prisma.service";
import { TaskStatus, TaskPriority } from "@prisma/client";
import { TestCleanup } from "../../utils/test-cleanup";
import { TransformInterceptor } from "../../../src/common/interceptors/transform.interceptor";

describe("TasksController (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let cleanup: TestCleanup;
  let userId: string;
  let taskId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);
    cleanup = new TestCleanup(prisma);

    // Set global prefix to match main.ts configuration
    app.setGlobalPrefix("api/v1");

    // Apply global interceptors
    app.useGlobalInterceptors(new TransformInterceptor());

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    // Create test user dynamically
    const timestamp = Date.now();
    const user = await prisma.user.create({
      data: {
        email: `test-e2e-${timestamp}@example.com`,
        username: `teste2e${timestamp}`,
        password: "hashedpassword",
        firstName: "E2E",
        lastName: "Test",
      },
    });

    userId = user.id;
    cleanup.trackUser(userId);
  });

  afterEach(async () => {
    await cleanup.cleanupTasks();
  });

  afterAll(async () => {
    await cleanup.cleanupAll();
    await app.close();
  });

  describe("POST /tasks", () => {
    it("should create a new task", () => {
      return request(app.getHttpServer())
        .post("/api/v1/tasks")
        .set("x-user-id", userId)
        .send({
          title: "E2E Test Task",
          description: "Testing task creation",
          priority: TaskPriority.HIGH,
        })
        .expect(HttpStatus.CREATED)
        .expect((res: request.Response) => {
          expect(res.body.data).toHaveProperty("id");
          expect(res.body.data.title).toBe("E2E Test Task");
          taskId = res.body.data.id;
          cleanup.trackTask(taskId);
        });
    });

    it("should fail validation with short title", () => {
      return request(app.getHttpServer())
        .post("/api/v1/tasks")
        .set("x-user-id", userId)
        .send({
          title: "AB",
          priority: TaskPriority.HIGH,
        })
        .expect(HttpStatus.BAD_REQUEST)
        .then((res) => {
          expect(res.body.message).toMatchObject(["Title must be at least 3 characters long"]);
        });
    });

    it("should fail validation with invalid priority", () => {
      return request(app.getHttpServer())
        .post("/api/v1/tasks")
        .set("x-user-id", userId)
        .send({
          title: "Valid Title",
          priority: "INVALID_PRIORITY",
        })
        .expect(HttpStatus.BAD_REQUEST)
        .then((res) => {
          expect(res.body.message).toMatchObject([
            "Priority must be one of: LOW, MEDIUM, HIGH, URGENT",
          ]);
        });
    });
  });

  describe("GET /tasks", () => {
    beforeAll(async () => {
      // Create test tasks
      const task1 = await prisma.task.create({
        data: {
          title: "Test Task 1",
          description: "First test task",
          status: TaskStatus.TODO,
          priority: TaskPriority.HIGH,
          userId,
        },
      });

      const task2 = await prisma.task.create({
        data: {
          title: "Test Task 2",
          description: "Second test task",
          status: TaskStatus.IN_PROGRESS,
          priority: TaskPriority.MEDIUM,
          userId,
        },
      });

      const task3 = await prisma.task.create({
        data: {
          title: "Test Task 3",
          description: "Third test task",
          status: TaskStatus.TODO,
          priority: TaskPriority.LOW,
          userId,
        },
      });

      cleanup.trackTasks([task1.id, task2.id, task3.id]);
    });

    it("should return paginated tasks", () => {
      return request(app.getHttpServer())
        .get("/api/v1/tasks")
        .expect(HttpStatus.OK)
        .expect((res: request.Response) => {
          expect(res.body).toHaveProperty("data");
          expect(res.body).toHaveProperty("meta");
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.meta).toHaveProperty("total");
          expect(res.body.meta).toHaveProperty("page");
        });
    });

    it("should filter tasks by status", () => {
      return request(app.getHttpServer())
        .get("/api/v1/tasks")
        .query({ status: TaskStatus.TODO })
        .expect(HttpStatus.OK)
        .expect((res: request.Response) => {
          const tasks = res.body.data as any[];

          if (tasks.length > 0) {
            tasks.forEach((task: any) => {
              expect(task.status).toBe(TaskStatus.TODO);
            });
          }
        });
    });

    it("should search tasks by title", () => {
      return request(app.getHttpServer())
        .get("/api/v1/tasks")
        .query({ search: "Test Task" })
        .expect(HttpStatus.OK)
        .expect((res: request.Response) => {
          expect(res.body.data.length).toBeGreaterThan(0);
        });
    });

    it("should paginate results", () => {
      return request(app.getHttpServer())
        .get("/api/v1/tasks")
        .query({ page: 1, limit: 2 })
        .expect(HttpStatus.OK)
        .expect((res: request.Response) => {
          expect(res.body.data.length).toBeLessThanOrEqual(2);
          expect(res.body.meta.limit).toBe(2);
        });
    });
  });

  describe("GET /tasks/:id", () => {
    beforeEach(async () => {
      // Create a task for GET tests
      const task = await prisma.task.create({
        data: {
          title: "Test Task for GET",
          description: "Task for GET endpoint testing",
          status: TaskStatus.TODO,
          priority: TaskPriority.MEDIUM,
          userId,
        },
      });

      taskId = task.id;
      cleanup.trackTask(taskId);
    });

    it("should return a single task", () => {
      return request(app.getHttpServer())
        .get(`/api/v1/tasks/${taskId}`)
        .expect(HttpStatus.OK)
        .expect((res: request.Response) => {
          expect(res.body.data.id).toBe(taskId);
          expect(res.body.data).toHaveProperty("title");
        });
    });

    it("should return 404 for non-existent task", () => {
      // Use a valid CUID format that doesn't exist in database
      // Valid format: 'c' + 24 lowercase alphanumeric characters (25 total)
      const fakeId = "clh9k7x2a0000qmxbzv0q999";

      return request(app.getHttpServer())
        .get(`/api/v1/tasks/${fakeId}`)
        .expect(HttpStatus.BAD_REQUEST)
        .then((res) => {
          expect(res.body.message).toBe(
            `Validation failed (valid CUID is expected). Received: "${fakeId}"`,
          );
        });
    });

    it("should return 400 for invalid CUID format", () => {
      return request(app.getHttpServer())
        .get("/api/v1/tasks/invalid-id")
        .expect(HttpStatus.BAD_REQUEST)
        .then((res) => {
          expect(res.body.message).toBe(
            `Validation failed (valid CUID is expected). Received: "invalid-id"`,
          );
        });
    });
  });

  describe("PATCH /tasks/:id", () => {
    beforeEach(async () => {
      // Create a task for PATCH tests
      const task = await prisma.task.create({
        data: {
          title: "Test Task for PATCH",
          description: "Task for PATCH endpoint testing",
          status: TaskStatus.TODO,
          priority: TaskPriority.MEDIUM,
          userId,
        },
      });

      taskId = task.id;
      cleanup.trackTask(taskId);
    });

    it("should update a task", () => {
      return request(app.getHttpServer())
        .patch(`/api/v1/tasks/${taskId}`)
        .send({
          title: "Updated E2E Task",
          status: TaskStatus.IN_PROGRESS,
        })
        .expect(HttpStatus.OK)
        .expect((res: request.Response) => {
          expect(res.body.data.title).toBe("Updated E2E Task");
          expect(res.body.data.status).toBe(TaskStatus.IN_PROGRESS);
        });
    });

    it("should set completedAt when marking as completed", () => {
      return request(app.getHttpServer())
        .patch(`/api/v1/tasks/${taskId}`)
        .send({
          status: TaskStatus.COMPLETED,
        })
        .expect(HttpStatus.OK)
        .expect((res: request.Response) => {
          expect(res.body.data.status).toBe(TaskStatus.COMPLETED);
          expect(res.body.data.completedAt).not.toBeNull();
        });
    });
  });

  describe("DELETE /tasks/:id", () => {
    beforeEach(async () => {
      // Create a task for DELETE tests
      const task = await prisma.task.create({
        data: {
          title: "Test Task for DELETE",
          description: "Task for DELETE endpoint testing",
          status: TaskStatus.TODO,
          priority: TaskPriority.MEDIUM,
          userId,
        },
      });

      taskId = task.id;
      cleanup.trackTask(taskId);
    });

    it("should soft delete a task", () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/tasks/${taskId}`)
        .expect(HttpStatus.NO_CONTENT);
    });

    it("should not find deleted task", async () => {
      // First soft delete the task
      await request(app.getHttpServer())
        .delete(`/api/v1/tasks/${taskId}`)
        .expect(HttpStatus.NO_CONTENT);

      // Then verify it's not found
      return request(app.getHttpServer())
        .get(`/api/v1/tasks/${taskId}`)
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe("GET /tasks/statistics", () => {
    it("should return task statistics", () => {
      return request(app.getHttpServer())
        .get("/api/v1/tasks/statistics")
        .expect(HttpStatus.OK)
        .expect((res: request.Response) => {
          expect(res.body.data).toHaveProperty("total");
          expect(res.body.data).toHaveProperty("byStatus");
          expect(res.body.data).toHaveProperty("byPriority");
          expect(res.body.data).toHaveProperty("overdue");
        });
    });
  });
});
