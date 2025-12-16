# Tasks Module - API Examples

> **Note**: This document provides detailed API examples for the **Tasks module**, which serves as an example implementation in the NestJS API Skeleton. Use these as a reference when building your own modules.

## Base URL

- Development: `http://localhost:3000/api/v1`
- Production: `https://api.yourdomain.com/api/v1`

## Health Check

### GET /health

Check if the API is running and database connectivity.

**Request:**

```bash
curl http://localhost:3000/health
```

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2025-12-11T10:30:00.000Z",
  "uptime": 12345.67,
  "environment": "development",
  "database": {
    "status": "connected",
    "latency": "5ms"
  }
}
```

## Tasks

### Create Task

**POST** `/tasks`

Create a new task.

**Request:**

```bash
curl -X POST http://localhost:3000/api/v1/tasks \\
-H "Content-Type: application/json" \\
-H "x-user-id: cmixpvpir0000p9ypdk6za4qc" \\
-d '{
"title": "Complete project documentation",
"description": "Write comprehensive docs for all endpoints",
"priority": "HIGH",
"dueDate": "2025-12-31T23:59:59Z"
}'
```

**Response (201):**

```json
{
  "id": "cmixpvpir0001p9yp5xq8r7ks",
  "title": "Complete project documentation",
  "description": "Write comprehensive docs for all endpoints",
  "status": "TODO",
  "priority": "HIGH",
  "dueDate": "2025-12-31T23:59:59.000Z",
  "completedAt": null,
  "userId": "cmixpvpir0000p9ypdk6za4qc",
  "createdAt": "2025-12-11T10:30:00.000Z",
  "updatedAt": "2025-12-11T10:30:00.000Z"
}
```

### Get All Tasks

**GET** `/tasks`

Retrieve paginated tasks with optional filters.

**Request:**

```bash

# Basic pagination

curl "http://localhost:3000/api/v1/tasks?page=1&limit=10"

# Filter by status

curl "http://localhost:3000/api/v1/tasks?status=TODO"

# Filter by priority

curl "http://localhost:3000/api/v1/tasks?priority=HIGH"

# Search in title/description

curl "http://localhost:3000/api/v1/tasks?search=documentation"

# Combined filters with sorting

curl "http://localhost:3000/api/v1/tasks?status=IN_PROGRESS&priority=HIGH&sortBy=DUE_DATE&sortOrder=ASC"
```

**Response (200):**

```json
{
  "data": [
    {
      "id": "cmixpvpir0001p9yp5xq8r7ks",
      "title": "Complete project documentation",
      "description": "Write comprehensive docs",
      "status": "IN_PROGRESS",
      "priority": "HIGH",
      "dueDate": "2025-12-31T23:59:59.000Z",
      "completedAt": null,
      "userId": "cmixpvpir0000p9ypdk6za4qc",
      "createdAt": "2025-12-11T10:30:00.000Z",
      "updatedAt": "2025-12-11T11:00:00.000Z"
    }
  ],
  "meta": {
    "total": 42,
    "page": 1,
    "limit": 10,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

### Get Task by ID

**GET** `/tasks/:id`

Retrieve a specific task.

**Request:**

```bash
curl http://localhost:3000/api/v1/tasks/cmixpvpir0001p9yp5xq8r7ks
```

**Response (200):**

```json
{
  "id": "cmixpvpir0001p9yp5xq8r7ks",
  "title": "Complete project documentation",
  "description": "Write comprehensive docs",
  "status": "IN_PROGRESS",
  "priority": "HIGH",
  "dueDate": "2025-12-31T23:59:59.000Z",
  "completedAt": null,
  "userId": "cmixpvpir0000p9ypdk6za4qc",
  "createdAt": "2025-12-11T10:30:00.000Z",
  "updatedAt": "2025-12-11T11:00:00.000Z"
}
```

**Error Response (404):**

```json
{
  "statusCode": 404,
  "message": "Task with ID 'cmixpvpir0001p9yp5xq8r7ks' not found",
  "error": "Not Found"
}
```

### Update Task

**PATCH** `/tasks/:id`

Update an existing task.

**Request:**

```bash
curl -X PATCH http://localhost:3000/api/v1/tasks/cmixpvpir0001p9yp5xq8r7ks \\
-H "Content-Type: application/json" \\
-d '{
"status": "COMPLETED",
"description": "Documentation completed with examples",
"completedAt": "2025-12-11T12:00:00Z"
}'
```

**Response (200):**

```json
{
  "id": "cmixpvpir0001p9yp5xq8r7ks",
  "title": "Complete project documentation",
  "description": "Documentation completed with examples",
  "status": "COMPLETED",
  "priority": "HIGH",
  "dueDate": "2025-12-31T23:59:59.000Z",
  "completedAt": "2025-12-11T12:00:00.000Z",
  "userId": "cmixpvpir0000p9ypdk6za4qc",
  "createdAt": "2025-12-11T10:30:00.000Z",
  "updatedAt": "2025-12-11T12:00:00.000Z"
}
```

### Delete Task

**DELETE** `/tasks/:id`

Soft delete a task.

**Request:**

```bash
curl -X DELETE http://localhost:3000/api/v1/tasks/cmixpvpir0001p9yp5xq8r7ks
```

**Response (204):**
No content returned.

### Get Statistics

**GET** `/tasks/statistics`

Get aggregated task statistics.

**Request:**

```bash
curl http://localhost:3000/api/v1/tasks/statistics
```

**Response (200):**

```json
{
  "totalTasks": 42,
  "byStatus": {
    "TODO": 10,
    "IN_PROGRESS": 15,
    "COMPLETED": 17
  },
  "byPriority": {
    "LOW": 8,
    "MEDIUM": 20,
    "HIGH": 14
  }
}
```

## Error Responses

### 400 Bad Request

Invalid input data or validation failure.

```json
{
  "statusCode": 400,
  "message": [
    "title must be longer than or equal to 3 characters",
    "priority must be a valid enum value"
  ],
  "error": "Bad Request"
}
```

### 404 Not Found

Resource not found.

```json
{
  "statusCode": 404,
  "message": "Task with ID 'cmixpvpir0001p9yp5xq8r7ks' not found",
  "error": "Not Found"
}
```

### 500 Internal Server Error

Server error.

```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Internal Server Error"
}
```
