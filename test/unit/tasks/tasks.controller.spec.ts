import { Test, TestingModule } from "@nestjs/testing";
import { TasksController } from "../../../src/modules/tasks/tasks.controller";
import { TasksService } from "../../../src/modules/tasks/tasks.service";
import { TaskPriority, UserRole } from "@prisma/client";
import { mockTask } from "../../utils/mocks";
import { PaginatedTasksResponseDto } from "../../../src/modules/tasks/dto";

describe("TasksController", () => {
  let controller: TasksController;

  const TEST_USER_ID = { id: "test-user-id", role: UserRole.USER }; // Match mockTask.userId

  const mockTasksService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    purge: jest.fn(),
    getStatistics: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        {
          provide: TasksService,
          useValue: mockTasksService,
        },
        {
          provide: "CACHE_MANAGER",
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
            reset: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<TasksController>(TasksController);

    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("create", () => {
    it("should create a task with provided userId from header", async () => {
      const createTaskDto = {
        title: "New Task",
        description: "Task description",
        priority: TaskPriority.HIGH,
      };
      const user = { id: "user-123", role: UserRole.USER };

      mockTasksService.create.mockResolvedValue(mockTask);

      const result = await controller.create(createTaskDto, user);

      expect(result).toBeDefined();
      expect(mockTasksService.create).toHaveBeenCalledWith(createTaskDto, user);
    });

    it("should create a task with authenticated userId", async () => {
      const createTaskDto = {
        title: "New Task",
        description: "Task description",
        priority: TaskPriority.HIGH,
      };

      mockTasksService.create.mockResolvedValue(mockTask);

      const result = await controller.create(createTaskDto, TEST_USER_ID);

      expect(result).toBeDefined();
      expect(mockTasksService.create).toHaveBeenCalledWith(createTaskDto, TEST_USER_ID);
    });
  });

  describe("findAll", () => {
    it("should return paginated tasks", async () => {
      const query = { page: 1, limit: 10 };
      const paginatedResponse = new PaginatedTasksResponseDto([mockTask], 1, 1, 10);

      mockTasksService.findAll.mockResolvedValue(paginatedResponse);

      const result = await controller.findAll(query, TEST_USER_ID);

      expect(result).toEqual(paginatedResponse);
      expect(mockTasksService.findAll).toHaveBeenCalledWith(query, TEST_USER_ID);
    });
  });

  describe("findOne", () => {
    it("should return a single task", async () => {
      mockTasksService.findOne.mockResolvedValue(mockTask);

      const result = await controller.findOne("test-task-id", TEST_USER_ID);

      expect(result).toBeDefined();
      expect(mockTasksService.findOne).toHaveBeenCalledWith("test-task-id", TEST_USER_ID);
    });
  });

  describe("update", () => {
    it("should update a task", async () => {
      const updateTaskDto = { title: "Updated Title" };
      const updatedTask = { ...mockTask, ...updateTaskDto };

      mockTasksService.update.mockResolvedValue(updatedTask);

      const result = await controller.update("test-task-id", updateTaskDto, TEST_USER_ID);

      expect(result).toBeDefined();
      expect(mockTasksService.update).toHaveBeenCalledWith(
        "test-task-id",
        updateTaskDto,
        TEST_USER_ID,
      );
    });
  });

  describe("remove", () => {
    it("should remove a task", async () => {
      mockTasksService.remove.mockResolvedValue(undefined);

      await controller.remove("test-task-id", TEST_USER_ID);

      expect(mockTasksService.remove).toHaveBeenCalledWith("test-task-id", TEST_USER_ID);
    });
  });

  describe("getStatistics", () => {
    it("should return task statistics for authenticated user", async () => {
      const stats = {
        total: 10,
        byStatus: { TODO: 5, COMPLETED: 5 },
        byPriority: { HIGH: 6, LOW: 4 },
        overdue: 2,
      };

      mockTasksService.getStatistics.mockResolvedValue(stats);

      const result = await controller.getStatistics(TEST_USER_ID);

      expect(result).toEqual(stats);
      expect(mockTasksService.getStatistics).toHaveBeenCalledWith(TEST_USER_ID);
    });

    it("should return task statistics for a specific user", async () => {
      const user = { id: "user-123", role: UserRole.USER };
      const stats = {
        total: 5,
        byStatus: { TODO: 3, IN_PROGRESS: 2 },
        byPriority: { HIGH: 5 },
        overdue: 1,
      };

      mockTasksService.getStatistics.mockResolvedValue(stats);

      const result = await controller.getStatistics(user);

      expect(result).toEqual(stats);
      expect(mockTasksService.getStatistics).toHaveBeenCalledWith(user);
    });
  });
});
