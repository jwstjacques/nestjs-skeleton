import { HttpStatus } from "@nestjs/common";
import { ApplicationException } from "./application.exception";
import { ErrorCode } from "../constants/error-codes.constants";

export class InvalidCredentialsException extends ApplicationException {
  constructor(message?: string) {
    super(ErrorCode.AUTH_INVALID_CREDENTIALS, message, HttpStatus.UNAUTHORIZED);
  }
}

export class TokenExpiredException extends ApplicationException {
  constructor(message?: string) {
    super(ErrorCode.AUTH_TOKEN_EXPIRED, message, HttpStatus.UNAUTHORIZED);
  }
}

export class TokenInvalidException extends ApplicationException {
  constructor(message?: string) {
    super(ErrorCode.AUTH_TOKEN_INVALID, message, HttpStatus.UNAUTHORIZED);
  }
}

export class UserNotFoundException extends ApplicationException {
  constructor() {
    super(ErrorCode.AUTH_AUTHENTICATION_FAILED, "Authentication failed", HttpStatus.UNAUTHORIZED);
  }
}

export class UserInactiveException extends ApplicationException {
  constructor(message?: string) {
    super(ErrorCode.AUTH_USER_INACTIVE, message, HttpStatus.UNAUTHORIZED);
  }
}

export class RegistrationConflictException extends ApplicationException {
  constructor() {
    super(ErrorCode.AUTH_REGISTRATION_FAILED, "Registration failed", HttpStatus.CONFLICT);
  }
}

export class AuthenticationFailedException extends ApplicationException {
  constructor() {
    super(ErrorCode.AUTH_AUTHENTICATION_FAILED, "Authentication failed", HttpStatus.UNAUTHORIZED);
  }
}

export class WeakPasswordException extends ApplicationException {
  constructor(requirements?: string[]) {
    super(ErrorCode.AUTH_WEAK_PASSWORD, { requirements }, HttpStatus.BAD_REQUEST);
  }
}
