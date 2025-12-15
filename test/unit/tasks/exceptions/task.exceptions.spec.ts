import { HttpStatus } from "@nestjs/common";
import {
  TaskForbiddenException,
  TaskInvalidStatusException,
  TaskInvalidPriorityException,
  TaskAlreadyCompletedException,
} from "../../../../src/modules/tasks/exceptions";
import { ErrorCode } from "../../../../src/common/constants/error-codes.constants";

describe("Task Exceptions", () => {
  describe("TaskForbiddenException", () => {
    it("should create exception with default message when no task ID provided", () => {
      const exception = new TaskForbiddenException();

      expect(exception.getStatus()).toBe(HttpStatus.FORBIDDEN);
      expect(exception.getErrorCode()).toBe(ErrorCode.TASK_FORBIDDEN);

      const response = exception.getResponse() as Record<string, unknown>;

      expect(response.message).toBe("You do not have permission to access this task");
      expect(response.errorCode).toBe(ErrorCode.TASK_FORBIDDEN);
    });

    it("should create exception with task ID in message", () => {
      const taskId = "clh9k7x2a0000qmxbzv0q0001";
      const exception = new TaskForbiddenException(taskId);

      const response = exception.getResponse() as Record<string, unknown>;

      expect(response.message).toBe(`You do not have permission to access task: ${taskId}`);
      expect(response.errorCode).toBe(ErrorCode.TASK_FORBIDDEN);
    });
  });

  describe("TaskInvalidStatusException", () => {
    it("should create exception with status in message", () => {
      const status = "INVALID_STATUS";
      const exception = new TaskInvalidStatusException(status);

      expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      expect(exception.getErrorCode()).toBe(ErrorCode.TASK_INVALID_STATUS);

      const response = exception.getResponse() as Record<string, unknown>;

      expect(response.message).toBe(`Invalid task status: ${status}`);
      expect(response.errorCode).toBe(ErrorCode.TASK_INVALID_STATUS);
    });

    it("should create exception with different status value", () => {
      const status = "UNKNOWN";
      const exception = new TaskInvalidStatusException(status);

      const response = exception.getResponse() as Record<string, unknown>;

      expect(response.message).toBe(`Invalid task status: ${status}`);
      expect(response.errorCode).toBe(ErrorCode.TASK_INVALID_STATUS);
    });
  });

  describe("TaskInvalidPriorityException", () => {
    it("should create exception with priority in message", () => {
      const priority = "URGENT";
      const exception = new TaskInvalidPriorityException(priority);

      expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      expect(exception.getErrorCode()).toBe(ErrorCode.TASK_INVALID_PRIORITY);

      const response = exception.getResponse() as Record<string, unknown>;

      expect(response.message).toBe(`Invalid task priority: ${priority}`);
      expect(response.errorCode).toBe(ErrorCode.TASK_INVALID_PRIORITY);
    });

    it("should create exception with different priority value", () => {
      const priority = "INVALID";
      const exception = new TaskInvalidPriorityException(priority);

      const response = exception.getResponse() as Record<string, unknown>;

      expect(response.message).toBe(`Invalid task priority: ${priority}`);
      expect(response.errorCode).toBe(ErrorCode.TASK_INVALID_PRIORITY);
    });
  });

  describe("TaskAlreadyCompletedException", () => {
    it("should create exception with task ID in message", () => {
      const taskId = "clh9k7x2a0000qmxbzv0q0001";
      const exception = new TaskAlreadyCompletedException(taskId);

      expect(exception.getStatus()).toBe(HttpStatus.CONFLICT);
      expect(exception.getErrorCode()).toBe(ErrorCode.TASK_ALREADY_COMPLETED);

      const response = exception.getResponse() as Record<string, unknown>;

      expect(response.message).toBe(`Task is already completed: ${taskId}`);
      expect(response.errorCode).toBe(ErrorCode.TASK_ALREADY_COMPLETED);
    });

    it("should create exception with different task ID", () => {
      const taskId = "clh9k7x2a0000qmxbzv0q0002";
      const exception = new TaskAlreadyCompletedException(taskId);

      const response = exception.getResponse() as Record<string, unknown>;

      expect(response.message).toBe(`Task is already completed: ${taskId}`);
      expect(response.errorCode).toBe(ErrorCode.TASK_ALREADY_COMPLETED);
    });
  });
});
