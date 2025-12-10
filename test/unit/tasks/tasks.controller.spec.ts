import { Test, TestingModule } from "@nestjs/testing";
import { TasksController } from "../../../src/modules/tasks/tasks.controller";
import { TasksService } from "../../../src/modules/tasks/tasks.service";
import { TaskPriority } from "@prisma/client";
import { mockTask } from "../../utils/mocks";
import { PaginatedTasksResponseDto } from "../../../src/modules/tasks/dto";

describe("TasksController", () => {
  let controller: TasksController;

  const mockTasksService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
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
      const userId = "user-123";

      mockTasksService.create.mockResolvedValue(mockTask);

      const result = await controller.create(createTaskDto, userId);

      expect(result).toBeDefined();
      expect(mockTasksService.create).toHaveBeenCalledWith(createTaskDto, userId);
    });

    it("should create a task with default userId when no header provided", async () => {
      const createTaskDto = {
        title: "New Task",
        description: "Task description",
        priority: TaskPriority.HIGH,
      };

      mockTasksService.create.mockResolvedValue(mockTask);

      const result = await controller.create(createTaskDto);

      expect(result).toBeDefined();
      expect(mockTasksService.create).toHaveBeenCalledWith(
        createTaskDto,
        "cmixpvpir0000p9ypdk6za4qc",
      );
    });
  });

  describe("findAll", () => {
    it("should return paginated tasks", async () => {
      const query = { page: 1, limit: 10 };
      const paginatedResponse = new PaginatedTasksResponseDto([mockTask], 1, 1, 10);

      mockTasksService.findAll.mockResolvedValue(paginatedResponse);

      const result = await controller.findAll(query);

      expect(result).toEqual(paginatedResponse);
      expect(mockTasksService.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe("findOne", () => {
    it("should return a single task", async () => {
      mockTasksService.findOne.mockResolvedValue(mockTask);

      const result = await controller.findOne("test-task-id");

      expect(result).toBeDefined();
      expect(mockTasksService.findOne).toHaveBeenCalledWith("test-task-id");
    });
  });

  describe("update", () => {
    it("should update a task", async () => {
      const updateTaskDto = { title: "Updated Title" };
      const updatedTask = { ...mockTask, ...updateTaskDto };

      mockTasksService.update.mockResolvedValue(updatedTask);

      const result = await controller.update("test-task-id", updateTaskDto);

      expect(result).toBeDefined();
      expect(mockTasksService.update).toHaveBeenCalledWith("test-task-id", updateTaskDto);
    });
  });

  describe("remove", () => {
    it("should remove a task", async () => {
      mockTasksService.remove.mockResolvedValue(undefined);

      await controller.remove("test-task-id");

      expect(mockTasksService.remove).toHaveBeenCalledWith("test-task-id");
    });
  });

  describe("getStatistics", () => {
    it("should return task statistics for all users", async () => {
      const stats = {
        total: 10,
        byStatus: { TODO: 5, COMPLETED: 5 },
        byPriority: { HIGH: 6, LOW: 4 },
        overdue: 2,
      };

      mockTasksService.getStatistics.mockResolvedValue(stats);

      const result = await controller.getStatistics();

      expect(result).toEqual(stats);
      expect(mockTasksService.getStatistics).toHaveBeenCalledWith(undefined);
    });

    it("should return task statistics for a specific user", async () => {
      const userId = "user-123";
      const stats = {
        total: 5,
        byStatus: { TODO: 3, IN_PROGRESS: 2 },
        byPriority: { HIGH: 5 },
        overdue: 1,
      };

      mockTasksService.getStatistics.mockResolvedValue(stats);

      const result = await controller.getStatistics(userId);

      expect(result).toEqual(stats);
      expect(mockTasksService.getStatistics).toHaveBeenCalledWith(userId);
    });
  });
});
