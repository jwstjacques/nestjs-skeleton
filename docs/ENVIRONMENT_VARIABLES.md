# Environment Variables Reference

## Overview

This document provides a complete reference for all environment variables used in the NestJS API Skeleton.

## Configuration Files

- `.env.example` - Main example with all variables documented
- `.env.template` - Detailed template with explanations
- `.env.development.example` - Development environment preset
- `.env.production.example` - Production environment preset
- `.env.test.example` - Test environment preset

## Quick Start

```bash
# For local development
cp .env.development.example .env

# Or start from template
cp .env.template .env
```

## Variable Categories

### 1. Application Settings

| Variable     | Type   | Required | Default       | Description                                         |
| ------------ | ------ | -------- | ------------- | --------------------------------------------------- |
| `NODE_ENV`   | string | Yes      | `development` | Environment: development, staging, production, test |
| `PORT`       | number | Yes      | `3000`        | Server port                                         |
| `HOST`       | string | No       | `localhost`   | Server host (use `0.0.0.0` in production)           |
| `API_PREFIX` | string | Yes      | `api/v1`      | API route prefix                                    |

### 2. Database (PostgreSQL)

| Variable            | Type   | Required | Default     | Description                    |
| ------------------- | ------ | -------- | ----------- | ------------------------------ |
| `DATABASE_URL`      | string | Yes      | -           | Full PostgreSQL connection URL |
| `POSTGRES_HOST`     | string | No       | `localhost` | Database host                  |
| `POSTGRES_PORT`     | number | No       | `5432`      | Database port                  |
| `POSTGRES_USER`     | string | No       | `postgres`  | Database user                  |
| `POSTGRES_PASSWORD` | string | No       | -           | Database password              |
| `POSTGRES_DB`       | string | No       | -           | Database name                  |

### 3. JWT Authentication

| Variable                 | Type   | Required | Default | Description                              |
| ------------------------ | ------ | -------- | ------- | ---------------------------------------- |
| `JWT_SECRET`             | string | Yes      | -       | Access token secret (min 32 chars)       |
| `JWT_REFRESH_SECRET`     | string | Yes      | -       | Refresh token secret (min 32 chars)      |
| `JWT_EXPIRES_IN`         | string | Yes      | `1h`    | Access token expiration (e.g., 15m, 1h)  |
| `JWT_REFRESH_EXPIRES_IN` | string | Yes      | `7d`    | Refresh token expiration (e.g., 7d, 30d) |

### 4. Redis Cache

| Variable         | Type   | Required | Default     | Description                             |
| ---------------- | ------ | -------- | ----------- | --------------------------------------- |
| `REDIS_HOST`     | string | Yes      | `localhost` | Redis host                              |
| `REDIS_PORT`     | number | Yes      | `6379`      | Redis port                              |
| `REDIS_PASSWORD` | string | No       | -           | Redis password (required in production) |

### 5. Rate Limiting

| Variable                | Type   | Required | Default | Description         |
| ----------------------- | ------ | -------- | ------- | ------------------- |
| `THROTTLE_SHORT_TTL`    | number | No       | `1000`  | Short window (ms)   |
| `THROTTLE_SHORT_LIMIT`  | number | No       | `10`    | Short window limit  |
| `THROTTLE_MEDIUM_TTL`   | number | No       | `10000` | Medium window (ms)  |
| `THROTTLE_MEDIUM_LIMIT` | number | No       | `50`    | Medium window limit |
| `THROTTLE_LONG_TTL`     | number | No       | `60000` | Long window (ms)    |
| `THROTTLE_LONG_LIMIT`   | number | No       | `200`   | Long window limit   |

### 6. Logging

| Variable               | Type   | Required | Default                | Description                       |
| ---------------------- | ------ | -------- | ---------------------- | --------------------------------- |
| `LOG_LEVEL`            | string | No       | `info`                 | error, warn, info, debug, verbose |
| `LOG_FILE`             | string | No       | `logs/application.log` | Log file path                     |
| `LOG_DIR`              | string | No       | `logs`                 | Log directory                     |
| `LOG_FILE_MAX_SIZE`    | number | No       | `10485760`             | Max log file size (bytes)         |
| `LOG_FILE_MAX_FILES`   | number | No       | `5`                    | Max log files to keep             |
| `LOG_TIMESTAMP_FORMAT` | string | No       | `YYYY-MM-DD HH:mm:ss`  | Timestamp format                  |

### 7. Pagination

| Variable                   | Type   | Required | Default | Description       |
| -------------------------- | ------ | -------- | ------- | ----------------- |
| `PAGINATION_DEFAULT_LIMIT` | number | No       | `10`    | Default page size |
| `PAGINATION_MAX_LIMIT`     | number | No       | `100`   | Maximum page size |

### 8. CORS

| Variable      | Type   | Required | Default | Description                       |
| ------------- | ------ | -------- | ------- | --------------------------------- |
| `CORS_ORIGIN` | string | No       | -       | Allowed origins (comma-separated) |

### 9. Security Headers (Helmet)

| Variable                              | Type    | Required | Default              | Description                  |
| ------------------------------------- | ------- | -------- | -------------------- | ---------------------------- |
| `HELMET_CSP_DEFAULT_SRC`              | string  | No       | `self`               | CSP default-src directive    |
| `HELMET_CSP_STYLE_SRC`                | string  | No       | `self,unsafe-inline` | CSP style-src directive      |
| `HELMET_CSP_SCRIPT_SRC`               | string  | No       | `self,unsafe-inline` | CSP script-src directive     |
| `HELMET_CSP_IMG_SRC`                  | string  | No       | `self,data:,https:`  | CSP img-src directive        |
| `HELMET_CROSS_ORIGIN_EMBEDDER_POLICY` | boolean | No       | `false`              | Cross-Origin Embedder Policy |

### 10. Health Checks

| Variable                | Type   | Required | Default | Description              |
| ----------------------- | ------ | -------- | ------- | ------------------------ |
| `HEALTH_MEMORY_HEAP_MB` | number | No       | `150`   | Max heap memory (MB)     |
| `HEALTH_MEMORY_RSS_MB`  | number | No       | `300`   | Max RSS memory (MB)      |
| `HEALTH_DISK_THRESHOLD` | number | No       | `0.9`   | Max disk usage (0.0-1.0) |
| `HEALTH_DISK_PATH`      | string | No       | `/`     | Disk path to monitor     |

## Security Best Practices

### Development

- ✅ Use `.env.development.example` as template
- ✅ Weak secrets OK for local development
- ✅ Verbose logging enabled (`LOG_LEVEL=debug`)
- ✅ Relaxed rate limiting

### Production

- ⚠️ **NEVER** commit production `.env` to git
- ⚠️ Use secrets manager (AWS Secrets Manager, Azure Key Vault, HashiCorp Vault)
- ⚠️ Generate cryptographically random JWT secrets (min 32 characters)
- ⚠️ Set `NODE_ENV=production`
- ⚠️ Set `LOG_LEVEL=warn` or `error`
- ⚠️ Configure specific `CORS_ORIGIN` domains (never use `*`)
- ⚠️ Use SSL/TLS for all connections (DATABASE_URL should include `?sslmode=require`)
- ⚠️ Enable `REDIS_PASSWORD`
- ⚠️ Use environment-specific rate limits
- ⚠️ Set `HOST=0.0.0.0` for containerized deployments

### Generating Secure Secrets

```bash
# Generate JWT secret (Node.js)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate JWT secret (OpenSSL)
openssl rand -hex 32

# Generate JWT secret (Linux/Mac)
head -c 32 /dev/urandom | base64

# Generate strong password
openssl rand -base64 32
```

## Environment-Specific Configurations

### Local Development

```bash
# Quick setup
cp .env.development.example .env

# Start services
npm run docker:start

# Run migrations
npm run migrate:dev

# Start application
npm run start:dev
```

### Production Deployment

```bash
# Don't use .env files in production!
# Set via environment variables or secrets manager

export NODE_ENV=production
export DATABASE_URL=$PROD_DATABASE_URL
export JWT_SECRET=$PROD_JWT_SECRET
export JWT_REFRESH_SECRET=$PROD_JWT_REFRESH_SECRET
export REDIS_HOST=$PROD_REDIS_HOST
export REDIS_PASSWORD=$PROD_REDIS_PASSWORD
# ... etc

npm run start:prod
```

### Docker Deployment

```bash
# docker-compose.yml uses .env automatically
cp .env.production.example .env

# Update with production values
# Use secrets manager to inject values

docker-compose up -d
```

### CI/CD

```bash
# Set in CI environment variables
export NODE_ENV=test
export DATABASE_URL=$CI_DATABASE_URL
export SKIP_DB_SETUP=true

# Run tests
npm run test:all
```

## Validation

All environment variables are validated at startup using Zod schemas located in:

- `src/config/app.config.ts` - Application settings
- `src/config/database.config.ts` - Database configuration
- `src/config/jwt.config.ts` - JWT authentication
- `src/config/redis.config.ts` - Redis cache
- `src/config/throttler.config.ts` - Rate limiting
- `src/config/pagination.config.ts` - Pagination settings

If validation fails, the application will:

1. Display detailed error messages
2. Show which variables are invalid
3. Prevent the application from starting

Example validation error:

```text
[Nest] ERROR [ConfigService] Configuration validation failed:
- JWT_SECRET: String must contain at least 32 character(s)
- DATABASE_URL: Required
```

## Troubleshooting

### "DATABASE_URL is required"

**Problem**: Application fails to start with missing DATABASE_URL error

**Solution**:

1. Ensure `.env` file exists: `cp .env.development.example .env`
2. Verify `DATABASE_URL` is set in `.env`
3. Check Docker containers are running: `npm run docker:start`
4. Test connection: `npm run prisma:studio`

### "JWT_SECRET must be at least 32 characters"

**Problem**: JWT secret is too short

**Solution**:

```bash
# Generate new secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Update .env
JWT_SECRET=<generated-secret>
JWT_REFRESH_SECRET=<another-generated-secret>
```

### "Cannot connect to Redis"

**Problem**: Application cannot connect to Redis

**Solution**:

1. Check Redis is running: `docker ps | grep redis`
2. Verify `REDIS_HOST` and `REDIS_PORT` in `.env`
3. Start Docker containers: `npm run docker:start`
4. Test Redis: `redis-cli ping` (should return `PONG`)

### "Rate limit exceeded"

**Problem**: Too many requests being blocked

**Solution** (Development only):

```env
# Increase limits in .env
THROTTLE_SHORT_LIMIT=1000
THROTTLE_MEDIUM_LIMIT=5000
THROTTLE_LONG_LIMIT=10000
```

### "Port 3000 already in use"

**Problem**: Another process is using port 3000

**Solution**:

```bash
# Find process
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port in .env
PORT=3001
```

### "Database migration failed"

**Problem**: Prisma migrations failing

**Solution**:

```bash
# Reset database (development only! requires confirmation)
npx prisma migrate reset

# Or create new migration
npm run migrate:dev

# Check connection
npm run docker:logs postgres
```

## Docker Integration

When using Docker Compose (`npm run docker:start`):

### Services Created

- **postgres**: PostgreSQL database (port 5432)
- **redis**: Redis cache (port 6379)
- **pgadmin**: Database admin UI (port 5050)

### For App on Host Machine

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/taskdb?schema=public
REDIS_HOST=localhost
```

### For App Inside Docker Network

```env
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/taskdb?schema=public
REDIS_HOST=redis
```

### PgAdmin Access

- **URL**: `http://localhost:5050`
- **Email**: `admin@admin.com`
- **Password**: `admin`

## Production Checklist

Before deploying to production, verify:

- [ ] `NODE_ENV=production`
- [ ] Strong random JWT secrets (min 32 chars)
- [ ] Production database with SSL (`?sslmode=require`)
- [ ] Specific `CORS_ORIGIN` domains (no wildcards)
- [ ] `LOG_LEVEL=warn` or `error`
- [ ] Redis password configured
- [ ] `HOST=0.0.0.0` (if containerized)
- [ ] All secrets in secrets manager
- [ ] SSL/TLS enabled for all connections
- [ ] Database backups configured
- [ ] Monitoring and alerting setup
- [ ] Rate limits reviewed and tuned
- [ ] Health checks configured
- [ ] No debug/development settings

## Related Documentation

- [Development Guide](./DEVELOPMENT.md) - Local development setup
- [Production Guide](./PRODUCTION.md) - Production deployment
- [Testing Guide](./TESTING.md) - Test environment configuration
- [Database Guide](./DATABASE.md) - Database configuration
- [Docker Guide](./DOCKER.md) - Docker deployment

## Support

For issues or questions:

1. Check troubleshooting section above
2. Review configuration validation errors
3. Consult related documentation
4. Check logs: `tail -f logs/application.log`

---

**Last Updated**: December 16, 2025  
**Version**: 1.0.0
