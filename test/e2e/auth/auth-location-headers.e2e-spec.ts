import { HttpStatus, INestApplication } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "../../../src/app.module";
import { PrismaService } from "../../../src/database/prisma.service";
import { TestCleanup } from "../../utils/test-cleanup";
import { Setup, TestDataFactory } from "../../utils";

describe("Auth API - Location Headers (e2e)", () => {
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

  describe("POST /auth/register", () => {
    it("should not return Location header on successful registration", async () => {
      const userData = TestDataFactory.createUserData();

      const response = await request(app.getHttpServer())
        .post("/api/v1/auth/register")
        .send(userData)
        .expect(HttpStatus.CREATED);

      const userId = response.body.data.user.id;

      // Location header should not be present - registration is an auth operation, not resource creation
      expect(response.headers.location).toBeUndefined();

      // Verify response still contains expected auth data
      expect(response.body.data).toHaveProperty("user");
      expect(response.body.data).toHaveProperty("accessToken");
      expect(response.body.data).toHaveProperty("refreshToken");
      expect(response.body.data.user.id).toBe(userId);

      cleanup.trackUser(userId);
    });

    it("should not return Location header on duplicate email", async () => {
      const userData = TestDataFactory.createUserData({
        email: "duplicate-test@example.com",
      });

      // Register first user
      const firstResponse = await request(app.getHttpServer())
        .post("/api/v1/auth/register")
        .send(userData)
        .expect(HttpStatus.CREATED);

      cleanup.trackUser(firstResponse.body.data.user.id);

      // Try to register with same email
      const duplicateResponse = await request(app.getHttpServer())
        .post("/api/v1/auth/register")
        .send(userData)
        .expect(HttpStatus.CONFLICT);

      // Location header should not be present on conflict
      expect(duplicateResponse.headers.location).toBeUndefined();
      expect(duplicateResponse.body).toHaveProperty("statusCode", HttpStatus.CONFLICT);
      expect(duplicateResponse.body.errorCode).toBe("AUTH_EMAIL_EXISTS");
    });
  });

  describe("POST /auth/login", () => {
    let credentials: { email: string; password: string; username: string };
    let userId: string;

    beforeAll(async () => {
      // Create a user for login tests
      const userData = TestDataFactory.createUserData();

      const response = await request(app.getHttpServer())
        .post("/api/v1/auth/register")
        .send(userData)
        .expect(HttpStatus.CREATED);

      userId = response.body.data.user.id;
      credentials = {
        email: userData.email,
        password: userData.password,
        username: userData.username,
      };

      cleanup.trackUser(userId);
    });

    it("should NOT return Location header on login (no resource created)", async () => {
      const response = await request(app.getHttpServer())
        .post("/api/v1/auth/login")
        .send({
          username: credentials.username,
          password: credentials.password,
        })
        .expect(HttpStatus.OK);

      // Login doesn't create a new resource, so no Location header expected
      expect(response.headers.location).toBeUndefined();

      // But should return tokens
      expect(response.body.data).toHaveProperty("accessToken");
      expect(response.body.data).toHaveProperty("refreshToken");
      expect(response.body.data).toHaveProperty("user");
    });

    it("should not return Location header on failed login", async () => {
      const response = await request(app.getHttpServer())
        .post("/api/v1/auth/login")
        .send({
          username: credentials.username,
          password: "wrong-password",
        })
        .expect(HttpStatus.UNAUTHORIZED);

      // No Location header on error
      expect(response.headers.location).toBeUndefined();
      expect(response.body).toHaveProperty("statusCode", HttpStatus.UNAUTHORIZED);
    });
  });

  describe("POST /auth/refresh", () => {
    let refreshToken: string;
    let userId: string;

    beforeAll(async () => {
      // Create a user and get refresh token
      const userData = TestDataFactory.createUserData();

      const response = await request(app.getHttpServer())
        .post("/api/v1/auth/register")
        .send(userData)
        .expect(HttpStatus.CREATED);

      userId = response.body.data.user.id;
      refreshToken = response.body.data.refreshToken;

      cleanup.trackUser(userId);
    });

    it("should NOT return Location header on token refresh (no resource created)", async () => {
      const response = await request(app.getHttpServer())
        .post("/api/v1/auth/refresh")
        .send({ refreshToken })
        .expect(HttpStatus.OK);

      // Refresh doesn't create a new resource, so no Location header expected
      expect(response.headers.location).toBeUndefined();

      // But should return new tokens
      expect(response.body.data).toHaveProperty("accessToken");
      expect(response.body.data).toHaveProperty("refreshToken");
    });

    it("should not return Location header on invalid refresh token", async () => {
      const response = await request(app.getHttpServer())
        .post("/api/v1/auth/refresh")
        .send({ refreshToken: "invalid-token" })
        .expect(HttpStatus.UNAUTHORIZED);

      // No Location header on error
      expect(response.headers.location).toBeUndefined();
      expect(response.body).toHaveProperty("statusCode", HttpStatus.UNAUTHORIZED);
    });
  });

  describe("Location Header Format", () => {
    it("should not return Location header for registration (auth operation, not resource creation)", async () => {
      const userData = TestDataFactory.createUserData();

      const response = await request(app.getHttpServer())
        .post("/api/v1/auth/register")
        .send(userData)
        .expect(HttpStatus.CREATED);

      const userId = response.body.data.user.id;
      const locationHeader = response.headers.location;

      // Location header should not be present for auth operations
      expect(locationHeader).toBeUndefined();

      // Verify response still contains expected auth data
      expect(response.body.data).toHaveProperty("user");
      expect(response.body.data).toHaveProperty("accessToken");
      expect(response.body.data).toHaveProperty("refreshToken");
      expect(response.body.data.user.id).toBe(userId);

      cleanup.trackUser(userId);
    });
  });
});
