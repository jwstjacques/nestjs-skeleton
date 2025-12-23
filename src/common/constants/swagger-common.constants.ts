/**
 * Common constants used across Swagger decorators
 * Provides consistent values for examples, error codes, and resource identifiers
 */

import { HttpStatus } from "@nestjs/common";
import * as http from "http";
import { ErrorCode } from "./error-codes.constants";

/**
 * Standard CUID example for API documentation
 * Used across all endpoints that accept CUID identifiers
 */
export const SWAGGER_CUID_EXAMPLE = "cm4abc123xyz456def789ghi";

/**
 * Get the standard HTTP error name for a given status code
 *
 * @param statusCode - HTTP status code (e.g., HttpStatus.BAD_REQUEST)
 * @returns HTTP error name (e.g., "Bad Request")
 *
 * @example
 * ```typescript
 * getHttpErrorName(HttpStatus.BAD_REQUEST)  // "Bad Request"
 * getHttpErrorName(HttpStatus.UNAUTHORIZED) // "Unauthorized"
 * getHttpErrorName(HttpStatus.CONFLICT)     // "Conflict"
 * ```
 */
export function getHttpErrorName(statusCode: HttpStatus): string {
  return http.STATUS_CODES[statusCode] || "Unknown Error";
}

/**
 * Generic error codes for common API responses
 * Use these as defaults when specific error codes aren't provided
 */
export enum SwaggerErrorCode {
  VALIDATION_FAILED = "VALIDATION_FAILED",
  AUTH_UNAUTHORIZED = "AUTH_UNAUTHORIZED",
  RATE_LIMIT_EXCEEDED = "SYSTEM_RATE_LIMIT_EXCEEDED",
  RESOURCE_FORBIDDEN = "RESOURCE_FORBIDDEN",
  RESOURCE_NOT_FOUND = "RESOURCE_NOT_FOUND",
}

/**
 * Generic error messages for common API responses
 */
export const SwaggerErrorMessage = {
  VALIDATION_FAILED: "Validation error",
  UNAUTHORIZED: "Unauthorized",
  RATE_LIMIT: "ThrottlerException: Too Many Requests",
  FORBIDDEN: "You do not have permission to access this resource",
  NOT_FOUND: "Resource not found",
} as const;

/**
 * Helper function to create standardized error response examples for Swagger documentation
 *
 * This reduces duplication by automatically providing common fields like timestamp,
 * correlationId, path, and the HTTP error name in a consistent format across all error examples.
 *
 * @param statusCode - HTTP status code (e.g., HttpStatus.BAD_REQUEST)
 * @param message - Error message (string or array of validation errors)
 * @param errorCode - Application-specific error code (from ErrorCode enum or string)
 * @param path - API endpoint path (e.g., "/api/v1/auth/login")
 * @param error - Optional HTTP error name (auto-derived from statusCode if not provided)
 * @returns Standardized error response object with timestamp, correlationId, and path
 *
 * @example
 * ```typescript
 * Error name auto-derived from status code
 *
 * const example = createSwaggerErrorExample(
 *   HttpStatus.UNAUTHORIZED,
 *   "Invalid credentials",
 *   ErrorCode.AUTH_INVALID_CREDENTIALS,
 *   "/api/v1/auth/login"
 * );
 *  Returns:
 *  {
 *    statusCode: 401,
 *    message: "Invalid credentials",
 *    error: "Unauthorized", // Auto-derived!
 *    errorCode: "AUTH_INVALID_CREDENTIALS",
 *    timestamp: "2025-12-22T17:09:34.298Z",
 *    path: "/api/v1/auth/login",
 *    correlationId: "cm4abc123xyz456def789ghi"
 *  }
 *
 * Or provide custom error name
 *
 * const custom = createSwaggerErrorExample(
 *   HttpStatus.BAD_REQUEST,
 *   ["Invalid input"],
 *   ErrorCode.VALIDATION_FAILED,
 *   "/api/v1/auth/register",
 *   "Custom Error Name"
 * );
 * ```
 */
export function createSwaggerErrorExample(
  statusCode: HttpStatus,
  message: string | string[],
  errorCode: ErrorCode | string,
  path: string,
  error?: string,
) {
  return {
    statusCode,
    message,
    error: error || getHttpErrorName(statusCode),
    errorCode,
    timestamp: new Date().toISOString(),
    path,
    correlationId: SWAGGER_CUID_EXAMPLE,
  };
}
