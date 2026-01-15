# Authentication Guide

## Overview

The API uses JWT (JSON Web Token) based authentication with access and refresh tokens.

---

## Token Types

### Access Token

- **Purpose**: API access
- **Expires**: 15 minutes
- **Location**: Authorization header

### Refresh Token

- **Purpose**: Generate new access token
- **Expires**: 7 days
- **Location**: Request body

---

## Endpoints

### POST /auth/register

Register a new user account.

**Request:**
\`\`\`bash
curl -X POST http://localhost:3000/api/v1/auth/register \\
-H "Content-Type: application/json" \\
-d '{
"email": "user@example.com",
"username": "username",
"password": "SecurePass123!",
"firstName": "John",
"lastName": "Doe"
}'
\`\`\`

**Response (201):**
\`\`\`json
{
"data": {
"accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
"refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
"user": {
"id": "cm4nk4kx30000v6jb0gx9zs8x",
"email": "user@example.com",
"username": "username",
"firstName": "John",
"lastName": "Doe",
"role": "USER",
"isActive": true,
"createdAt": "2025-11-28T10:30:00.000Z"
}
}
}
\`\`\`

**Password Requirements:**

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (@$!%\*?&)

### POST /auth/login

Login with username/email and password.

**Request:**
\`\`\`bash
curl -X POST http://localhost:3000/api/v1/auth/login \\
-H "Content-Type: application/json" \\
-d '{
"username": "username",
"password": "SecurePass123!"
}'
\`\`\`

**Response (200):**
Same as registration response.

### POST /auth/refresh

Refresh access token using refresh token.

**Request:**
\`\`\`bash
curl -X POST http://localhost:3000/api/v1/auth/refresh \\
-H "Content-Type: application/json" \\
-d '{
"refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}'
\`\`\`

**Response (200):**
\`\`\`json
{
"data": {
"accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
"refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
}
\`\`\`

---

## Using Tokens

### Authorization Header

Include access token in all protected endpoint requests:

\`\`\`bash
curl http://localhost:3000/api/v1/tasks \\
-H "Authorization: Bearer YOUR_ACCESS_TOKEN"
\`\`\`

### Token Expiration

When access token expires (15 minutes), you'll receive:

\`\`\`json
{
"statusCode": 401,
"message": "Unauthorized"
}
\`\`\`

Use the refresh token to get a new access token.

---

## User Roles

### USER (Default)

- Can create, read, update, delete own tasks
- Can view own statistics
- Cannot access other users' data

### ADMIN

- Can perform all USER actions
- Can view all tasks from all users
- Can access admin-only endpoints
- Can permanently delete tasks

---

## Role-Based Access Control (RBAC)

Certain endpoints require specific roles:

| Endpoint                      | Required Role           |
| ----------------------------- | ----------------------- |
| POST /tasks                   | Any authenticated user  |
| GET /tasks                    | USER (own), ADMIN (all) |
| GET /tasks/:id                | USER (own), ADMIN (all) |
| PATCH /tasks/:id              | USER (own), ADMIN (all) |
| DELETE /tasks/:id             | USER (own), ADMIN (all) |
| DELETE /tasks/admin/purge/:id | ADMIN only              |

---

## Security Best Practices

### For API Consumers

1. **Store tokens securely**
   - Use httpOnly cookies for web apps
   - Use secure storage for mobile apps
   - Never expose tokens in URLs

2. **Handle token refresh**
   - Implement automatic token refresh
   - Handle 401 errors gracefully
   - Clear tokens on logout

3. **Password management**
   - Never log or expose passwords
   - Use HTTPS in production
   - Implement password reset flow

### For Developers

1. **JWT Secrets**
   - Use strong, random secrets (min 32 characters)
   - Different secrets for access and refresh tokens
   - Rotate secrets periodically

2. **Token Expiration**
   - Short-lived access tokens (15 min)
   - Longer-lived refresh tokens (7 days)
   - Consider refresh token rotation

3. **Rate Limiting**
   - Limit login attempts
   - Prevent brute force attacks
   - Monitor suspicious activity

---

## Testing with Swagger

1. Navigate to [http://localhost:3000/api/v1/docs](http://localhost:3000/api/v1/docs)
2. Click "Authorize" button
3. Enter: `Bearer YOUR_ACCESS_TOKEN`
4. Click "Authorize"
5. All subsequent requests will include the token

---

## Error Responses

### 400 Bad Request

Invalid input data:
\`\`\`json
{
"statusCode": 400,
"message": ["password must contain uppercase, lowercase, number, and special character"],
"error": "Bad Request"
}
\`\`\`

### 401 Unauthorized

Missing or invalid token:
\`\`\`json
{
"statusCode": 401,
"message": "Unauthorized"
}
\`\`\`

### 403 Forbidden

Insufficient permissions:
\`\`\`json
{
"statusCode": 403,
"message": "Forbidden resource"
}
\`\`\`

### 409 Conflict

Duplicate username/email:
\`\`\`json
{
"statusCode": 409,
"message": "Email already registered",
"error": "Conflict"
}
\`\`\`

---

## JWT Token Structure

### Payload

\`\`\`json
{
"sub": "user-id",
"username": "username",
"email": "user@example.com",
"role": "USER",
"iat": 1701177600,
"exp": 1701178500
}
\`\`\`

### Verification

Tokens are signed with HS256 algorithm using JWT_SECRET.

---

## Token Refresh Flow

1. Client receives access + refresh tokens on login
2. Client stores both tokens securely
3. Client uses access token for API requests
4. When access token expires (401 response):
   - Client sends refresh token to `/auth/refresh`
   - Receives new access + refresh tokens
   - Retries original request with new access token
5. When refresh token expires:
   - Client must login again

---

## Logout

Logout is client-side:

1. Delete stored access token
2. Delete stored refresh token
3. Clear any cached user data

**Note**: Server-side token revocation requires a token blacklist (not implemented in this phase).

---

## Correlation ID with Authentication

Every authentication request includes a correlation ID for request tracing.

### Response Headers

All auth responses include `x-correlation-id` header:

\`\`\`bash
curl -v -X POST http://localhost:3000/api/v1/auth/login \\
-H "Content-Type: application/json" \\
-d '{"username": "user", "password": "pass"}'
\`\`\`

Response headers will include:

\`\`\`text
x-correlation-id: a1b2c3d4-e5f6-4789-90ab-cdef12345678
\`\`\`

### Custom Correlation ID

Clients can send custom correlation ID:

\`\`\`bash
curl -X POST http://localhost:3000/api/v1/auth/register \\
-H "Content-Type: application/json" \\
-H "x-correlation-id: my-custom-trace-id" \\
-d '{
"email": "user@example.com",
"username": "user",
"password": "SecurePass123!"
}'
\`\`\`

### Error Responses Include Correlation ID

\`\`\`json
{
"statusCode": 409,
"message": "Email already registered",
"error": "Conflict",
"correlationId": "a1b2c3d4-e5f6-4789-90ab-cdef12345678",
"timestamp": "2025-11-28T10:30:00.000Z",
"path": "/api/v1/auth/register"
}
\`\`\`

### Benefits for Auth Debugging

1. **Track Authentication Flow**: Follow registration/login through all logs
2. **Debug Failures**: Filter logs by correlation ID to see exactly what happened
3. **Performance Monitoring**: Measure auth operation duration per request
4. **Client-Side Reporting**: Users can provide correlation ID when reporting issues
5. **Security Monitoring**: Detect brute force attacks by analyzing correlation patterns

### Example Log Output

\`\`\`
2025-11-28 10:30:00 [a1b2c3d4] [AuthService] INFO: Login attempt for username: john
2025-11-28 10:30:00 [a1b2c3d4] [PrismaService] DEBUG: Query: SELECT \* FROM users WHERE username = 'john'
2025-11-28 10:30:01 [a1b2c3d4] [user-42] [AuthService] INFO: User logged in successfully: john (ID: 42)
2025-11-28 10:30:01 [a1b2c3d4] [user-42] [AuthService] DEBUG: Generating tokens for user: john
2025-11-28 10:30:01 [a1b2c3d4] [user-42] [RequestLogger] INFO: POST /api/v1/auth/login 200 150ms
\`\`\`

All logs for correlation ID `a1b2c3d4` can be found with:

\`\`\`bash
grep "a1b2c3d4" logs/application.log
\`\`\`
