import { HttpStatus } from "@nestjs/common";
import type { ApplicationException } from "../../../../src/common/exceptions/application.exception";
import {
  TaskForbiddenException,
  TaskInvalidStatusException,
  TaskInvalidPriorityException,
  TaskAlreadyCompletedException,
} from "../../../../src/modules/tasks/exceptions";
import { TaskErrorCode, TASK_MESSAGES } from "../../../../src/modules/tasks/constants";

describe("Task Exceptions", () => {
  describe("TaskForbiddenException", () => {
    describe("Success", () => {
      it("should create exception with default message when no task ID provided", () => {
        const exception = new TaskForbiddenException() as ApplicationException;

        expect(exception.getStatus()).toBe(HttpStatus.FORBIDDEN);
        expect(exception.getErrorCode()).toBe(TaskErrorCode.TASK_FORBIDDEN);

        const response = exception.getResponse() as Record<string, unknown>;

        expect(response.message).toBe(TASK_MESSAGES.FORBIDDEN());
        expect(response.errorCode).toBe(TaskErrorCode.TASK_FORBIDDEN);
      });

      it("should create exception with task ID in message", () => {
        const taskId = "clh9k7x2a0000qmxbzv0q0001";
        const exception = new TaskForbiddenException(taskId) as ApplicationException;

        const response = exception.getResponse() as Record<string, unknown>;

        expect(response.message).toBe(TASK_MESSAGES.FORBIDDEN(taskId));
        expect(response.errorCode).toBe(TaskErrorCode.TASK_FORBIDDEN);
      });
    });
  });

  describe("TaskInvalidStatusException", () => {
    describe("Success", () => {
      it("should create exception with status in message", () => {
        const status = "INVALID_STATUS";
        const exception = new TaskInvalidStatusException(status) as ApplicationException;

        expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
        expect(exception.getErrorCode()).toBe(TaskErrorCode.TASK_INVALID_STATUS);

        const response = exception.getResponse() as Record<string, unknown>;

        expect(response.message).toBe(TASK_MESSAGES.INVALID_STATUS(status));
        expect(response.errorCode).toBe(TaskErrorCode.TASK_INVALID_STATUS);
      });

      it("should create exception with different status value", () => {
        const status = "UNKNOWN";
        const exception = new TaskInvalidStatusException(status) as ApplicationException;

        const response = exception.getResponse() as Record<string, unknown>;

        expect(response.message).toBe(TASK_MESSAGES.INVALID_STATUS(status));
        expect(response.errorCode).toBe(TaskErrorCode.TASK_INVALID_STATUS);
      });
    });
  });

  describe("TaskInvalidPriorityException", () => {
    describe("Success", () => {
      it("should create exception with priority in message", () => {
        const priority = "URGENT";
        const exception = new TaskInvalidPriorityException(priority) as ApplicationException;

        expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
        expect(exception.getErrorCode()).toBe(TaskErrorCode.TASK_INVALID_PRIORITY);

        const response = exception.getResponse() as Record<string, unknown>;

        expect(response.message).toBe(TASK_MESSAGES.INVALID_PRIORITY(priority));
        expect(response.errorCode).toBe(TaskErrorCode.TASK_INVALID_PRIORITY);
      });

      it("should create exception with different priority value", () => {
        const priority = "INVALID";
        const exception = new TaskInvalidPriorityException(priority) as ApplicationException;

        const response = exception.getResponse() as Record<string, unknown>;

        expect(response.message).toBe(TASK_MESSAGES.INVALID_PRIORITY(priority));
        expect(response.errorCode).toBe(TaskErrorCode.TASK_INVALID_PRIORITY);
      });
    });
  });

  describe("TaskAlreadyCompletedException", () => {
    describe("Success", () => {
      it("should create exception with task ID in message", () => {
        const taskId = "clh9k7x2a0000qmxbzv0q0001";
        const exception = new TaskAlreadyCompletedException(taskId) as ApplicationException;

        expect(exception.getStatus()).toBe(HttpStatus.CONFLICT);
        expect(exception.getErrorCode()).toBe(TaskErrorCode.TASK_ALREADY_COMPLETED);

        const response = exception.getResponse() as Record<string, unknown>;

        expect(response.message).toBe(TASK_MESSAGES.ALREADY_COMPLETED(taskId));
        expect(response.errorCode).toBe(TaskErrorCode.TASK_ALREADY_COMPLETED);
      });

      it("should create exception with different task ID", () => {
        const taskId = "clh9k7x2a0000qmxbzv0q0002";
        const exception = new TaskAlreadyCompletedException(taskId) as ApplicationException;

        const response = exception.getResponse() as Record<string, unknown>;

        expect(response.message).toBe(TASK_MESSAGES.ALREADY_COMPLETED(taskId));
        expect(response.errorCode).toBe(TaskErrorCode.TASK_ALREADY_COMPLETED);
      });
    });
  });
});
