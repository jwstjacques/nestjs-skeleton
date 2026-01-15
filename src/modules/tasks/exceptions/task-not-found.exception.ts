import { HttpStatus } from "@nestjs/common";
import { ApplicationException } from "../../../common/exceptions/application.exception";
import { TaskErrorCode, TASK_MESSAGES } from "../constants";

export class TaskNotFoundException extends ApplicationException {
  constructor(id: string) {
    super(TaskErrorCode.TASK_NOT_FOUND, TASK_MESSAGES.NOT_FOUND(id), HttpStatus.NOT_FOUND);
  }
}
