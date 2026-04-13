import { Test, TestingModule } from "@nestjs/testing";
import { TasksService } from "../../../src/modules/tasks/tasks.service";
import { TasksDal } from "../../../src/modules/tasks/tasks.dal";
import {
  TaskNotFoundException,
  TaskForbiddenException,
  TaskConflictException,
} from "../../../src/modules/tasks/exceptions";
import { TaskStatus, TaskPriority, UserRole } from "@prisma/client";
import { TaskSortBy } from "../../../src/modules/tasks/dto/query-task.dto";
import { SortOrder } from "../../../src/common/constants";
import { mockTasksDal, mockTask } from "../../utils/mocks";

describe("TasksService", () => {
  let service: TasksService;

  const mockTestUser = { id: "test-user-id", role: UserRole.USER }; // Match mockTask.userId
  const mockUser = { id: "user-123", role: UserRole.USER };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: TasksDal,
          useValue: mockTasksDal,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    describe("Success", () => {
      it("should create a new task", async () => {
        const createTaskDto = {
          title: "New Task",
          description: "Task description",
          priority: TaskPriority.HIGH,
        };

        mockTasksDal.create.mockResolvedValue(mockTask);

        const result = await service.create(createTaskDto, mockUser);

        expect(result).toEqual(mockTask);
        expect(mockTasksDal.create).toHaveBeenCalledWith({
          ...createTaskDto,
          user: { connect: { id: mockUser.id } },
          dueDate: null,
        });
      });

      it("should create a task with due date", async () => {
        const createTaskDto = {
          title: "New Task",
          description: "Task description",
          priority: TaskPriority.HIGH,
          dueDate: "2025-12-31T00:00:00.000Z",
        };

        mockTasksDal.create.mockResolvedValue(mockTask);

        await service.create(createTaskDto, mockUser);

        expect(mockTasksDal.create).toHaveBeenCalledWith({
          ...createTaskDto,
          user: { connect: { id: mockUser.id } },
          dueDate: new Date(createTaskDto.dueDate),
        });
      });
    });
  });

  describe("findAll", () => {
    describe("Success", () => {
      it("should return paginated tasks", async () => {
        const query = { page: 1, limit: 10 };
        const tasks = [mockTask];

        mockTasksDal.findMany.mockResolvedValue(tasks);
        mockTasksDal.count.mockResolvedValue(1);

        const result = await service.findAll(query, mockTestUser);

        expect(result.data).toHaveLength(1);
        expect(result.meta.total).toBe(1);
        expect(result.meta.page).toBe(1);
        expect(result.meta.limit).toBe(10);
      });

      it("should filter tasks by status", async () => {
        const query = { page: 1, limit: 10, status: TaskStatus.TODO };

        mockTasksDal.findMany.mockResolvedValue([mockTask]);
        mockTasksDal.count.mockResolvedValue(1);

        await service.findAll(query, mockTestUser);

        expect(mockTasksDal.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            status: TaskStatus.TODO,
          }),
          0,
          10,
          expect.any(Object),
        );
      });

      it("should filter tasks by priority", async () => {
        const query = { page: 1, limit: 10, priority: TaskPriority.HIGH };

        mockTasksDal.findMany.mockResolvedValue([mockTask]);
        mockTasksDal.count.mockResolvedValue(1);

        await service.findAll(query, mockTestUser);

        expect(mockTasksDal.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            priority: TaskPriority.HIGH,
          }),
          0,
          10,
          expect.any(Object),
        );
      });

      it("should filter tasks by userId", async () => {
        const query = { page: 1, limit: 10 };

        mockTasksDal.findMany.mockResolvedValue([mockTask]);
        mockTasksDal.count.mockResolvedValue(1);

        await service.findAll(query, mockTestUser);

        expect(mockTasksDal.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            userId: mockTestUser.id,
          }),
          0,
          10,
          expect.any(Object),
        );
      });

      it("should search tasks by title or description", async () => {
        const query = { page: 1, limit: 10, search: "test" };

        mockTasksDal.findMany.mockResolvedValue([mockTask]);
        mockTasksDal.count.mockResolvedValue(1);

        await service.findAll(query, mockTestUser);

        expect(mockTasksDal.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            OR: expect.any(Array) as unknown[],
          }),
          0,
          10,
          expect.any(Object) as Record<string, unknown>,
        );
      });

      it("should sort tasks by specified field and order", async () => {
        const query = {
          page: 1,
          limit: 10,
          sortBy: TaskSortBy.CREATED_AT,
          sortOrder: SortOrder.ASC,
        };

        mockTasksDal.findMany.mockResolvedValue([mockTask]);
        mockTasksDal.count.mockResolvedValue(1);

        await service.findAll(query, mockTestUser);

        expect(mockTasksDal.findMany).toHaveBeenCalledWith(expect.any(Object), 0, 10, {
          createdAt: "asc",
        });
      });

      it("should default to desc order when sortBy is provided without sortOrder", async () => {
        const query = { page: 1, limit: 10, sortBy: TaskSortBy.CREATED_AT };

        mockTasksDal.findMany.mockResolvedValue([mockTask]);
        mockTasksDal.count.mockResolvedValue(1);

        await service.findAll(query, mockTestUser);

        expect(mockTasksDal.findMany).toHaveBeenCalledWith(expect.any(Object), 0, 10, {
          createdAt: "desc",
        });
      });
    });
  });

  describe("findOne", () => {
    describe("Success", () => {
      it("should return a task by id", async () => {
        mockTasksDal.findUnique.mockResolvedValue(mockTask);

        const result = await service.findOne("test-task-id", mockTestUser);

        expect(result).toEqual(mockTask);
        expect(mockTasksDal.findUnique).toHaveBeenCalledWith("test-task-id");
      });
    });

    describe("Failure", () => {
      it("should throw TaskNotFoundException when task not found", async () => {
        mockTasksDal.findUnique.mockResolvedValue(null);

        await expect(service.findOne("non-existent-id", mockTestUser)).rejects.toThrow(
          TaskNotFoundException,
        );
      });
    });
  });

  describe("update", () => {
    // The update method now uses tasksDal.transaction() with optimistic locking.
    // Mock transaction to execute the callback with a mock tx client.
    const mockTx = {
      task: {
        findUnique: jest.fn(),
        updateMany: jest.fn(),
      },
    };

    beforeEach(() => {
      mockTasksDal.transaction.mockImplementation(
        async (fn: (tx: typeof mockTx) => Promise<unknown>) => fn(mockTx),
      );
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    describe("Success", () => {
      it("should update a task", async () => {
        const updateTaskDto = { title: "Updated Title" };
        const updatedTask = { ...mockTask, ...updateTaskDto, version: 1 };

        mockTx.task.findUnique.mockResolvedValueOnce(mockTask).mockResolvedValueOnce(updatedTask);
        mockTx.task.updateMany.mockResolvedValue({ count: 1 });

        const result = await service.update("test-task-id", updateTaskDto, mockTestUser);

        expect(result).toEqual(updatedTask);
        expect(mockTx.task.updateMany).toHaveBeenCalled();
      });

      it("should set completedAt when status changes to COMPLETED", async () => {
        const updateTaskDto = { status: TaskStatus.COMPLETED };
        const updatedTask = { ...mockTask, status: TaskStatus.COMPLETED, completedAt: new Date() };

        mockTx.task.findUnique.mockResolvedValueOnce(mockTask).mockResolvedValueOnce(updatedTask);
        mockTx.task.updateMany.mockResolvedValue({ count: 1 });

        await service.update("test-task-id", updateTaskDto, mockTestUser);

        expect(mockTx.task.updateMany).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              completedAt: expect.any(Date) as Date,
            }),
          }),
        );
      });

      it("should clear completedAt when status changes from COMPLETED", async () => {
        const updateTaskDto = { status: TaskStatus.TODO };
        const completedTask = { ...mockTask, status: TaskStatus.COMPLETED };
        const updatedTask = { ...completedTask, status: TaskStatus.TODO, completedAt: null };

        mockTx.task.findUnique
          .mockResolvedValueOnce(completedTask)
          .mockResolvedValueOnce(updatedTask);
        mockTx.task.updateMany.mockResolvedValue({ count: 1 });

        await service.update("test-task-id", updateTaskDto, mockTestUser);

        expect(mockTx.task.updateMany).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              completedAt: null,
            }),
          }),
        );
      });

      it("should update task with dueDate", async () => {
        const updateTaskDto = { dueDate: "2025-12-31T00:00:00.000Z" };
        const updatedTask = { ...mockTask, dueDate: new Date(updateTaskDto.dueDate) };

        mockTx.task.findUnique.mockResolvedValueOnce(mockTask).mockResolvedValueOnce(updatedTask);
        mockTx.task.updateMany.mockResolvedValue({ count: 1 });

        await service.update("test-task-id", updateTaskDto, mockTestUser);

        expect(mockTx.task.updateMany).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              dueDate: new Date(updateTaskDto.dueDate),
            }),
          }),
        );
      });

      it("should update task with completedAt", async () => {
        const updateTaskDto = { completedAt: "2025-12-10T00:00:00.000Z" };
        const updatedTask = { ...mockTask, completedAt: new Date(updateTaskDto.completedAt) };

        mockTx.task.findUnique.mockResolvedValueOnce(mockTask).mockResolvedValueOnce(updatedTask);
        mockTx.task.updateMany.mockResolvedValue({ count: 1 });

        await service.update("test-task-id", updateTaskDto, mockTestUser);

        expect(mockTx.task.updateMany).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              completedAt: new Date(updateTaskDto.completedAt),
            }),
          }),
        );
      });

      it("should preserve explicit completedAt when status is not COMPLETED", async () => {
        const updateTaskDto = {
          status: TaskStatus.IN_PROGRESS,
          completedAt: "2025-12-10T00:00:00.000Z",
        };
        const updatedTask = {
          ...mockTask,
          status: TaskStatus.IN_PROGRESS,
          completedAt: new Date(updateTaskDto.completedAt),
        };

        mockTx.task.findUnique.mockResolvedValueOnce(mockTask).mockResolvedValueOnce(updatedTask);
        mockTx.task.updateMany.mockResolvedValue({ count: 1 });

        await service.update("test-task-id", updateTaskDto, mockTestUser);

        // The else-if fix means completedAt should be the explicit value,
        // NOT null (which was the bug before the fix)
        expect(mockTx.task.updateMany).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              completedAt: new Date(updateTaskDto.completedAt),
            }),
          }),
        );
      });

      it("should allow admin to update any task", async () => {
        const adminUser = { id: "admin-id", role: UserRole.ADMIN };
        const updateTaskDto = { title: "Admin Updated" };
        const updatedTask = { ...mockTask, ...updateTaskDto, version: 1 };

        mockTx.task.findUnique
          .mockResolvedValueOnce(mockTask) // task owned by test-user-id
          .mockResolvedValueOnce(updatedTask);
        mockTx.task.updateMany.mockResolvedValue({ count: 1 });

        // Admin can update task owned by different user
        const result = await service.update("test-task-id", updateTaskDto, adminUser);

        expect(result).toEqual(updatedTask);
      });

      it("should include version check in updateMany where clause", async () => {
        const updateTaskDto = { title: "Updated" };
        const taskWithVersion3 = { ...mockTask, version: 3 };
        const updatedTask = { ...taskWithVersion3, title: "Updated", version: 4 };

        mockTx.task.findUnique
          .mockResolvedValueOnce(taskWithVersion3)
          .mockResolvedValueOnce(updatedTask);
        mockTx.task.updateMany.mockResolvedValue({ count: 1 });

        await service.update("test-task-id", updateTaskDto, mockTestUser);

        expect(mockTx.task.updateMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              id: "test-task-id",
              version: 3, // Must match the version read from the database
            }),
            data: expect.objectContaining({
              version: { increment: 1 },
            }),
          }),
        );
      });
    });

    describe("Failure", () => {
      it("should throw TaskConflictException when version conflict occurs", async () => {
        const updateTaskDto = { title: "Updated Title" };

        mockTx.task.findUnique.mockResolvedValueOnce(mockTask);
        mockTx.task.updateMany.mockResolvedValue({ count: 0 }); // Version conflict

        await expect(service.update("test-task-id", updateTaskDto, mockTestUser)).rejects.toThrow(
          TaskConflictException,
        );
      });

      it("should throw TaskNotFoundException when task does not exist", async () => {
        mockTx.task.findUnique.mockResolvedValueOnce(null);

        await expect(service.update("test-task-id", { title: "X" }, mockTestUser)).rejects.toThrow(
          TaskNotFoundException,
        );
      });

      it("should throw TaskForbiddenException when user is not owner or admin", async () => {
        const otherUser = { id: "other-user-id", role: UserRole.USER };

        mockTx.task.findUnique.mockResolvedValueOnce(mockTask);

        await expect(service.update("test-task-id", { title: "X" }, otherUser)).rejects.toThrow(
          TaskForbiddenException,
        );
      });
    });
  });

  describe("remove", () => {
    const mockTx = {
      task: {
        findUnique: jest.fn(),
        updateMany: jest.fn(),
      },
    };

    beforeEach(() => {
      mockTasksDal.transaction.mockImplementation(
        async (fn: (tx: typeof mockTx) => Promise<unknown>) => fn(mockTx),
      );
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    describe("Success", () => {
      it("should soft delete a task", async () => {
        const deletedTask = { ...mockTask, deletedAt: new Date() };

        mockTx.task.findUnique.mockResolvedValueOnce(mockTask).mockResolvedValueOnce(deletedTask);
        mockTx.task.updateMany.mockResolvedValue({ count: 1 });

        const result = await service.remove("test-task-id", mockTestUser);

        expect(result.deletedAt).toBeDefined();
        expect(mockTx.task.updateMany).toHaveBeenCalled();
      });
    });

    describe("Failure", () => {
      it("should throw TaskConflictException when version conflict occurs on delete", async () => {
        mockTx.task.findUnique.mockResolvedValueOnce(mockTask);
        mockTx.task.updateMany.mockResolvedValue({ count: 0 });

        await expect(service.remove("test-task-id", mockTestUser)).rejects.toThrow(
          TaskConflictException,
        );
      });

      it("should throw TaskNotFoundException when task not found for deletion", async () => {
        mockTx.task.findUnique.mockResolvedValueOnce(null);

        await expect(service.remove("test-task-id", mockTestUser)).rejects.toThrow(
          TaskNotFoundException,
        );
      });

      it("should throw TaskForbiddenException when non-owner tries to delete", async () => {
        const otherUser = { id: "other-user-id", role: UserRole.USER };

        mockTx.task.findUnique.mockResolvedValueOnce(mockTask);

        await expect(service.remove("test-task-id", otherUser)).rejects.toThrow(
          TaskForbiddenException,
        );
      });
    });
  });

  describe("purge", () => {
    describe("Success", () => {
      it("should permanently delete a task that exists", async () => {
        mockTasksDal.delete.mockResolvedValue(undefined);

        await service.purge("test-task-id");

        expect(mockTasksDal.delete).toHaveBeenCalledWith("test-task-id");
        expect(mockTasksDal.delete).toHaveBeenCalledTimes(1);
      });
    });

    describe("Failure", () => {
      it("should handle deletion of a non-existent task", async () => {
        mockTasksDal.delete.mockRejectedValue(new Error("Task not found"));

        await expect(service.purge("non-existent-id")).rejects.toThrow("Task not found");
        expect(mockTasksDal.delete).toHaveBeenCalledWith("non-existent-id");
      });
    });
  });

  describe("getStatistics", () => {
    describe("Success", () => {
      it("should return task statistics", async () => {
        mockTasksDal.count.mockResolvedValueOnce(10);
        mockTasksDal.countByStatus.mockResolvedValueOnce([
          { status: TaskStatus.TODO, _count: 5 },
          { status: TaskStatus.COMPLETED, _count: 5 },
        ]);
        mockTasksDal.countByPriority.mockResolvedValueOnce([
          { priority: TaskPriority.HIGH, _count: 6 },
          { priority: TaskPriority.LOW, _count: 4 },
        ]);
        mockTasksDal.countOverdue.mockResolvedValueOnce(2);

        const result = await service.getStatistics(mockTestUser);

        expect(result).toHaveProperty("total");
        expect(result).toHaveProperty("byStatus");
        expect(result).toHaveProperty("byPriority");
        expect(result).toHaveProperty("overdue");
      });

      it("should return task statistics for a specific user", async () => {
        const user = { id: "user-123", role: UserRole.USER };

        mockTasksDal.count.mockResolvedValueOnce(5);
        mockTasksDal.countByStatus.mockResolvedValueOnce([
          { status: TaskStatus.TODO, _count: 3 },
          { status: TaskStatus.IN_PROGRESS, _count: 2 },
        ]);
        mockTasksDal.countByPriority.mockResolvedValueOnce([
          { priority: TaskPriority.HIGH, _count: 5 },
        ]);
        mockTasksDal.countOverdue.mockResolvedValueOnce(1);

        const result = await service.getStatistics(user);

        expect(result).toHaveProperty("total", 5);
        expect(mockTasksDal.countOverdue).toHaveBeenCalledWith(user.id);
      });
    });
  });

  describe("findNextDueTask", () => {
    describe("Success", () => {
      it("should return the next due task", async () => {
        const futureDate = new Date();

        futureDate.setDate(futureDate.getDate() + 5);

        const mockTaskWithDueDate = {
          ...mockTask,
          dueDate: futureDate,
          status: TaskStatus.TODO,
        };

        mockTasksDal.findNextDueTask.mockResolvedValue(mockTaskWithDueDate);

        const result = await service.findNextDueTask("user-id");

        expect(result).toEqual(mockTaskWithDueDate);
        expect(mockTasksDal.findNextDueTask).toHaveBeenCalledWith("user-id");
      });

      it("should return null when no upcoming tasks", async () => {
        mockTasksDal.findNextDueTask.mockResolvedValue(null);

        const result = await service.findNextDueTask("user-id");

        expect(result).toBeNull();
      });
    });
  });

  describe("findOneWithPermissions", () => {
    describe("Success", () => {
      it("should allow task owner to access their task", async () => {
        const user = { id: "test-user-id", role: "USER" };

        mockTasksDal.findUnique.mockResolvedValue(mockTask);

        const result = await service.findOneWithPermissions("task-id", user);

        expect(result).toEqual(mockTask);
        expect(mockTasksDal.findUnique).toHaveBeenCalledWith("task-id");
      });

      it("should allow admin to access any task", async () => {
        const adminUser = { id: "admin-id", role: "ADMIN" };

        mockTasksDal.findUnique.mockResolvedValue(mockTask);

        const result = await service.findOneWithPermissions("task-id", adminUser);

        expect(result).toEqual(mockTask);
      });
    });

    describe("Failure", () => {
      it("should throw TaskForbiddenException for non-owner/non-admin", async () => {
        const otherUser = { id: "other-user-id", role: "USER" };

        mockTasksDal.findUnique.mockResolvedValue(mockTask);

        await expect(service.findOneWithPermissions("task-id", otherUser)).rejects.toThrow(
          TaskForbiddenException,
        );
      });

      it("should throw TaskNotFoundException if task does not exist", async () => {
        const user = { id: "user-id", role: "USER" };

        mockTasksDal.findUnique.mockResolvedValue(null);

        await expect(service.findOneWithPermissions("task-id", user)).rejects.toThrow(
          TaskNotFoundException,
        );
      });
    });
  });
});
