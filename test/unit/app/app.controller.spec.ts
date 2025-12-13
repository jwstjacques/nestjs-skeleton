import { Test, TestingModule } from "@nestjs/testing";
import { AppController } from "../../../src/app.controller";
import { AppService } from "../../../src/app.service";

describe("AppController", () => {
  let controller: AppController;

  const mockAppService = {
    getHealth: jest.fn(),
    getStats: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: mockAppService,
        },
      ],
    }).compile();

    controller = module.get<AppController>(AppController);

    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("getStatus", () => {
    it("should return health status from service", async () => {
      const healthData = {
        status: "ok",
        timestamp: "2025-12-11T10:00:00.000Z",
        uptime: 12345.67,
        environment: "test",
        database: {
          status: "connected",
          latency: "5ms",
        },
      };

      mockAppService.getHealth.mockResolvedValue(healthData);

      const result = await controller.getStatus();

      expect(result).toEqual(healthData);
      expect(mockAppService.getHealth).toHaveBeenCalledTimes(1);
      expect(mockAppService.getHealth).toHaveBeenCalledWith();
    });

    it("should handle health check with disconnected database", async () => {
      const healthData = {
        status: "ok",
        timestamp: "2025-12-11T10:00:00.000Z",
        uptime: 12345.67,
        environment: "test",
        database: {
          status: "disconnected",
          latency: "0ms",
        },
      };

      mockAppService.getHealth.mockResolvedValue(healthData);

      const result = await controller.getStatus();

      expect(result).toEqual(healthData);
      expect(result.database.status).toBe("disconnected");
    });

    it("should handle health check with database error", async () => {
      const healthData = {
        status: "ok",
        timestamp: "2025-12-11T10:00:00.000Z",
        uptime: 12345.67,
        environment: "test",
        database: {
          status: "error",
          latency: "0ms",
        },
      };

      mockAppService.getHealth.mockResolvedValue(healthData);

      const result = await controller.getStatus();

      expect(result).toEqual(healthData);
      expect(result.database.status).toBe("error");
    });

    it("should handle different environments", async () => {
      const healthData = {
        status: "ok",
        timestamp: "2025-12-11T10:00:00.000Z",
        uptime: 12345.67,
        environment: "production",
        database: {
          status: "connected",
          latency: "3ms",
        },
      };

      mockAppService.getHealth.mockResolvedValue(healthData);

      const result = await controller.getStatus();

      expect(result.environment).toBe("production");
    });
  });

  describe("getStats", () => {
    it("should return application statistics from service", async () => {
      const statsData = {
        users: 10,
        tasks: 42,
        tasksByStatus: {
          TODO: 15,
          IN_PROGRESS: 12,
          COMPLETED: 15,
        },
      };

      mockAppService.getStats.mockResolvedValue(statsData);

      const result = await controller.getStats();

      expect(result).toEqual(statsData);
      expect(mockAppService.getStats).toHaveBeenCalledTimes(1);
      expect(mockAppService.getStats).toHaveBeenCalledWith();
    });

    it("should return zero counts when no data exists", async () => {
      const statsData = {
        users: 0,
        tasks: 0,
        tasksByStatus: {},
      };

      mockAppService.getStats.mockResolvedValue(statsData);

      const result = await controller.getStats();

      expect(result).toEqual(statsData);
      expect(result.users).toBe(0);
      expect(result.tasks).toBe(0);
      expect(Object.keys(result.tasksByStatus)).toHaveLength(0);
    });

    it("should return stats with partial task status data", async () => {
      const statsData = {
        users: 5,
        tasks: 10,
        tasksByStatus: {
          TODO: 10,
        },
      };

      mockAppService.getStats.mockResolvedValue(statsData);

      const result = await controller.getStats();

      expect(result).toEqual(statsData);
      expect(result.tasksByStatus).toHaveProperty("TODO");
      expect(result.tasksByStatus).not.toHaveProperty("IN_PROGRESS");
      expect(result.tasksByStatus).not.toHaveProperty("COMPLETED");
    });

    it("should return stats with all task statuses", async () => {
      const statsData = {
        users: 20,
        tasks: 100,
        tasksByStatus: {
          TODO: 30,
          IN_PROGRESS: 40,
          COMPLETED: 30,
        },
      };

      mockAppService.getStats.mockResolvedValue(statsData);

      const result = await controller.getStats();

      expect(result).toEqual(statsData);
      expect(result.tasks).toBe(100);
      expect(result.tasksByStatus.TODO).toBe(30);
      expect(result.tasksByStatus.IN_PROGRESS).toBe(40);
      expect(result.tasksByStatus.COMPLETED).toBe(30);
    });

    it("should handle large numbers correctly", async () => {
      const statsData = {
        users: 10000,
        tasks: 50000,
        tasksByStatus: {
          TODO: 15000,
          IN_PROGRESS: 20000,
          COMPLETED: 15000,
        },
      };

      mockAppService.getStats.mockResolvedValue(statsData);

      const result = await controller.getStats();

      expect(result.users).toBe(10000);
      expect(result.tasks).toBe(50000);
    });
  });
});
