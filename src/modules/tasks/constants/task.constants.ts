/**
 * Task Module Constants
 *
 * Central location for all task-specific strings, messages, and configuration.
 * This file contains constants that are specific to the tasks feature module.
 * For generic/shared constants, see src/config/ and src/common/constants/
 */

// ============================================================================
// API Configuration
// ============================================================================

/**
 * Swagger API tag for task endpoints
 */
export const TASK_API_TAG = "tasks";

/**
 * Controller path for task routes
 */
export const TASK_CONTROLLER_PATH = "tasks";

// ============================================================================
// Task Validation Messages
// ============================================================================

/**
 * Task-specific validation error messages
 * Used in DTO validation decorators for consistent error responses
 *
 * Note: For generic validation messages (required, mustBeString, etc.),
 * use ValidationMessages from @/common/constants
 */
export const TASK_VALIDATION_MESSAGES = {
  // Title validation
  TITLE_REQUIRED: "Task title is required",
  TITLE_MIN_LENGTH: "Task title must be at least 3 characters",
  TITLE_MAX_LENGTH: "Task title cannot exceed 200 characters",
  TITLE_MUST_BE_STRING: "Task title must be a string",

  // Description validation
  DESCRIPTION_MAX_LENGTH: "Description cannot exceed 1000 characters",
  DESCRIPTION_MUST_BE_STRING: "Description must be a string",

  // Status validation
  STATUS_INVALID: "Status must be one of: TODO, IN_PROGRESS, COMPLETED, CANCELLED",
  STATUS_MUST_BE_ENUM: "Status must be a valid TaskStatus enum value",

  // Priority validation
  PRIORITY_INVALID: "Priority must be one of: LOW, MEDIUM, HIGH",
  PRIORITY_MUST_BE_ENUM: "Priority must be a valid TaskPriority enum value",

  // ID validation
  ID_INVALID: "Task ID must be a valid CUID",
  ID_REQUIRED: "Task ID is required",

  // Query validation
  PAGE_MIN: "Page must be at least 1",
  LIMIT_MIN: "Limit must be at least 1",
  LIMIT_MAX: "Limit cannot exceed 100",
  SORT_ORDER_INVALID: "Sort order must be ASC or DESC",
  SORT_BY_INVALID: "Invalid sort field",

  // Filter validation
  FILTER_INVALID_DATE: "Invalid date format for filter",
  FILTER_INVALID_BOOLEAN: "Filter value must be a boolean",
} as const;

// ============================================================================
// Task Response Messages
// ============================================================================

/**
 * Task API response messages
 * Used in controllers for consistent success/error messaging
 */
export const TASK_MESSAGES = {
  // Success messages
  CREATED: "Task created successfully",
  UPDATED: "Task updated successfully",
  DELETED: "Task deleted successfully",
  SOFT_DELETED: "Task moved to trash successfully",
  RESTORED: "Task restored successfully",
  PURGED: "Task permanently deleted",
  RETRIEVED: "Task retrieved successfully",
  LIST_RETRIEVED: "Tasks retrieved successfully",
  STATS_RETRIEVED: "Task statistics retrieved successfully",

  // Error message templates
  NOT_FOUND: (id: string) => `Task not found: ${id}`,
  FORBIDDEN: (id?: string) =>
    id ? `You do not have permission to access task: ${id}` : "Access forbidden to this task",
  ALREADY_COMPLETED: (id: string) => `Task is already completed: ${id}`,
  INVALID_STATUS: (status: string) => `Invalid task status: ${status}`,
  INVALID_PRIORITY: (priority: string) => `Invalid task priority: ${priority}`,
} as const;

// ============================================================================
// Swagger Documentation Examples
// ============================================================================

/**
 * Example data for Swagger/OpenAPI documentation
 * Provides realistic examples for API endpoints
 */
export const TASK_SWAGGER_EXAMPLES = {
  // Request examples
  CREATE_REQUEST: {
    title: "Implement authentication",
    description: "Add JWT authentication to the API",
    priority: "HIGH",
    status: "TODO",
  },
  UPDATE_REQUEST: {
    status: "IN_PROGRESS",
    description: "Working on authentication implementation",
  },
  QUERY_REQUEST: {
    page: 1,
    limit: 10,
    status: "TODO",
    priority: "HIGH",
    sortBy: "createdAt",
    sortOrder: "DESC",
  },

  // Response examples
  SINGLE_TASK: {
    id: "cmixpvpir0001p9yp5xq8r7ks",
    title: "Implement authentication",
    description: "Add JWT authentication to the API",
    status: "IN_PROGRESS",
    priority: "HIGH",
    userId: "cmixpvpir0002p9yp5xq8r7kt",
    createdAt: "2025-12-14T10:30:00.000Z",
    updatedAt: "2025-12-14T11:45:00.000Z",
    deletedAt: null,
  },
  TASK_LIST: {
    data: [
      {
        id: "cmixpvpir0001p9yp5xq8r7ks",
        title: "Implement authentication",
        status: "IN_PROGRESS",
        priority: "HIGH",
      },
      {
        id: "cmixpvpir0003p9yp5xq8r7ku",
        title: "Write documentation",
        status: "TODO",
        priority: "MEDIUM",
      },
    ],
    pagination: {
      total: 25,
      page: 1,
      limit: 10,
      totalPages: 3,
    },
  },
  TASK_STATS: {
    total: 100,
    byStatus: {
      TODO: 45,
      IN_PROGRESS: 30,
      COMPLETED: 20,
      CANCELLED: 5,
    },
    byPriority: {
      LOW: 30,
      MEDIUM: 50,
      HIGH: 20,
    },
    completionRate: 0.2,
  },

  // Example IDs
  TASK_ID: "cmixpvpir0001p9yp5xq8r7ks",
  USER_ID: "cmixpvpir0002p9yp5xq8r7kt",
  INVALID_ID: "invalid-cuid-format",
} as const;

// ============================================================================
// Cache Configuration
// ============================================================================

/**
 * Task-specific cache key prefixes
 * Used with CacheKeys class from @/common/cache for consistent cache management
 *
 * @example
 * ```typescript
 * const cacheKey = CacheKeys.list(TASK_CACHE_PREFIX, filters);
 * // Result: "tasks:list:status=TODO"
 * ```
 */
export const TASK_CACHE_PREFIX = "tasks";

/**
 * Cache key patterns for different task operations
 */
export const TASK_CACHE_KEYS = {
  LIST: `${TASK_CACHE_PREFIX}:list`,
  ITEM: (id: string) => `${TASK_CACHE_PREFIX}:item:${id}`,
  STATS: `${TASK_CACHE_PREFIX}:stats`,
  USER_TASKS: (userId: string) => `${TASK_CACHE_PREFIX}:user:${userId}`,
  PATTERN_ALL: `${TASK_CACHE_PREFIX}:*`,
  PATTERN_LISTS: `${TASK_CACHE_PREFIX}:list*`,
} as const;

// ============================================================================
// Task Limits & Configuration
// ============================================================================

/**
 * Task-specific limits and configuration values
 */
export const TASK_LIMITS = {
  TITLE_MIN_LENGTH: 3,
  TITLE_MAX_LENGTH: 200,
  DESCRIPTION_MAX_LENGTH: 1000,
  MAX_TASKS_PER_USER: 1000,
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
} as const;

// ============================================================================
// Task Enums (Export for convenience)
// ============================================================================

/**
 * Task status values for validation
 */
export const TASK_STATUS_VALUES = ["TODO", "IN_PROGRESS", "COMPLETED", "CANCELLED"] as const;

/**
 * Task priority values for validation
 */
export const TASK_PRIORITY_VALUES = ["LOW", "MEDIUM", "HIGH"] as const;

/**
 * Valid sort fields for task queries
 */
export const TASK_SORT_FIELDS = ["createdAt", "updatedAt", "title", "status", "priority"] as const;

/**
 * Valid sort orders
 */
export const TASK_SORT_ORDERS = ["ASC", "DESC"] as const;
