import { HttpStatus } from "@nestjs/common";
import { ApplicationException } from "../../../common/exceptions/application.exception";
import { TaskErrorCode, TASK_MESSAGES } from "../constants";

export class TaskForbiddenException extends ApplicationException {
  constructor(taskId?: string) {
    super(TaskErrorCode.TASK_FORBIDDEN, TASK_MESSAGES.FORBIDDEN(taskId), HttpStatus.FORBIDDEN);
  }
}

export class TaskConflictException extends ApplicationException {
  constructor(taskId: string) {
    super(TaskErrorCode.TASK_CONFLICT, TASK_MESSAGES.CONFLICT(taskId), HttpStatus.CONFLICT);
  }
}
