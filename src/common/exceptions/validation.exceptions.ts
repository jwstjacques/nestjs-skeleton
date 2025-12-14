import { HttpStatus } from "@nestjs/common";
import { ApplicationException } from "./application.exception";
import { ErrorCode } from "../constants/error-codes.constants";

export class ValidationFailedException extends ApplicationException {
  constructor(errors: Record<string, string[]>) {
    super(ErrorCode.VALIDATION_FAILED, { errors }, HttpStatus.BAD_REQUEST);
  }
}

export class InvalidCuidException extends ApplicationException {
  constructor(value: string) {
    super(
      ErrorCode.VALIDATION_INVALID_CUID,
      `Invalid CUID format: ${value}`,
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class InvalidEmailException extends ApplicationException {
  constructor(email: string) {
    super(
      ErrorCode.VALIDATION_INVALID_EMAIL,
      `Invalid email format: ${email}`,
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class InvalidDateException extends ApplicationException {
  constructor(field: string, value: string) {
    super(
      ErrorCode.VALIDATION_INVALID_DATE,
      `Invalid date for ${field}: ${value}`,
      HttpStatus.BAD_REQUEST,
    );
  }
}
