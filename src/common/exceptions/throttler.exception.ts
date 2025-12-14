import { HttpStatus } from "@nestjs/common";
import { ApplicationException } from "./application.exception";
import { ErrorCode } from "../constants/error-codes.constants";

export class ThrottlerException extends ApplicationException {
  constructor(message?: string) {
    super(ErrorCode.SYSTEM_RATE_LIMIT_EXCEEDED, message, HttpStatus.TOO_MANY_REQUESTS);
  }
}
