import { HttpStatus } from "@nestjs/common";
import { ApplicationException } from "./application.exception";
import { ErrorCode } from "../constants/error-codes.constants";

export class TaskNotFoundException extends ApplicationException {
  constructor(id: string) {
    super(ErrorCode.TASK_NOT_FOUND, `Task not found: ${id}`, HttpStatus.NOT_FOUND);
  }
}
