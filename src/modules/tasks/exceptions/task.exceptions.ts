import { HttpStatus } from "@nestjs/common";
import { ApplicationException } from "../../../common/exceptions/application.exception";
import { ErrorCode } from "../../../common/constants/error-codes.constants";

export class TaskForbiddenException extends ApplicationException {
  constructor(taskId?: string) {
    const message = taskId ? `You do not have permission to access task: ${taskId}` : undefined;

    super(ErrorCode.TASK_FORBIDDEN, message, HttpStatus.FORBIDDEN);
  }
}

export class TaskInvalidStatusException extends ApplicationException {
  constructor(status: string) {
    super(ErrorCode.TASK_INVALID_STATUS, `Invalid task status: ${status}`, HttpStatus.BAD_REQUEST);
  }
}

export class TaskInvalidPriorityException extends ApplicationException {
  constructor(priority: string) {
    super(
      ErrorCode.TASK_INVALID_PRIORITY,
      `Invalid task priority: ${priority}`,
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class TaskAlreadyCompletedException extends ApplicationException {
  constructor(taskId: string) {
    super(
      ErrorCode.TASK_ALREADY_COMPLETED,
      `Task is already completed: ${taskId}`,
      HttpStatus.CONFLICT,
    );
  }
}
