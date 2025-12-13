import { HttpStatus } from "@nestjs/common";
import { ThrottlerException } from "../../../../src/common/exceptions/throttler.exception";

describe("ThrottlerException", () => {
  describe("constructor", () => {
    it("should create exception with default message", () => {
      const exception = new ThrottlerException();

      expect(exception).toBeDefined();
      expect(exception).toBeInstanceOf(ThrottlerException);
      expect(exception.getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS);
    });

    it("should have correct HTTP status code (429)", () => {
      const exception = new ThrottlerException();

      expect(exception.getStatus()).toBe(429);
      expect(exception.getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS);
    });

    it("should create exception with default message in response", () => {
      const exception = new ThrottlerException();
      const response = exception.getResponse() as {
        statusCode: number;
        message: string;
        error: string;
      };

      expect(response).toBeDefined();
      expect(response.statusCode).toBe(HttpStatus.TOO_MANY_REQUESTS);
      expect(response.message).toBe("Too many requests, please try again later");
      expect(response.error).toBe("Too Many Requests");
    });

    it("should create exception with custom message", () => {
      const customMessage = "Rate limit exceeded for this endpoint";
      const exception = new ThrottlerException(customMessage);
      const response = exception.getResponse() as {
        statusCode: number;
        message: string;
        error: string;
      };

      expect(response.message).toBe(customMessage);
      expect(response.statusCode).toBe(HttpStatus.TOO_MANY_REQUESTS);
      expect(response.error).toBe("Too Many Requests");
    });

    it("should override default message when custom message provided", () => {
      const exception1 = new ThrottlerException();
      const exception2 = new ThrottlerException("Custom limit message");

      const response1 = exception1.getResponse() as { message: string };
      const response2 = exception2.getResponse() as { message: string };

      expect(response1.message).toBe("Too many requests, please try again later");
      expect(response2.message).toBe("Custom limit message");
      expect(response1.message).not.toBe(response2.message);
    });

    it("should handle empty string as custom message", () => {
      const exception = new ThrottlerException("");
      const response = exception.getResponse() as { message: string };

      // Empty string is falsy, so it should use default message
      expect(response.message).toBe("Too many requests, please try again later");
    });

    it("should maintain error field as 'Too Many Requests'", () => {
      const exception1 = new ThrottlerException();
      const exception2 = new ThrottlerException("Custom message");

      const response1 = exception1.getResponse() as { error: string };
      const response2 = exception2.getResponse() as { error: string };

      expect(response1.error).toBe("Too Many Requests");
      expect(response2.error).toBe("Too Many Requests");
    });
  });

  describe("response structure", () => {
    it("should have all required response fields", () => {
      const exception = new ThrottlerException();
      const response = exception.getResponse() as Record<string, unknown>;

      expect(response).toHaveProperty("statusCode");
      expect(response).toHaveProperty("message");
      expect(response).toHaveProperty("error");
    });

    it("should have consistent response structure with custom message", () => {
      const exception = new ThrottlerException("API rate limit reached");
      const response = exception.getResponse() as Record<string, unknown>;

      expect(Object.keys(response)).toEqual(["statusCode", "message", "error"]);
      expect(Object.keys(response).length).toBe(3);
    });
  });

  describe("error handling scenarios", () => {
    it("should be throwable and catchable", () => {
      expect(() => {
        throw new ThrottlerException();
      }).toThrow(ThrottlerException);
    });

    it("should preserve stack trace", () => {
      const exception = new ThrottlerException();

      expect(exception.stack).toBeDefined();
      expect(typeof exception.stack).toBe("string");
    });

    it("should be instance of Error", () => {
      const exception = new ThrottlerException();

      expect(exception).toBeInstanceOf(Error);
    });

    it("should work in try-catch blocks", () => {
      let caughtException: ThrottlerException | null = null;

      try {
        throw new ThrottlerException("Test rate limit");
      } catch (error) {
        caughtException = error as ThrottlerException;
      }

      expect(caughtException).not.toBeNull();
      expect(caughtException).toBeInstanceOf(ThrottlerException);
      expect((caughtException?.getResponse() as { message: string }).message).toBe(
        "Test rate limit",
      );
    });
  });

  describe("use cases", () => {
    it("should be suitable for API rate limiting", () => {
      const exception = new ThrottlerException("API rate limit: 100 requests per minute");
      const response = exception.getResponse() as {
        statusCode: number;
        message: string;
      };

      expect(response.statusCode).toBe(429);
      expect(response.message).toContain("API rate limit");
    });

    it("should be suitable for IP-based rate limiting", () => {
      const exception = new ThrottlerException("Too many requests from this IP address");
      const response = exception.getResponse() as { message: string };

      expect(response.message).toContain("IP address");
    });

    it("should be suitable for endpoint-specific limits", () => {
      const exception = new ThrottlerException("Login attempt limit exceeded");
      const response = exception.getResponse() as { message: string };

      expect(response.message).toContain("Login attempt");
    });
  });
});
