# Rate Limiting Guide

This project uses `@nestjs/throttler` for rate limiting with a custom guard that provides standardized error responses.

## Overview

Rate limiting protects your API from:

- **Brute force attacks** on authentication endpoints
- **DDoS attacks** from overwhelming traffic
- **API abuse** from misbehaving clients
- **Resource exhaustion** from expensive operations

## Architecture

```
Request → CustomThrottlerGuard → Controller
               ↓
        Check rate limit
               ↓
    ┌──────────┴──────────┐
    ↓                     ↓
Within limit         Over limit
    ↓                     ↓
Continue         ThrottlerException
                         ↓
               429 Too Many Requests
               {
                 errorCode: "SYSTEM_RATE_LIMIT_EXCEEDED",
                 message: "Too Many Requests",
                 statusCode: 429
               }
```

## Configuration

### Environment Variables

Configure each tier via environment variables:

```bash
# Short-term (for frequent endpoints)
THROTTLE_SHORT_TTL=1000        # 1 second window
THROTTLE_SHORT_LIMIT=10        # 10 requests per second

# Medium-term (for standard endpoints)
THROTTLE_MEDIUM_TTL=10000      # 10 second window
THROTTLE_MEDIUM_LIMIT=20       # 20 requests per 10 seconds

# Long-term (for resource-intensive endpoints)
THROTTLE_LONG_TTL=60000        # 1 minute window
THROTTLE_LONG_LIMIT=100        # 100 requests per minute

# Strict (for sensitive endpoints like login)
THROTTLE_STRICT_TTL=900000     # 15 minute window
THROTTLE_STRICT_LIMIT=5        # 5 requests per 15 minutes
```

### Default Values

If environment variables are not set, these defaults apply:

| Tier     | TTL        | Limit | Use Case                   |
| -------- | ---------- | ----- | -------------------------- |
| `short`  | 1 second   | 10    | High-frequency endpoints   |
| `medium` | 10 seconds | 20    | Standard CRUD operations   |
| `long`   | 1 minute   | 100   | Resource-intensive queries |
| `strict` | 15 minutes | 5     | Login, password reset      |

## Usage

### Basic Rate Limiting

Apply the `@Throttle()` decorator to endpoints:

```typescript
import { Throttle } from "@nestjs/throttler";

@Post()
@Throttle({ short: { ttl: 1000, limit: 10 } })
async create(@Body() createDto: CreateTaskDto) {
  return this.tasksService.create(createDto);
}
```

### Using Throttle Tiers

Define throttle limits as constants for consistency:

```typescript
const THROTTLE_LIMITS = {
  SHORT: { ttl: 1000, limit: 10 },
  MEDIUM: { ttl: 10000, limit: 50 },
  STRICT: { ttl: 900000, limit: 5 },
} as const;

@Post()
@Throttle({ short: THROTTLE_LIMITS.SHORT })
async create(@Body() dto: CreateTaskDto) {
  return this.tasksService.create(dto);
}

@Get()
@Throttle({ medium: THROTTLE_LIMITS.MEDIUM })
async findAll(@Query() query: QueryTaskDto) {
  return this.tasksService.findAll(query);
}
```

### Controller-Level Rate Limiting

Apply to all endpoints in a controller:

```typescript
@Controller("tasks")
@Throttle({ medium: { ttl: 10000, limit: 20 } })
export class TasksController {
  // All endpoints inherit this limit
}
```

### Skipping Rate Limiting

Skip throttling for specific endpoints:

```typescript
import { SkipThrottle } from "@nestjs/throttler";

@Get("health")
@SkipThrottle()
async healthCheck() {
  return { status: "ok" };
}
```

### Multiple Throttle Rules

Apply multiple rules to an endpoint:

```typescript
@Post("login")
@Throttle({
  short: { ttl: 1000, limit: 3 },    // 3 per second
  strict: { ttl: 900000, limit: 5 }, // 5 per 15 minutes
})
async login(@Body() loginDto: LoginDto) {
  return this.authService.login(loginDto);
}
```

## Custom Throttler Guard

The project uses a custom guard in [custom-throttler.guard.ts](../src/common/guards/custom-throttler.guard.ts):

```typescript
@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected throwThrottlingException(): Promise<void> {
    throw new ThrottlerException("Too Many Requests");
  }
}
```

This ensures rate limit errors follow the standard error response format:

```json
{
  "success": false,
  "error": {
    "statusCode": 429,
    "errorCode": "SYSTEM_RATE_LIMIT_EXCEEDED",
    "message": "Too Many Requests",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "path": "/api/v1/auth/login",
    "correlationId": "abc123-def456"
  }
}
```

## Error Response

When rate limited, clients receive:

```http
HTTP/1.1 429 Too Many Requests
Retry-After: 60
Content-Type: application/json

{
  "success": false,
  "error": {
    "statusCode": 429,
    "errorCode": "SYSTEM_RATE_LIMIT_EXCEEDED",
    "message": "Too Many Requests",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "path": "/api/v1/auth/login"
  }
}
```

## Recommended Limits by Endpoint Type

### Authentication Endpoints

```typescript
// Login - Strict to prevent brute force
@Post("login")
@Throttle({ strict: { ttl: 900000, limit: 5 } })  // 5 per 15 min
async login() {}

// Register - Medium to prevent spam
@Post("register")
@Throttle({ medium: { ttl: 60000, limit: 10 } })  // 10 per minute
async register() {}

// Refresh Token - More lenient
@Post("refresh")
@Throttle({ medium: { ttl: 10000, limit: 20 } })  // 20 per 10 sec
async refresh() {}
```

### CRUD Endpoints

```typescript
// Create - Moderate
@Post()
@Throttle({ short: { ttl: 1000, limit: 10 } })  // 10 per second
async create() {}

// Read - More lenient
@Get()
@Throttle({ medium: { ttl: 10000, limit: 50 } })  // 50 per 10 sec
async findAll() {}

// Update - Moderate
@Patch(":id")
@Throttle({ short: { ttl: 1000, limit: 10 } })  // 10 per second
async update() {}

// Delete - Moderate
@Delete(":id")
@Throttle({ short: { ttl: 1000, limit: 10 } })  // 10 per second
async remove() {}
```

### Resource-Intensive Endpoints

```typescript
// Export/Reports - Strict
@Get("export")
@Throttle({ long: { ttl: 60000, limit: 5 } })  // 5 per minute
async export() {}

// Batch Operations - Very strict
@Post("batch")
@Throttle({ long: { ttl: 60000, limit: 3 } })  // 3 per minute
async batchProcess() {}
```

## Best Practices

### 1. Start Conservative, Relax as Needed

Begin with strict limits and relax based on legitimate usage patterns:

```typescript
// Start strict
@Throttle({ short: { ttl: 1000, limit: 5 } })

// After monitoring, relax if needed
@Throttle({ short: { ttl: 1000, limit: 20 } })
```

### 2. Use Different Limits for Authenticated vs Public

```typescript
@Get("public")
@SkipThrottle(false)  // Apply default
@Throttle({ short: { ttl: 1000, limit: 5 } })  // Strict for public
async publicEndpoint() {}

@Get("private")
@UseGuards(JwtAuthGuard)
@Throttle({ medium: { ttl: 10000, limit: 50 } })  // Lenient for authenticated
async privateEndpoint() {}
```

### 3. Consider Endpoint Cost

Match limits to resource usage:

```typescript
// Cheap read operation - High limit
@Get()
@Throttle({ medium: { ttl: 10000, limit: 100 } })
async findAll() {}

// Expensive aggregation - Low limit
@Get("statistics")
@Throttle({ long: { ttl: 60000, limit: 10 } })
async getStatistics() {}
```

### 4. Document Rate Limits

Include limits in Swagger documentation:

```typescript
@Post()
@Throttle({ short: THROTTLE_LIMITS.SHORT })
@ApiOperation({
  summary: "Create a task",
  description: "Rate limited to 10 requests per second",
})
async create() {}
```

## Testing Rate Limits

### Manual Testing

```bash
# Hit an endpoint repeatedly
for i in {1..15}; do
  curl -s -o /dev/null -w "%{http_code}\n" \
    -X POST http://localhost:3000/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}'
done
```

Expected output after limit exceeded:

```
200
200
200
200
200
429  # Rate limited
429
...
```

### E2E Test Example

```typescript
describe("Rate Limiting", () => {
  it("should rate limit after exceeding threshold", async () => {
    const loginDto = { email: "test@example.com", password: "wrong" };

    // Make requests up to the limit
    for (let i = 0; i < 5; i++) {
      await request(app.getHttpServer()).post("/api/v1/auth/login").send(loginDto).expect(401); // Unauthorized (wrong password)
    }

    // Next request should be rate limited
    const response = await request(app.getHttpServer())
      .post("/api/v1/auth/login")
      .send(loginDto)
      .expect(429);

    expect(response.body.error.errorCode).toBe("SYSTEM_RATE_LIMIT_EXCEEDED");
  });
});
```

## Monitoring

### Logs

Rate limit events are logged:

```
[2024-01-15 10:30:00] [WARN] Rate limit exceeded for IP 192.168.1.100 on /api/v1/auth/login
```

### Headers

Throttler adds headers to responses:

```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 1705315800
```

## Common Issues

### Rate Limit Too Strict

**Symptom**: Legitimate users getting 429 errors

**Solution**: Increase limits or TTL windows

### Rate Limit Not Working

**Symptom**: No 429 responses even with many requests

**Solution**: Ensure `CustomThrottlerGuard` is applied globally in `app.module.ts`

### Different Limits Per User Type

**Symptom**: Need different limits for free vs premium users

**Solution**: Implement custom throttler guard that checks user type

```typescript
@Injectable()
export class UserAwareThrottlerGuard extends ThrottlerGuard {
  async handleRequest(context: ExecutionContext, limit: number, ttl: number) {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Premium users get higher limits
    if (user?.isPremium) {
      limit = limit * 5;
    }

    return super.handleRequest(context, limit, ttl);
  }
}
```

## See Also

- [Caching Guide](./CACHING.md)
- [Authentication Guide](./AUTHENTICATION.md)
- [Error Codes](./ERROR_CODES.md)
