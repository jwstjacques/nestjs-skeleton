# Production Guide

## Overview

This guide covers production deployment, monitoring, logging, security, and maintenance.

---

## Environment Configuration

### Production Requirements

⚠️ **CRITICAL**: Never use `.env` files in production. Always use a secrets manager or environment variables.

#### Secrets Manager (Recommended)

Use cloud provider secrets managers:

- **AWS**: AWS Secrets Manager or Parameter Store
- **Azure**: Azure Key Vault
- **Google Cloud**: Secret Manager
- **HashiCorp**: Vault
- **Kubernetes**: Secrets

#### Environment Variables Setup

```bash
# Set via environment variables (not .env files)
export NODE_ENV=production
export PORT=3000
export HOST=0.0.0.0

# Database (from secrets manager)
export DATABASE_URL="${SECRET_DATABASE_URL}"

# JWT (from secrets manager)
export JWT_SECRET="${SECRET_JWT_ACCESS}"
export JWT_REFRESH_SECRET="${SECRET_JWT_REFRESH}"
export JWT_EXPIRES_IN=15m
export JWT_REFRESH_EXPIRES_IN=7d

# Redis (from secrets manager)
export REDIS_HOST="${SECRET_REDIS_HOST}"
export REDIS_PORT=6379
export REDIS_PASSWORD="${SECRET_REDIS_PASSWORD}"

# Security
export CORS_ORIGIN="https://yourdomain.com,https://app.yourdomain.com"
export LOG_LEVEL=warn

# Rate limiting (production values)
export THROTTLE_SHORT_TTL=1000
export THROTTLE_SHORT_LIMIT=10
export THROTTLE_MEDIUM_TTL=10000
export THROTTLE_MEDIUM_LIMIT=50
export THROTTLE_LONG_TTL=60000
export THROTTLE_LONG_LIMIT=200
```

#### Production Checklist

Before deploying, verify:

- [ ] `NODE_ENV=production`
- [ ] Strong random JWT secrets (min 32 chars)
- [ ] Database connection uses SSL (`?sslmode=require`)
- [ ] Specific `CORS_ORIGIN` domains (no wildcards)
- [ ] `LOG_LEVEL=warn` or `error`
- [ ] Redis password configured
- [ ] `HOST=0.0.0.0` (if containerized)
- [ ] All secrets from secrets manager
- [ ] SSL/TLS enabled for all connections
- [ ] Database backups configured
- [ ] Monitoring and alerting setup
- [ ] Health checks configured

For complete variable reference, see [Environment Variables Guide](./ENVIRONMENT_VARIABLES.md).

---

## Logging

### Winston Logger

The application uses Winston for structured logging with multiple transports.

#### Log Levels

- **error**: Critical errors requiring immediate attention
- **warn**: Warning messages (4xx errors, slow queries)
- **log**: General information (requests, lifecycle events)
- **debug**: Detailed debugging information (development only)

#### Log Files

```text
logs/
├── application.log # All logs
└── error.log # Errors only
```

#### Log Rotation

- Maximum file size: 10MB
- Maximum files: 5 (50MB total)
- Automatic rotation and compression

#### Viewing Logs

```bash
# Tail application logs
tail -f logs/application.log

# Tail error logs
tail -f logs/error.log

# Filter for specific patterns
grep "ERROR" logs/application.log
grep "Slow request" logs/application.log

# View logs in Docker
docker logs nestjs-api -f
```

#### Log Format

Console (Development) with Correlation ID:

```
2025-11-28 10:30:00 [a1b2c3d4-e5f6-4789-90ab-cdef12345678] [user-42] [TasksService] INFO: Task created successfully
```

JSON (Production) with Correlation ID:

```json
{
  "timestamp": "2025-11-28T10:30:00.000Z",
  "level": "info",
  "context": "TasksService",
  "correlationId": "a1b2c3d4-e5f6-4789-90ab-cdef12345678",
  "userId": 42,
  "message": "Task created successfully"
}
```

#### Correlation ID

Every request has a unique correlation ID that appears in:

- Response headers (`x-correlation-id`)
- All log messages
- Error responses

**Benefits:**

- Trace a single request through the entire application
- Filter logs by correlation ID to debug specific requests
- Clients can report issues with specific correlation ID
- Track performance of individual requests

**Usage:**

```bash
# Client sends custom correlation ID
curl -H "x-correlation-id: my-custom-id" http://localhost:3000/api/tasks

# Server returns it in response header
# x-correlation-id: my-custom-id

# All logs for that request include it
grep "my-custom-id" logs/application.log

# Example log output:
# 2025-11-28 10:30:00 [my-custom-id] [user-42] [TasksService] INFO: Finding tasks
# 2025-11-28 10:30:00 [my-custom-id] [user-42] [PrismaService] DEBUG: Query: SELECT * FROM tasks
# 2025-11-28 10:30:01 [my-custom-id] [user-42] [RequestLogger] INFO: GET /api/tasks 200 150ms
```

**Best Practices:**

- Use correlation ID when reporting bugs
- Include correlation ID in client-side error tracking
- Set up log aggregation to filter by correlation ID
- Use correlation ID in distributed tracing systems

---

## Security

### Helmet

Security headers are configured via Helmet:

- **Content Security Policy**: Prevents XSS attacks
- **X-Frame-Options**: Prevents clickjacking
- **X-Content-Type-Options**: Prevents MIME sniffing
- **Strict-Transport-Security**: Forces HTTPS
- **X-XSS-Protection**: Browser XSS protection

#### Verify Security Headers

```bash
curl -I http://localhost:3000/api/v1/health

# Expected headers:
# X-DNS-Prefetch-Control: off
# X-Frame-Options: SAMEORIGIN
# Strict-Transport-Security: max-age=15552000; includeSubDomains
# X-Download-Options: noopen
# X-Content-Type-Options: nosniff
# X-XSS-Protection: 0
```

### CORS Configuration

CORS is configured per environment:

Development:

```typescript
app.enableCors({
  origin: "*",
  credentials: true,
});
```

Production:

```typescript
app.enableCors({
  origin: process.env.CORS_ORIGIN, // Specific domain
  credentials: true,
});
```

### Environment Variables

Sensitive data must be in environment variables:

```bash
# Required
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key

# Optional
REDIS_HOST=localhost
REDIS_PORT=6379
CORS_ORIGIN=https://yourdomain.com
PORT=3000
```

**Never commit `.env` files to Git!**

---

## Health Checks

### Endpoints

#### GET /api/v1/health

Comprehensive health check for all dependencies.

**Response:**

```json
{
  "status": "ok",
  "info": {
    "database": { "status": "up" },
    "memory_heap": { "status": "up" },
    "memory_rss": { "status": "up" },
    "storage": { "status": "up" }
  },
  "error": {},
  "details": {
    "database": { "status": "up" },
    "memory_heap": { "status": "up" },
    "memory_rss": { "status": "up" },
    "storage": { "status": "up" }
  }
}
```

#### GET /api/v1/health/liveness

Kubernetes liveness probe - is the service running?

**Use case**: Kubernetes will restart the pod if this fails.

#### GET /api/v1/health/readiness

Kubernetes readiness probe - can the service accept traffic?

**Use case**: Kubernetes will remove the pod from load balancing if this fails.

### Health Check Thresholds

| Check       | Threshold          | Action         |
| ----------- | ------------------ | -------------- |
| Database    | Connection timeout | Fail readiness |
| Memory Heap | >150MB             | Fail readiness |
| Memory RSS  | >300MB             | Warn           |
| Disk Space  | >90% used          | Warn           |

### Monitoring

```bash
# Check health
curl http://localhost:3000/api/v1/health

# Check specific probe
curl http://localhost:3000/api/v1/health/liveness
curl http://localhost:3000/api/v1/health/readiness

# Continuous monitoring
watch -n 5 'curl -s http://localhost:3000/api/v1/health | jq'
```

---

## Graceful Shutdown

### How It Works

1. Application receives SIGTERM/SIGINT signal
2. Server stops accepting new connections
3. Existing requests complete (up to 30s timeout)
4. Database connections close
5. Redis connections close
6. Application exits with code 0

### Testing

```bash
# Start the application
npm run start

# Get the process ID
ps aux | grep node

# Send SIGTERM
kill -SIGTERM <PID>

# Watch logs for graceful shutdown
# Expected: "Starting graceful shutdown..."
# Expected: "Database disconnected successfully"
# Expected: "Application closed successfully"
```

### Docker

Docker automatically sends SIGTERM on `docker stop`:

```bash
docker stop nestjs-api
```

Default timeout: 10 seconds
Override: `docker stop -t 30 nestjs-api`

---

## Performance Monitoring

### Metrics to Track

1. **Response Times**
   - 95th percentile < 500ms
   - 99th percentile < 1000ms

2. **Error Rate**
   - 4xx errors < 5%
   - 5xx errors < 0.1%

3. **Cache Hit Rate**
   - Target: >50%
   - Check: Redis INFO stats

4. **Database Connections**
   - Monitor pool usage
   - Prevent connection leaks

5. **Memory Usage**
   - RSS < 300MB
   - Heap < 150MB

### Monitoring Tools

**Application Performance Monitoring (APM):**

- New Relic
- Datadog
- AWS CloudWatch

**Log Aggregation:**

- ELK Stack (Elasticsearch, Logstash, Kibana)
- Splunk
- AWS CloudWatch Logs

**Infrastructure Monitoring:**

- Prometheus + Grafana
- AWS CloudWatch
- Datadog

---

## Error Handling

### Error Response Format

```json
{
  "statusCode": 404,
  "message": "Task with ID 123 not found",
  "error": "Not Found",
  "timestamp": "2025-11-28T10:30:00.000Z",
  "path": "/api/v1/tasks/123"
}
```

### Common Errors

| Status | Error                 | Description              |
| ------ | --------------------- | ------------------------ |
| 400    | Bad Request           | Invalid input data       |
| 401    | Unauthorized          | Missing/invalid token    |
| 403    | Forbidden             | Insufficient permissions |
| 404    | Not Found             | Resource doesn't exist   |
| 429    | Too Many Requests     | Rate limit exceeded      |
| 500    | Internal Server Error | Server error             |
| 503    | Service Unavailable   | Database/service down    |

### Error Monitoring

```bash
# Check error logs
tail -f logs/error.log

# Count errors
grep "ERROR" logs/application.log | wc -l

# Find unique errors
grep "ERROR" logs/application.log | sort | uniq -c
```

---

## Maintenance

### Database Migrations

```bash
# Create migration
npx prisma migrate dev --name add_new_field

# Apply migrations in production
npx prisma migrate deploy

# Check migration status
npx prisma migrate status
```

### Database Backups

```bash
# Manual backup
npm run db:backup

# Automated backups (cron)
0 2 * * * /path/to/project/scripts/db-backup.sh
```

### Log Cleanup

```bash
# Clean old logs (older than 30 days)
find logs/ -name "*.log" -mtime +30 -delete
```

### Restart Without Downtime

```bash
# Rolling restart (Kubernetes)
kubectl rollout restart deployment/nestjs-api

# Zero-downtime restart (PM2)
pm2 reload ecosystem.config.js

# Docker Compose
docker-compose up -d --no-deps --build api
```

---

## Troubleshooting

### High Memory Usage

```bash
# Check memory
docker stats nestjs-api

# Generate heap snapshot
node --inspect=9229 dist/main.js
# Connect Chrome DevTools
# Take heap snapshot
```

### Database Connection Issues

```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Check connection pool
curl http://localhost:3000/api/v1/health | jq '.info.database'

# View active connections
psql $DATABASE_URL -c "SELECT count(*) FROM pg_stat_activity"
```

### High Response Times

```bash
# Check slow queries in logs
grep "Duration:" logs/application.log | sort -t: -k2 -rn | head -10

# Check database load
curl http://localhost:3000/api/v1/health | jq '.details'

# Check server resources
docker stats nestjs-api
```

### Service Won't Start

```bash
# Check logs
docker logs nestjs-api --tail 100

# Verify environment variables
env | grep -E "DATABASE_URL|PORT"

# Check port availability
lsof -i :3000

# Verify database is running
docker ps | grep postgres
```

---

## Deployment Checklist

Before deploying to production:

- [ ] All tests passing (`npm run test:all`)
- [ ] No lint errors (`npm run lint`)
- [ ] Build successful (`npm run build`)
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Secrets stored in secure vault
- [ ] Monitoring/alerting configured
- [ ] Log aggregation configured
- [ ] Backup strategy in place
- [ ] Disaster recovery plan documented
- [ ] Performance baselines established
- [ ] Security headers verified
- [ ] CORS configured for production domain
- [ ] Rate limiting enabled
- [ ] Health checks passing

## See Also

- [Logging Guide](./LOGGING.md) - Detailed logging configuration and best practices
- [Rate Limiting Guide](./RATE_LIMITING.md) - Throttler configuration
- [Caching Guide](./CACHING.md) - Redis caching patterns
- [Environment Variables](./ENVIRONMENT_VARIABLES.md) - Complete variable reference
- [Scripts Reference](./SCRIPTS.md) - Utility scripts for deployment
