# Advanced Features

## Rate Limiting

### Overview

Rate limiting protects the API from abuse by limiting the number of requests per time window.

### Configuration

The API uses a tiered rate limiting approach:

- **Short**: 10 requests per second (general limit)
- **Medium**: 50 requests per 10 seconds
- **Long**: 200 requests per minute

### Endpoint-Specific Limits

| Endpoint Category | Tier   | Limit       | Time Window |
| ----------------- | ------ | ----------- | ----------- |
| POST /tasks       | SHORT  | 10 requests | 1 second    |
| PATCH /tasks/:id  | SHORT  | 10 requests | 1 second    |
| DELETE /tasks/:id | SHORT  | 10 requests | 1 second    |
| GET /tasks        | MEDIUM | 50 requests | 10 seconds  |
| GET /tasks/:id    | MEDIUM | 50 requests | 10 seconds  |
| GET /tasks/stats  | MEDIUM | 50 requests | 10 seconds  |

### Response Headers

Rate-limited responses include these headers:

- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining
- `X-RateLimit-Reset`: Timestamp when limit resets

### Error Response

```json
{
  "statusCode": 429,
  "message": "Too many requests, please try again later",
  "error": "Too Many Requests"
}
```

### Testing Rate Limits

```bash
./scripts/test-rate-limit.sh
```

## Caching

### Overview

The API uses Redis for caching to improve response times and reduce database load.

### What Gets Cached

- GET /tasks (list endpoint with query parameters)
- GET /tasks/:id (single task endpoint)

**Note**: GET /tasks/statistics is intentionally NOT cached to provide real-time data.

### Cache TTL

- **LIST endpoint** (`GET /tasks`): 60 seconds
- **SINGLE endpoint** (`GET /tasks/:id`): 300 seconds (5 minutes)

### Cache Invalidation

Cache invalidation is handled automatically at the controller level:

- When a new task is created (POST), the LIST cache is cleared
- When a task is updated (PATCH), both the SINGLE and LIST caches are cleared
- When a task is deleted (DELETE), both the SINGLE and LIST caches are cleared

This ensures that subsequent GET requests always retrieve fresh data without manual cache management.

### Cache Keys

Cache keys are based on the full request URL:

- `/api/v1/tasks?page=1&limit=10`
- `/api/v1/tasks?status=TODO&priority=HIGH`
- `/api/v1/tasks/550e8400-e29b-41d4-a716-446655440000`

### Monitoring Cache

```bash
# Connect to Redis
docker exec -it nestjs-task-redis redis-cli

# View all keys
KEYS *

# View specific key
GET "/api/v1/tasks?page=1&limit=10"

# Check cache statistics
INFO stats

# Clear all cache
FLUSHALL
```

### Performance Impact

Typical improvements:

- Uncached request: 50-200ms
- Cached request: 1-5ms
- **40-200x faster** for cached responses

## Compression

### Overview

GZIP compression reduces response payload size by 60-90% for JSON responses.

### How It Works

The server automatically compresses responses when the client includes:

```
Accept-Encoding: gzip
```

All modern browsers and API clients support this automatically.

### Benefits

Example response sizes:

- Uncompressed: 125 KB
- Compressed: 12 KB
- **90% reduction**

### Testing Compression

```bash
# Check compression headers
curl -I -H "Accept-Encoding: gzip" http://localhost:3000/api/v1/tasks

# Verify compression is working by decompressing the response
curl -H "Accept-Encoding: gzip" http://localhost:3000/api/v1/tasks 2>/dev/null | gunzip | head -20

# Compare sizes
curl http://localhost:3000/api/v1/tasks -w "Size: %{size_download} bytes\n"
curl -H "Accept-Encoding: gzip" http://localhost:3000/api/v1/tasks -w "Size: %{size_download} bytes\n"
```

## Performance Monitoring

### Overview

The Performance Interceptor logs request durations and identifies slow requests.

### Logged Information

Every request logs:

- HTTP method
- URL path
- Duration in milliseconds

### Slow Request Detection

Requests taking >1000ms are logged as warnings:

```
[WARN] Slow request: GET /api/v1/tasks - 1523ms
```

### Performance Targets

| Operation       | Target | Threshold |
| --------------- | ------ | --------- |
| GET single task | <50ms  | <100ms    |
| GET task list   | <200ms | <500ms    |
| POST/PATCH task | <100ms | <300ms    |
| Statistics      | <500ms | <1000ms   |

### Monitoring Logs

```bash

# View performance logs

tail -f logs/application.log | grep "Slow request"
```

## Best Practices

### For API Consumers

1. **Respect rate limits**: Implement exponential backoff
2. **Use pagination**: Don't request all data at once
3. **Cache on client**: Leverage ETags and cache headers
4. **Accept compression**: Always send `Accept-Encoding: gzip`

### For Developers

1. **Monitor slow queries**: Check performance logs regularly
2. **Optimize database queries**: Use indexes and efficient queries
3. **Adjust cache TTL**: Balance freshness vs performance
4. **Fine-tune rate limits**: Based on actual usage patterns

## See Also

- [Caching Guide](./CACHING.md) - Detailed Redis caching patterns and configuration
- [Rate Limiting Guide](./RATE_LIMITING.md) - Complete throttler configuration and usage
- [Logging Guide](./LOGGING.md) - Winston logging with correlation IDs
- [Production Guide](./PRODUCTION.md) - Production deployment and monitoring
