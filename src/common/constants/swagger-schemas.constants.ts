import { HttpStatus } from "@nestjs/common";

/**
 * Options for generating custom error schema examples
 */
export interface ErrorSchemaOptions {
  path: string;
  message?: string | string[];
  errorCode: string;
  statusCode: HttpStatus;
  error?: string;
}

/**
 * Reusable Swagger error schema factory functions
 * Provides consistent error response examples across all API endpoints
 *
 * @example
 * ```typescript
 * @ApiBadRequestResponse({
 *   description: "Validation failed",
 *   schema: SWAGGER_ERROR_SCHEMAS.validationFailed(
 *     "/api/v1/tasks",
 *     ["title must be longer than or equal to 3 characters"]
 *   ),
 * })
 * ```
 */
export const SWAGGER_ERROR_SCHEMAS = {
  /**
   * Generate validation error schema (400 Bad Request)
   */
  validationFailed: (path: string, messages: string[]) => ({
    example: {
      statusCode: HttpStatus.BAD_REQUEST,
      message: messages,
      error: "Bad Request",
      errorCode: "VALIDATION_FAILED",
      timestamp: new Date().toISOString(),
      path,
      correlationId: "550e8400-e29b-41d4-a716-446655440000",
    },
  }),

  /**
   * Generate not found error schema (404 Not Found)
   */
  notFound: (resourceName: string, path: string, errorCode: string) => ({
    example: {
      statusCode: HttpStatus.NOT_FOUND,
      message: `${resourceName} not found`,
      errorCode,
      timestamp: new Date().toISOString(),
      path,
      correlationId: "550e8400-e29b-41d4-a716-446655440000",
    },
  }),

  /**
   * Generate unauthorized error schema (401 Unauthorized)
   */
  unauthorized: (path: string) => ({
    example: {
      statusCode: HttpStatus.UNAUTHORIZED,
      message: "Unauthorized",
      errorCode: "AUTH_UNAUTHORIZED",
      timestamp: new Date().toISOString(),
      path,
      correlationId: "550e8400-e29b-41d4-a716-446655440000",
    },
  }),

  /**
   * Generate forbidden error schema (403 Forbidden)
   */
  forbidden: (path: string, message = "Forbidden resource") => ({
    example: {
      statusCode: HttpStatus.FORBIDDEN,
      message,
      errorCode: "AUTH_FORBIDDEN",
      timestamp: new Date().toISOString(),
      path,
      correlationId: "550e8400-e29b-41d4-a716-446655440000",
    },
  }),

  /**
   * Generate rate limit error schema (429 Too Many Requests)
   */
  rateLimitExceeded: (path: string) => ({
    example: {
      statusCode: HttpStatus.TOO_MANY_REQUESTS,
      message: "ThrottlerException: Too Many Requests",
      errorCode: "SYSTEM_RATE_LIMIT_EXCEEDED",
      timestamp: new Date().toISOString(),
      path,
      correlationId: "550e8400-e29b-41d4-a716-446655440000",
    },
  }),

  /**
   * Generate conflict error schema (409 Conflict)
   */
  conflict: (message: string, path: string, errorCode: string) => ({
    example: {
      statusCode: HttpStatus.CONFLICT,
      message,
      errorCode,
      timestamp: new Date().toISOString(),
      path,
      correlationId: "550e8400-e29b-41d4-a716-446655440000",
    },
  }),

  /**
   * Generic error schema builder for custom scenarios
   */
  custom: (options: ErrorSchemaOptions) => ({
    example: {
      statusCode: options.statusCode,
      message: options.message || "Error occurred",
      error: options.error,
      errorCode: options.errorCode,
      timestamp: new Date().toISOString(),
      path: options.path,
      correlationId: "550e8400-e29b-41d4-a716-446655440000",
    },
  }),
};
