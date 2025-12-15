import { Test, TestingModule } from "@nestjs/testing";
import { AppController } from "../../../src/app.controller";
import { AppService } from "../../../src/app.service";

describe("AppController", () => {
  let controller: AppController;

  const mockAppService = {
    getHealth: jest.fn(),
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
});
