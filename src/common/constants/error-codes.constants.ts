/**
 * Centralized error codes for the application.
 * These codes enable frontend translation and error tracking.
 *
 * Format: {DOMAIN}_{ERROR_TYPE}_{SPECIFIC_ERROR}
 * - DOMAIN: AUTH, TASK, USER, VALIDATION, SYSTEM
 * - ERROR_TYPE: NOT_FOUND, INVALID, CONFLICT, FORBIDDEN, etc.
 */
export enum ErrorCode {
  // Authentication Errors (1000-1999)
  AUTH_INVALID_CREDENTIALS = "AUTH_INVALID_CREDENTIALS",
  AUTH_TOKEN_EXPIRED = "AUTH_TOKEN_EXPIRED",
  AUTH_TOKEN_INVALID = "AUTH_TOKEN_INVALID",
  AUTH_USER_NOT_FOUND = "AUTH_USER_NOT_FOUND",
  AUTH_USER_INACTIVE = "AUTH_USER_INACTIVE",
  AUTH_EMAIL_EXISTS = "AUTH_EMAIL_EXISTS",
  AUTH_USERNAME_EXISTS = "AUTH_USERNAME_EXISTS",
  AUTH_WEAK_PASSWORD = "AUTH_WEAK_PASSWORD",
  AUTH_UNAUTHORIZED = "AUTH_UNAUTHORIZED",
  AUTH_FORBIDDEN = "AUTH_FORBIDDEN",

  // Task Errors (2000-2999)
  TASK_NOT_FOUND = "TASK_NOT_FOUND",
  TASK_FORBIDDEN = "TASK_FORBIDDEN",
  TASK_INVALID_STATUS = "TASK_INVALID_STATUS",
  TASK_INVALID_PRIORITY = "TASK_INVALID_PRIORITY",
  TASK_INVALID_DUE_DATE = "TASK_INVALID_DUE_DATE",
  TASK_ALREADY_COMPLETED = "TASK_ALREADY_COMPLETED",
  TASK_CREATION_FAILED = "TASK_CREATION_FAILED",
  TASK_UPDATE_FAILED = "TASK_UPDATE_FAILED",
  TASK_DELETE_FAILED = "TASK_DELETE_FAILED",

  // User Errors (3000-3999)
  USER_NOT_FOUND = "USER_NOT_FOUND",
  USER_ALREADY_EXISTS = "USER_ALREADY_EXISTS",
  USER_INVALID_EMAIL = "USER_INVALID_EMAIL",
  USER_INVALID_USERNAME = "USER_INVALID_USERNAME",
  USER_CREATION_FAILED = "USER_CREATION_FAILED",
  USER_UPDATE_FAILED = "USER_UPDATE_FAILED",
  USER_DELETE_FAILED = "USER_DELETE_FAILED",

  // Validation Errors (4000-4999)
  VALIDATION_FAILED = "VALIDATION_FAILED",
  VALIDATION_INVALID_CUID = "VALIDATION_INVALID_CUID",
  VALIDATION_INVALID_EMAIL = "VALIDATION_INVALID_EMAIL",
  VALIDATION_INVALID_DATE = "VALIDATION_INVALID_DATE",
  VALIDATION_MISSING_FIELD = "VALIDATION_MISSING_FIELD",
  VALIDATION_INVALID_FORMAT = "VALIDATION_INVALID_FORMAT",
  VALIDATION_OUT_OF_RANGE = "VALIDATION_OUT_OF_RANGE",

  // System Errors (5000-5999)
  SYSTEM_INTERNAL_ERROR = "SYSTEM_INTERNAL_ERROR",
  SYSTEM_DATABASE_ERROR = "SYSTEM_DATABASE_ERROR",
  SYSTEM_RATE_LIMIT_EXCEEDED = "SYSTEM_RATE_LIMIT_EXCEEDED",
  SYSTEM_SERVICE_UNAVAILABLE = "SYSTEM_SERVICE_UNAVAILABLE",
  SYSTEM_TIMEOUT = "SYSTEM_TIMEOUT",
  SYSTEM_CONFIGURATION_ERROR = "SYSTEM_CONFIGURATION_ERROR",

  // Resource Errors (6000-6999)
  RESOURCE_NOT_FOUND = "RESOURCE_NOT_FOUND",
  RESOURCE_CONFLICT = "RESOURCE_CONFLICT",
  RESOURCE_GONE = "RESOURCE_GONE",
}

/**
 * Human-readable error messages for each error code.
 * These can be used as default messages when no custom message is provided.
 */
export const ErrorMessages: Record<ErrorCode, string> = {
  // Authentication
  [ErrorCode.AUTH_INVALID_CREDENTIALS]: "Invalid email or password",
  [ErrorCode.AUTH_TOKEN_EXPIRED]: "Authentication token has expired",
  [ErrorCode.AUTH_TOKEN_INVALID]: "Invalid authentication token",
  [ErrorCode.AUTH_USER_NOT_FOUND]: "User account not found",
  [ErrorCode.AUTH_USER_INACTIVE]: "User account is inactive",
  [ErrorCode.AUTH_EMAIL_EXISTS]: "Email address is already registered",
  [ErrorCode.AUTH_USERNAME_EXISTS]: "Username is already taken",
  [ErrorCode.AUTH_WEAK_PASSWORD]: "Password does not meet security requirements",
  [ErrorCode.AUTH_UNAUTHORIZED]: "You are not authorized to perform this action",
  [ErrorCode.AUTH_FORBIDDEN]: "Access to this resource is forbidden",

  // Tasks
  [ErrorCode.TASK_NOT_FOUND]: "Task not found",
  [ErrorCode.TASK_FORBIDDEN]: "You do not have permission to access this task",
  [ErrorCode.TASK_INVALID_STATUS]: "Invalid task status",
  [ErrorCode.TASK_INVALID_PRIORITY]: "Invalid task priority",
  [ErrorCode.TASK_INVALID_DUE_DATE]: "Invalid due date",
  [ErrorCode.TASK_ALREADY_COMPLETED]: "Task is already completed",
  [ErrorCode.TASK_CREATION_FAILED]: "Failed to create task",
  [ErrorCode.TASK_UPDATE_FAILED]: "Failed to update task",
  [ErrorCode.TASK_DELETE_FAILED]: "Failed to delete task",

  // Users
  [ErrorCode.USER_NOT_FOUND]: "User not found",
  [ErrorCode.USER_ALREADY_EXISTS]: "User already exists",
  [ErrorCode.USER_INVALID_EMAIL]: "Invalid email address",
  [ErrorCode.USER_INVALID_USERNAME]: "Invalid username",
  [ErrorCode.USER_CREATION_FAILED]: "Failed to create user",
  [ErrorCode.USER_UPDATE_FAILED]: "Failed to update user",
  [ErrorCode.USER_DELETE_FAILED]: "Failed to delete user",

  // Validation
  [ErrorCode.VALIDATION_FAILED]: "Validation failed",
  [ErrorCode.VALIDATION_INVALID_CUID]: "Invalid CUID format",
  [ErrorCode.VALIDATION_INVALID_EMAIL]: "Invalid email format",
  [ErrorCode.VALIDATION_INVALID_DATE]: "Invalid date format",
  [ErrorCode.VALIDATION_MISSING_FIELD]: "Required field is missing",
  [ErrorCode.VALIDATION_INVALID_FORMAT]: "Invalid data format",
  [ErrorCode.VALIDATION_OUT_OF_RANGE]: "Value is out of acceptable range",

  // System
  [ErrorCode.SYSTEM_INTERNAL_ERROR]: "An internal server error occurred",
  [ErrorCode.SYSTEM_DATABASE_ERROR]: "Database operation failed",
  [ErrorCode.SYSTEM_RATE_LIMIT_EXCEEDED]: "Rate limit exceeded. Please try again later",
  [ErrorCode.SYSTEM_SERVICE_UNAVAILABLE]: "Service temporarily unavailable",
  [ErrorCode.SYSTEM_TIMEOUT]: "Request timeout",
  [ErrorCode.SYSTEM_CONFIGURATION_ERROR]: "System configuration error",

  // Resources
  [ErrorCode.RESOURCE_NOT_FOUND]: "Requested resource not found",
  [ErrorCode.RESOURCE_CONFLICT]: "Resource conflict",
  [ErrorCode.RESOURCE_GONE]: "Resource no longer available",
};
