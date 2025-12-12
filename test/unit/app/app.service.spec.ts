import { Test, TestingModule } from "@nestjs/testing";
import { AppService } from "../../../src/app.service";
import { AppDal } from "../../../src/app.dal";

describe("AppService", () => {
  let service: AppService;

  const mockAppDal = {
    checkDatabaseConnection: jest.fn(),
    getUserCount: jest.fn(),
    getTaskCount: jest.fn(),
    getTasksByStatus: jest.fn(),
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

  describe("getStats", () => {
    it("should return application statistics", async () => {
      mockAppDal.getUserCount.mockResolvedValue(10);
      mockAppDal.getTaskCount.mockResolvedValue(42);
      mockAppDal.getTasksByStatus.mockResolvedValue([
        { status: "TODO", _count: 15 },
        { status: "IN_PROGRESS", _count: 12 },
        { status: "COMPLETED", _count: 15 },
      ]);

      const result = await service.getStats();

      expect(result).toEqual({
        users: 10,
        tasks: 42,
        tasksByStatus: {
          TODO: 15,
          IN_PROGRESS: 12,
          COMPLETED: 15,
        },
      });
      expect(mockAppDal.getUserCount).toHaveBeenCalledTimes(1);
      expect(mockAppDal.getTaskCount).toHaveBeenCalledTimes(1);
      expect(mockAppDal.getTasksByStatus).toHaveBeenCalledTimes(1);
    });

    it("should return zero counts when no data exists", async () => {
      mockAppDal.getUserCount.mockResolvedValue(0);
      mockAppDal.getTaskCount.mockResolvedValue(0);
      mockAppDal.getTasksByStatus.mockResolvedValue([]);

      const result = await service.getStats();

      expect(result.users).toBe(0);
      expect(result.tasks).toBe(0);
      expect(result.tasksByStatus).toEqual({});
    });

    it("should handle partial task status data", async () => {
      mockAppDal.getUserCount.mockResolvedValue(5);
      mockAppDal.getTaskCount.mockResolvedValue(10);
      mockAppDal.getTasksByStatus.mockResolvedValue([{ status: "TODO", _count: 10 }]);

      const result = await service.getStats();

      expect(result.users).toBe(5);
      expect(result.tasks).toBe(10);
      expect(result.tasksByStatus).toEqual({ TODO: 10 });
    });

    it("should correctly aggregate tasks by status", async () => {
      mockAppDal.getUserCount.mockResolvedValue(20);
      mockAppDal.getTaskCount.mockResolvedValue(100);
      mockAppDal.getTasksByStatus.mockResolvedValue([
        { status: "TODO", _count: 30 },
        { status: "IN_PROGRESS", _count: 40 },
        { status: "COMPLETED", _count: 30 },
      ]);

      const result = await service.getStats();

      expect(result.tasksByStatus.TODO).toBe(30);
      expect(result.tasksByStatus.IN_PROGRESS).toBe(40);
      expect(result.tasksByStatus.COMPLETED).toBe(30);
    });

    it("should handle only one status type", async () => {
      mockAppDal.getUserCount.mockResolvedValue(1);
      mockAppDal.getTaskCount.mockResolvedValue(5);
      mockAppDal.getTasksByStatus.mockResolvedValue([{ status: "COMPLETED", _count: 5 }]);

      const result = await service.getStats();

      expect(result.tasksByStatus).toEqual({ COMPLETED: 5 });
      expect(Object.keys(result.tasksByStatus)).toHaveLength(1);
    });

    it("should handle large numbers", async () => {
      mockAppDal.getUserCount.mockResolvedValue(10000);
      mockAppDal.getTaskCount.mockResolvedValue(50000);
      mockAppDal.getTasksByStatus.mockResolvedValue([
        { status: "TODO", _count: 15000 },
        { status: "IN_PROGRESS", _count: 20000 },
        { status: "COMPLETED", _count: 15000 },
      ]);

      const result = await service.getStats();

      expect(result.users).toBe(10000);
      expect(result.tasks).toBe(50000);
    });

    it("should call all DAL methods", async () => {
      mockAppDal.getUserCount.mockResolvedValue(1);
      mockAppDal.getTaskCount.mockResolvedValue(1);
      mockAppDal.getTasksByStatus.mockResolvedValue([]);

      await service.getStats();

      expect(mockAppDal.getUserCount).toHaveBeenCalledTimes(1);
      expect(mockAppDal.getTaskCount).toHaveBeenCalledTimes(1);
      expect(mockAppDal.getTasksByStatus).toHaveBeenCalledTimes(1);
    });

    it("should reduce tasksByStatus array to object correctly", async () => {
      mockAppDal.getUserCount.mockResolvedValue(5);
      mockAppDal.getTaskCount.mockResolvedValue(15);
      mockAppDal.getTasksByStatus.mockResolvedValue([
        { status: "TODO", _count: 5 },
        { status: "IN_PROGRESS", _count: 5 },
        { status: "COMPLETED", _count: 5 },
      ]);

      const result = await service.getStats();

      expect(result.tasksByStatus).toBeInstanceOf(Object);
      expect(Array.isArray(result.tasksByStatus)).toBe(false);
      expect(Object.keys(result.tasksByStatus)).toHaveLength(3);
    });
  });
});
