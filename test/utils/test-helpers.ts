/**
 * Generic Test Utilities
 * Reusable helpers, assertions, and utilities for all test types
 */

import { INestApplication, ValidationPipe, VersioningType } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import request from "supertest";
import { TransformInterceptor } from "../../src/common/interceptors/transform.interceptor";
import { PrismaService } from "@app/database/prisma.service";
import * as bcrypt from "bcrypt";

// ============================================================================
// Data Factories
// ============================================================================

export class TestDataFactory {
  /**
   * Generate test user data
   */
  static createUserData(overrides: Partial<any> = {}) {
    const timestamp = Date.now();

    return {
      email: `test-${timestamp}@example.com`,
      username: `testuser${timestamp}`,
      password: "Test123!@#",
      firstName: "Test",
      lastName: "User",
      ...overrides,
    };
  }

  /**
   * Generate CUID for testing
   * Mimics real CUID structure
   */
  static generateCuid(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 11);

    return `c${timestamp}${random}`;
  }

  /**
   * Generate non-existent CUID for 404 testing
   * Uses a valid CUID format that doesn't exist in database
   */
  static generateInvalidCuid(): string {
    // Valid CUID format that won't exist: starts with 'c', followed by timestamp-like string
    return "cm00000000000000000000000"; // Valid format, won't exist
  }

  /**
   * Create mock pagination query
   */
  static createPaginationQuery(overrides: Partial<any> = {}) {
    return {
      page: 1,
      limit: 10,
      sortBy: "createdAt",
      sortOrder: "DESC",
      ...overrides,
    };
  }

  /**
   * Create mock date range
   */
  static createDateRange(daysBack = 7) {
    const endDate = new Date();
    const startDate = new Date();

    startDate.setDate(startDate.getDate() - daysBack);

    return { startDate, endDate };
  }

  /**
   * Create a future date (X days from now)
   * Useful for testing due dates, expiration dates, etc.
   */
  static getFutureDate(daysFromNow: number): Date {
    const date = new Date();

    date.setDate(date.getDate() + daysFromNow);

    return date;
  }

  /**
   * Create a past date (X days ago)
   * Useful for testing expired items, historical data, etc.
   */
  static getPastDate(daysAgo: number): Date {
    const date = new Date();

    date.setDate(date.getDate() - daysAgo);

    return date;
  }
}

// ============================================================================
// Assertions
// ============================================================================

export class TestAssertions {
  /**
   * Assert paginated response structure
   */
  static assertPaginatedResponse(response: any, expectedDataLength?: number) {
    expect(response.body).toHaveProperty("data");
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body).toHaveProperty("meta");
    expect(response.body.meta).toHaveProperty("page");
    expect(response.body.meta).toHaveProperty("limit");
    expect(response.body.meta).toHaveProperty("total");
    expect(response.body.meta).toHaveProperty("totalPages");

    if (expectedDataLength !== undefined) {
      expect(response.body.data).toHaveLength(expectedDataLength);
    }

    // Validate meta calculations
    expect(response.body.meta.page).toBeGreaterThanOrEqual(1);
    expect(response.body.meta.limit).toBeGreaterThanOrEqual(1);
    expect(response.body.meta.total).toBeGreaterThanOrEqual(0);
    expect(response.body.meta.totalPages).toBeGreaterThanOrEqual(0);
  }

  /**
   * Assert success response structure
   */
  static assertSuccessResponse(response: any, statusCode = 200) {
    expect(response.statusCode).toBe(statusCode);
    expect(response.body).toHaveProperty("data");
  }

  /**
   * Assert error response structure
   */
  static assertErrorResponse(
    response: any,
    statusCode: number,
    errorCode?: string,
    messageContains?: string,
  ) {
    expect(response.statusCode).toBe(statusCode);
    expect(response.body).toHaveProperty("statusCode", statusCode);
    expect(response.body).toHaveProperty("message");
    // error field is optional (401 responses don't have it)

    if (errorCode) {
      expect(response.body.errorCode).toBe(errorCode);
    }

    if (messageContains) {
      const message = Array.isArray(response.body.message)
        ? response.body.message.join(" ")
        : response.body.message;

      expect(message.toLowerCase()).toContain(messageContains.toLowerCase());
    }
  }

  /**
   * Assert validation error response
   */
  static assertValidationError(response: any, fieldErrors?: string[]) {
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("statusCode", 400);
    expect(response.body).toHaveProperty("message");
    expect(Array.isArray(response.body.message)).toBe(true);

    if (fieldErrors) {
      const messages = response.body.message.join(" ").toLowerCase();

      fieldErrors.forEach((error) => {
        expect(messages).toContain(error.toLowerCase());
      });
    }
  }

  /**
   * Assert unauthorized error
   */
  static assertUnauthorized(response: any) {
    this.assertErrorResponse(response, 401);
  }

  /**
   * Assert forbidden error
   */
  static assertForbidden(response: any, errorCode?: string) {
    this.assertErrorResponse(response, 403, errorCode);
  }

  /**
   * Assert not found error
   */
  static assertNotFound(response: any, errorCode?: string) {
    this.assertErrorResponse(response, 404, errorCode);
  }

  /**
   * Assert conflict error
   */
  static assertConflict(response: any, errorCode?: string) {
    this.assertErrorResponse(response, 409, errorCode);
  }

  /**
   * Assert resource has standard fields
   */
  static assertResourceFields(resource: any, requiredFields: string[]) {
    requiredFields.forEach((field) => {
      expect(resource).toHaveProperty(field);
    });

    // Standard audit fields
    expect(resource).toHaveProperty("id");
    expect(resource).toHaveProperty("createdAt");
    expect(resource).toHaveProperty("updatedAt");
  }

  /**
   * Assert soft delete fields
   */
  static assertSoftDeleteFields(resource: any, isDeleted = false) {
    expect(resource).toHaveProperty("deletedAt");
    if (isDeleted) {
      expect(resource.deletedAt).not.toBeNull();
    } else {
      expect(resource.deletedAt).toBeNull();
    }
  }

  /**
   * Assert timestamp is recent (within last minute)
   */
  static assertRecentTimestamp(timestamp: string | Date) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();

    expect(diffMs).toBeLessThan(60000); // Less than 1 minute
    expect(diffMs).toBeGreaterThanOrEqual(0);
  }

  /**
   * Assert array contains items matching criteria
   */
  static assertArrayContains<T>(array: T[], matcher: Partial<T>) {
    const found = array.some((item) =>
      Object.keys(matcher).every((key) => item[key as keyof T] === matcher[key as keyof T]),
    );

    expect(found).toBe(true);
  }

  /**
   * Assert two dates are approximately equal (within tolerance)
   */
  static assertDatesEqual(date1: Date | string, date2: Date | string, toleranceMs = 1000) {
    const d1 = new Date(date1).getTime();
    const d2 = new Date(date2).getTime();
    const diff = Math.abs(d1 - d2);

    expect(diff).toBeLessThanOrEqual(toleranceMs);
  }
}

// ============================================================================
// Test Setup Helpers
// ============================================================================

export class TestSetup {
  /**
   * Create a test NestJS application
   */
  static async createTestApp(
    imports: any[],
    options: { enableValidation?: boolean; globalPrefix?: string } = {},
  ): Promise<INestApplication> {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports,
    }).compile();

    const app = moduleFixture.createNestApplication();

    // Set global prefix (default to 'api' to match main.ts)
    const prefix = options.globalPrefix !== undefined ? options.globalPrefix : "api";

    if (prefix) {
      app.setGlobalPrefix(prefix);
    }

    // Enable URI versioning (matches main.ts)
    app.enableVersioning({
      type: VersioningType.URI,
      prefix: "v", // Adds 'v' before version number (e.g., /api/v1/, /api/v2/)
      defaultVersion: "1",
    });

    // Apply global interceptors (matches main.ts)
    app.useGlobalInterceptors(new TransformInterceptor());

    if (options.enableValidation !== false) {
      app.useGlobalPipes(
        new ValidationPipe({
          whitelist: true,
          forbidNonWhitelisted: true,
          transform: true,
        }),
      );
    }

    await app.init();

    return app;
  }

  /**
   * Clean up test application
   */
  static async closeTestApp(app: INestApplication): Promise<void> {
    if (app) {
      await app.close();
    }
  }
}

// ============================================================================
// Authentication Helpers
// ============================================================================

export class AuthTestHelper {
  /**
   * Register a test user and return credentials
   */
  static async registerUser(app: INestApplication, userData?: Partial<any>) {
    const user = TestDataFactory.createUserData(userData);
    const response = await request(app.getHttpServer())
      .post("/api/v1/auth/register")
      .send(user)
      .expect(201);

    return {
      user: response.body.data.user,
      accessToken: response.body.data.accessToken,
      refreshToken: response.body.data.refreshToken,
      credentials: {
        email: user.email,
        password: user.password,
      },
    };
  }

  /**
   * Create an admin user directly in the database and login
   * Bypasses the register endpoint to set ADMIN role
   */
  static async createAdminUser(app: INestApplication, userData?: Partial<any>) {
    // Get PrismaService from the app context
    const prismaService = app.get(PrismaService);

    const user = TestDataFactory.createUserData(userData);
    const hashedPassword = await bcrypt.hash(user.password, 10);

    // Create admin user directly in database
    await prismaService.user.create({
      data: {
        email: user.email,
        username: user.username,
        password: hashedPassword,
        firstName: user.firstName,
        lastName: user.lastName,
        role: "ADMIN", // Set admin role
      },
    });

    // Login to get tokens
    const loginResponse = await request(app.getHttpServer())
      .post("/api/v1/auth/login")
      .send({
        username: user.username, // Login with username, not email
        password: user.password,
      })
      .expect(200);

    return {
      user: loginResponse.body.data.user,
      accessToken: loginResponse.body.data.accessToken,
      refreshToken: loginResponse.body.data.refreshToken,
      credentials: {
        email: user.email,
        password: user.password,
      },
    };
  }

  /**
   * Login an existing user
   */
  static async login(app: INestApplication, credentials: { email: string; password: string }) {
    const response = await request(app.getHttpServer())
      .post("/api/v1/auth/login")
      .send(credentials)
      .expect(200);

    return {
      user: response.body.data.user,
      accessToken: response.body.data.accessToken,
      refreshToken: response.body.data.refreshToken,
    };
  }

  /**
   * Create authorization header
   */
  static authHeader(token: string): Record<string, string> {
    return { Authorization: `Bearer ${token}` };
  }

  /**
   * Refresh access token
   */
  static async refreshToken(app: INestApplication, refreshToken: string) {
    const response = await request(app.getHttpServer())
      .post("/api/v1/auth/refresh")
      .send({ refreshToken })
      .expect(200);

    return {
      accessToken: response.body.data.accessToken,
      refreshToken: response.body.data.refreshToken,
    };
  }
}

// ============================================================================
// Mock Builders
// ============================================================================

export class MockBuilder {
  /**
   * Create mock PrismaService
   */
  static createMockPrismaService() {
    return {
      $connect: jest.fn(),
      $disconnect: jest.fn(),
      $executeRaw: jest.fn(),
      $queryRaw: jest.fn(),
      $transaction: jest.fn(),
      // Add specific model mocks as needed
    };
  }

  /**
   * Create mock CacheManager
   */
  static createMockCacheManager() {
    const cache = new Map();

    return {
      get: jest.fn((key) => Promise.resolve(cache.get(key))),
      set: jest.fn((key, value) => {
        cache.set(key, value);

        return Promise.resolve();
      }),
      del: jest.fn((key) => {
        cache.delete(key);

        return Promise.resolve();
      }),
      reset: jest.fn(() => {
        cache.clear();

        return Promise.resolve();
      }),
      store: {
        keys: jest.fn(() => Promise.resolve(Array.from(cache.keys()))),
      },
    };
  }

  /**
   * Create mock ConfigService
   */
  static createMockConfigService(config: Record<string, any> = {}) {
    return {
      get: jest.fn((key: string, defaultValue?: any) => config[key] ?? defaultValue),
      getOrThrow: jest.fn((key: string) => {
        if (!(key in config)) {
          throw new Error(`Config key ${key} not found`);
        }

        return config[key];
      }),
    };
  }

  /**
   * Create mock Logger
   */
  static createMockLogger() {
    return {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
    };
  }
}

// ============================================================================
// Database Helpers
// ============================================================================

export class DatabaseTestHelper {
  /**
   * Clean up test data for a specific model
   */
  static async cleanupModel(prisma: any, modelName: string, where: any = {}) {
    await prisma[modelName].deleteMany({ where });
  }

  /**
   * Count records in a model
   */
  static async countRecords(prisma: any, modelName: string, where: any = {}) {
    return await prisma[modelName].count({ where });
  }

  /**
   * Create test record and return cleanup function
   */
  static async createWithCleanup<T>(
    createFn: () => Promise<T>,
    cleanupFn: (record: T) => Promise<void>,
  ): Promise<{ record: T; cleanup: () => Promise<void> }> {
    const record = await createFn();

    return {
      record,
      cleanup: async () => {
        await cleanupFn(record);
      },
    };
  }

  /**
   * Verify database connection
   */
  static async verifyConnection(prisma: any): Promise<boolean> {
    try {
      await prisma.$queryRaw`SELECT 1`;

      return true;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return false;
    }
  }
}

// ============================================================================
// HTTP Request Helpers
// ============================================================================

export class HttpTestHelper {
  /**
   * Make authenticated GET request
   */
  static async get(app: INestApplication, path: string, token: string) {
    return request(app.getHttpServer()).get(path).set(AuthTestHelper.authHeader(token));
  }

  /**
   * Make authenticated POST request
   */
  static async post(app: INestApplication, path: string, token: string, data: any) {
    return request(app.getHttpServer()).post(path).set(AuthTestHelper.authHeader(token)).send(data);
  }

  /**
   * Make authenticated PATCH request
   */
  static async patch(app: INestApplication, path: string, token: string, data: any) {
    return request(app.getHttpServer())
      .patch(path)
      .set(AuthTestHelper.authHeader(token))
      .send(data);
  }

  /**
   * Make authenticated DELETE request
   */
  static async delete(app: INestApplication, path: string, token: string) {
    return request(app.getHttpServer()).delete(path).set(AuthTestHelper.authHeader(token));
  }
}

// ============================================================================
// Exports (with aliases)
// ============================================================================

export { TestDataFactory as DataFactory };
export { TestAssertions as Assertions };
export { TestSetup as Setup };
export { AuthTestHelper as AuthHelper };
export { MockBuilder as Mocks };
export { DatabaseTestHelper as DbHelper };
export { HttpTestHelper as HttpHelper };
