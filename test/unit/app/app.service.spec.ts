import { Test, TestingModule } from "@nestjs/testing";
import { AppService } from "../../../src/app.service";
import { AppDal } from "../../../src/app.dal";

describe("AppService", () => {
  let service: AppService;

  const mockAppDal = {
    checkDatabaseConnection: jest.fn(),
    getUserCount: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        {
          provide: AppDal,
          useValue: mockAppDal,
        },
      ],
    }).compile();

    service = module.get<AppService>(AppService);

    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("getHealth", () => {
    it("should return health status with connected database", async () => {
      mockAppDal.checkDatabaseConnection.mockResolvedValue(undefined);

      const result = await service.getHealth();

      expect(result).toBeDefined();
      expect(result.status).toBe("ok");
      expect(result.timestamp).toBeDefined();
      expect(result.uptime).toBeDefined();
      expect(result.environment).toBeDefined();
      expect(result.database).toBeDefined();
      expect(result.database.status).toBe("connected");
      expect(result.database.latency).toMatch(/^\d+ms$/);
      expect(mockAppDal.checkDatabaseConnection).toHaveBeenCalledTimes(1);
    });

    it("should return health status with error database state on failure", async () => {
      mockAppDal.checkDatabaseConnection.mockRejectedValue(new Error("Connection failed"));

      const result = await service.getHealth();

      expect(result.status).toBe("ok");
      expect(result.database.status).toBe("error");
      expect(result.database.latency).toBe("0ms");
    });

    it("should include current timestamp", async () => {
      mockAppDal.checkDatabaseConnection.mockResolvedValue(undefined);

      const before = new Date();
      const result = await service.getHealth();
      const after = new Date();

      const timestamp = new Date(result.timestamp);

      expect(timestamp.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(timestamp.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it("should include process uptime", async () => {
      mockAppDal.checkDatabaseConnection.mockResolvedValue(undefined);

      const result = await service.getHealth();

      expect(typeof result.uptime).toBe("number");
      expect(result.uptime).toBeGreaterThan(0);
    });

    it("should include environment from NODE_ENV", async () => {
      mockAppDal.checkDatabaseConnection.mockResolvedValue(undefined);
      const originalEnv = process.env.NODE_ENV;

      process.env.NODE_ENV = "production";
      const result = await service.getHealth();

      expect(result.environment).toBe("production");

      process.env.NODE_ENV = originalEnv;
    });

    it("should default to development environment when NODE_ENV is not set", async () => {
      mockAppDal.checkDatabaseConnection.mockResolvedValue(undefined);
      const originalEnv = process.env.NODE_ENV;

      delete process.env.NODE_ENV;
      const result = await service.getHealth();

      expect(result.environment).toBe("development");

      process.env.NODE_ENV = originalEnv;
    });

    it("should measure database latency accurately", async () => {
      mockAppDal.checkDatabaseConnection.mockImplementation(() => {
        return new Promise((resolve) => setTimeout(resolve, 10));
      });

      const result = await service.getHealth();

      expect(result.database.status).toBe("connected");
      const latency = parseInt(result.database.latency);

      expect(latency).toBeGreaterThanOrEqual(10);
    });

    it("should handle database timeout errors", async () => {
      mockAppDal.checkDatabaseConnection.mockRejectedValue(new Error("Timeout"));

      const result = await service.getHealth();

      expect(result.database.status).toBe("error");
      expect(result.database.latency).toBe("0ms");
    });

    it("should handle database connection errors gracefully", async () => {
      mockAppDal.checkDatabaseConnection.mockRejectedValue(
        new Error("ECONNREFUSED: Connection refused"),
      );

      const result = await service.getHealth();

      expect(result.status).toBe("ok"); // API is still ok even if DB fails
      expect(result.database.status).toBe("error");
    });
  });
});
