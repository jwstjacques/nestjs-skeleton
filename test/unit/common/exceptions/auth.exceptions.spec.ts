import { HttpStatus } from "@nestjs/common";
import {
  InvalidCredentialsException,
  TokenExpiredException,
  TokenInvalidException,
  UserNotFoundException,
  UserInactiveException,
  RegistrationConflictException,
  AuthenticationFailedException,
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
      it("should create exception with unified authentication failed message", () => {
        const exception = new UserNotFoundException();

        expect(exception.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
        expect(exception.getErrorCode()).toBe(ErrorCode.AUTH_AUTHENTICATION_FAILED);

        const response = exception.getResponse() as Record<string, unknown>;

        expect(response.message).toBe("Authentication failed");
        expect(response.errorCode).toBe(ErrorCode.AUTH_AUTHENTICATION_FAILED);
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

  describe("RegistrationConflictException", () => {
    describe("Success", () => {
      it("should create exception with unified registration failed message", () => {
        const exception = new RegistrationConflictException();

        expect(exception.getStatus()).toBe(HttpStatus.CONFLICT);
        expect(exception.getErrorCode()).toBe(ErrorCode.AUTH_REGISTRATION_FAILED);

        const response = exception.getResponse() as Record<string, unknown>;

        expect(response.message).toBe("Registration failed");
        expect(response.errorCode).toBe(ErrorCode.AUTH_REGISTRATION_FAILED);
      });
    });
  });

  describe("AuthenticationFailedException", () => {
    describe("Success", () => {
      it("should create exception with unified authentication failed message", () => {
        const exception = new AuthenticationFailedException();

        expect(exception.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
        expect(exception.getErrorCode()).toBe(ErrorCode.AUTH_AUTHENTICATION_FAILED);

        const response = exception.getResponse() as Record<string, unknown>;

        expect(response.message).toBe("Authentication failed");
        expect(response.errorCode).toBe(ErrorCode.AUTH_AUTHENTICATION_FAILED);
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
