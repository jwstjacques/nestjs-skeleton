/**
 * Standard HTTP response messages
 * Use these for consistent API responses
 */

/**
 * Standard HTTP success messages
 * Use these for consistent API responses
 */
export enum HttpSuccessMessage {
  CREATED = "Resource created successfully",
  UPDATED = "Resource updated successfully",
  DELETED = "Resource deleted successfully",
  RETRIEVED = "Resource retrieved successfully",
  OK = "Request processed successfully",
  ACCEPTED = "Request accepted for processing",
}

/**
 * Standard HTTP error messages
 * Generic messages for common error scenarios
 */
export enum HttpErrorMessage {
  NOT_FOUND = "Resource not found",
  FORBIDDEN = "Access forbidden",
  UNAUTHORIZED = "Authentication required",
  BAD_REQUEST = "Invalid request data",
  CONFLICT = "Resource already exists",
  INTERNAL_ERROR = "Internal server error",
  SERVICE_UNAVAILABLE = "Service temporarily unavailable",
  VALIDATION_ERROR = "Validation failed",
  RATE_LIMIT_EXCEEDED = "Too many requests, please try again later",
}

/**
 * Swagger documentation examples
 * Use these for consistent example data
 */
export const SWAGGER_EXAMPLES = {
  CUID: "cmixpvpir0001p9yp5xq8r7ks",
  TIMESTAMP: "2025-12-14T10:30:00.000Z",
  EMAIL: "user@example.com",
  USERNAME: "john.doe",
  UUID: "550e8400-e29b-41d4-a716-446655440000",
} as const;

/**
 * Message templates for dynamic content
 */
export class ResponseMessages {
  static created(resource: string): string {
    return `${resource} created successfully`;
  }

  static updated(resource: string): string {
    return `${resource} updated successfully`;
  }

  static deleted(resource: string): string {
    return `${resource} deleted successfully`;
  }

  static notFound(resource: string, id?: string): string {
    return id ? `${resource} not found: ${id}` : `${resource} not found`;
  }

  static forbidden(resource?: string): string {
    return resource ? `Access forbidden to ${resource}` : "Access forbidden";
  }
}
