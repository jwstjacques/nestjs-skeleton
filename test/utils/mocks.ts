import { Task, User, TaskStatus, TaskPriority, UserRole } from "@prisma/client";

export const mockUser: User = {
  id: "test-user-id",
  email: "test@example.com",
  username: "testuser",
  password: "hashedpassword",
  firstName: "Test",
  lastName: "User",
  role: UserRole.USER,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

export const mockTask: Task = {
  id: "test-task-id",
  title: "Test Task",
  description: "Test Description",
  status: TaskStatus.TODO,
  priority: TaskPriority.MEDIUM,
  dueDate: null,
  completedAt: null,
  userId: "test-user-id",
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

export const mockPrismaService = {
  task: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    groupBy: jest.fn(),
  },
  user: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  $connect: jest.fn(),
  $disconnect: jest.fn(),
};

export const mockTasksDal = {
  create: jest.fn(),
  findMany: jest.fn(),
  findUnique: jest.fn(),
  count: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
  delete: jest.fn(),
  groupBy: jest.fn(),
  countOverdue: jest.fn(),
};
