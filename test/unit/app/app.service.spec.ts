import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { AppService } from "../../../src/app.service";
import { AppDal } from "../../../src/app.dal";
import { createMockConfigService, DEFAULT_TEST_CONFIG } from "../../utils/config.mock";

describe("AppService", () => {
  let service: AppService;
  let configService: ReturnType<typeof createMockConfigService>;

  const mockAppDal = {
    checkDatabaseConnection: jest.fn(),
    getUserCount: jest.fn(),
  };

  beforeEach(async () => {
    configService = createMockConfigService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        {
          provide: AppDal,
          useValue: mockAppDal,
        },
        {
          provide: ConfigService,
          useValue: configService,
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

    it("should use environment from config service", async () => {
      mockAppDal.checkDatabaseConnection.mockResolvedValue(undefined);

      // ConfigService will return the configured environment
      const result = await service.getHealth();

      expect(result.environment).toBe("test");
      expect(configService.get).toHaveBeenCalledWith("app.nodeEnv", "development");
    });

    it("should default to development environment when not configured", async () => {
      mockAppDal.checkDatabaseConnection.mockResolvedValue(undefined);

      // Override the mock to return undefined, triggering the default
      configService.get.mockImplementation((key: string, defaultValue?: unknown) => {
        if (key === "app.nodeEnv") return defaultValue;

        return (DEFAULT_TEST_CONFIG as Record<string, unknown>)[key] ?? defaultValue;
      });

      const result = await service.getHealth();

      expect(result.environment).toBe("development");
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
