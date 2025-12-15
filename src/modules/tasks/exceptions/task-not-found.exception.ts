import { HttpStatus } from "@nestjs/common";
import { ApplicationException } from "../../../common/exceptions/application.exception";
import { ErrorCode } from "../../../common/constants/error-codes.constants";

export class TaskNotFoundException extends ApplicationException {
  constructor(id: string) {
    super(ErrorCode.TASK_NOT_FOUND, `Task not found: ${id}`, HttpStatus.NOT_FOUND);
  }
}
