# Error Codes Reference

This document provides a comprehensive list of all error codes used in the API, enabling frontend translation and better error tracking.

---

## Error Response Format

All error responses follow a consistent structure:

```json
{
  "statusCode": 404,
  "message": "Task not found: clh9k7x2a0000qmxbzv0q0001",
  "error": "Not Found",
  "errorCode": "TASK_NOT_FOUND",
  "timestamp": "2025-12-13T10:30:00.000Z",
  "path": "/api/v1/tasks/clh9k7x2a0000qmxbzv0q0001",
  "correlationId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### Response Fields

| Field           | Type               | Description                                          |
| --------------- | ------------------ | ---------------------------------------------------- |
| `statusCode`    | number             | HTTP status code (e.g., 404, 401, 500)               |
| `message`       | string \| string[] | Human-readable error message or validation errors    |
| `error`         | string             | HTTP status text (e.g., "Not Found", "Unauthorized") |
| `errorCode`     | string             | Machine-readable error code for translation          |
| `timestamp`     | string             | ISO 8601 timestamp when the error occurred           |
| `path`          | string             | Request path that caused the error                   |
| `correlationId` | string             | Unique ID for tracing the request across logs        |
| `details`       | object             | (Optional) Additional error context                  |

---

## Error Code Categories

Error codes are organized by domain and follow the pattern: `{DOMAIN}_{TYPE}_{SPECIFIC}`

| Domain     | Code Range | Description                             |
| ---------- | ---------- | --------------------------------------- |
| AUTH       | 1000-1999  | Authentication and authorization errors |
| TASK       | 2000-2999  | Task-related errors                     |
| USER       | 3000-3999  | User management errors                  |
| VALIDATION | 4000-4999  | Input validation errors                 |
| SYSTEM     | 5000-5999  | System-level errors                     |
| RESOURCE   | 6000-6999  | Generic resource errors                 |

---

## Authentication Errors (AUTH\_\*)

| Error Code                 | HTTP Status | Default Message                               | When It Occurs                               |
| -------------------------- | ----------- | --------------------------------------------- | -------------------------------------------- |
| `AUTH_INVALID_CREDENTIALS` | 401         | Invalid email or password                     | Login with incorrect credentials             |
| `AUTH_TOKEN_EXPIRED`       | 401         | Authentication token has expired              | JWT token is expired                         |
| `AUTH_TOKEN_INVALID`       | 401         | Invalid authentication token                  | JWT token is malformed or invalid            |
| `AUTH_USER_NOT_FOUND`      | 401         | User account not found                        | User lookup fails during auth                |
| `AUTH_USER_INACTIVE`       | 401         | User account is inactive                      | User account is deactivated                  |
| `AUTH_REGISTRATION_FAILED` | 409         | Registration failed                           | Registration with existing email or username |
| `AUTH_WEAK_PASSWORD`       | 400         | Password does not meet security requirements  | Password fails validation rules              |
| `AUTH_UNAUTHORIZED`        | 401         | You are not authorized to perform this action | General unauthorized access                  |
| `AUTH_FORBIDDEN`           | 403         | Access to this resource is forbidden          | Insufficient permissions                     |

### Examples

**Invalid Credentials:**

```json
{
  "statusCode": 401,
  "message": "Invalid email or password",
  "error": "Unauthorized",
  "errorCode": "AUTH_INVALID_CREDENTIALS",
  "timestamp": "2025-12-13T10:30:00.000Z",
  "path": "/api/v1/auth/login",
  "correlationId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Registration Conflict:**

```json
{
  "statusCode": 409,
  "message": "Registration failed",
  "error": "Conflict",
  "errorCode": "AUTH_REGISTRATION_FAILED",
  "timestamp": "2025-12-13T10:30:00.000Z",
  "path": "/api/v1/auth/register",
  "correlationId": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

## Task Errors (TASK\_\*)

| Error Code               | HTTP Status | Default Message                                | When It Occurs                                |
| ------------------------ | ----------- | ---------------------------------------------- | --------------------------------------------- |
| `TASK_NOT_FOUND`         | 404         | Task not found                                 | Requested task doesn't exist                  |
| `TASK_FORBIDDEN`         | 403         | You do not have permission to access this task | User not owner and not admin                  |
| `TASK_INVALID_STATUS`    | 400         | Invalid task status                            | Status value not in allowed enum              |
| `TASK_INVALID_PRIORITY`  | 400         | Invalid task priority                          | Priority value not in allowed enum            |
| `TASK_INVALID_DUE_DATE`  | 400         | Invalid due date                               | Due date format is invalid                    |
| `TASK_ALREADY_COMPLETED` | 409         | Task is already completed                      | Attempting to complete already completed task |
| `TASK_CREATION_FAILED`   | 500         | Failed to create task                          | Database error during creation                |
| `TASK_UPDATE_FAILED`     | 500         | Failed to update task                          | Database error during update                  |
| `TASK_DELETE_FAILED`     | 500         | Failed to delete task                          | Database error during deletion                |

### Examples

**Task Not Found:**

```json
{
  "statusCode": 404,
  "message": "Task not found: clh9k7x2a0000qmxbzv0q0001",
  "error": "Not Found",
  "errorCode": "TASK_NOT_FOUND",
  "timestamp": "2025-12-13T10:30:00.000Z",
  "path": "/api/v1/tasks/clh9k7x2a0000qmxbzv0q0001",
  "correlationId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Task Forbidden:**

```json
{
  "statusCode": 403,
  "message": "You do not have permission to access task: clh9k7x2a0000qmxbzv0q0001",
  "error": "Forbidden",
  "errorCode": "TASK_FORBIDDEN",
  "timestamp": "2025-12-13T10:30:00.000Z",
  "path": "/api/v1/tasks/clh9k7x2a0000qmxbzv0q0001",
  "correlationId": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

## User Errors (USER\_\*)

| Error Code              | HTTP Status | Default Message       | When It Occurs                         |
| ----------------------- | ----------- | --------------------- | -------------------------------------- |
| `USER_NOT_FOUND`        | 404         | User not found        | Requested user doesn't exist           |
| `USER_ALREADY_EXISTS`   | 409         | User already exists   | User creation with existing identifier |
| `USER_INVALID_EMAIL`    | 400         | Invalid email address | Email format validation fails          |
| `USER_INVALID_USERNAME` | 400         | Invalid username      | Username format validation fails       |
| `USER_CREATION_FAILED`  | 500         | Failed to create user | Database error during creation         |
| `USER_UPDATE_FAILED`    | 500         | Failed to update user | Database error during update           |
| `USER_DELETE_FAILED`    | 500         | Failed to delete user | Database error during deletion         |

---

## Validation Errors (VALIDATION\_\*)

| Error Code                  | HTTP Status | Default Message                  | When It Occurs                        |
| --------------------------- | ----------- | -------------------------------- | ------------------------------------- |
| `VALIDATION_FAILED`         | 400         | Validation failed                | General validation error with details |
| `VALIDATION_INVALID_CUID`   | 400         | Invalid CUID format              | ID parameter is not a valid CUID      |
| `VALIDATION_INVALID_EMAIL`  | 400         | Invalid email format             | Email format is invalid               |
| `VALIDATION_INVALID_DATE`   | 400         | Invalid date format              | Date format is invalid                |
| `VALIDATION_MISSING_FIELD`  | 400         | Required field is missing        | Required field not provided           |
| `VALIDATION_INVALID_FORMAT` | 400         | Invalid data format              | Data format doesn't match schema      |
| `VALIDATION_OUT_OF_RANGE`   | 400         | Value is out of acceptable range | Numeric value exceeds limits          |

### Examples

**Invalid CUID:**

```json
{
  "statusCode": 400,
  "message": "Invalid CUID format: invalid-id",
  "error": "Bad Request",
  "errorCode": "VALIDATION_INVALID_CUID",
  "timestamp": "2025-12-13T10:30:00.000Z",
  "path": "/api/v1/tasks/invalid-id",
  "correlationId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Validation Failed (with details):**

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "errorCode": "VALIDATION_FAILED",
  "timestamp": "2025-12-13T10:30:00.000Z",
  "path": "/api/v1/tasks",
  "correlationId": "550e8400-e29b-41d4-a716-446655440000",
  "details": {
    "errors": {
      "title": ["title should not be empty"],
      "priority": ["priority must be one of: LOW, MEDIUM, HIGH, URGENT"]
    }
  }
}
```

---

## System Errors (SYSTEM\_\*)

| Error Code                   | HTTP Status | Default Message                             | When It Occurs                     |
| ---------------------------- | ----------- | ------------------------------------------- | ---------------------------------- |
| `SYSTEM_INTERNAL_ERROR`      | 500         | An internal server error occurred           | Unhandled server error             |
| `SYSTEM_DATABASE_ERROR`      | 500         | Database operation failed                   | Database connection or query error |
| `SYSTEM_RATE_LIMIT_EXCEEDED` | 429         | Rate limit exceeded. Please try again later | Too many requests from client      |
| `SYSTEM_SERVICE_UNAVAILABLE` | 503         | Service temporarily unavailable             | Service is down or overloaded      |
| `SYSTEM_TIMEOUT`             | 504         | Request timeout                             | Request took too long to process   |
| `SYSTEM_CONFIGURATION_ERROR` | 500         | System configuration error                  | Invalid system configuration       |

### Examples

**Rate Limit Exceeded:**

```json
{
  "statusCode": 429,
  "message": "Rate limit exceeded. Please try again later",
  "error": "Too Many Requests",
  "errorCode": "SYSTEM_RATE_LIMIT_EXCEEDED",
  "timestamp": "2025-12-13T10:30:00.000Z",
  "path": "/api/v1/tasks",
  "correlationId": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

## Resource Errors (RESOURCE\_\*)

| Error Code           | HTTP Status | Default Message              | When It Occurs               |
| -------------------- | ----------- | ---------------------------- | ---------------------------- |
| `RESOURCE_NOT_FOUND` | 404         | Requested resource not found | Generic resource not found   |
| `RESOURCE_CONFLICT`  | 409         | Resource conflict            | Generic resource conflict    |
| `RESOURCE_GONE`      | 410         | Resource no longer available | Resource permanently deleted |

---

## Frontend Integration

### React/TypeScript Example

```typescript
// types/api.ts
export interface ApiError {
  statusCode: number;
  message: string | string[];
  error: string;
  errorCode?: string;
  timestamp: string;
  path: string;
  correlationId: string;
  details?: unknown;
}

// i18n/en.json
{
  "errors": {
    "AUTH_INVALID_CREDENTIALS": "Invalid email or password",
    "AUTH_REGISTRATION_FAILED": "Registration failed",
    "TASK_NOT_FOUND": "The task you're looking for doesn't exist",
    "TASK_FORBIDDEN": "You don't have permission to access this task",
    "VALIDATION_INVALID_CUID": "Invalid ID format",
    "SYSTEM_RATE_LIMIT_EXCEEDED": "Too many requests. Please slow down."
  }
}

// i18n/es.json
{
  "errors": {
    "AUTH_INVALID_CREDENTIALS": "Correo electrónico o contraseña inválidos",
    "AUTH_REGISTRATION_FAILED": "El registro ha fallado",
    "TASK_NOT_FOUND": "La tarea que buscas no existe",
    "TASK_FORBIDDEN": "No tienes permiso para acceder a esta tarea",
    "VALIDATION_INVALID_CUID": "Formato de ID inválido",
    "SYSTEM_RATE_LIMIT_EXCEEDED": "Demasiadas solicitudes. Por favor, desacelere."
  }
}

// utils/errorHandler.ts
import { useTranslation } from 'react-i18next';
import { ApiError } from '../types/api';

export function useErrorMessage() {
  const { t } = useTranslation();

  return function getErrorMessage(error: ApiError): string {
    // Try to translate using error code
    if (error.errorCode) {
      const translationKey = `errors.${error.errorCode}`;
      const translated = t(translationKey);

      // If translation exists, use it; otherwise fall back to message
      if (translated !== translationKey) {
        return translated;
      }
    }

    // Fall back to server message
    return Array.isArray(error.message) ? error.message[0] : error.message;
  };
}

// Usage in component
function LoginForm() {
  const getErrorMessage = useErrorMessage();
  const [error, setError] = useState<ApiError | null>(null);

  const handleSubmit = async (data: LoginData) => {
    try {
      await login(data);
    } catch (err) {
      setError(err as ApiError);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      {error && (
        <Alert severity="error">
          {getErrorMessage(error)}
        </Alert>
      )}
    </form>
  );
}
```

### Axios Interceptor Example

```typescript
// api/axios.ts
import axios from "axios";
import { ApiError } from "../types/api";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const apiError: ApiError = error.response?.data;

    // Log error with correlation ID for support
    console.error("API Error:", {
      errorCode: apiError.errorCode,
      correlationId: apiError.correlationId,
      path: apiError.path,
    });

    // Handle specific error codes
    switch (apiError.errorCode) {
      case "AUTH_TOKEN_EXPIRED":
        // Redirect to login
        window.location.href = "/login";
        break;

      case "SYSTEM_RATE_LIMIT_EXCEEDED":
        // Show toast notification
        toast.error("Please slow down and try again");
        break;

      case "AUTH_USER_INACTIVE":
        // Redirect to account activation
        window.location.href = "/activate-account";
        break;
    }

    return Promise.reject(apiError);
  },
);

export default api;
```

---

## Monitoring and Analytics

### Error Code Tracking

Error codes enable better monitoring and analytics:

```typescript
// Example: DataDog/Sentry integration
import * as Sentry from "@sentry/node";

function logError(error: ApiError, context: RequestContext) {
  Sentry.captureException(new Error(error.message), {
    tags: {
      errorCode: error.errorCode,
      correlationId: error.correlationId,
      statusCode: error.statusCode,
    },
    extra: {
      path: error.path,
      userId: context.userId,
      details: error.details,
    },
  });
}
```

### Metrics Dashboard Queries

Track specific error rates:

```
# Rate of authentication failures
count(error_code == "AUTH_INVALID_CREDENTIALS") by hour

# Tasks not found (might indicate broken links)
count(error_code == "TASK_NOT_FOUND") by day

# Permission errors (might indicate UX issues)
count(error_code == "TASK_FORBIDDEN") by user_role
```

---

## Best Practices

### For Developers

1. **Always use error codes**: Every exception should have an associated error code
2. **Provide context**: Include relevant IDs (userId, taskId, etc.) in error messages
3. **Log correlation IDs**: Always include correlationId in logs for tracing
4. **Don't expose sensitive data**: Error messages should be safe to show users
5. **Be specific**: Use granular error codes (e.g., `AUTH_USER_NOT_FOUND` vs `AUTH_USER_INACTIVE`)

### For Frontend Teams

1. **Translate error codes**: Maintain translation files for all error codes
2. **Handle gracefully**: Show user-friendly messages based on error codes
3. **Log for support**: Always log correlationId for debugging
4. **Consider context**: Different error codes may need different UI treatments
5. **Provide actions**: Suggest next steps based on error code (e.g., "Try again" for rate limits)

### For Operations

1. **Monitor error rates**: Set up alerts for unusual spikes in specific error codes
2. **Track correlationIds**: Use them to trace issues across distributed systems
3. **Analyze patterns**: Look for patterns in error codes to identify systemic issues
4. **Document incidents**: Reference error codes and correlationIds in post-mortems

---

## Adding New Error Codes

When adding new error codes:

1. **Update the enum** in `src/common/constants/error-codes.constants.ts`
2. **Add default message** to `ErrorMessages` record
3. **Create exception class** (if needed) extending `ApplicationException`
4. **Update this documentation** with the new error code
5. **Add translations** to frontend i18n files
6. **Write tests** for the new exception

Example:

```typescript
// 1. Add to ErrorCode enum
export enum ErrorCode {
  // ... existing codes
  TASK_INVALID_ASSIGNEE = "TASK_INVALID_ASSIGNEE",
}

// 2. Add default message
export const ErrorMessages: Record<ErrorCode, string> = {
  // ... existing messages
  [ErrorCode.TASK_INVALID_ASSIGNEE]: "Invalid task assignee",
};

// 3. Create exception class
export class TaskInvalidAssigneeException extends ApplicationException {
  constructor(userId: string) {
    super(
      ErrorCode.TASK_INVALID_ASSIGNEE,
      `User ${userId} cannot be assigned to tasks`,
      HttpStatus.BAD_REQUEST,
    );
  }
}
```

---

## Support

If you encounter an error:

1. **Note the `correlationId`** from the error response
2. **Check this documentation** for the error code meaning
3. **Search logs** using the correlationId
4. **Contact support** with the correlationId if needed

The correlationId allows us to trace your request through all our systems and quickly identify the root cause.
