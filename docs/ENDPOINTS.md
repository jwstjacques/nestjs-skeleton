# 🚀 NestJS API Skeleton - Core Endpoints

This document lists the core endpoints available in the NestJS API Skeleton. The Tasks module endpoints are documented separately as an example implementation.

## Server Status

- **Application**: `http://localhost:3000`
- **API Base URL**:
  - **v1 (default)**: `http://localhost:3000/api/v1`
  - **v2**: `http://localhost:3000/api/v2`
- **Swagger Documentation**: `http://localhost:3000/api/v1/docs`

> **💡 Tip**: For interactive API testing, visit the [Swagger UI](http://localhost:3000/api/v1/docs) where you can try all endpoints directly in your browser.

---

## 🔄 API Versioning

This API uses **URI versioning** to allow evolution while maintaining backward compatibility.

### Available Versions

#### Version 1 (v1) - Default

- **Base Path**: `/api/v1/*`
- **Status**: Stable
- **Features**: All core functionality including authentication, health checks, and basic CRUD operations
- **Use Cases**: Production applications, stable integrations

#### Version 2 (v2) - Enhanced

- **Base Path**: `/api/v2/*`
- **Status**: Stable
- **Features**: Enhanced endpoints with improved permission checks and additional functionality
- **Key Differences**:
  - More granular permission checks (ownership-based access control)
  - Additional query parameters and filtering options
  - Enhanced validation and error messages
- **Use Cases**: Applications requiring fine-grained access control

### How to Use Versioning

Simply include the version number in your request path:

```bash
# Version 1 (default)
curl http://localhost:3000/api/v1/tasks

# Version 2 (enhanced)
curl http://localhost:3000/api/v2/tasks/next-due-date
```

### Version Compatibility

- **v1**: All endpoints remain stable and unchanged
- **v2**: Adds new endpoints and enhances existing ones with additional security
- **Migration**: Applications can gradually migrate from v1 to v2 as needed
- **Deprecation**: v1 endpoints are not deprecated and will continue to be supported

> **Note**: Not all v1 endpoints have v2 equivalents. v2 currently focuses on enhanced task management endpoints. Check the specific module documentation for v2 availability.

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
