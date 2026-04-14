import { HttpStatus } from "@nestjs/common";
import type { ApplicationException } from "../../../../src/common/exceptions/application.exception";
import { TaskForbiddenException } from "../../../../src/modules/tasks/exceptions";
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
});
