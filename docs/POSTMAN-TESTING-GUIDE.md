# Postman Testing Guide

This guide walks you through testing the NestJS Task API using Postman.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Importing the Collection](#importing-the-collection)
- [Setting Up Environment](#setting-up-environment)
- [Running Tests](#running-tests)
- [Test Scenarios](#test-scenarios)
- [Troubleshooting](#troubleshooting)

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
5. Navigate to `docs/api-collection.json`
6. Click **"Import"**

### Method 2: Drag and Drop

1. Open Postman
2. Drag `docs/api-collection.json` directly into the Postman window
3. Collection will be imported automatically

### Verify Import

After importing, you should see:

- Collection name: **"NestJS Task API"**
- Two folders:
  - **Tasks** (6 endpoints)
  - **Health & Info** (3 endpoints)

---

## Setting Up Environment

### Option 1: Use Collection Variables (Quick Start)

The collection already has a `baseUrl` variable configured. No additional setup needed!

### Option 2: Create an Environment (Recommended for Multiple Environments)

1. Click **"Environments"** icon (left sidebar)
2. Click **"+"** to create a new environment
3. Name it: `NestJS Local`
4. Add variables:

| Variable  | Initial Value                  | Current Value                  |
| --------- | ------------------------------ | ------------------------------ |
| `baseUrl` | `http://localhost:3000/api/v1` | `http://localhost:3000/api/v1` |
| `userId`  | `cmixpvpir0000p9ypdk6za4qc`    | `cmixpvpir0000p9ypdk6za4qc`    |
| `taskId`  | _(leave empty)_                | _(will be set during tests)_   |

5. Click **"Save"**
6. Select the environment from the dropdown (top-right)

---

## Running Tests

### Single Request Test

1. Select a request from the collection (e.g., "Get All Tasks")
2. Click **"Send"** button
3. View the response in the bottom panel

### Testing the Complete Workflow

Follow this sequence to test all CRUD operations:

#### Step 1: Health Check

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

#### Step 2: Create a Task

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

#### Step 3: Get All Tasks

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

#### Step 4: Get Task by ID

**Request:** `Tasks → Get Task by ID`

**Setup:**

1. Click on the request
2. Click on **"Params"** tab
3. In the URL, replace `:id` with the CUID you copied in Step 2
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

#### Step 5: Update Task

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

#### Step 6: Get Task Statistics

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

#### Step 7: Delete Task

**Request:** `Tasks → Delete Task`

**Setup:**

1. Replace `:id` in URL with your task CUID

**Expected Response (204 No Content):**

- No response body
- Status code: `204`

**Verify:** Run "Get All Tasks" again - the deleted task should not appear in the list (soft delete sets `deletedAt`).

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

Test validation and error responses:

**Test 1: Invalid CUID Format**

**Request:** `Tasks → Get Task by ID`

**URL:** `.../tasks/invalid-id`

**Expected Response (400 Bad Request):**

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed (CUID is expected)",
  "timestamp": "2025-12-09T10:40:00.000Z",
  "path": "/api/v1/tasks/invalid-id"
}
```

---

**Test 2: Task Not Found**

**Request:** `Tasks → Get Task by ID`

**URL:** `.../tasks/caaaaaaaaaaaaaaaaaaaaaaaaa` (valid format but doesn't exist)

**Expected Response (404 Not Found):**

```json
{
  "success": false,
  "statusCode": 404,
  "message": "Task with ID caaaaaaaaaaaaaaaaaaaaaaaaa not found",
  "timestamp": "2025-12-09T10:41:00.000Z",
  "path": "/api/v1/tasks/caaaaaaaaaaaaaaaaaaaaaaaaa"
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
  "success": false,
  "statusCode": 400,
  "message": ["title should not be empty", "title must be a string"],
  "timestamp": "2025-12-09T10:42:00.000Z",
  "path": "/api/v1/tasks"
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
