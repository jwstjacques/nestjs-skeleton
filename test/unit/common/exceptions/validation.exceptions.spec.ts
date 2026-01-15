import { HttpStatus } from "@nestjs/common";
import {
  ValidationFailedException,
  InvalidCuidException,
  InvalidEmailException,
  InvalidDateException,
} from "../../../../src/common/exceptions/validation.exceptions";
import { ErrorCode } from "../../../../src/common/constants/error-codes.constants";

describe("Validation Exceptions", () => {
  describe("ValidationFailedException", () => {
    describe("Success", () => {
      it("should create exception with validation errors in details", () => {
        const validationErrors = {
          email: ["Invalid email format", "Email is required"],
          password: ["Password too short", "Password must contain a number"],
        };
        const exception = new ValidationFailedException(validationErrors);

        expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
        expect(exception.getErrorCode()).toBe(ErrorCode.VALIDATION_FAILED);

        const response = exception.getResponse() as Record<string, unknown>;

        expect(response.message).toBe("Validation failed");
        expect(response.errorCode).toBe(ErrorCode.VALIDATION_FAILED);
        expect(response.details).toEqual({ errors: validationErrors });
      });

      it("should create exception with single field validation error", () => {
        const validationErrors = {
          username: ["Username is required"],
        };
        const exception = new ValidationFailedException(validationErrors);

        const response = exception.getResponse() as Record<string, unknown>;

        expect(response.message).toBe("Validation failed");
        expect(response.errorCode).toBe(ErrorCode.VALIDATION_FAILED);
        expect(response.details).toEqual({ errors: validationErrors });
      });

      it("should create exception with multiple fields", () => {
        const validationErrors = {
          name: ["Name is required"],
          age: ["Age must be a number", "Age must be positive"],
          email: ["Invalid email format"],
        };
        const exception = new ValidationFailedException(validationErrors);

        const response = exception.getResponse() as Record<string, unknown>;

        expect(response.details).toEqual({ errors: validationErrors });
      });
    });
  });

  describe("InvalidCuidException", () => {
    describe("Success", () => {
      it("should create exception with invalid value in message", () => {
        const invalidValue = "invalid-cuid";
        const exception = new InvalidCuidException(invalidValue);

        expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
        expect(exception.getErrorCode()).toBe(ErrorCode.VALIDATION_INVALID_CUID);

        const response = exception.getResponse() as Record<string, unknown>;

        expect(response.message).toBe(`Invalid CUID format: ${invalidValue}`);
        expect(response.errorCode).toBe(ErrorCode.VALIDATION_INVALID_CUID);
      });

      it("should create exception with different invalid value", () => {
        const invalidValue = "123";
        const exception = new InvalidCuidException(invalidValue);

        const response = exception.getResponse() as Record<string, unknown>;

        expect(response.message).toBe(`Invalid CUID format: ${invalidValue}`);
        expect(response.errorCode).toBe(ErrorCode.VALIDATION_INVALID_CUID);
      });
    });
  });

  describe("InvalidEmailException", () => {
    describe("Success", () => {
      it("should create exception with invalid email in message", () => {
        const email = "invalid-email";
        const exception = new InvalidEmailException(email);

        expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
        expect(exception.getErrorCode()).toBe(ErrorCode.VALIDATION_INVALID_EMAIL);

        const response = exception.getResponse() as Record<string, unknown>;

        expect(response.message).toBe(`Invalid email format: ${email}`);
        expect(response.errorCode).toBe(ErrorCode.VALIDATION_INVALID_EMAIL);
      });

      it("should create exception with different invalid email", () => {
        const email = "@example.com";
        const exception = new InvalidEmailException(email);

        const response = exception.getResponse() as Record<string, unknown>;

        expect(response.message).toBe(`Invalid email format: ${email}`);
        expect(response.errorCode).toBe(ErrorCode.VALIDATION_INVALID_EMAIL);
      });
    });
  });

  describe("InvalidDateException", () => {
    describe("Success", () => {
      it("should create exception with field and date value in message", () => {
        const field = "dueDate";
        const dateValue = "2024-13-45";
        const exception = new InvalidDateException(field, dateValue);

        expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
        expect(exception.getErrorCode()).toBe(ErrorCode.VALIDATION_INVALID_DATE);

        const response = exception.getResponse() as Record<string, unknown>;

        expect(response.message).toBe(`Invalid date for ${field}: ${dateValue}`);
        expect(response.errorCode).toBe(ErrorCode.VALIDATION_INVALID_DATE);
      });

      it("should create exception with different field and date", () => {
        const field = "createdAt";
        const dateValue = "invalid-date";
        const exception = new InvalidDateException(field, dateValue);

        const response = exception.getResponse() as Record<string, unknown>;

        expect(response.message).toBe(`Invalid date for ${field}: ${dateValue}`);
        expect(response.errorCode).toBe(ErrorCode.VALIDATION_INVALID_DATE);
      });
    });
  });
});
