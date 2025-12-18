# Tasks Module - Complete Usage Guide

## Overview

This guide provides comprehensive examples for using the Tasks module API. The Tasks module demonstrates all best practices and serves as a reference implementation for building your own modules.

---

## Table of Contents

1. [Authentication](#authentication)
2. [Create Tasks](#create-tasks)
3. [List Tasks](#list-tasks)
4. [Get Single Task](#get-single-task)
5. [Update Tasks](#update-tasks)
6. [Delete Tasks](#delete-tasks)
7. [Filtering & Sorting](#filtering--sorting)
8. [Error Handling](#error-handling)
9. [Postman Examples](#postman-examples)
10. [cURL Examples](#curl-examples)

---

## Authentication

All tasks endpoints require JWT authentication. First, obtain a token by logging in:

```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "your-password"
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "cm1a2b3c4d5e6f7g8h9i0j1k",
      "email": "user@example.com",
      "username": "user"
    }
  }
}
```

Use the `accessToken` in the `Authorization` header for all subsequent requests:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Create Tasks

### Basic Task Creation

**Request**:

```bash
POST /api/v1/tasks
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "title": "Complete project documentation",
  "description": "Write comprehensive README and API docs",
  "priority": "HIGH",
  "status": "TODO"
}
```

**Response** (201 Created):

```json
{
  "success": true,
  "data": {
    "id": "cmixpvpir0001p9yp5xq8r7ks",
    "title": "Complete project documentation",
    "description": "Write comprehensive README and API docs",
    "priority": "HIGH",
    "status": "TODO",
    "userId": "cm1a2b3c4d5e6f7g8h9i0j1k",
    "dueDate": null,
    "completedAt": null,
    "createdAt": "2025-12-16T10:00:00.000Z",
    "updatedAt": "2025-12-16T10:00:00.000Z",
    "deletedAt": null
  },
  "message": "Task created successfully"
}
```

### Task with Due Date

```json
{
  "title": "Quarterly Report",
  "description": "Prepare Q4 financial summary",
  "priority": "HIGH",
  "status": "TODO",
  "dueDate": "2025-12-31T23:59:59.000Z"
}
```

### Minimal Task (Only Required Fields)

```json
{
  "title": "Quick task"
}
```

**Note**: Defaults to `status: "TODO"` and `priority: "MEDIUM"`.

---

## List Tasks

### Basic Listing (First Page)

**Request**:

```bash
GET /api/v1/tasks?page=1&limit=10
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response** (200 OK):

```json
{
  "success": true,
  "data": [
    {
      "id": "cmixpvpir0001p9yp5xq8r7ks",
      "title": "Complete project documentation",
      "description": "Write comprehensive README and API docs",
      "priority": "HIGH",
      "status": "TODO",
      "userId": "cm1a2b3c4d5e6f7g8h9i0j1k",
      "createdAt": "2025-12-16T10:00:00.000Z",
      "updatedAt": "2025-12-16T10:00:00.000Z",
      "deletedAt": null
    },
    {
      "id": "cmixpvpir0002p9yp5xq8r7kt",
      "title": "Review pull requests",
      "description": "Check team PRs",
      "priority": "MEDIUM",
      "status": "IN_PROGRESS",
      "userId": "cm1a2b3c4d5e6f7g8h9i0j1k",
      "createdAt": "2025-12-16T09:00:00.000Z",
      "updatedAt": "2025-12-16T09:30:00.000Z",
      "deletedAt": null
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 15,
    "totalPages": 2
  }
}
```

### Pagination Examples

**Get Second Page**:

```bash
GET /api/v1/tasks?page=2&limit=10
```

**Get More Items Per Page**:

```bash
GET /api/v1/tasks?page=1&limit=25
```

**Maximum Limit**: 100 items per page

---

## Get Single Task

**Request**:

```bash
GET /api/v1/tasks/cmixpvpir0001p9yp5xq8r7ks
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "id": "cmixpvpir0001p9yp5xq8r7ks",
    "title": "Complete project documentation",
    "description": "Write comprehensive README and API docs",
    "priority": "HIGH",
    "status": "TODO",
    "userId": "cm1a2b3c4d5e6f7g8h9i0j1k",
    "dueDate": null,
    "completedAt": null,
    "createdAt": "2025-12-16T10:00:00.000Z",
    "updatedAt": "2025-12-16T10:00:00.000Z",
    "deletedAt": null
  }
}
```

---

## Update Tasks

### Update Task Status

**Request**:

```bash
PATCH /api/v1/tasks/cmixpvpir0001p9yp5xq8r7ks
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "status": "IN_PROGRESS"
}
```

**Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "id": "cmixpvpir0001p9yp5xq8r7ks",
    "title": "Complete project documentation",
    "description": "Write comprehensive README and API docs",
    "priority": "HIGH",
    "status": "IN_PROGRESS",
    "userId": "cm1a2b3c4d5e6f7g8h9i0j1k",
    "dueDate": null,
    "completedAt": null,
    "createdAt": "2025-12-16T10:00:00.000Z",
    "updatedAt": "2025-12-16T11:00:00.000Z",
    "deletedAt": null
  },
  "message": "Task updated successfully"
}
```

### Mark Task as Completed

```json
{
  "status": "COMPLETED"
}
```

**Note**: Setting status to `COMPLETED` automatically sets `completedAt` timestamp.

### Update Multiple Fields

```json
{
  "title": "Updated title",
  "description": "Updated description",
  "priority": "LOW",
  "status": "IN_PROGRESS",
  "dueDate": "2025-12-25T23:59:59.000Z"
}
```

### Update Only Description

```json
{
  "description": "Added more details about the task requirements"
}
```

---

## Delete Tasks

### Soft Delete (Recommended)

**Request**:

```bash
DELETE /api/v1/tasks/cmixpvpir0001p9yp5xq8r7ks
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

**Note**: Task is marked as deleted (`deletedAt` timestamp set) but not removed from database. Can be recovered if needed.

### Permanent Delete (Purge)

**Request**:

```bash
DELETE /api/v1/tasks/cmixpvpir0001p9yp5xq8r7ks/purge
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Task permanently deleted"
}
```

**Warning**: Task is permanently removed from database. Cannot be recovered!

---

## Filtering & Sorting

### Filter by Status

**Get Only TODO Tasks**:

```bash
GET /api/v1/tasks?status=TODO&page=1&limit=10
```

**Get Only Completed Tasks**:

```bash
GET /api/v1/tasks?status=COMPLETED&page=1&limit=10
```

**Available Statuses**: `TODO`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`

### Filter by Priority

**Get Only High Priority Tasks**:

```bash
GET /api/v1/tasks?priority=HIGH&page=1&limit=10
```

**Available Priorities**: `LOW`, `MEDIUM`, `HIGH`

### Combined Filters

**Get High Priority TODO Tasks**:

```bash
GET /api/v1/tasks?status=TODO&priority=HIGH&page=1&limit=10
```

### Sorting

**Sort by Created Date (Newest First)**:

```bash
GET /api/v1/tasks?sortBy=createdAt&sortOrder=DESC
```

**Sort by Title (Alphabetical)**:

```bash
GET /api/v1/tasks?sortBy=title&sortOrder=ASC
```

**Sort by Priority**:

```bash
GET /api/v1/tasks?sortBy=priority&sortOrder=DESC
```

**Sort by Due Date**:

```bash
GET /api/v1/tasks?sortBy=dueDate&sortOrder=ASC
```

**Available Sort Fields**: `title`, `status`, `priority`, `createdAt`, `updatedAt`, `dueDate`

**Sort Orders**: `ASC` (ascending), `DESC` (descending)

### Complex Query Example

**Get High Priority In-Progress Tasks, Sorted by Due Date**:

```bash
GET /api/v1/tasks?status=IN_PROGRESS&priority=HIGH&sortBy=dueDate&sortOrder=ASC&page=1&limit=20
```

---

## Error Handling

### Task Not Found (404)

**Request**:

```bash
GET /api/v1/tasks/invalid-id-here
```

**Response** (404 Not Found):

```json
{
  "success": false,
  "statusCode": 404,
  "errorCode": "TASK_NOT_FOUND",
  "message": "Task not found: invalid-id-here",
  "error": "Not Found",
  "timestamp": "2025-12-16T10:30:00.000Z",
  "path": "/api/v1/tasks/invalid-id-here",
  "correlationId": "abc-123-def-456"
}
```

### Forbidden Access (403)

**Request**: Trying to access another user's task

**Response** (403 Forbidden):

```json
{
  "success": false,
  "statusCode": 403,
  "errorCode": "TASK_FORBIDDEN",
  "message": "You do not have permission to access task: cmixpvpir0001p9yp5xq8r7ks",
  "error": "Forbidden",
  "timestamp": "2025-12-16T10:30:00.000Z",
  "path": "/api/v1/tasks/cmixpvpir0001p9yp5xq8r7ks",
  "correlationId": "abc-123-def-456"
}
```

### Validation Error (400)

**Request**: Missing required field

```json
{
  "title": "ab" // Too short (min 3 characters)
}
```

**Response** (400 Bad Request):

```json
{
  "success": false,
  "statusCode": 400,
  "message": ["Title must be at least 3 characters"],
  "error": "Bad Request",
  "timestamp": "2025-12-16T10:30:00.000Z",
  "path": "/api/v1/tasks",
  "correlationId": "abc-123-def-456"
}
```

### Unauthorized (401)

**Request**: Missing or invalid JWT token

**Response** (401 Unauthorized):

```json
{
  "success": false,
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized",
  "timestamp": "2025-12-16T10:30:00.000Z",
  "path": "/api/v1/tasks",
  "correlationId": "abc-123-def-456"
}
```

---

## Postman Examples

### Import Collection

1. Open Postman
2. Import `postman/api-collection.json`
3. Set environment variable `{{baseUrl}}` to `http://localhost:3000`
4. Set environment variable `{{token}}` after logging in

### Pre-configured Requests

The Postman collection includes:

- ✅ Authentication (Login/Register)
- ✅ Create Task
- ✅ List Tasks (with filters)
- ✅ Get Single Task
- ✅ Update Task
- ✅ Delete Task
- ✅ Purge Task
- ✅ All error scenarios

### Tests Included

Each request includes automated tests to verify:

- Response status code
- Response structure
- Data validation
- Error handling

---

## cURL Examples

### Complete Workflow

#### 1. Register User

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@example.com",
    "username": "demouser",
    "password": "Demo123!@#",
    "firstName": "Demo",
    "lastName": "User"
  }'
```

#### 2. Login

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@example.com",
    "password": "Demo123!@#"
  }'
```

#### 3. Create Task

```bash
curl -X POST http://localhost:3000/api/v1/tasks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Task from cURL",
    "description": "Testing API with cURL",
    "priority": "HIGH",
    "status": "TODO"
  }'
```

#### 4. List Tasks

```bash
curl -X GET "http://localhost:3000/api/v1/tasks?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 5. Update Task

```bash
curl -X PATCH http://localhost:3000/api/v1/tasks/TASK_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "COMPLETED"
  }'
```

#### 6. Delete Task

```bash
curl -X DELETE http://localhost:3000/api/v1/tasks/TASK_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Quick Reference

### Status Values

| Status        | Description                |
| ------------- | -------------------------- |
| `TODO`        | Task not started (default) |
| `IN_PROGRESS` | Task is being worked on    |
| `COMPLETED`   | Task finished successfully |
| `CANCELLED`   | Task cancelled/abandoned   |

### Priority Values

| Priority | Description                |
| -------- | -------------------------- |
| `LOW`    | Low priority task          |
| `MEDIUM` | Normal priority (default)  |
| `HIGH`   | High priority, urgent task |

### Query Parameters

| Parameter   | Type   | Default     | Description                       |
| ----------- | ------ | ----------- | --------------------------------- |
| `page`      | number | 1           | Page number (min: 1)              |
| `limit`     | number | 10          | Items per page (min: 1, max: 100) |
| `status`    | enum   | -           | Filter by status                  |
| `priority`  | enum   | -           | Filter by priority                |
| `sortBy`    | string | `createdAt` | Field to sort by                  |
| `sortOrder` | enum   | `DESC`      | Sort direction (ASC/DESC)         |

---

## Common Use Cases

### 1. Get My Todo List

```bash
GET /api/v1/tasks?status=TODO&sortBy=priority&sortOrder=DESC
```

### 2. Get Today's High Priority Tasks

```bash
GET /api/v1/tasks?priority=HIGH&status=TODO&sortBy=createdAt&sortOrder=ASC
```

### 3. Get Recently Completed Tasks

```bash
GET /api/v1/tasks?status=COMPLETED&sortBy=completedAt&sortOrder=DESC&limit=5
```

### 4. Get Overdue Tasks

This requires custom filtering by `dueDate` (not yet implemented in the example module).

---

## Related Documentation

- [Tasks Module README](../../src/modules/tasks/README.md) - Module documentation
- [API Endpoints](../ENDPOINTS.md) - All API endpoints
- [Postman Testing Guide](../POSTMAN-TESTING-GUIDE.md) - Testing with Postman
- [Authentication Guide](../API_EXAMPLES.md#authentication) - Auth examples

---

## Support

For issues or questions:

1. Check the troubleshooting section
2. Review error responses
3. Check application logs: `tail -f logs/application.log`
4. Look for correlation ID in error responses for debugging

---

**Last Updated**: December 16, 2025
