import { TaskStatus, TaskPriority, UserRole, PrismaClient, User, Task } from "@prisma/client";
import * as bcrypt from "bcrypt";

export const testUsers = {
  admin: {
    email: "admin@test.com",
    username: "testadmin",
    password: "Test123!",
    firstName: "Admin",
    lastName: "Test",
    role: UserRole.ADMIN,
  },
  user1: {
    email: "user1@test.com",
    username: "testuser1",
    password: "Test123!",
    firstName: "User",
    lastName: "One",
    role: UserRole.USER,
  },
  user2: {
    email: "user2@test.com",
    username: "testuser2",
    password: "Test123!",
    firstName: "User",
    lastName: "Two",
    role: UserRole.USER,
  },
};

export const testTasks = {
  task1: {
    title: "Test Task 1",
    description: "First test task",
    status: TaskStatus.TODO,
    priority: TaskPriority.HIGH,
  },
  task2: {
    title: "Test Task 2",
    description: "Second test task",
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.MEDIUM,
  },
  task3: {
    title: "Test Task 3",
    description: "Third test task",
    status: TaskStatus.COMPLETED,
    priority: TaskPriority.LOW,
    completedAt: new Date(),
  },
};

export async function createTestUser(
  prisma: PrismaClient,
  userData = testUsers.user1,
): Promise<User> {
  const hashedPassword = await bcrypt.hash(userData.password, 10);

  return await prisma.user.create({
    data: {
      ...userData,
      password: hashedPassword,
    },
  });
}

export async function createTestTask(
  prisma: PrismaClient,
  userId: string,
  taskData: Partial<Task> = testTasks.task1,
): Promise<Task> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, createdAt, updatedAt, deletedAt, ...data } = taskData;

  return await prisma.task.create({
    data: {
      title: data.title ?? testTasks.task1.title,
      description: data.description ?? testTasks.task1.description,
      status: data.status ?? testTasks.task1.status,
      priority: data.priority ?? testTasks.task1.priority,
      userId,
      ...(data.completedAt && { completedAt: data.completedAt }),
      ...(data.dueDate && { dueDate: data.dueDate }),
    },
  });
}
