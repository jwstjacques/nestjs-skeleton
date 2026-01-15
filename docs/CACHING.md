# Caching Guide

This project uses Redis for caching via `@nestjs/cache-manager` with the `cache-manager-redis-yet` store.

## Overview

The caching system provides:

- **Redis-backed caching** for distributed deployments
- **User-aware cache keys** that include the authenticated user's ID
- **Automatic error response exclusion** (4xx/5xx responses are never cached)
- **Configurable TTL tiers** for different data volatility levels

## Architecture

```
Request → JwtGuard → HttpCacheInterceptor → Controller → Service
                           ↓
                    Check cache key
                           ↓
              ┌────────────┴────────────┐
              ↓                         ↓
         Cache Hit                 Cache Miss
              ↓                         ↓
        Return cached            Execute request
                                       ↓
                              Check response status
                                       ↓
                          ┌────────────┴────────────┐
                          ↓                         ↓
                     Success (2xx)             Error (4xx/5xx)
                          ↓                         ↓
                    Cache response            Skip caching
```

## Configuration

### Environment Variables

```bash
# Redis Connection
REDIS_HOST=localhost        # Redis server host
REDIS_PORT=6379             # Redis server port
REDIS_PASSWORD=             # Redis password (optional)
REDIS_DB=0                  # Redis database number
```

### Cache Module

The cache module is globally registered in [cache.module.ts](../src/common/cache/cache.module.ts):

```typescript
@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        store: await redisStore({
          socket: {
            host: configService.get<string>("cache.redis.host", "localhost"),
            port: configService.get<number>("cache.redis.port", 6379),
          },
          password: configService.get<string>("cache.redis.password"),
          database: configService.get<number>("cache.redis.db", 0),
        }),
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [NestCacheModule],
})
export class CacheModule {}
```

## TTL Constants

Cache TTLs are defined in [cache-ttl.constants.ts](../src/config/constants/cache-ttl.constants.ts):

| Constant     | Duration   | Use Case                 |
| ------------ | ---------- | ------------------------ |
| `VERY_SHORT` | 30 seconds | Frequently changing data |
| `SHORT`      | 1 minute   | Dynamic lists            |
| `MEDIUM`     | 5 minutes  | Semi-static data         |
| `LONG`       | 15 minutes | Relatively stable data   |
| `VERY_LONG`  | 30 minutes | Stats and aggregations   |
| `HOUR`       | 1 hour     | Rarely changing data     |
| `DAY`        | 24 hours   | Static data              |

## Usage

### Basic Caching with Interceptor

Apply the `CacheInterceptor` and `@CacheTTL()` decorator to endpoints:

```typescript
import { CacheInterceptor, CacheTTL } from "@nestjs/cache-manager";
import { CacheTTL as CacheTTLEnum } from "../../common/cache/cache-keys.constants";

@Get()
@UseInterceptors(CacheInterceptor)
@CacheTTL(CacheTTLEnum.SHORT)  // 1 minute
async findAll(@Query() query: QueryTaskDto) {
  return this.tasksService.findAll(query);
}
```

### Custom HttpCacheInterceptor

The project includes a custom [HttpCacheInterceptor](../src/common/interceptors/cache.interceptor.ts) that:

1. **Only caches GET requests**
2. **Excludes error responses** (status >= 400)
3. **Includes user ID in cache keys** for user-specific data

```typescript
@Get(":id")
@UseInterceptors(HttpCacheInterceptor)
@CacheTTL(CacheTTLEnum.MEDIUM)  // 5 minutes
async findOne(@Param("id") id: string) {
  return this.tasksService.findOne(id);
}
```

### Cache Key Patterns

The `CacheKeys` utility class generates consistent cache keys:

```typescript
import { CacheKeys } from "../../common/cache/cache-keys.constants";

// List cache key
const listKey = CacheKeys.list("tasks");
// Result: "tasks:list"

// List with filters
const filteredKey = CacheKeys.list("tasks", { status: "TODO", priority: "HIGH" });
// Result: "tasks:list:priority=HIGH&status=TODO"

// Single item
const itemKey = CacheKeys.item("tasks", "clxyz123456789");
// Result: "tasks:clxyz123456789"

// User-specific items
const userItemsKey = CacheKeys.userItems("user123", "tasks");
// Result: "user:user123:tasks"

// Statistics
const statsKey = CacheKeys.stats("tasks");
// Result: "tasks:stats"
```

### Manual Cache Operations

Inject `CACHE_MANAGER` for manual cache operations:

```typescript
import { CACHE_MANAGER, Cache } from "@nestjs/cache-manager";

@Injectable()
export class TasksService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async getOrSetTask(id: string): Promise<Task> {
    const cacheKey = CacheKeys.item("tasks", id);

    // Try cache first
    const cached = await this.cacheManager.get<Task>(cacheKey);
    if (cached) return cached;

    // Fetch from database
    const task = await this.tasksDal.findUnique(id);

    // Cache the result
    await this.cacheManager.set(cacheKey, task, CacheTTL.MEDIUM);

    return task;
  }
}
```

### Cache Invalidation

Invalidate cache when data changes:

```typescript
async update(id: string, updateDto: UpdateTaskDto): Promise<Task> {
  const task = await this.tasksDal.update(id, updateDto);

  // Invalidate specific item
  await this.cacheManager.del(CacheKeys.item("tasks", id));

  // Invalidate related lists (using pattern - requires Redis)
  // Note: Pattern deletion requires custom implementation with Redis client

  return task;
}
```

### Pattern-Based Invalidation

For bulk invalidation, use Redis patterns:

```typescript
import { Redis } from "ioredis";

async invalidateAllTaskLists(): Promise<void> {
  const pattern = CacheKeys.allListsPattern("tasks");
  // Result: "tasks:list*"

  // With Redis client
  const keys = await this.redis.keys(pattern);
  if (keys.length > 0) {
    await this.redis.del(...keys);
  }
}
```

## Best Practices

### 1. Choose Appropriate TTLs

| Data Type               | Recommended TTL |
| ----------------------- | --------------- |
| User-specific lists     | `SHORT`         |
| Individual items        | `MEDIUM`        |
| Statistics/aggregations | `VERY_LONG`     |
| Configuration data      | `HOUR`          |
| Static reference data   | `DAY`           |

### 2. Always Invalidate on Mutations

```typescript
// After CREATE
await this.cacheManager.del(CacheKeys.list("tasks"));

// After UPDATE
await this.cacheManager.del(CacheKeys.item("tasks", id));
await this.cacheManager.del(CacheKeys.list("tasks"));

// After DELETE
await this.cacheManager.del(CacheKeys.item("tasks", id));
await this.cacheManager.del(CacheKeys.list("tasks"));
```

### 3. Use User-Aware Cache Keys

The `HttpCacheInterceptor` automatically includes user ID in cache keys:

```
/api/v1/tasks → tasks:list:user:clxyz123456789
```

This prevents users from seeing each other's cached data.

### 4. Don't Cache Sensitive Data

Avoid caching:

- Authentication tokens
- Password reset links
- Personal identification information
- Financial data

### 5. Set Max List Size

When caching lists, limit the size to prevent memory issues:

```typescript
const MAX_CACHED_ITEMS = 1000;

async findAll(query: QueryDto) {
  const items = await this.dal.findMany({
    take: Math.min(query.limit, MAX_CACHED_ITEMS),
  });

  // Only cache if within size limits
  if (items.length <= MAX_CACHED_ITEMS) {
    await this.cacheManager.set(key, items, CacheTTL.SHORT);
  }

  return items;
}
```

## Debugging

### Enable Cache Logging

The `HttpCacheInterceptor` logs cache hits and misses at the `debug` level:

```
[2024-01-15 10:30:00] [DEBUG] [HttpCacheInterceptor] Cache hit for key: /api/v1/tasks:user:clxyz123456789
[2024-01-15 10:30:05] [DEBUG] [HttpCacheInterceptor] Cache key with user: /api/v1/tasks/abc:user:clxyz123456789
[2024-01-15 10:30:10] [DEBUG] [HttpCacheInterceptor] Cached successful response for key: /api/v1/tasks/abc:user:clxyz123456789
```

### Redis CLI Commands

```bash
# Connect to Redis
redis-cli

# View all keys
KEYS *

# View task-related keys
KEYS tasks:*

# Get a specific cache entry
GET "tasks:list"

# Check TTL remaining
TTL "tasks:clxyz123456789"

# Delete a key
DEL "tasks:clxyz123456789"

# Clear all keys (use with caution!)
FLUSHDB
```

## Common Issues

### Cache Not Updating

**Symptom**: Old data returned after updates

**Solution**: Ensure cache invalidation is called after mutations

```typescript
// WRONG - Missing invalidation
async update(id: string, dto: UpdateDto) {
  return this.dal.update(id, dto);
}

// CORRECT - With invalidation
async update(id: string, dto: UpdateDto) {
  const result = await this.dal.update(id, dto);
  await this.cacheManager.del(CacheKeys.item("tasks", id));
  return result;
}
```

### Users Seeing Other Users' Data

**Symptom**: User A sees data belonging to User B

**Solution**: Use `HttpCacheInterceptor` instead of the default `CacheInterceptor`

### Redis Connection Errors

**Symptom**: `ECONNREFUSED` errors in logs

**Solution**: Check Redis is running and connection settings are correct

```bash
# Check if Redis is running
docker ps | grep redis

# Start Redis via Docker
./scripts/docker-start.sh
```

## See Also

- [Configuration Guide](./CONFIGURATION.md)
- [Rate Limiting Guide](./RATE_LIMITING.md)
- [Environment Variables](./ENVIRONMENT_VARIABLES.md)
