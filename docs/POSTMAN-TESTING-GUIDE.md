# Postman Testing Guide

> **Note**: This guide includes examples from the **Tasks module**, which serves as a reference implementation in the NestJS API Skeleton. The authentication and health check endpoints are core features, while the Tasks endpoints demonstrate best practices you can follow when building your own modules.

This guide walks you through testing the NestJS API using Postman.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Importing the Collection](#importing-the-collection)
- [Setting Up Environment](#setting-up-environment)
- [Authentication Workflow](#-authentication-workflow)
- [Running Tests](#running-tests)
- [Test Scenarios](#test-scenarios)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)
- [Error Codes Reference](#error-codes-reference)
- [Advanced Features](#advanced-features)
- [Summary](#summary)

---

## Prerequisites

### 1. Install Postman

Download and install Postman:

- **Desktop App**: [https://www.postman.com/downloads/](https://www.postman.com/downloads/) (Recommended)
- **Web Version**: [https://web.postman.com/](https://web.postman.com/)

### 2. Start Your Application

Ensure your NestJS application and database are running:

```bash
# Start Docker containers (PostgreSQL)
npm run docker:start

# Start the NestJS application
npm run start:dev
```

Verify the app is running at: [http://localhost:3000/api/v1/](http://localhost:3000/api/v1/)

---

## Importing the Collection

### Method 1: Import via File

1. Open Postman
2. Click **"Import"** button (top-left corner)
3. Select **"File"** tab
4. Click **"Choose Files"**
5. Navigate to `postman/api-collection.json`
6. Click **"Import"**

### Method 2: Drag and Drop

1. Open Postman
2. Drag `postman/api-collection.json` directly into the Postman window
3. Collection will be imported automatically

### Verify Import

After importing, you should see:

- Collection name: **"NestJS API Skeleton"**
- Four folders:
  - **Authentication** (3 endpoints: Register, Login, Refresh Token)
  - **Tasks (Example Module)** (6 endpoints - v1 API)
  - **Tasks v2 (Enhanced)** (2 endpoints - v2 API with permission checks)
  - **Health & Info** (1 endpoint)

> **Note**: The collection now includes both v1 and v2 API endpoints. v1 provides full CRUD operations, while v2 offers enhanced read operations with ownership-based access control.

---

## Setting Up Environment

### Option 1: Use Collection Variables (Quick Start)

The collection already has `baseUrl` and `baseUrlV2` variables configured. No additional setup needed!

- `baseUrl`: `http://localhost:3000/api/v1` (for v1 endpoints)
- `baseUrlV2`: `http://localhost:3000/api/v2` (for v2 endpoints)

### Option 2: Create an Environment (Recommended for Multiple Environments)

1. Click **"Environments"** icon (left sidebar)
2. Click **"+"** to create a new environment
3. Name it: `NestJS Local`
4. Add variables:

| Variable    | Initial Value                  | Current Value                  |
| ----------- | ------------------------------ | ------------------------------ |
| `baseUrl`   | `http://localhost:3000/api/v1` | `http://localhost:3000/api/v1` |
| `baseUrlV2` | `http://localhost:3000/api/v2` | `http://localhost:3000/api/v2` |
| `userId`    | `cmixpvpir0000p9ypdk6za4qc`    | `cmixpvpir0000p9ypdk6za4qc`    |
| `taskId`    | _(leave empty)_                | _(will be set during tests)_   |

5. Click **"Save"**
6. Select the environment from the dropdown (top-right)

---

## 🔐 Authentication Workflow

The API uses JWT-based authentication. All task endpoints require a valid access token.

### Quick Start: Register and Login

**Step 1: Register a New User**

1. Open the **Authentication** folder
2. Select **"Register"**
3. The request body is already populated with example data:
   ```json
   {
     "email": "john.doe@example.com",
     "username": "johndoe",
     "password": "SecurePass123!",
     "firstName": "John",
     "lastName": "Doe"
   }
   ```
4. Click **"Send"**
5. On success (201), you'll receive a response with user details

**Step 2: Login to Get Tokens**

1. Select **"Login"** from the Authentication folder
2. Use the credentials from registration:

   ```json
   {
     "username": "john.doe@example.com",
     "password": "SecurePass123!"
   }
   ```

   > **Note**: The field must be named `username` (not `identifier`), but you can provide either a username OR email address as the value. The backend accepts both.

   **Alternative - Use Seeded Demo Users:**

   If you've run the database seed script (`npm run db:seed`), you can use these pre-created accounts:

   ```json
   // Regular user - John Doe
   {
     "username": "johndoe",
     "password": "Password123!"
   }
   ```

   ```json
   // Regular user - Jane Smith
   {
     "username": "janesmith",
     "password": "Password123!"
   }
   ```

   ```json
   // Admin user
   {
     "username": "admin",
     "password": "Password123!"
   }
   ```

   You can also use their email addresses: `john.doe@example.com`, `jane.smith@example.com`, or `admin@example.com`

3. Click **"Send"**
4. On success (200), the response includes:
   - `accessToken` - Used for API requests (expires in 15 minutes)
   - `refreshToken` - Used to get new access tokens (expires in 7 days)

**🎯 Automatic Token Management**

The collection includes test scripts that automatically save tokens to environment variables:

```javascript
// Runs after successful login/refresh
if (pm.response.code === 200) {
  const jsonData = pm.response.json();
  pm.environment.set("accessToken", jsonData.data.accessToken);
  pm.environment.set("refreshToken", jsonData.data.refreshToken);
}
```

After logging in, tokens are saved as `{{accessToken}}` and `{{refreshToken}}` variables.

**Step 3: Test Authenticated Endpoints**

1. Navigate to the **Tasks** folder
2. All task requests automatically use the saved `{{accessToken}}`
3. Try **"Create Task"** - it will work because folder-level auth is configured
4. No need to manually add auth headers!

**Step 4: Refresh Expired Tokens**

When your access token expires (after 15 minutes):

1. Select **"Refresh Token"** from the Authentication folder
2. The request automatically uses your saved `{{refreshToken}}`
3. Click **"Send"**
4. New tokens are automatically saved, replacing the old ones

### Authentication Error Scenarios

The collection includes examples for common auth errors:

**Register Errors:**

- `AUTH_EMAIL_EXISTS` (409) - Email already registered
- `AUTH_USERNAME_EXISTS` (409) - Username taken
- `VALIDATION_FAILED` (400) - Invalid email format or weak password

**Login Errors:**

- `AUTH_INVALID_CREDENTIALS` (401) - Wrong email/username or password

**Token Errors:**

- `AUTH_TOKEN_EXPIRED` (401) - Access token expired, use refresh endpoint
- `AUTH_TOKEN_INVALID` (401) - Token malformed or refresh token expired

### How Folder-Level Auth Works

The **Tasks** folder has Bearer authentication configured at the folder level:

```json
{
  "auth": {
    "type": "bearer",
    "bearer": [
      {
        "key": "token",
        "value": "{{accessToken}}",
        "type": "string"
      }
    ]
  }
}
```

This means:

- All requests inside the Tasks folder automatically include: `Authorization: Bearer {{accessToken}}`
- No need to configure auth on individual requests
- When you refresh tokens, all task requests use the new token automatically

---

## Running Tests

### Single Request Test

1. Select a request from the collection (e.g., "Get All Tasks")
2. Click **"Send"** button
3. View the response in the bottom panel

### Testing the Complete Workflow

Follow this sequence to test all CRUD operations. **Note:** You must authenticate first (see [Authentication Workflow](#-authentication-workflow) above) before testing task endpoints.

#### Step 1: Authenticate

1. **Register** a new user (Authentication → Register)
2. **Login** to get tokens (Authentication → Login)
3. Tokens are automatically saved to `{{accessToken}}` and `{{refreshToken}}`
4. All task requests will now work with the saved token

#### Step 2: Health Check

**Request:** `Health & Info → Health Check`

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "info": {
      "database": {
        "status": "up"
      }
    }
  }
}
```

---

#### Step 3: Create a Task

**Request:** `Tasks → Create Task`

**Body:**

```json
{
  "title": "Test Task from Postman",
  "description": "Testing CRUD operations",
  "priority": "HIGH",
  "status": "TODO"
}
```

**Expected Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "id": "cmiympu7x00002tsaknh5dqql",
    "title": "Test Task from Postman",
    "description": "Testing CRUD operations",
    "status": "TODO",
    "priority": "HIGH",
    "userId": "cmixpvpir0000p9ypdk6za4qc",
    "createdAt": "2025-12-09T10:30:00.000Z",
    "updatedAt": "2025-12-09T10:30:00.000Z",
    "deletedAt": null
  }
}
```

**Action:** Copy the `id` value (CUID) from the response.

---

#### Step 4: Get All Tasks

**Request:** `Tasks → Get All Tasks`

**Expected Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "cmiympu7x00002tsaknh5dqql",
      "title": "Test Task from Postman"
      // ... other fields
    }
    // ... more tasks
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 12,
    "totalPages": 2
  }
}
```

**Verify:** Your newly created task appears in the list.

---

#### Step 5: Get Task by ID

**Request:** `Tasks → Get Task by ID`

**Setup:**

1. Click on the request
2. Click on **"Params"** tab
3. In the URL, replace `:id` with the CUID you copied in Step 3
   - Example: `.../tasks/cmiympu7x00002tsaknh5dqql`

**Expected Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "cmiympu7x00002tsaknh5dqql",
    "title": "Test Task from Postman",
    "description": "Testing CRUD operations",
    "status": "TODO",
    "priority": "HIGH"
    // ... other fields
  }
}
```

---

#### Step 6: Update Task

**Request:** `Tasks → Update Task`

**Setup:**

1. Replace `:id` in URL with your task CUID
2. Update the request body:

```json
{
  "status": "IN_PROGRESS",
  "description": "Updated via Postman"
}
```

**Expected Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "cmiympu7x00002tsaknh5dqql",
    "status": "IN_PROGRESS",
    "description": "Updated via Postman",
    "updatedAt": "2025-12-09T10:35:00.000Z"
    // ... other fields
  }
}
```

**Verify:** `updatedAt` timestamp has changed.

---

#### Step 7: Get Task Statistics

**Request:** `Tasks → Get Task Statistics`

**Expected Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "total": 12,
    "byStatus": {
      "TODO": 5,
      "IN_PROGRESS": 4,
      "COMPLETED": 3
    },
    "byPriority": {
      "LOW": 3,
      "MEDIUM": 4,
      "HIGH": 5
    }
  }
}
```

---

#### Step 8: Delete Task

**Request:** `Tasks → Delete Task`

**Setup:**

1. Replace `:id` in URL with your task CUID

**Expected Response (204 No Content):**

- No response body
- Status code: `204`

**Verify:** Run "Get All Tasks" again - the deleted task should not appear in the list (soft delete sets `deletedAt`).

---

#### Step 9: Test v2 Enhanced Endpoints

The v2 API provides enhanced endpoints with ownership-based access control. You must be authenticated to use these endpoints.

**Request 1: Get Next Due Task**

1. Select **"Tasks v2 (Enhanced)"** → **"Get Next Due Task"**
2. This endpoint returns the task with the nearest upcoming due date (only active tasks: TODO or IN_PROGRESS)
3. Click **"Send"**

**Expected Response (200 OK):**

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

> **Note**: Returns `null` if you have no upcoming active tasks with due dates.

**Request 2: Get Task by ID (with Permission Check)**

1. Select **"Tasks v2 (Enhanced)"** → **"Get Task by ID (with Permission Check)"**
2. Replace `:id` in URL with your task CUID
3. Click **"Send"**

**Expected Response (200 OK) - If you own the task:**

```json
{
  "id": "cmiympu7x00002tsaknh5dqql",
  "title": "Test Task",
  "description": "Testing v2 endpoint",
  "status": "TODO",
  "priority": "HIGH",
  "userId": "cmixpvpir0000p9ypdk6za4qc",
  "createdAt": "2025-12-09T13:41:39.260Z",
  "updatedAt": "2025-12-09T13:41:39.260Z"
}
```

**Expected Response (403 Forbidden) - If you don't own the task:**

```json
{
  "statusCode": 403,
  "message": "You do not have permission to access this task",
  "error": "Forbidden"
}
```

**v2 vs v1 Differences:**

| Feature           | v1 (Tasks)          | v2 (Tasks v2)                         |
| ----------------- | ------------------- | ------------------------------------- |
| Get Task by ID    | ✅ Returns any task | ✅ Ownership check (403 if not owner) |
| Next Due Date     | ❌ Not available    | ✅ New endpoint                       |
| Permission Checks | ❌ No               | ✅ Owner or Admin only                |
| CRUD Operations   | ✅ Full CRUD        | 📖 Read-only                          |

> **Best Practice**: Use v1 for write operations (create, update, delete) and v2 for security-enhanced read operations.

---

## Test Scenarios

### Scenario 1: Pagination Testing

**Request:** `Tasks → Get All Tasks`

Test different pagination parameters:

```bash
# First page, 5 items
?page=1&limit=5

# Second page
?page=2&limit=5

# Large page size
?page=1&limit=50
```

**Steps:**

1. Click **"Params"** tab
2. Check the query parameters you want to enable
3. Modify their values
4. Click **"Send"**

---

### Scenario 2: Filtering Tasks

**Request:** `Tasks → Get All Tasks`

Filter by status and priority:

```bash
# Only TODO tasks
?status=TODO

# High priority tasks
?priority=HIGH

# Combine filters
?status=IN_PROGRESS&priority=HIGH
```

---

### Scenario 3: Searching Tasks

**Request:** `Tasks → Get All Tasks`

Search by title or description:

```bash
# Search for "project"
?search=project

# Search with pagination
?search=meeting&page=1&limit=10
```

---

### Scenario 4: Sorting Tasks

**Request:** `Tasks → Get All Tasks`

Sort by different fields:

```bash
# Newest first
?sortBy=createdAt&sortOrder=desc

# Oldest first
?sortBy=createdAt&sortOrder=asc

# By priority (descending)
?sortBy=priority&sortOrder=desc

# By status (ascending)
?sortBy=status&sortOrder=asc
```

---

### Scenario 5: Error Handling

Test validation and error responses with error codes for frontend translation:

**Test 1: Invalid CUID Format**

**Request:** `Tasks → Get Task by ID`

**URL:** `.../tasks/invalid-id`

**Expected Response (400 Bad Request):**

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

---

**Test 2: Task Not Found**

**Request:** `Tasks → Get Task by ID`

**URL:** `.../tasks/caaaaaaaaaaaaaaaaaaaaaaaaa` (valid format but doesn't exist)

**Expected Response (404 Not Found):**

```json
{
  "statusCode": 404,
  "message": "Task with ID 'caaaaaaaaaaaaaaaaaaaaaaaaa' not found",
  "error": "Not Found",
  "errorCode": "TASK_NOT_FOUND",
  "timestamp": "2025-12-13T10:30:00.000Z",
  "path": "/api/v1/tasks/caaaaaaaaaaaaaaaaaaaaaaaaa",
  "correlationId": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

**Test 3: Missing Required Fields**

**Request:** `Tasks → Create Task`

**Body:** (missing `title`)

```json
{
  "description": "Task without title",
  "priority": "LOW",
  "status": "TODO"
}
```

**Expected Response (400 Bad Request):**

```json
{
  "statusCode": 400,
  "message": ["title should not be empty", "title must be a string"],
  "error": "Bad Request",
  "errorCode": "VALIDATION_FAILED",
  "timestamp": "2025-12-13T10:30:00.000Z",
  "path": "/api/v1/tasks",
  "correlationId": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

## Troubleshooting

### Issue 1: "Could not get any response"

**Symptoms:** Postman shows connection error

**Solutions:**

1. Verify the application is running:
   ```bash
   curl http://localhost:3000/api/v1/health
   ```
2. Check Docker containers:
   ```bash
   docker ps
   ```
3. Restart the application:
   ```bash
   npm run start:dev
   ```

---

### Issue 2: "404 Not Found" on All Requests

**Symptoms:** All endpoints return 404

**Solutions:**

1. Verify you're using the correct base URL: `http://localhost:3000/api/v1`
2. Check the `API_PREFIX` in your `.env` file
3. Ensure the path includes `/api/v1` prefix

---

### Issue 3: "500 Internal Server Error"

**Symptoms:** Server error response

**Solutions:**

1. Check application logs in terminal
2. Verify database connection:
   ```bash
   npm run docker:start
   ```
3. Check Prisma schema is migrated:
   ```bash
   npx prisma migrate dev
   ```

---

### Issue 4: CUID Validation Errors

**Symptoms:** "Validation failed (CUID is expected)"

**Solutions:**

1. Ensure CUID format is correct: 25 characters starting with `c`
2. Example valid CUID: `cmiympu7x00002tsaknh5dqql`
3. Don't use UUIDs or other ID formats

---

### Issue 5: Empty Response Body

**Symptoms:** Status 204 but expected data

**Solution:** This is correct for DELETE operations. Status `204 No Content` means success with no response body.

---

## Best Practices

### 1. Use Environment Variables

Store dynamic values in environment variables:

- `{{baseUrl}}` - Base API URL
- `{{taskId}}` - Current task ID for testing
- `{{userId}}` - Test user ID

### 2. Save Response Data

Use Postman's **Tests** tab to automatically save response data:

```javascript
// Save task ID from response
if (pm.response.code === 201) {
  const response = pm.response.json();
  pm.environment.set("taskId", response.data.id);
}
```

### 3. Create Test Scripts

Add assertions in the **Tests** tab:

```javascript
// Verify status code
pm.test("Status code is 200", function () {
  pm.response.to.have.status(200);
});

// Verify response structure
pm.test("Response has success field", function () {
  const jsonData = pm.response.json();
  pm.expect(jsonData).to.have.property("success");
  pm.expect(jsonData.success).to.be.true;
});
```

### 4. Use Collection Runner

Run all requests in sequence:

1. Click **"..."** next to collection name
2. Select **"Run collection"**
3. Choose which requests to run
4. Click **"Run NestJS Task API"**

---

## Error Codes Reference

All error responses now include an `errorCode` field for consistent error handling and frontend translation:

### Common Error Codes

| Error Code                   | HTTP Status | Description                  |
| ---------------------------- | ----------- | ---------------------------- |
| `VALIDATION_FAILED`          | 400         | Request validation failed    |
| `VALIDATION_INVALID_CUID`    | 400         | Invalid CUID format          |
| `TASK_NOT_FOUND`             | 404         | Task does not exist          |
| `TASK_FORBIDDEN`             | 403         | No permission to access task |
| `AUTH_INVALID_CREDENTIALS`   | 401         | Invalid login credentials    |
| `AUTH_TOKEN_EXPIRED`         | 401         | Authentication token expired |
| `AUTH_TOKEN_INVALID`         | 401         | Invalid authentication token |
| `AUTH_EMAIL_EXISTS`          | 409         | Email already registered     |
| `SYSTEM_RATE_LIMIT_EXCEEDED` | 429         | Too many requests            |

### Error Response Structure

All errors follow this structure:

```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "HTTP status text",
  "errorCode": "ERROR_CODE_CONSTANT",
  "timestamp": "2025-12-13T10:30:00.000Z",
  "path": "/api/v1/endpoint",
  "correlationId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### Using Error Codes in Tests

You can test for specific error codes in Postman:

```javascript
pm.test("Returns correct error code", function () {
  const jsonData = pm.response.json();
  pm.expect(jsonData.errorCode).to.eql("TASK_NOT_FOUND");
});

pm.test("Has correlation ID", function () {
  const jsonData = pm.response.json();
  pm.expect(jsonData.correlationId).to.exist;
});
```

For a complete list of error codes, see [ERROR_CODES.md](./ERROR_CODES.md)

---

## Advanced Features

### Pre-request Scripts

Automatically set headers or variables before each request:

```javascript
// Generate timestamp
pm.environment.set("timestamp", new Date().toISOString());

// Log request details
console.log(`Sending request to: ${pm.request.url}`);
```

### Collection-Level Tests

Add tests that run for all requests:

1. Click on collection name
2. Select **"Tests"** tab
3. Add common assertions:

```javascript
// All responses should return within 500ms
pm.test("Response time is less than 500ms", function () {
  pm.expect(pm.response.responseTime).to.be.below(500);
});

// All responses should be JSON
pm.test("Response is JSON", function () {
  pm.response.to.have.header("Content-Type");
  pm.expect(pm.response.headers.get("Content-Type")).to.include("application/json");
});
```

---

## Summary

You now have a complete guide to testing your NestJS Task API with Postman:

- ✅ Import the collection
- ✅ Set up environment variables
- ✅ Run individual requests
- ✅ Test complete CRUD workflows
- ✅ Handle errors and edge cases
- ✅ Use advanced Postman features

For more information, refer to:

- [API Endpoints Documentation](./ENDPOINTS.md)
- [CRUD Test Results](./CRUD-TEST-RESULTS.md)
- [Phase 4 Tutorial](../temp/tutorial/NESTJS-PHASE4.md)

---

**Happy Testing! 🚀**
