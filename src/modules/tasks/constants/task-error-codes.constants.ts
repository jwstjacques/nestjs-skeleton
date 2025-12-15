/**
 * Task-specific error codes.
 * These codes enable frontend translation and error tracking for task operations.
 *
 * Format: TASK_{ERROR_TYPE}_{SPECIFIC_ERROR}
 */
export enum TaskErrorCode {
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
}

/**
 * Human-readable error messages for task error codes.
 */
export const TaskErrorMessages: Record<TaskErrorCode, string> = {
  [TaskErrorCode.TASK_NOT_FOUND]: "Task not found",
  [TaskErrorCode.TASK_FORBIDDEN]: "You do not have permission to access this task",
  [TaskErrorCode.TASK_INVALID_STATUS]: "Invalid task status",
  [TaskErrorCode.TASK_INVALID_PRIORITY]: "Invalid task priority",
  [TaskErrorCode.TASK_INVALID_DUE_DATE]: "Invalid due date",
  [TaskErrorCode.TASK_ALREADY_COMPLETED]: "Task is already completed",
  [TaskErrorCode.TASK_CREATION_FAILED]: "Failed to create task",
  [TaskErrorCode.TASK_UPDATE_FAILED]: "Failed to update task",
  [TaskErrorCode.TASK_DELETE_FAILED]: "Failed to delete task",
};
