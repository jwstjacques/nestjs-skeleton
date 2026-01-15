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
  constructor(identifier?: string) {
    const message = identifier ? `User not found: ${identifier}` : undefined;

    super(ErrorCode.AUTH_USER_NOT_FOUND, message, HttpStatus.UNAUTHORIZED);
  }
}

export class UserInactiveException extends ApplicationException {
  constructor(message?: string) {
    super(ErrorCode.AUTH_USER_INACTIVE, message, HttpStatus.UNAUTHORIZED);
  }
}

export class EmailExistsException extends ApplicationException {
  constructor(email?: string) {
    const message = email ? `Email already registered: ${email}` : undefined;

    super(ErrorCode.AUTH_EMAIL_EXISTS, message, HttpStatus.CONFLICT);
  }
}

export class UsernameExistsException extends ApplicationException {
  constructor(username?: string) {
    const message = username ? `Username already taken: ${username}` : undefined;

    super(ErrorCode.AUTH_USERNAME_EXISTS, message, HttpStatus.CONFLICT);
  }
}

export class WeakPasswordException extends ApplicationException {
  constructor(requirements?: string[]) {
    super(ErrorCode.AUTH_WEAK_PASSWORD, { requirements }, HttpStatus.BAD_REQUEST);
  }
}
