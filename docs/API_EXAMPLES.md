# API Examples# API Examples

This document provides request/response examples for the core endpoints in the NestJS API Skeleton.## Authentication

## Base URL> **Note**: Authentication will be added in Phase 9. For now, all endpoints are accessible without authentication

- **Development**: `http://localhost:3000/api/v1`## Base URL

- **Production**: `https://api.yourdomain.com/api/v1`

- Development: `http://localhost:3000/api/v1`

---- Production: `https://api.yourdomain.com/api/v1`

## Authentication Examples## Health Check

### Register a New User### GET /health

**POST** `/auth/register`Check if the API is running and database connectivity.

Create a new user account.**Request:**

**Request:**```bash

curl http://localhost:3000/health

`bash`

curl -X POST http://localhost:3000/api/v1/auth/register \

-H "Content-Type: application/json" \*\*Response:\*\*

-d '{

    "email": "john.doe@example.com",```json

    "password": "SecurePassword123!",{

    "name": "John Doe"  "status": "ok",

}' "timestamp": "2025-12-11T10:30:00.000Z",

````"uptime": 12345.67,

  "environment": "development",

**Response:** `201 Created`  "database": {

    "status": "connected",

```json    "latency": "5ms"

{  }

  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbTRuazRreDMwMDAwdjZqYjBneDl6czhiIiwiaWF0IjoxNzMzNzQ1NzI3LCJleHAiOjE3MzM3NDkzMjd9.signature",}

  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbTRuazRreDMwMDAwdjZqYjBneDl6czhiIiwiaWF0IjoxNzMzNzQ1NzI3LCJleHAiOjE3MzQ0MTA1Mjd9.signature",```

  "user": {

    "id": "cm4nk4kx30000v6jb0gx9zs8b",## Tasks

    "email": "john.doe@example.com",

    "name": "John Doe",### Create Task

    "role": "USER"

  }**POST** `/tasks`

}

```Create a new task.



**Validation Errors:****Request:**



```json```bash

{curl -X POST http://localhost:3000/api/v1/tasks \\

  "statusCode": 400,-H "Content-Type: application/json" \\

  "message": [-H "x-user-id: cmixpvpir0000p9ypdk6za4qc" \\

    "email must be a valid email",-d '{

    "password is too weak""title": "Complete project documentation",

  ],"description": "Write comprehensive docs for all endpoints",

  "error": "Bad Request""priority": "HIGH",

}"dueDate": "2025-12-31T23:59:59Z"

```}'

````

---

**Response (201):**

### Login

````json

**POST** `/auth/login`{

  "id": "cmixpvpir0001p9yp5xq8r7ks",

Authenticate an existing user.  "title": "Complete project documentation",

  "description": "Write comprehensive docs for all endpoints",

**Request:**  "status": "TODO",

  "priority": "HIGH",

```bash  "dueDate": "2025-12-31T23:59:59.000Z",

curl -X POST http://localhost:3000/api/v1/auth/login \  "completedAt": null,

  -H "Content-Type: application/json" \  "userId": "cmixpvpir0000p9ypdk6za4qc",

  -d '{  "createdAt": "2025-12-11T10:30:00.000Z",

    "email": "john.doe@example.com",  "updatedAt": "2025-12-11T10:30:00.000Z"

    "password": "SecurePassword123!"}

  }'```

````

### Get All Tasks

**Response:** `200 OK`

**GET** `/tasks`

````json

{Retrieve paginated tasks with optional filters.

  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",

  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",**Request:**

  "user": {

    "id": "cm4nk4kx30000v6jb0gx9zs8b",```bash

    "email": "john.doe@example.com",

    "name": "John Doe",# Basic pagination

    "role": "USER"

  }curl "http://localhost:3000/api/v1/tasks?page=1&limit=10"

}

```# Filter by status



**Error - Invalid Credentials:**curl "http://localhost:3000/api/v1/tasks?status=TODO"



```json# Filter by priority

{

  "statusCode": 401,curl "http://localhost:3000/api/v1/tasks?priority=HIGH"

  "message": "Invalid credentials",

  "error": "Unauthorized"# Search in title/description

}

```curl "http://localhost:3000/api/v1/tasks?search=documentation"



---# Combined filters with sorting



### Refresh Access Tokencurl "http://localhost:3000/api/v1/tasks?status=IN_PROGRESS&priority=HIGH&sortBy=DUE_DATE&sortOrder=ASC"

````

**POST** `/auth/refresh`

**Response (200):**

Get a new access token using the refresh token.

````json

**Request:**{

  "data": [

```bash    {

curl -X POST http://localhost:3000/api/v1/auth/refresh \      "id": "cmixpvpir0001p9yp5xq8r7ks",

  -H "Content-Type: application/json" \      "title": "Complete project documentation",

  -d '{      "description": "Write comprehensive docs",

    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."      "status": "IN_PROGRESS",

  }'      "priority": "HIGH",

```      "dueDate": "2025-12-31T23:59:59.000Z",

      "completedAt": null,

**Response:** `200 OK`      "userId": "cmixpvpir0000p9ypdk6za4qc",

      "createdAt": "2025-12-11T10:30:00.000Z",

```json      "updatedAt": "2025-12-11T11:00:00.000Z"

{    }

  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",  ],

  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."  "meta": {

}    "total": 42,

```    "page": 1,

    "limit": 10,

**Error - Invalid Token:**    "totalPages": 5,

    "hasNextPage": true,

```json    "hasPreviousPage": false

{  }

  "statusCode": 401,}

  "message": "Invalid or expired refresh token",```

  "error": "Unauthorized"

}### Get Task by ID

````

**GET** `/tasks/:id`

---

Retrieve a specific task.

### Get Current User

**Request:**

**GET** `/auth/me`

```bash

Retrieve the authenticated user's information.curl http://localhost:3000/api/v1/tasks/cmixpvpir0001p9yp5xq8r7ks

```

**Request:**

**Response (200):**

`````bash

curl http://localhost:3000/api/v1/auth/me \```json

  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."{

```  "id": "cmixpvpir0001p9yp5xq8r7ks",

  "title": "Complete project documentation",

**Response:** `200 OK`  "description": "Write comprehensive docs",

  "status": "IN_PROGRESS",

```json  "priority": "HIGH",

{  "dueDate": "2025-12-31T23:59:59.000Z",

  "id": "cm4nk4kx30000v6jb0gx9zs8b",  "completedAt": null,

  "email": "john.doe@example.com",  "userId": "cmixpvpir0000p9ypdk6za4qc",

  "name": "John Doe",  "createdAt": "2025-12-11T10:30:00.000Z",

  "role": "USER",  "updatedAt": "2025-12-11T11:00:00.000Z"

  "createdAt": "2025-12-09T08:22:07.000Z",}

  "updatedAt": "2025-12-09T08:22:07.000Z"```

}

```**Error Response (404):**



**Error - Unauthorized:**```json

{

```json  "statusCode": 404,

{  "message": "Task with ID 'cmixpvpir0001p9yp5xq8r7ks' not found",

  "statusCode": 401,  "error": "Not Found"

  "message": "Unauthorized",}

  "error": "Unauthorized"```

}

```### Update Task



---**PATCH** `/tasks/:id`



## Health Check ExampleUpdate an existing task.



**GET** `/health`**Request:**



Check application and database health.```bash

curl -X PATCH http://localhost:3000/api/v1/tasks/cmixpvpir0001p9yp5xq8r7ks \\

**Request:**-H "Content-Type: application/json" \\

-d '{

```bash"status": "COMPLETED",

curl http://localhost:3000/api/v1/health"description": "Documentation completed with examples",

```"completedAt": "2025-12-11T12:00:00Z"

}'

**Response:** `200 OK````



```json**Response (200):**

{

  "status": "ok",```json

  "timestamp": "2025-12-09T10:30:00.000Z",{

  "uptime": 12345.67,  "id": "cmixpvpir0001p9yp5xq8r7ks",

  "environment": "development",  "title": "Complete project documentation",

  "database": {  "description": "Documentation completed with examples",

    "status": "connected",  "status": "COMPLETED",

    "latency": "5ms"  "priority": "HIGH",

  }  "dueDate": "2025-12-31T23:59:59.000Z",

}  "completedAt": "2025-12-11T12:00:00.000Z",

```  "userId": "cmixpvpir0000p9ypdk6za4qc",

  "createdAt": "2025-12-11T10:30:00.000Z",

**Error - Database Down:**  "updatedAt": "2025-12-11T12:00:00.000Z"

}

```json```

{

  "status": "error",### Delete Task

  "timestamp": "2025-12-09T10:30:00.000Z",

  "uptime": 12345.67,**DELETE** `/tasks/:id`

  "environment": "development",

  "database": {Soft delete a task.

    "status": "disconnected",

    "error": "Connection refused"**Request:**

  }

}```bash

```curl -X DELETE http://localhost:3000/api/v1/tasks/cmixpvpir0001p9yp5xq8r7ks

`````

---

**Response (204):**

## Common Error ResponsesNo content returned

### 400 Bad Request### Get Statistics

Invalid input or validation failure.**GET** `/tasks/statistics`

````jsonGet aggregated task statistics.

{

  "statusCode": 400,**Request:**

  "message": [

    "field1 should not be empty",```bash

    "field2 must be a valid email"curl http://localhost:3000/api/v1/tasks/statistics

  ],```

  "error": "Bad Request"

}**Response (200):**

````

````json

### 401 Unauthorized{

  "totalTasks": 42,

Missing or invalid authentication token.  "byStatus": {

    "TODO": 10,

```json    "IN_PROGRESS": 15,

{    "COMPLETED": 17

  "statusCode": 401,  },

  "message": "Unauthorized",  "byPriority": {

  "error": "Unauthorized"    "LOW": 8,

}    "MEDIUM": 20,

```    "HIGH": 14

  }

### 403 Forbidden}

````

Insufficient permissions.

## Error Responses

````json

{### 400 Bad Request

  "statusCode": 403,

  "message": "Insufficient permissions",Invalid input data or validation failure.

  "error": "Forbidden"

}```json

```{

  "statusCode": 400,

### 404 Not Found  "message": [

    "title must be longer than or equal to 3 characters",

Resource not found.    "priority must be a valid enum value"

  ],

```json  "error": "Bad Request"

{}

  "statusCode": 404,```

  "message": "Resource not found",

  "error": "Not Found"### 404 Not Found

}

```Resource not found.



### 429 Too Many Requests```json

{

Rate limit exceeded.  "statusCode": 404,

  "message": "Task with ID 'cmixpvpir0001p9yp5xq8r7ks' not found",

```json  "error": "Not Found"

{}

  "statusCode": 429,```

  "message": "ThrottlerException: Too Many Requests",

  "error": "Too Many Requests"### 500 Internal Server Error

}

```Server error.



### 500 Internal Server Error```json

{

Unexpected server error.  "statusCode": 500,

  "message": "Internal server error",

```json  "error": "Internal Server Error"

{}

  "statusCode": 500,```

  "message": "Internal server error",
  "error": "Internal Server Error"
}
````

---

## Example Module: Tasks

For comprehensive examples of CRUD operations, pagination, filtering, and custom endpoints, see the **Tasks module** documentation:

- [Tasks API Examples](./examples/TASKS_API_EXAMPLES.md) - Complete request/response examples for all task operations

---

## Testing with Postman

Import the Postman collection for interactive testing:

1. Open Postman
2. Import `postman/api-collection.json`
3. Set the environment variable `baseUrl` to `http://localhost:3000/api/v1`
4. Use the "Auth" folder to register/login and get tokens
5. Tokens are automatically saved to collection variables

See [POSTMAN-TESTING-GUIDE.md](./POSTMAN-TESTING-GUIDE.md) for detailed instructions.

---

## Related Documentation

- [Endpoints Guide](./ENDPOINTS.md) - Complete endpoint reference
- [Development Guide](./DEVELOPMENT.md) - Development workflow
- [Testing Guide](./TESTING.md) - Testing strategies
- [Customization Guide](./CUSTOMIZATION.md) - Creating your own modules
