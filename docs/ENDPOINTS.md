# 🚀 NestJS API Skeleton - Core Endpoints

This document lists the core endpoints available in the NestJS API Skeleton. The Tasks module endpoints are documented separately as an example implementation.

## Server Status

- **Application**: `http://localhost:3000`
- **API Base URL**: `http://localhost:3000/api/v1`
- **Swagger Documentation**: `http://localhost:3000/api/v1/docs`

> **💡 Tip**: For interactive API testing, visit the [Swagger UI](http://localhost:3000/api/v1/docs) where you can try all endpoints directly in your browser.

---

## 📍 Core Endpoints

### Health Check

**GET** `/api/v1/health`

Returns application health status including database connectivity.

```bash
curl http://localhost:3000/api/v1/health
```

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2025-12-09T08:22:07.000Z",
  "uptime": 123.45,
  "environment": "development",
  "database": {
    "status": "connected",
    "latency": "5ms"
  }
}
```

---

### Authentication Endpoints

#### Register

**POST** `/api/v1/auth/register`

Create a new user account.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "name": "John Doe"
}
```

**Response:**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "cm4nk4kx30000v6jb0gx9zs8x",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER"
  }
}
```

---

#### Login

**POST** `/api/v1/auth/login`

Authenticate and receive access tokens.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response:**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "cm4nk4kx30000v6jb0gx9zs8x",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER"
  }
}
```

---

#### Refresh Token

**POST** `/api/v1/auth/refresh`

Get a new access token using refresh token.

**Request Body:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

#### Get Current User

**GET** `/api/v1/auth/me`

Get the currently authenticated user's information.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response:**

```json
{
  "id": "cm4nk4kx30000v6jb0gx9zs8x",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "USER",
  "createdAt": "2025-12-09T08:22:07.000Z",
  "updatedAt": "2025-12-09T08:22:07.000Z"
}
```

---

### API Documentation

**GET** `/api/v1/docs`

Interactive Swagger/OpenAPI documentation with:

- Try-it-out functionality for all endpoints
- Request/response schemas
- Authentication testing
- Full API specification

---

## 📦 Example Module: Tasks

The skeleton includes a **Tasks module** as a reference implementation showing best practices for:

- CRUD operations with pagination
- Custom endpoints (statistics)
- DTO validation
- Swagger documentation
- Error handling
- Unit and E2E tests

**See**: [docs/examples/TASKS_ENDPOINTS.md](./examples/TASKS_ENDPOINTS.md) for the complete Tasks endpoint documentation.

---

## 🔧 Adding Your Own Endpoints

When you create custom modules, follow these patterns:

1. **Use versioned routing**: All endpoints under `/api/v1`
2. **Document with Swagger**: Add `@ApiTags()`, `@ApiOperation()`, `@ApiResponse()` decorators
3. **Validate input**: Use DTOs with `class-validator` decorators
4. **Handle errors**: Use custom exceptions that extend `ApplicationException`
5. **Add tests**: Both unit and E2E tests for each endpoint
6. **Update this doc**: Keep endpoint documentation up to date

See the [CUSTOMIZATION.md](./CUSTOMIZATION.md) guide for detailed instructions on creating your own modules.

---

## 📚 Related Documentation

- [API Examples](./API_EXAMPLES.md) - Request/response examples
- [Development Guide](./DEVELOPMENT.md) - Development workflow
- [Testing Guide](./TESTING.md) - Testing strategies
- [Customization Guide](./CUSTOMIZATION.md) - Creating your own modules
