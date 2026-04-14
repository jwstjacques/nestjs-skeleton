# Error Response Format

This document defines the standardized error response format used throughout the NestJS Task API.

## Overview

All errors in the application are handled by the `HttpExceptionFilter` which ensures a consistent error response format across all endpoints. This makes it easier for API consumers to handle errors predictably.

## Error Response Interface

All error responses follow this TypeScript interface:

```typescript
interface ErrorResponse {
  statusCode: number; // HTTP status code
  message: string | string[]; // Error message(s)
  error: string; // Error name/type
  errorCode?: string; // Optional application-specific error code
  timestamp: string; // ISO 8601 timestamp
  path: string; // Request path
  correlationId: string; // Unique request correlation ID
  details?: unknown; // Optional additional error details
}
```

## Field Descriptions

### Required Fields

- **`statusCode`** (number): The HTTP status code (400, 401, 403, 404, 500, etc.)
- **`message`** (string | string[]): Human-readable error message
  - Single string for most errors
  - Array of strings for validation errors (multiple field errors)
- **`error`** (string): The error type/name (e.g., "Bad Request", "Not Found", "Unauthorized")
- **`timestamp`** (string): ISO 8601 formatted timestamp when the error occurred
- **`path`** (string): The API endpoint path that was requested
- **`correlationId`** (string): Unique UUID for request tracing across logs

### Optional Fields

- **`errorCode`** (string): Application-specific error code for programmatic error handling
  - Examples: `TASK_NOT_FOUND`, `AUTH_REGISTRATION_FAILED`, `VALIDATION_FAILED`
  - See `src/common/constants/error-codes.constants.ts` for all codes
- **`details`** (unknown): Additional context-specific error information
  - Used for complex errors that need extra information
  - Not commonly included in responses

## Common Error Responses

### 400 Bad Request - Validation Error

**Single validation error:**

```json
{
  "statusCode": 400,
  "message": "title must be longer than or equal to 3 characters",
  "error": "Bad Request",
  "errorCode": "VALIDATION_FAILED",
  "timestamp": "2025-12-21T10:30:00.000Z",
  "path": "/api/v1/tasks",
  "correlationId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Multiple validation errors:**

```json
{
  "statusCode": 400,
  "message": [
    "title must be longer than or equal to 3 characters",
    "description must be a string",
    "dueDate must be a valid ISO 8601 date string"
  ],
  "error": "Bad Request",
  "errorCode": "VALIDATION_FAILED",
  "timestamp": "2025-12-21T10:30:00.000Z",
  "path": "/api/v1/tasks",
  "correlationId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### 401 Unauthorized

**Missing or invalid token:**

```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized",
  "timestamp": "2025-12-21T10:30:00.000Z",
  "path": "/api/v1/tasks",
  "correlationId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Invalid credentials:**

```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized",
  "errorCode": "AUTH_INVALID_CREDENTIALS",
  "timestamp": "2025-12-21T10:30:00.000Z",
  "path": "/api/v1/auth/login",
  "correlationId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### 403 Forbidden

**Insufficient permissions:**

```json
{
  "statusCode": 403,
  "message": "Insufficient permissions",
  "error": "Forbidden",
  "errorCode": "FORBIDDEN_RESOURCE",
  "timestamp": "2025-12-21T10:30:00.000Z",
  "path": "/api/v1/tasks/admin/purge/cmixpvpir0001p9yp5xq8r7ks",
  "correlationId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### 404 Not Found

**Resource not found:**

```json
{
  "statusCode": 404,
  "message": "Task with ID 'cmixpvpir0001p9yp5xq8r7ks' not found",
  "error": "Not Found",
  "errorCode": "TASK_NOT_FOUND",
  "timestamp": "2025-12-21T10:30:00.000Z",
  "path": "/api/v1/tasks/cmixpvpir0001p9yp5xq8r7ks",
  "correlationId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### 409 Conflict

**Registration conflict:**

```json
{
  "statusCode": 409,
  "message": "Registration failed",
  "error": "Conflict",
  "errorCode": "AUTH_REGISTRATION_FAILED",
  "timestamp": "2025-12-21T10:30:00.000Z",
  "path": "/api/v1/auth/register",
  "correlationId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### 429 Too Many Requests

**Rate limit exceeded:**

```json
{
  "statusCode": 429,
  "message": "Too Many Requests",
  "error": "Too Many Requests",
  "timestamp": "2025-12-21T10:30:00.000Z",
  "path": "/api/v1/tasks",
  "correlationId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### 500 Internal Server Error

**Unexpected server error:**

```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Internal Server Error",
  "errorCode": "SYSTEM_INTERNAL_ERROR",
  "timestamp": "2025-12-21T10:30:00.000Z",
  "path": "/api/v1/tasks",
  "correlationId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### 503 Service Unavailable

**Service dependency failure:**

```json
{
  "statusCode": 503,
  "message": "Service Unavailable",
  "error": "ServiceUnavailableException",
  "timestamp": "2025-12-21T10:30:00.000Z",
  "path": "/api/v1/health",
  "correlationId": "550e8400-e29b-41d4-a716-446655440000"
}
```

## Error Codes

The application defines specific error codes for programmatic error handling. These are found in `src/common/constants/error-codes.constants.ts`.

### Authentication Error Codes

- `AUTH_REGISTRATION_FAILED` - Registration failed (email or username conflict)
- `AUTH_INVALID_CREDENTIALS` - Invalid login credentials
- `AUTH_TOKEN_EXPIRED` - JWT token has expired
- `AUTH_TOKEN_INVALID` - JWT token is invalid

### Task Error Codes

- `TASK_NOT_FOUND` - Task does not exist
- `TASK_UPDATE_FAILED` - Failed to update task
- `TASK_DELETE_FAILED` - Failed to delete task

### System Error Codes

- `VALIDATION_FAILED` - Input validation failed
- `FORBIDDEN_RESOURCE` - Insufficient permissions
- `SYSTEM_INTERNAL_ERROR` - Internal server error
- `DATABASE_ERROR` - Database operation failed

## Client Error Handling

### TypeScript/JavaScript Example

```typescript
interface ErrorResponse {
  statusCode: number;
  message: string | string[];
  error: string;
  errorCode?: string;
  timestamp: string;
  path: string;
  correlationId: string;
  details?: unknown;
}

async function fetchTask(taskId: string) {
  try {
    const response = await fetch(`/api/v1/tasks/${taskId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error: ErrorResponse = await response.json();

      // Handle specific error codes
      switch (error.errorCode) {
        case "TASK_NOT_FOUND":
          console.error("Task not found");
          break;
        case "AUTH_TOKEN_EXPIRED":
          // Refresh token and retry
          break;
        case "VALIDATION_FAILED":
          // Show validation errors to user
          if (Array.isArray(error.message)) {
            error.message.forEach((msg) => console.error(msg));
          }
          break;
        default:
          console.error("Unknown error:", error.message);
      }

      // Log correlation ID for support requests
      console.log("Correlation ID:", error.correlationId);

      throw error;
    }

    return await response.json();
  } catch (error) {
    // Handle network errors
    console.error("Request failed:", error);
    throw error;
  }
}
```

### Python Example

```python
import requests
from typing import Union, List, Dict, Any

class ErrorResponse:
    def __init__(self, data: Dict[str, Any]):
        self.status_code: int = data['statusCode']
        self.message: Union[str, List[str]] = data['message']
        self.error: str = data['error']
        self.error_code: str = data.get('errorCode')
        self.timestamp: str = data['timestamp']
        self.path: str = data['path']
        self.correlation_id: str = data['correlationId']
        self.details: Any = data.get('details')

def fetch_task(task_id: str, token: str):
    try:
        response = requests.get(
            f'/api/v1/tasks/{task_id}',
            headers={'Authorization': f'Bearer {token}'}
        )

        if not response.ok:
            error = ErrorResponse(response.json())

            # Handle specific error codes
            if error.error_code == 'TASK_NOT_FOUND':
                print('Task not found')
            elif error.error_code == 'AUTH_TOKEN_EXPIRED':
                # Refresh token and retry
                pass
            elif error.error_code == 'VALIDATION_FAILED':
                # Show validation errors
                if isinstance(error.message, list):
                    for msg in error.message:
                        print(f'Validation error: {msg}')

            # Log correlation ID
            print(f'Correlation ID: {error.correlation_id}')

            raise Exception(error.message)

        return response.json()
    except requests.RequestException as e:
        print(f'Request failed: {e}')
        raise
```

## Best Practices

### For API Consumers

1. **Always check HTTP status codes** before parsing response bodies
2. **Handle array message formats** for validation errors
3. **Use error codes** for programmatic error handling instead of parsing message strings
4. **Log correlation IDs** when reporting issues to support
5. **Display user-friendly messages** based on error codes, not raw error messages
6. **Implement exponential backoff** for 429 (rate limit) errors
7. **Refresh tokens** on 401 errors with `AUTH_TOKEN_EXPIRED`

### For API Developers

1. **Use ApplicationException** for custom errors with error codes
2. **Always provide error codes** for business logic errors
3. **Keep messages user-friendly** and actionable
4. **Document all error codes** in `error-codes.constants.ts`
5. **Update Swagger examples** when adding new error responses
6. **Include details field** only when necessary for debugging
7. **Test error responses** in E2E tests to ensure consistency

## Swagger Documentation

All error responses are documented in controller decorators using:

```typescript
@ApiNotFoundResponse({
  description: "Task not found",
  schema: {
    example: {
      statusCode: 404,
      message: "Task with ID 'cmixpvpir0001p9yp5xq8r7ks' not found",
      error: "Not Found",
      errorCode: "TASK_NOT_FOUND",
      timestamp: "2025-12-21T10:30:00.000Z",
      path: "/api/v1/tasks/cmixpvpir0001p9yp5xq8r7ks",
      correlationId: "550e8400-e29b-41d4-a716-446655440000",
    },
  },
})
```

For multiple examples:

```typescript
@ApiBadRequestResponse({
  description: "Invalid input data or user already exists",
  schema: {
    examples: {
      validationError: {
        value: { /* error response */ }
      },
      emailExists: {
        value: { /* error response */ }
      }
    }
  }
})
```

## Correlation IDs

Every request is assigned a unique correlation ID that:

- Appears in all error responses
- Is logged with every log entry for that request
- Can be used to trace a request through all logs
- Should be provided when reporting issues

**Finding logs by correlation ID:**

```bash
# Search application logs
grep "550e8400-e29b-41d4-a716-446655440000" logs/application.log

# Search error logs
grep "550e8400-e29b-41d4-a716-446655440000" logs/error.log
```

## Testing Error Responses

When writing tests, verify error responses match the standard format:

```typescript
it("should return 404 error in correct format", async () => {
  const response = await request(app.getHttpServer()).get("/api/v1/tasks/invalid-id").expect(404);

  expect(response.body).toMatchObject({
    statusCode: 404,
    message: expect.any(String),
    error: "Not Found",
    errorCode: expect.any(String),
    timestamp: expect.any(String),
    path: expect.any(String),
    correlationId: expect.any(String),
  });

  // Verify correlation ID format (UUID)
  expect(response.body.correlationId).toMatch(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  );
});
```

## See Also

- [Error Codes](../src/common/constants/error-codes.constants.ts)
- [Http Exception Filter](../src/common/filters/http-exception.filter.ts)
- [Application Exception](../src/common/exceptions/application.exception.ts)
- [API Examples](./API_EXAMPLES.md)
- [Testing Guide](./TESTING-GUIDE.md)
