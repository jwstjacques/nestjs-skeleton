import { Test, TestingModule } from "@nestjs/testing";
import { PrismaService } from "../../../src/database/prisma.service";
import { AppDal } from "../../../src/app.dal";
import { TestCleanup } from "../../utils/test-cleanup";
import { CorrelationService } from "../../../src/common/correlation";

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
      providers: [AppDal, PrismaService, CorrelationService],
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
});
