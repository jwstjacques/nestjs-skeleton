import { HttpStatus } from "@nestjs/common";
import {
  InvalidCredentialsException,
  TokenExpiredException,
  TokenInvalidException,
  UserNotFoundException,
  UserInactiveException,
  EmailExistsException,
  UsernameExistsException,
  WeakPasswordException,
} from "../../../../src/common/exceptions/auth.exceptions";
import { ErrorCode } from "../../../../src/common/constants/error-codes.constants";

describe("Auth Exceptions", () => {
  describe("InvalidCredentialsException", () => {
    describe("Success", () => {
      it("should create exception with default message", () => {
        const exception = new InvalidCredentialsException();

        expect(exception.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
        expect(exception.getErrorCode()).toBe(ErrorCode.AUTH_INVALID_CREDENTIALS);

        const response = exception.getResponse() as Record<string, unknown>;

        expect(response.message).toBe("Invalid email or password");
        expect(response.errorCode).toBe(ErrorCode.AUTH_INVALID_CREDENTIALS);
      });

      it("should create exception with custom message", () => {
        const customMessage = "Login failed due to invalid credentials";
        const exception = new InvalidCredentialsException(customMessage);

        const response = exception.getResponse() as Record<string, unknown>;

        expect(response.message).toBe(customMessage);
        expect(response.errorCode).toBe(ErrorCode.AUTH_INVALID_CREDENTIALS);
      });
    });
  });

  describe("TokenExpiredException", () => {
    describe("Success", () => {
      it("should create exception with default message", () => {
        const exception = new TokenExpiredException();

        expect(exception.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
        expect(exception.getErrorCode()).toBe(ErrorCode.AUTH_TOKEN_EXPIRED);

        const response = exception.getResponse() as Record<string, unknown>;

        expect(response.message).toBe("Authentication token has expired");
        expect(response.errorCode).toBe(ErrorCode.AUTH_TOKEN_EXPIRED);
      });

      it("should create exception with custom message", () => {
        const customMessage = "Your session has expired. Please login again";
        const exception = new TokenExpiredException(customMessage);

        const response = exception.getResponse() as Record<string, unknown>;

        expect(response.message).toBe(customMessage);
      });
    });
  });

  describe("TokenInvalidException", () => {
    describe("Success", () => {
      it("should create exception with default message", () => {
        const exception = new TokenInvalidException();

        expect(exception.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
        expect(exception.getErrorCode()).toBe(ErrorCode.AUTH_TOKEN_INVALID);

        const response = exception.getResponse() as Record<string, unknown>;

        expect(response.message).toBe("Invalid authentication token");
        expect(response.errorCode).toBe(ErrorCode.AUTH_TOKEN_INVALID);
      });

      it("should create exception with custom message", () => {
        const customMessage = "Token validation failed";
        const exception = new TokenInvalidException(customMessage);

        const response = exception.getResponse() as Record<string, unknown>;

        expect(response.message).toBe(customMessage);
      });
    });
  });

  describe("UserNotFoundException", () => {
    describe("Success", () => {
      it("should create exception with default message when no identifier provided", () => {
        const exception = new UserNotFoundException();

        expect(exception.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
        expect(exception.getErrorCode()).toBe(ErrorCode.AUTH_USER_NOT_FOUND);

        const response = exception.getResponse() as Record<string, unknown>;

        expect(response.message).toBe("User account not found");
        expect(response.errorCode).toBe(ErrorCode.AUTH_USER_NOT_FOUND);
      });

      it("should create exception with identifier in message", () => {
        const userId = "clh9k7x2a0000qmxbzv0q0001";
        const exception = new UserNotFoundException(userId);

        const response = exception.getResponse() as Record<string, unknown>;

        expect(response.message).toBe(`User not found: ${userId}`);
        expect(response.errorCode).toBe(ErrorCode.AUTH_USER_NOT_FOUND);
      });
    });
  });

  describe("UserInactiveException", () => {
    describe("Success", () => {
      it("should create exception with default message", () => {
        const exception = new UserInactiveException();

        expect(exception.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
        expect(exception.getErrorCode()).toBe(ErrorCode.AUTH_USER_INACTIVE);

        const response = exception.getResponse() as Record<string, unknown>;

        expect(response.message).toBe("User account is inactive");
        expect(response.errorCode).toBe(ErrorCode.AUTH_USER_INACTIVE);
      });

      it("should create exception with custom message", () => {
        const customMessage = "Account has been deactivated";
        const exception = new UserInactiveException(customMessage);

        const response = exception.getResponse() as Record<string, unknown>;

        expect(response.message).toBe(customMessage);
      });
    });
  });

  describe("EmailExistsException", () => {
    describe("Success", () => {
      it("should create exception with default message when no email provided", () => {
        const exception = new EmailExistsException();

        expect(exception.getStatus()).toBe(HttpStatus.CONFLICT);
        expect(exception.getErrorCode()).toBe(ErrorCode.AUTH_EMAIL_EXISTS);

        const response = exception.getResponse() as Record<string, unknown>;

        expect(response.message).toBe("Email address is already registered");
        expect(response.errorCode).toBe(ErrorCode.AUTH_EMAIL_EXISTS);
      });

      it("should create exception with email in message", () => {
        const email = "test@example.com";
        const exception = new EmailExistsException(email);

        const response = exception.getResponse() as Record<string, unknown>;

        expect(response.message).toBe(`Email already registered: ${email}`);
        expect(response.errorCode).toBe(ErrorCode.AUTH_EMAIL_EXISTS);
      });
    });
  });

  describe("UsernameExistsException", () => {
    describe("Success", () => {
      it("should create exception with default message when no username provided", () => {
        const exception = new UsernameExistsException();

        expect(exception.getStatus()).toBe(HttpStatus.CONFLICT);
        expect(exception.getErrorCode()).toBe(ErrorCode.AUTH_USERNAME_EXISTS);

        const response = exception.getResponse() as Record<string, unknown>;

        expect(response.message).toBe("Username is already taken");
        expect(response.errorCode).toBe(ErrorCode.AUTH_USERNAME_EXISTS);
      });

      it("should create exception with username in message", () => {
        const username = "johndoe";
        const exception = new UsernameExistsException(username);

        const response = exception.getResponse() as Record<string, unknown>;

        expect(response.message).toBe(`Username already taken: ${username}`);
        expect(response.errorCode).toBe(ErrorCode.AUTH_USERNAME_EXISTS);
      });
    });
  });

  describe("WeakPasswordException", () => {
    describe("Success", () => {
      it("should create exception with default message when no requirements provided", () => {
        const exception = new WeakPasswordException();

        expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
        expect(exception.getErrorCode()).toBe(ErrorCode.AUTH_WEAK_PASSWORD);

        const response = exception.getResponse() as Record<string, unknown>;

        expect(response.message).toBe("Password does not meet security requirements");
        expect(response.errorCode).toBe(ErrorCode.AUTH_WEAK_PASSWORD);
      });

      it("should create exception with password requirements in details", () => {
        const requirements = [
          "At least 8 characters",
          "One uppercase letter",
          "One number",
          "One special character",
        ];
        const exception = new WeakPasswordException(requirements);

        const response = exception.getResponse() as Record<string, unknown>;

        expect(response.message).toBe("Password does not meet security requirements");
        expect(response.errorCode).toBe(ErrorCode.AUTH_WEAK_PASSWORD);
        expect(response.details).toEqual({ requirements });
      });
    });
  });
});
