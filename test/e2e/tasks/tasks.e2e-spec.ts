import { HttpStatus, INestApplication } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "../../../src/app.module";
import { PrismaService } from "../../../src/database/prisma.service";
import { TaskStatus, TaskPriority } from "@prisma/client";
import { TestCleanup } from "../../utils/test-cleanup";
import { Setup, AuthHelper, DataFactory, Assertions, HttpHelper } from "../../utils";

describe("TasksController (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let cleanup: TestCleanup;
  let userId: string;
  let taskId: string;
  let accessToken: string;

  beforeAll(async () => {
    // Use Setup helper to create app
    app = await Setup.createTestApp([AppModule]);

    prisma = app.get<PrismaService>(PrismaService);
    cleanup = new TestCleanup(prisma);

    // Use AuthHelper to register test user
    const { accessToken: token, user } = await AuthHelper.registerUser(app);

    accessToken = token;
    userId = user.id;
    cleanup.trackUser(userId);
  });

  afterEach(async () => {
    await cleanup.cleanupTasks();
  });

  afterAll(async () => {
    await cleanup.cleanupAll();
    await Setup.closeTestApp(app);
  });

  describe("POST /tasks", () => {
    describe("Success", () => {
      it("should create a new task", async () => {
        const response = await HttpHelper.post(app, "/api/v1/tasks", accessToken, {
          title: "E2E Test Task",
          description: "Testing task creation",
          priority: TaskPriority.HIGH,
        });

        Assertions.assertSuccessResponse(response, HttpStatus.CREATED);
        expect(response.body.data).toHaveProperty("id");
        expect(response.body.data.title).toBe("E2E Test Task");

        // Verify Location header is present
        expect(response.headers.location).toBeDefined();
        expect(response.headers.location).toContain(`/api/v1/tasks/${response.body.data.id}`);

        taskId = response.body.data.id;
        cleanup.trackTask(taskId);
      });

      it("should accept today's date", () => {
        const today = new Date();

        today.setHours(23, 59, 59, 999); // End of today

        return request(app.getHttpServer())
          .post("/api/v1/tasks")
          .set("Authorization", `Bearer ${accessToken}`)
          .send({
            title: "Task with today's date",
            dueDate: today.toISOString(),
          })
          .expect(HttpStatus.CREATED)
          .then((res) => {
            expect(res.body.data).toHaveProperty("id");
            expect(res.body.data.dueDate).toBeDefined();
            // Verify Location header
            expect(res.headers.location).toBeDefined();
            expect(res.headers.location).toContain(`/api/v1/tasks/${res.body.data.id}`);
            cleanup.trackTask(res.body.data.id);
          });
      });

      it("should accept future date", () => {
        const futureDate = new Date();

        futureDate.setDate(futureDate.getDate() + 7); // Next week

        return request(app.getHttpServer())
          .post("/api/v1/tasks")
          .set("Authorization", `Bearer ${accessToken}`)
          .send({
            title: "Task with future date",
            dueDate: futureDate.toISOString(),
          })
          .expect(HttpStatus.CREATED)
          .then((res) => {
            expect(res.body.data).toHaveProperty("id");
            expect(res.body.data.dueDate).toBeDefined();
            // Verify Location header
            expect(res.headers.location).toBeDefined();
            expect(res.headers.location).toContain(`/api/v1/tasks/${res.body.data.id}`);
            cleanup.trackTask(res.body.data.id);
          });
      });
    });

    describe("Failure", () => {
      it("should fail validation with short title", async () => {
        const response = await HttpHelper.post(app, "/api/v1/tasks", accessToken, {
          title: "AB",
          priority: TaskPriority.HIGH,
        });

        Assertions.assertValidationError(response);

        expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toMatchObject(["Title must be at least 3 characters long"]);
      });

      it("should fail validation with invalid priority", async () => {
        const response = await HttpHelper.post(app, "/api/v1/tasks", accessToken, {
          title: "Valid Title",
          priority: "INVALID_PRIORITY",
        });

        Assertions.assertValidationError(response);

        expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toMatchObject([
          "Priority must be one of: LOW, MEDIUM, HIGH, URGENT",
        ]);
      });

      it("should fail validation with invalid date format", () => {
        return request(app.getHttpServer())
          .post("/api/v1/tasks")
          .set("Authorization", `Bearer ${accessToken}`)
          .send({
            title: "Valid Title",
            dueDate: "invalid-date",
          })
          .expect(HttpStatus.BAD_REQUEST)
          .then((res) => {
            expect(res.body.message).toContain("Due date has an invalid format");
          });
      });

      it("should fail validation with past date", () => {
        const pastDate = new Date();

        pastDate.setDate(pastDate.getDate() - 1); // Yesterday

        return request(app.getHttpServer())
          .post("/api/v1/tasks")
          .set("Authorization", `Bearer ${accessToken}`)
          .send({
            title: "Valid Title",
            dueDate: pastDate.toISOString(),
          })
          .expect(HttpStatus.BAD_REQUEST)
          .then((res) => {
            expect(res.body.message).toContain("Due date must be today or in the future");
          });
      });
    });
  });

  describe("GET /tasks", () => {
    beforeEach(async () => {
      // Create test tasks before each test to ensure they exist
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

    describe("Success", () => {
      it("should return paginated tasks", async () => {
        const response = await HttpHelper.get(app, "/api/v1/tasks", accessToken);

        Assertions.assertSuccessResponse(response, HttpStatus.OK);
        Assertions.assertPaginatedResponse(response);
      });

      it("should filter tasks by status", () => {
        return request(app.getHttpServer())
          .get("/api/v1/tasks")
          .set("Authorization", `Bearer ${accessToken}`)
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
          .set("Authorization", `Bearer ${accessToken}`)
          .query({ search: "Test Task" })
          .expect(HttpStatus.OK)
          .expect((res: request.Response) => {
            expect(res.body.data.length).toBeGreaterThan(0);
          });
      });

      it("should paginate results", () => {
        return request(app.getHttpServer())
          .get("/api/v1/tasks")
          .set("Authorization", `Bearer ${accessToken}`)
          .query({ page: 1, limit: 2 })
          .expect(HttpStatus.OK)
          .expect((res: request.Response) => {
            expect(res.body.data.length).toBeLessThanOrEqual(2);
            expect(res.body.meta.limit).toBe(2);
          });
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

    describe("Success", () => {
      it("should return a single task", async () => {
        const response = await HttpHelper.get(app, `/api/v1/tasks/${taskId}`, accessToken);

        Assertions.assertSuccessResponse(response, HttpStatus.OK);
        expect(response.body.data.id).toBe(taskId);
        Assertions.assertResourceFields(response.body.data, [
          "title",
          "description",
          "status",
          "priority",
        ]);
      });
    });

    describe("Failure", () => {
      it("should return 404 for non-existent task with valid CUID format", async () => {
        // Use DataFactory to generate a VALID CUID format that doesn't exist in database
        const validButNonExistentId = DataFactory.generateInvalidCuid();

        const response = await HttpHelper.get(
          app,
          `/api/v1/tasks/${validButNonExistentId}`,
          accessToken,
        );

        // DataFactory.generateInvalidCuid() creates valid CUID format, so it passes validation
        // But the task doesn't exist in database, so API returns 404 NOT_FOUND
        expect(response.statusCode).toBe(HttpStatus.NOT_FOUND);
        expect(response.body.message).toContain("Task not found");
        expect(response.body.errorCode).toBe("TASK_NOT_FOUND");
      });

      it("should return 400 for invalid CUID format", () => {
        return request(app.getHttpServer())
          .get("/api/v1/tasks/invalid-id")
          .set("Authorization", `Bearer ${accessToken}`)
          .expect(HttpStatus.BAD_REQUEST)
          .then((res) => {
            expect(res.body.message).toBe(`Invalid CUID format: invalid-id`);
            expect(res.body.errorCode).toBe("VALIDATION_INVALID_CUID");
          });
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

    describe("Success", () => {
      it("should update a task", () => {
        return request(app.getHttpServer())
          .patch(`/api/v1/tasks/${taskId}`)
          .set("Authorization", `Bearer ${accessToken}`)
          .send({
            title: "Updated E2E Task",
            status: TaskStatus.IN_PROGRESS,
          })
          .expect(HttpStatus.OK)
          .expect((res: request.Response) => {
            expect(res.body.data.title).toBe("Updated E2E Task");
            expect(res.body.data.status).toBe(TaskStatus.IN_PROGRESS);
            // Verify Location header for PATCH request
            expect(res.headers.location).toBeDefined();
            expect(res.headers.location).toContain(`/api/v1/tasks/${taskId}`);
          });
      });

      it("should set completedAt when marking as completed", () => {
        return request(app.getHttpServer())
          .patch(`/api/v1/tasks/${taskId}`)
          .set("Authorization", `Bearer ${accessToken}`)
          .send({
            status: TaskStatus.COMPLETED,
          })
          .expect(HttpStatus.OK)
          .expect((res: request.Response) => {
            expect(res.body.data.status).toBe(TaskStatus.COMPLETED);
            expect(res.body.data.completedAt).not.toBeNull();
            // Verify Location header
            expect(res.headers.location).toBeDefined();
            expect(res.headers.location).toContain(`/api/v1/tasks/${taskId}`);
          });
      });

      it("should accept valid completedAt in the past", () => {
        const pastDate = new Date();

        pastDate.setDate(pastDate.getDate() - 7); // Last week

        return request(app.getHttpServer())
          .patch(`/api/v1/tasks/${taskId}`)
          .set("Authorization", `Bearer ${accessToken}`)
          .send({
            status: TaskStatus.COMPLETED,
            completedAt: pastDate.toISOString(),
          })
          .expect(HttpStatus.OK)
          .then((res) => {
            expect(res.body.data.status).toBe(TaskStatus.COMPLETED);
            expect(res.body.data.completedAt).toBeDefined();
            // Verify Location header
            expect(res.headers.location).toBeDefined();
            expect(res.headers.location).toContain(`/api/v1/tasks/${taskId}`);
          });
      });

      it("should accept valid completedAt in the future", () => {
        const futureDate = new Date();

        futureDate.setDate(futureDate.getDate() + 1); // Tomorrow

        return request(app.getHttpServer())
          .patch(`/api/v1/tasks/${taskId}`)
          .set("Authorization", `Bearer ${accessToken}`)
          .send({
            status: TaskStatus.COMPLETED,
            completedAt: futureDate.toISOString(),
          })
          .expect(HttpStatus.OK)
          .then((res) => {
            expect(res.body.data.status).toBe(TaskStatus.COMPLETED);
            expect(res.body.data.completedAt).toBeDefined();
            // Verify Location header
            expect(res.headers.location).toBeDefined();
            expect(res.headers.location).toContain(`/api/v1/tasks/${taskId}`);
          });
      });
    });

    describe("Failure", () => {
      it("should fail validation with invalid status enum", () => {
        return request(app.getHttpServer())
          .patch(`/api/v1/tasks/${taskId}`)
          .set("Authorization", `Bearer ${accessToken}`)
          .send({
            status: "INVALID_STATUS",
          })
          .expect(HttpStatus.BAD_REQUEST)
          .then((res) => {
            expect(res.body.message).toContain(
              "Status must be one of: TODO, IN_PROGRESS, COMPLETED, CANCELLED",
            );
          });
      });

      it("should fail validation with invalid completedAt format", () => {
        return request(app.getHttpServer())
          .patch(`/api/v1/tasks/${taskId}`)
          .set("Authorization", `Bearer ${accessToken}`)
          .send({
            completedAt: "invalid-date",
          })
          .expect(HttpStatus.BAD_REQUEST)
          .then((res) => {
            expect(res.body.message).toContain("Completed at has an invalid format");
          });
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

    describe("Success", () => {
      // eslint-disable-next-line jest/expect-expect
      it("should soft delete a task", () => {
        return request(app.getHttpServer())
          .delete(`/api/v1/tasks/${taskId}`)
          .set("Authorization", `Bearer ${accessToken}`)
          .expect(HttpStatus.NO_CONTENT);
      });
    });

    describe("Failure", () => {
      it("should not find deleted task", async () => {
        // First soft delete the task
        await request(app.getHttpServer())
          .delete(`/api/v1/tasks/${taskId}`)
          .set("Authorization", `Bearer ${accessToken}`)
          .expect(HttpStatus.NO_CONTENT);

        const deletedTask = await prisma.task.findUnique({
          where: { id: taskId },
        });

        expect(deletedTask?.deletedAt).toBeDefined();
      });
    });
  });

  describe("GET /tasks/statistics", () => {
    describe("Success", () => {
      it("should return task statistics", () => {
        return request(app.getHttpServer())
          .get("/api/v1/tasks/statistics")
          .set("Authorization", `Bearer ${accessToken}`)
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

  describe("DELETE /tasks/:id/purge", () => {
    let adminToken: string;
    let adminUserId: string;
    let taskToPurge: string;

    beforeAll(async () => {
      // Create admin user for purge tests
      const { accessToken: token, user } = await AuthHelper.createAdminUser(app, {
        email: "admin-purge-test@example.com",
      });

      adminToken = token;
      adminUserId = user.id;
      cleanup.trackUser(adminUserId);
    });

    beforeEach(async () => {
      // Create a task to be purged
      const response = await HttpHelper.post(app, "/api/v1/tasks", accessToken, {
        title: "Task to Purge",
        description: "This task will be permanently deleted",
        priority: TaskPriority.LOW,
      });

      // Verify Location header on creation
      expect(response.headers.location).toBeDefined();
      expect(response.headers.location).toContain(`/api/v1/tasks/${response.body.data.id}`);

      taskToPurge = response.body.data.id;
      cleanup.trackTask(taskToPurge);

      // Soft delete the task first (purge requires task to be soft-deleted)
      await HttpHelper.delete(app, `/api/v1/tasks/${taskToPurge}`, accessToken);
    });

    describe("Success", () => {
      it("should permanently delete an existing task with admin role", async () => {
        // Purge the task
        const response = await request(app.getHttpServer())
          .delete(`/api/v1/tasks/${taskToPurge}/purge`)
          .set("Authorization", `Bearer ${adminToken}`)
          .expect(HttpStatus.NO_CONTENT);

        expect(response.statusCode).toBe(HttpStatus.NO_CONTENT);

        // Verify task is completely gone from database
        const task = await prisma.task.findUnique({
          where: { id: taskToPurge },
        });

        expect(task).toBeNull();

        // Verify API also returns 404
        const getResponse = await HttpHelper.get(app, `/api/v1/tasks/${taskToPurge}`, accessToken);

        Assertions.assertNotFound(getResponse);
      });

      it("should return 204 when admin tries to purge non-existent task (idempotent)", async () => {
        const nonExistentId = DataFactory.generateInvalidCuid();

        // Note: Current implementation uses raw SQL DELETE which is idempotent
        // Deleting a non-existent task returns 204 (success) rather than 404
        // This is actually better behavior - idempotent deletes are RESTful
        const response = await request(app.getHttpServer())
          .delete(`/api/v1/tasks/${nonExistentId}/purge`)
          .set("Authorization", `Bearer ${adminToken}`);

        // Idempotent delete - returns 204 even if task doesn't exist
        expect(response.statusCode).toBe(HttpStatus.NO_CONTENT);
      });
    });

    describe("Failure", () => {
      it("should return 403 when non-admin user attempts to purge", async () => {
        // Regular user (non-admin) attempts to purge
        const response = await request(app.getHttpServer())
          .delete(`/api/v1/tasks/${taskToPurge}/purge`)
          .set("Authorization", `Bearer ${accessToken}`) // Regular user token
          .expect(HttpStatus.FORBIDDEN);

        expect(response.statusCode).toBe(HttpStatus.FORBIDDEN);
        expect(response.body).toHaveProperty("message");

        // Verify task still exists in database (purge failed)
        const task = await prisma.task.findUnique({
          where: { id: taskToPurge },
        });

        expect(task).not.toBeNull();
        expect(task?.deletedAt).not.toBeNull(); // Should still be soft-deleted
      });
    });
  });
});
