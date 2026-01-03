import { HttpStatus } from "@nestjs/common";
import { ApplicationException } from "../../../../src/common/exceptions/application.exception";
import { ErrorCode } from "../../../../src/common/constants/error-codes.constants";

describe("ApplicationException", () => {
  describe("constructor", () => {
    describe("Success", () => {
      it("should create exception with error code and default message", () => {
        const exception = new ApplicationException(
          ErrorCode.AUTH_INVALID_CREDENTIALS,
          undefined,
          HttpStatus.UNAUTHORIZED,
        );

        expect(exception.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
        expect(exception.getErrorCode()).toBe(ErrorCode.AUTH_INVALID_CREDENTIALS);

        const response = exception.getResponse() as Record<string, unknown>;

        expect(response.message).toBe("Invalid email or password");
        expect(response.errorCode).toBe(ErrorCode.AUTH_INVALID_CREDENTIALS);
        expect(response.timestamp).toBeDefined();
        expect(typeof response.timestamp).toBe("string");
      });

      it("should create exception with custom message", () => {
        const customMessage = "Custom error message";
        const exception = new ApplicationException(
          ErrorCode.USER_NOT_FOUND,
          customMessage,
          HttpStatus.NOT_FOUND,
        );

        const response = exception.getResponse() as Record<string, unknown>;

        expect(response.message).toBe(customMessage);
        expect(response.errorCode).toBe(ErrorCode.USER_NOT_FOUND);
      });

      it("should create exception with custom HTTP status", () => {
        const exception = new ApplicationException(
          ErrorCode.SYSTEM_INTERNAL_ERROR,
          undefined,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );

        expect(exception.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(exception.getErrorCode()).toBe(ErrorCode.SYSTEM_INTERNAL_ERROR);
      });

      it("should default to 500 status when no status provided", () => {
        const exception = new ApplicationException(ErrorCode.AUTH_INVALID_CREDENTIALS);

        expect(exception.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      });

      it("should create exception with details object", () => {
        const details = {
          field: "password",
          requirements: ["min length 8", "must contain number"],
        };
        const exception = new ApplicationException(
          ErrorCode.AUTH_WEAK_PASSWORD,
          details,
          HttpStatus.BAD_REQUEST,
        );

        const response = exception.getResponse() as Record<string, unknown>;

        expect(response.message).toBe("Password does not meet security requirements");
        expect(response.details).toEqual(details);
      });
    });
  });

  describe("getErrorCode", () => {
    describe("Success", () => {
      it("should return the error code", () => {
        const exception = new ApplicationException(
          ErrorCode.AUTH_FORBIDDEN,
          undefined,
          HttpStatus.FORBIDDEN,
        );

        expect(exception.getErrorCode()).toBe(ErrorCode.AUTH_FORBIDDEN);
      });

      it("should return correct error code for different exceptions", () => {
        const authException = new ApplicationException(
          ErrorCode.AUTH_TOKEN_EXPIRED,
          undefined,
          HttpStatus.UNAUTHORIZED,
        );

        expect(authException.getErrorCode()).toBe(ErrorCode.AUTH_TOKEN_EXPIRED);

        const userException = new ApplicationException(
          ErrorCode.USER_NOT_FOUND,
          undefined,
          HttpStatus.NOT_FOUND,
        );

        expect(userException.getErrorCode()).toBe(ErrorCode.USER_NOT_FOUND);
      });
    });
  });

  describe("getResponse", () => {
    describe("Success", () => {
      it("should include timestamp in response", () => {
        const exception = new ApplicationException(
          ErrorCode.SYSTEM_INTERNAL_ERROR,
          undefined,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
        const response = exception.getResponse() as Record<string, unknown>;

        expect(response.timestamp).toBeDefined();
        expect(typeof response.timestamp).toBe("string");
        expect(new Date(response.timestamp as string).toString()).not.toBe("Invalid Date");
      });

      it("should not include details when not provided", () => {
        const exception = new ApplicationException(
          ErrorCode.USER_NOT_FOUND,
          undefined,
          HttpStatus.NOT_FOUND,
        );
        const response = exception.getResponse() as Record<string, unknown>;

        expect(response.details).toBeUndefined();
      });

      it("should include details when provided", () => {
        const details = { userId: "123", reason: "Account locked" };
        const exception = new ApplicationException(
          ErrorCode.AUTH_USER_INACTIVE,
          details,
          HttpStatus.UNAUTHORIZED,
        );
        const response = exception.getResponse() as Record<string, unknown>;

        expect(response.details).toEqual(details);
      });

      it("should preserve error code in response", () => {
        const exception = new ApplicationException(
          ErrorCode.VALIDATION_INVALID_EMAIL,
          undefined,
          HttpStatus.BAD_REQUEST,
        );
        const response = exception.getResponse() as Record<string, unknown>;

        expect(response.errorCode).toBe(ErrorCode.VALIDATION_INVALID_EMAIL);
      });
    });
  });

  describe("HTTP status codes", () => {
    describe("Success", () => {
      it("should use provided HTTP status code", () => {
        const exception = new ApplicationException(
          ErrorCode.AUTH_INVALID_CREDENTIALS,
          undefined,
          HttpStatus.UNAUTHORIZED,
        );

        expect(exception.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
      });

      it("should use default 500 when no status provided", () => {
        const exception = new ApplicationException(ErrorCode.AUTH_INVALID_CREDENTIALS);

        expect(exception.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      });

      it("should allow custom status override", () => {
        const exception = new ApplicationException(
          ErrorCode.USER_NOT_FOUND,
          "Custom message",
          HttpStatus.GONE,
        );

        expect(exception.getStatus()).toBe(HttpStatus.GONE);
      });
    });
  });
});
