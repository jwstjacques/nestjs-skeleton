import { Test, TestingModule } from "@nestjs/testing";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PrismaService } from "./database/prisma.service";

describe("AppController", () => {
  let appController: AppController;

  // Mock PrismaService
  const mockPrismaService = {
    $queryRaw: jest.fn(),
    user: {
      count: jest.fn(),
    },
    task: {
      count: jest.fn(),
      groupBy: jest.fn(),
    },
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe("root", () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe(
        "Welcome to NestJS Task Management API! Visit /api/v1/docs for API documentation.",
      );
    });
  });
});
