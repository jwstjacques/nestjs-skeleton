import { HttpStatus } from "@nestjs/common";
import { ApplicationException } from "../../../common/exceptions/application.exception";
import { TaskErrorCode, TASK_MESSAGES } from "../constants";

export class TaskForbiddenException extends ApplicationException {
  constructor(taskId?: string) {
    super(TaskErrorCode.TASK_FORBIDDEN, TASK_MESSAGES.FORBIDDEN(taskId), HttpStatus.FORBIDDEN);
  }
}

export class TaskInvalidStatusException extends ApplicationException {
  constructor(status: string) {
    super(
      TaskErrorCode.TASK_INVALID_STATUS,
      TASK_MESSAGES.INVALID_STATUS(status),
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class TaskInvalidPriorityException extends ApplicationException {
  constructor(priority: string) {
    super(
      TaskErrorCode.TASK_INVALID_PRIORITY,
      TASK_MESSAGES.INVALID_PRIORITY(priority),
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class TaskAlreadyCompletedException extends ApplicationException {
  constructor(taskId: string) {
    super(
      TaskErrorCode.TASK_ALREADY_COMPLETED,
      TASK_MESSAGES.ALREADY_COMPLETED(taskId),
      HttpStatus.CONFLICT,
    );
  }
}
