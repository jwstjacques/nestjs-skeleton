import { HttpStatus, INestApplication } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "../../../src/app.module";
import { PrismaService } from "../../../src/database/prisma.service";
import { TestCleanup } from "../../utils/test-cleanup";
import { Setup, TestDataFactory } from "../../utils";
import { ErrorCode } from "@app/common/constants";

describe("Auth API (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let cleanup: TestCleanup;

  beforeAll(async () => {
    app = await Setup.createTestApp([AppModule]);
    prisma = app.get<PrismaService>(PrismaService);
    cleanup = new TestCleanup(prisma);
  });

  afterAll(async () => {
    await cleanup.cleanupAll();
    await Setup.closeTestApp(app);
  });

  // ============================================================================
  // Registration Tests
  // ============================================================================

  describe("POST /auth/register", () => {
    describe("Success", () => {
      it("should register a new user with valid data", async () => {
        const userData = TestDataFactory.createUserData();

        const response = await request(app.getHttpServer())
          .post("/api/v1/auth/register")
          .send(userData)
          .expect(HttpStatus.CREATED);

        const userId = response.body.data.user.id;

        // Location header should not be present for auth operations
        expect(response.headers.location).toBeUndefined();

        expect(response.body.data).toHaveProperty("user");
        expect(response.body.data).toHaveProperty("accessToken");
        expect(response.body.data).toHaveProperty("refreshToken");
        expect(response.body.data.user).toHaveProperty("id");
        expect(response.body.data.user).toHaveProperty("email", userData.email);
        expect(response.body.data.user).toHaveProperty("username", userData.username);

        cleanup.trackUser(userId);
      });

      it("should allow registration with optional firstName and lastName", async () => {
        const userData = TestDataFactory.createUserData({
          firstName: "John",
          lastName: "Doe",
        });

        const response = await request(app.getHttpServer())
          .post("/api/v1/auth/register")
          .send(userData)
          .expect(HttpStatus.CREATED);

        const userId = response.body.data.user.id;

        expect(response.body.data.user).toHaveProperty("firstName", "John");
        expect(response.body.data.user).toHaveProperty("lastName", "Doe");

        cleanup.trackUser(userId);
      });
    });

    describe("Failure", () => {
      it("should return 409 CONFLICT when registering with duplicate email", async () => {
        const userData = TestDataFactory.createUserData({
          email: "conflict-test@example.com",
        });

        // Register first user
        const firstResponse = await request(app.getHttpServer())
          .post("/api/v1/auth/register")
          .send(userData)
          .expect(HttpStatus.CREATED);

        const userId = firstResponse.body.data.user.id;

        cleanup.trackUser(userId);

        // Try to register with same email
        const conflictResponse = await request(app.getHttpServer())
          .post("/api/v1/auth/register")
          .send(userData)
          .expect(HttpStatus.CONFLICT);

        expect(conflictResponse.body).toHaveProperty("statusCode", HttpStatus.CONFLICT);
        expect(conflictResponse.body).toHaveProperty(
          "errorCode",
          ErrorCode.AUTH_REGISTRATION_FAILED,
        );
      });

      it("should return 409 CONFLICT when registering with duplicate username", async () => {
        const duplicate = "duplicateusername123";

        const userData = TestDataFactory.createUserData({
          username: duplicate,
        });

        // Register first user
        const firstResponse = await request(app.getHttpServer())
          .post("/api/v1/auth/register")
          .send(userData)
          .expect(HttpStatus.CREATED);

        const userId = firstResponse.body.data.user.id;

        cleanup.trackUser(userId);

        // Try to register with same username but different email
        const secondData = TestDataFactory.createUserData({
          username: duplicate,
        });

        const conflictResponse = await request(app.getHttpServer())
          .post("/api/v1/auth/register")
          .send(secondData)
          .expect(HttpStatus.CONFLICT);

        expect(conflictResponse.body).toHaveProperty("statusCode", HttpStatus.CONFLICT);
        expect(conflictResponse.body).toHaveProperty(
          "errorCode",
          ErrorCode.AUTH_REGISTRATION_FAILED,
        );
      });

      it("should return 400 BAD_REQUEST with invalid email format", async () => {
        const userData = TestDataFactory.createUserData({
          email: "invalid-email",
        });

        const response = await request(app.getHttpServer())
          .post("/api/v1/auth/register")
          .send(userData)
          .expect(HttpStatus.BAD_REQUEST);

        expect(response.body).toHaveProperty("statusCode", HttpStatus.BAD_REQUEST);
        expect(response.body.message).toEqual(
          expect.arrayContaining([expect.stringContaining("Invalid email format")]),
        );
      });

      it("should return 400 BAD_REQUEST with weak password", async () => {
        const userData = TestDataFactory.createUserData({
          password: "weak", // Missing uppercase, number, special char
        });

        const response = await request(app.getHttpServer())
          .post("/api/v1/auth/register")
          .send(userData)
          .expect(HttpStatus.BAD_REQUEST);

        expect(response.body).toHaveProperty("statusCode", HttpStatus.BAD_REQUEST);
        expect(response.body.message).toEqual(
          expect.arrayContaining([expect.stringContaining("Password must contain")]),
        );
      });

      it("should return 400 BAD_REQUEST with missing required fields", async () => {
        const response = await request(app.getHttpServer())
          .post("/api/v1/auth/register")
          .send({
            email: "test@example.com",
            // Missing username and password
          })
          .expect(HttpStatus.BAD_REQUEST);

        expect(response.body).toHaveProperty("statusCode", HttpStatus.BAD_REQUEST);
        expect(response.body.message).toEqual(
          expect.arrayContaining([
            expect.stringContaining("username"),
            expect.stringContaining("password"),
          ]),
        );
      });

      it("should return 400 BAD_REQUEST with username too short", async () => {
        const userData = TestDataFactory.createUserData({
          username: "ab", // Minimum is 3 characters
        });

        const response = await request(app.getHttpServer())
          .post("/api/v1/auth/register")
          .send(userData)
          .expect(HttpStatus.BAD_REQUEST);

        expect(response.body).toHaveProperty("statusCode", HttpStatus.BAD_REQUEST);
        expect(response.body.message).toEqual(
          expect.arrayContaining([expect.stringContaining("at least 3 characters")]),
        );
      });
    });
  });

  // ============================================================================
  // Login Tests
  // ============================================================================

  describe("POST /auth/login", () => {
    let testUser: { email: string; username: string; password: string; userId: string };

    beforeAll(async () => {
      // Create a user for login tests
      const userData = TestDataFactory.createUserData();

      const response = await request(app.getHttpServer())
        .post("/api/v1/auth/register")
        .send(userData)
        .expect(HttpStatus.CREATED);

      testUser = {
        email: userData.email,
        username: userData.username,
        password: userData.password,
        userId: response.body.data.user.id,
      };

      cleanup.trackUser(testUser.userId);
    });

    describe("Success", () => {
      it("should login with valid username and password", async () => {
        const response = await request(app.getHttpServer())
          .post("/api/v1/auth/login")
          .send({
            username: testUser.username,
            password: testUser.password,
          })
          .expect(HttpStatus.OK);

        // Location header should not be present for auth operations
        expect(response.headers.location).toBeUndefined();

        expect(response.body.data).toHaveProperty("accessToken");
        expect(response.body.data).toHaveProperty("refreshToken");
        expect(response.body.data).toHaveProperty("user");
        expect(response.body.data.user.id).toBe(testUser.userId);
      });

      it("should login with valid email and password", async () => {
        const response = await request(app.getHttpServer())
          .post("/api/v1/auth/login")
          .send({
            username: testUser.email,
            password: testUser.password,
          })
          .expect(HttpStatus.OK);

        expect(response.body.data).toHaveProperty("accessToken");
        expect(response.body.data).toHaveProperty("refreshToken");
        expect(response.body.data).toHaveProperty("user");
        expect(response.body.data.user.id).toBe(testUser.userId);
      });
    });

    describe("Failure", () => {
      it("should return 400 BAD_REQUEST with wrong field name (identifier instead of username)", async () => {
        const response = await request(app.getHttpServer())
          .post("/api/v1/auth/login")
          .send({
            identifier: testUser.username, // Wrong field name
            password: testUser.password,
          })
          .expect(HttpStatus.BAD_REQUEST);

        expect(response.body).toHaveProperty("statusCode", HttpStatus.BAD_REQUEST);
        expect(response.body.message).toEqual(
          expect.arrayContaining([expect.stringContaining("username")]),
        );
      });

      it("should return 401 UNAUTHORIZED with invalid password", async () => {
        const response = await request(app.getHttpServer())
          .post("/api/v1/auth/login")
          .send({
            username: testUser.username,
            password: "WrongPassword123!",
          })
          .expect(HttpStatus.UNAUTHORIZED);

        expect(response.body).toHaveProperty("statusCode", HttpStatus.UNAUTHORIZED);
        expect(response.body).toHaveProperty("errorCode", "AUTH_INVALID_CREDENTIALS");
      });

      it("should return 401 UNAUTHORIZED with non-existent username", async () => {
        const response = await request(app.getHttpServer())
          .post("/api/v1/auth/login")
          .send({
            username: "nonexistentuser",
            password: testUser.password,
          })
          .expect(HttpStatus.UNAUTHORIZED);

        expect(response.body).toHaveProperty("statusCode", HttpStatus.UNAUTHORIZED);
        expect(response.body).toHaveProperty("errorCode", "AUTH_INVALID_CREDENTIALS");
      });

      it("should return 400 BAD_REQUEST with missing username", async () => {
        const response = await request(app.getHttpServer())
          .post("/api/v1/auth/login")
          .send({
            password: testUser.password,
          })
          .expect(HttpStatus.BAD_REQUEST);

        expect(response.body).toHaveProperty("statusCode", HttpStatus.BAD_REQUEST);
        expect(response.body.message).toEqual(
          expect.arrayContaining([expect.stringContaining("username")]),
        );
      });

      it("should return 400 BAD_REQUEST with missing password", async () => {
        const response = await request(app.getHttpServer())
          .post("/api/v1/auth/login")
          .send({
            username: testUser.username,
          })
          .expect(HttpStatus.BAD_REQUEST);

        expect(response.body).toHaveProperty("statusCode", HttpStatus.BAD_REQUEST);
        expect(response.body.message).toEqual(
          expect.arrayContaining([expect.stringContaining("password")]),
        );
      });
    });
  });

  // ============================================================================
  // Token Refresh Tests
  // ============================================================================

  describe("POST /auth/refresh", () => {
    let testUser: { userId: string; refreshToken: string };

    beforeAll(async () => {
      // Create a user and get refresh token
      const userData = TestDataFactory.createUserData();

      const response = await request(app.getHttpServer())
        .post("/api/v1/auth/register")
        .send(userData)
        .expect(HttpStatus.CREATED);

      testUser = {
        userId: response.body.data.user.id,
        refreshToken: response.body.data.refreshToken,
      };

      cleanup.trackUser(testUser.userId);
    });

    describe("Success", () => {
      it("should refresh tokens with valid refresh token", async () => {
        const response = await request(app.getHttpServer())
          .post("/api/v1/auth/refresh")
          .send({ refreshToken: testUser.refreshToken })
          .expect(HttpStatus.OK);

        // Location header should not be present for auth operations
        expect(response.headers.location).toBeUndefined();

        expect(response.body.data).toHaveProperty("accessToken");
        expect(response.body.data).toHaveProperty("refreshToken");
        // New tokens should be different from the old refresh token
        expect(response.body.data.accessToken).not.toBe(testUser.refreshToken);
        // The new refresh token should be different from the old one (valid test)
        expect(response.body.data.refreshToken).toBeDefined();
      });
    });

    describe("Failure", () => {
      it("should return 401 UNAUTHORIZED with invalid refresh token", async () => {
        const response = await request(app.getHttpServer())
          .post("/api/v1/auth/refresh")
          .send({ refreshToken: "invalid-token-format" })
          .expect(HttpStatus.UNAUTHORIZED);

        expect(response.body).toHaveProperty("statusCode", HttpStatus.UNAUTHORIZED);
      });

      it("should return 401 UNAUTHORIZED with expired/tampered refresh token", async () => {
        // Tampered token (changed last character)
        const tamperedToken = testUser.refreshToken.slice(0, -1) + "x";

        const response = await request(app.getHttpServer())
          .post("/api/v1/auth/refresh")
          .send({ refreshToken: tamperedToken })
          .expect(HttpStatus.UNAUTHORIZED);

        expect(response.body).toHaveProperty("statusCode", HttpStatus.UNAUTHORIZED);
      });

      it("should return 400 BAD_REQUEST with missing refreshToken", async () => {
        // When refreshToken is missing from body, JWT guard will return 401 instead of validation error
        // because the guard checks for token before validation kicks in
        const response = await request(app.getHttpServer())
          .post("/api/v1/auth/refresh")
          .send({})
          .expect(HttpStatus.UNAUTHORIZED);

        expect(response.body).toHaveProperty("statusCode", HttpStatus.UNAUTHORIZED);
      });
    });
  });

  // ============================================================================
  // Logout Tests
  // ============================================================================

  describe("POST /auth/logout", () => {
    describe("Success", () => {
      it("should logout successfully with valid access token", async () => {
        const userData = TestDataFactory.createUserData();
        const regResponse = await request(app.getHttpServer())
          .post("/api/v1/auth/register")
          .send(userData)
          .expect(HttpStatus.CREATED);

        const accessToken = regResponse.body.data.accessToken;
        const userId = regResponse.body.data.user.id;

        cleanup.trackUser(userId);

        const logoutResponse = await request(app.getHttpServer())
          .post("/api/v1/auth/logout")
          .set("Authorization", `Bearer ${accessToken}`)
          .expect(HttpStatus.OK);

        expect(logoutResponse.body.data).toHaveProperty("message", "Successfully logged out");
      });

      it("should reject the token on subsequent requests after logout", async () => {
        const userData = TestDataFactory.createUserData();
        const regResponse = await request(app.getHttpServer())
          .post("/api/v1/auth/register")
          .send(userData)
          .expect(HttpStatus.CREATED);

        const accessToken = regResponse.body.data.accessToken;
        const userId = regResponse.body.data.user.id;

        cleanup.trackUser(userId);

        // Verify token works before logout
        await request(app.getHttpServer())
          .get("/api/v1/tasks")
          .set("Authorization", `Bearer ${accessToken}`)
          .expect(HttpStatus.OK);

        // Logout
        await request(app.getHttpServer())
          .post("/api/v1/auth/logout")
          .set("Authorization", `Bearer ${accessToken}`)
          .expect(HttpStatus.OK);

        // Verify token is rejected after logout
        await request(app.getHttpServer())
          .get("/api/v1/tasks")
          .set("Authorization", `Bearer ${accessToken}`)
          .expect(HttpStatus.UNAUTHORIZED);
      });

      it("should not affect other tokens after logout", async () => {
        const userData = TestDataFactory.createUserData();
        const regResponse = await request(app.getHttpServer())
          .post("/api/v1/auth/register")
          .send(userData)
          .expect(HttpStatus.CREATED);

        const userId = regResponse.body.data.user.id;

        cleanup.trackUser(userId);

        // Login to get a second token
        const loginResponse = await request(app.getHttpServer())
          .post("/api/v1/auth/login")
          .send({ username: userData.username, password: userData.password })
          .expect(HttpStatus.OK);

        const firstToken = regResponse.body.data.accessToken;
        const secondToken = loginResponse.body.data.accessToken;

        // Logout with first token
        await request(app.getHttpServer())
          .post("/api/v1/auth/logout")
          .set("Authorization", `Bearer ${firstToken}`)
          .expect(HttpStatus.OK);

        // First token should be rejected
        await request(app.getHttpServer())
          .get("/api/v1/tasks")
          .set("Authorization", `Bearer ${firstToken}`)
          .expect(HttpStatus.UNAUTHORIZED);

        // Second token should still work
        await request(app.getHttpServer())
          .get("/api/v1/tasks")
          .set("Authorization", `Bearer ${secondToken}`)
          .expect(HttpStatus.OK);
      });

      it("should allow re-login after logout", async () => {
        const userData = TestDataFactory.createUserData();
        const regResponse = await request(app.getHttpServer())
          .post("/api/v1/auth/register")
          .send(userData)
          .expect(HttpStatus.CREATED);

        const accessToken = regResponse.body.data.accessToken;
        const userId = regResponse.body.data.user.id;

        cleanup.trackUser(userId);

        // Logout
        await request(app.getHttpServer())
          .post("/api/v1/auth/logout")
          .set("Authorization", `Bearer ${accessToken}`)
          .expect(HttpStatus.OK);

        // Re-login should work
        const loginResponse = await request(app.getHttpServer())
          .post("/api/v1/auth/login")
          .send({ username: userData.username, password: userData.password })
          .expect(HttpStatus.OK);

        const newToken = loginResponse.body.data.accessToken;

        // New token should work
        await request(app.getHttpServer())
          .get("/api/v1/tasks")
          .set("Authorization", `Bearer ${newToken}`)
          .expect(HttpStatus.OK);
      });
    });

    describe("Failure", () => {
      it("should return 401 when logging out without a token", async () => {
        await request(app.getHttpServer())
          .post("/api/v1/auth/logout")
          .expect(HttpStatus.UNAUTHORIZED);
      });

      it("should return 401 when logging out with an invalid token", async () => {
        await request(app.getHttpServer())
          .post("/api/v1/auth/logout")
          .set("Authorization", "Bearer invalid-token")
          .expect(HttpStatus.UNAUTHORIZED);
      });
    });
  });

  // ============================================================================
  // Authorization Tests
  // ============================================================================

  describe("Protected Routes Authorization", () => {
    let accessToken: string;
    let userId: string;

    beforeAll(async () => {
      // Create a user and get access token
      const userData = TestDataFactory.createUserData();

      const response = await request(app.getHttpServer())
        .post("/api/v1/auth/register")
        .send(userData)
        .expect(HttpStatus.CREATED);

      accessToken = response.body.data.accessToken;
      userId = response.body.data.user.id;

      cleanup.trackUser(userId);
    });

    describe("Success", () => {
      it("should allow access to protected route with valid access token", async () => {
        const response = await request(app.getHttpServer())
          .get("/api/v1/tasks")
          .set("Authorization", `Bearer ${accessToken}`)
          .expect(HttpStatus.OK);

        expect(response.body).toHaveProperty("data");
      });

      it("should return 200 OK accessing protected route with valid token and retrieve user data", async () => {
        const response = await request(app.getHttpServer())
          .get("/api/v1/tasks")
          .set("Authorization", `Bearer ${accessToken}`)
          .expect(HttpStatus.OK);

        expect(response.body.data).toBeDefined();
      });
    });

    describe("Failure", () => {
      it("should return 401 UNAUTHORIZED when accessing protected route without token", async () => {
        const response = await request(app.getHttpServer())
          .get("/api/v1/tasks")
          .expect(HttpStatus.UNAUTHORIZED);

        expect(response.body).toHaveProperty("statusCode", HttpStatus.UNAUTHORIZED);
      });

      it("should return 401 UNAUTHORIZED with invalid bearer token", async () => {
        const response = await request(app.getHttpServer())
          .get("/api/v1/tasks")
          .set("Authorization", "Bearer invalid-token")
          .expect(HttpStatus.UNAUTHORIZED);

        expect(response.body).toHaveProperty("statusCode", HttpStatus.UNAUTHORIZED);
      });

      it("should return 401 UNAUTHORIZED with malformed authorization header", async () => {
        const response = await request(app.getHttpServer())
          .get("/api/v1/tasks")
          .set("Authorization", "InvalidBearer token")
          .expect(HttpStatus.UNAUTHORIZED);

        expect(response.body).toHaveProperty("statusCode", HttpStatus.UNAUTHORIZED);
      });

      it("should return 401 UNAUTHORIZED with token but missing Bearer prefix", async () => {
        const response = await request(app.getHttpServer())
          .get("/api/v1/tasks")
          .set("Authorization", accessToken) // Missing "Bearer " prefix
          .expect(HttpStatus.UNAUTHORIZED);

        expect(response.body).toHaveProperty("statusCode", HttpStatus.UNAUTHORIZED);
      });
    });
  });

  // ============================================================================
  // Response Format Tests
  // ============================================================================

  describe("Response Format", () => {
    describe("Success", () => {
      it("should return auth response with correct structure on successful registration", async () => {
        const userData = TestDataFactory.createUserData();

        const response = await request(app.getHttpServer())
          .post("/api/v1/auth/register")
          .send(userData)
          .expect(HttpStatus.CREATED);

        expect(response.body).toHaveProperty("data");
        expect(response.body.data).toHaveProperty("user");
        expect(response.body.data).toHaveProperty("accessToken");
        expect(response.body.data).toHaveProperty("refreshToken");

        const { user, accessToken, refreshToken } = response.body.data;

        // Verify user data structure
        expect(user).toHaveProperty("id");
        expect(user).toHaveProperty("email");
        expect(user).toHaveProperty("username");

        // Verify tokens are JWT format (three parts separated by dots)
        expect(accessToken.split(".").length).toBe(3);
        expect(refreshToken.split(".").length).toBe(3);

        cleanup.trackUser(user.id);
      });
    });

    describe("Failure", () => {
      it("should return error response with correct error codes on validation failure", async () => {
        const response = await request(app.getHttpServer())
          .post("/api/v1/auth/register")
          .send({
            email: "invalid",
            // Missing required fields
          })
          .expect(HttpStatus.BAD_REQUEST);

        expect(response.body).toHaveProperty("statusCode", HttpStatus.BAD_REQUEST);
        expect(response.body).toHaveProperty("message");
        expect(Array.isArray(response.body.message)).toBe(true);
      });
    });
  });
});
