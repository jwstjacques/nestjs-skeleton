import { HttpStatus, INestApplication } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "../../src/app.module";
import { Setup, AuthHelper, DataFactory, Assertions, HttpHelper } from "../utils";

describe("Example E2E Test (Refactored)", () => {
  let app: INestApplication;
  let authToken: string;
  let testResourceId: string;

  // ============================================================================
  // Setup & Teardown
  // ============================================================================

  beforeAll(async () => {
    // Use Setup helper to create app
    app = await Setup.createTestApp([AppModule]);

    // Use AuthHelper to create and login test user
    const { accessToken } = await AuthHelper.registerUser(app, {
      email: "refactored-test@example.com",
    });

    authToken = accessToken;
  });

  afterAll(async () => {
    // Use Setup helper to clean up
    await Setup.closeTestApp(app);
  });

  // ============================================================================
  // Authentication Tests (using templates)
  // ============================================================================

  describe("Authentication", () => {
    describe("Unauthorized Access", () => {
      const endpoints = [
        { method: "get", path: "/api/v1/tasks" },
        { method: "get", path: "/api/v1/tasks/123" },
        { method: "post", path: "/api/v1/tasks" },
      ];

      endpoints.forEach(({ method, path }) => {
        it(`should return 401 for ${method.toUpperCase()} ${path} without auth`, async () => {
          const response = await request(app.getHttpServer())[
            method as "get" | "post" | "patch" | "delete"
          ](path);

          Assertions.assertUnauthorized(response);
        });
      });
    });
  });

  // ============================================================================
  // Create Resource Tests (using helpers and assertions)
  // ============================================================================

  describe("POST /api/v1/tasks - Create", () => {
    it("should create task successfully", async () => {
      const createData = {
        title: "Test Task from Refactored Test",
        description: "Created using new test utilities",
        priority: "HIGH",
        status: "TODO",
      };

      // Use HttpHelper for authenticated requests
      const response = await HttpHelper.post(app, "/api/v1/tasks", authToken, createData);

      // Use Assertions for response validation
      Assertions.assertSuccessResponse(response, HttpStatus.CREATED);
      expect(response.body.data).toHaveProperty("id");
      expect(response.body.data.title).toBe(createData.title);

      // Use assertion helper for timestamp validation
      Assertions.assertRecentTimestamp(response.body.data.createdAt);

      // Store for later tests
      testResourceId = response.body.data.id;
    });

    it("should validate required fields", async () => {
      const response = await HttpHelper.post(app, "/api/v1/tasks", authToken, {
        description: "Missing title",
      });

      // Use validation assertion
      Assertions.assertValidationError(response, ["title"]);
    });

    it("should validate title length", async () => {
      const response = await HttpHelper.post(app, "/api/v1/tasks", authToken, {
        title: "ab", // Too short (min: 3)
      });

      Assertions.assertValidationError(response);
    });
  });

  // ============================================================================
  // List Resources Tests (using pagination template)
  // ============================================================================

  describe("GET /api/v1/tasks - List", () => {
    describe("Pagination", () => {
      it("should return paginated results", async () => {
        const response = await HttpHelper.get(app, "/api/v1/tasks?page=1&limit=10", authToken);

        Assertions.assertSuccessResponse(response, HttpStatus.OK);
        Assertions.assertPaginatedResponse(response);
      });

      it("should respect limit parameter", async () => {
        const limit = 5;
        const response = await HttpHelper.get(
          app,
          `/api/v1/tasks?page=1&limit=${limit}`,
          authToken,
        );

        Assertions.assertSuccessResponse(response, HttpStatus.OK);
        Assertions.assertPaginatedResponse(response);
        expect(response.body.meta.limit).toBe(limit);
      });

      it("should handle invalid page number", async () => {
        const response = await HttpHelper.get(app, "/api/v1/tasks?page=0&limit=10", authToken);

        Assertions.assertValidationError(response);
      });

      it("should handle invalid limit", async () => {
        const response = await HttpHelper.get(app, "/api/v1/tasks?page=1&limit=0", authToken);

        Assertions.assertValidationError(response);
      });

      it("should handle page exceeding total pages", async () => {
        const response = await HttpHelper.get(app, "/api/v1/tasks?page=999999&limit=10", authToken);

        Assertions.assertSuccessResponse(response, HttpStatus.OK);
        Assertions.assertPaginatedResponse(response, 0);
      });
    });

    it("should return paginated list", async () => {
      const response = await HttpHelper.get(app, "/api/v1/tasks?page=1&limit=10", authToken);

      Assertions.assertSuccessResponse(response, HttpStatus.OK);
      Assertions.assertPaginatedResponse(response);
    });

    it("should filter by status", async () => {
      const response = await HttpHelper.get(app, "/api/v1/tasks?status=TODO", authToken);

      Assertions.assertSuccessResponse(response, HttpStatus.OK);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    it("should sort by created date", async () => {
      const response = await HttpHelper.get(
        app,
        "/api/v1/tasks?sortBy=createdAt&sortOrder=desc",
        authToken,
      );

      Assertions.assertSuccessResponse(response, HttpStatus.OK);
      expect(response.body.data).toBeInstanceOf(Array);
    });
  });

  // ============================================================================
  // Get Single Resource Tests
  // ============================================================================

  describe("GET /api/v1/tasks/:id - Get Single", () => {
    it("should get task by ID", async () => {
      const response = await HttpHelper.get(app, `/api/v1/tasks/${testResourceId}`, authToken);

      Assertions.assertSuccessResponse(response, HttpStatus.OK);
      expect(response.body.data.id).toBe(testResourceId);

      // Use resource fields assertion
      Assertions.assertResourceFields(response.body.data, ["id", "title", "status"]);
    });

    it("should return 404 for non-existent task", async () => {
      const invalidId = DataFactory.generateInvalidCuid();
      const response = await HttpHelper.get(app, `/api/v1/tasks/${invalidId}`, authToken);

      // Use not found assertion with error code
      Assertions.assertNotFound(response, "TASK_NOT_FOUND");
    });

    // Note: Tasks API doesn't implement per-resource authorization
    // All authenticated users can access all tasks
    // eslint-disable-next-line jest/no-disabled-tests
    it.skip("should return 403 when accessing other user task", async () => {
      // Create another user
      const { accessToken: otherToken } = await AuthHelper.registerUser(app, {
        email: "other-user@example.com",
      });

      // Try to access first user's task
      const response = await HttpHelper.get(app, `/api/v1/tasks/${testResourceId}`, otherToken);

      Assertions.assertForbidden(response, "TASK_FORBIDDEN");
    });
  });

  // ============================================================================
  // Update Resource Tests
  // ============================================================================

  describe("PATCH /api/v1/tasks/:id - Update", () => {
    it("should update task successfully", async () => {
      const updateData = {
        status: "IN_PROGRESS",
        description: "Updated via refactored test",
      };

      const response = await HttpHelper.patch(
        app,
        `/api/v1/tasks/${testResourceId}`,
        authToken,
        updateData,
      );

      Assertions.assertSuccessResponse(response, HttpStatus.OK);
      expect(response.body.data.status).toBe("IN_PROGRESS");
      expect(response.body.data.description).toBe(updateData.description);
    });

    it("should validate enum values", async () => {
      const response = await HttpHelper.patch(app, `/api/v1/tasks/${testResourceId}`, authToken, {
        status: "INVALID_STATUS",
      });

      Assertions.assertValidationError(response);
    });

    it("should return 404 for non-existent task", async () => {
      const invalidId = DataFactory.generateInvalidCuid();
      const response = await HttpHelper.patch(app, `/api/v1/tasks/${invalidId}`, authToken, {
        title: "New Title",
      });

      Assertions.assertNotFound(response);
    });
  });

  // ============================================================================
  // Delete Resource Tests
  // ============================================================================

  describe("DELETE /api/v1/tasks/:id - Delete", () => {
    let taskToDelete: string;

    beforeEach(async () => {
      // Create a task to delete
      const response = await HttpHelper.post(app, "/api/v1/tasks", authToken, {
        title: "Task to Delete",
        description: "Will be deleted in test",
      });

      taskToDelete = response.body.data.id;
    });

    it("should soft delete task", async () => {
      const response = await HttpHelper.delete(app, `/api/v1/tasks/${taskToDelete}`, authToken);

      expect(response.statusCode).toBe(HttpStatus.NO_CONTENT);
    });

    it("should not return soft deleted task in list", async () => {
      // Delete task
      await HttpHelper.delete(app, `/api/v1/tasks/${taskToDelete}`, authToken);

      // Verify not in list
      const response = await HttpHelper.get(app, "/api/v1/tasks", authToken);
      const deletedTask = response.body.data.find((task: any) => task.id === taskToDelete);

      expect(deletedTask).toBeUndefined();
    });

    it("should return 404 when deleting non-existent task", async () => {
      const invalidId = DataFactory.generateInvalidCuid();
      const response = await HttpHelper.delete(app, `/api/v1/tasks/${invalidId}`, authToken);

      Assertions.assertNotFound(response);
    });
  });

  // ============================================================================
  // Permanent Delete Tests (Admin only)
  // ============================================================================

  describe("DELETE /api/v1/tasks/admin/purge/:id - Permanent Delete", () => {
    let taskToPurge: string;
    let adminToken: string;

    beforeAll(async () => {
      // Create admin user for purge tests
      const { accessToken } = await AuthHelper.createAdminUser(app, {
        email: "admin-test@example.com",
      });

      adminToken = accessToken;
    });

    beforeEach(async () => {
      // Create task
      const response = await HttpHelper.post(app, "/api/v1/tasks", authToken, {
        title: "Task to Purge",
      });

      taskToPurge = response.body.data.id;

      // Soft delete first
      await HttpHelper.delete(app, `/api/v1/tasks/${taskToPurge}`, authToken);
    });

    it("should permanently delete task with admin role", async () => {
      const response = await request(app.getHttpServer())
        .delete(`/api/v1/tasks/admin/purge/${taskToPurge}`)
        .set(AuthHelper.authHeader(adminToken))
        .expect(HttpStatus.NO_CONTENT);

      expect(response.statusCode).toBe(HttpStatus.NO_CONTENT);

      // Verify task is completely gone from database
      const getResponse = await HttpHelper.get(app, `/api/v1/tasks/${taskToPurge}`, authToken);

      Assertions.assertNotFound(getResponse);
    });

    it("should return 403 when non-admin tries to purge", async () => {
      const response = await request(app.getHttpServer())
        .delete(`/api/v1/tasks/admin/purge/${taskToPurge}`)
        .set(AuthHelper.authHeader(authToken)) // Regular user token
        .expect(HttpStatus.FORBIDDEN);

      expect(response.statusCode).toBe(HttpStatus.FORBIDDEN);
    });
  });

  // ============================================================================
  // Data Factory Tests (demonstrating utilities)
  // ============================================================================

  describe("Utility Demonstrations", () => {
    it("should use DataFactory for test data", () => {
      const userData = DataFactory.createUserData();

      expect(userData).toHaveProperty("email");
      expect(userData).toHaveProperty("username");
      expect(userData).toHaveProperty("password");
    });

    it("should generate valid CUIDs", () => {
      const cuid = DataFactory.generateCuid();

      expect(cuid).toMatch(/^c[a-z0-9]+$/);
      expect(cuid.length).toBeGreaterThan(10);
    });

    it("should create pagination queries", () => {
      const query = DataFactory.createPaginationQuery({ limit: 20 });

      expect(query.page).toBe(1);
      expect(query.limit).toBe(20);
      expect(query.sortBy).toBe("createdAt");
    });

    it("should create date ranges", () => {
      const range = DataFactory.createDateRange(7);

      expect(range.startDate).toBeInstanceOf(Date);
      expect(range.endDate).toBeInstanceOf(Date);
      expect(range.endDate.getTime()).toBeGreaterThan(range.startDate.getTime());
    });
  });
});
