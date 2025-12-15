# Configuration Guide

## Overview

This NestJS application uses a centralized, type-safe configuration system built on:

- **NestJS ConfigModule**: Framework's built-in configuration management
- **Zod Schemas**: Runtime validation and type safety
- **Environment Variables**: 12-factor app methodology
- **Namespaced Config**: Organized by feature domain

All configuration is loaded at application startup, validated against Zod schemas, and made available through the `ConfigService` across the application.

## Table of Contents

- [Quick Start](#quick-start)
- [Configuration Architecture](#configuration-architecture)
- [Configuration Namespaces](#configuration-namespaces)
  - [Application](#application-appconfig)
  - [Database](#database-databaseconfig)
  - [Cache](#cache-cacheconfig)
  - [Security](#security-securityconfig)
  - [Observability](#observability-observabilityconfig)
  - [Rate Limiting](#rate-limiting-throttleconfig)
  - [Pagination](#pagination-paginationconfig)
  - [API Documentation](#api-documentation-swaggerconfig)
- [Environment-Specific Configuration](#environment-specific-configuration)
- [Validation and Error Handling](#validation-and-error-handling)
- [Testing Configuration](#testing-configuration)
- [Best Practices](#best-practices)
- [Migration Guide](#migration-guide)

## Quick Start

### 1. Set Up Environment File

```bash
# Copy example environment file
cp .env.example .env

# Edit with your values
nano .env
```

### 2. Minimum Required Variables

```bash
# Application
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mydb

# Security
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
JWT_REFRESH_SECRET=your-super-secret-refresh-key-minimum-32-characters-long
```

### 3. Start the Application

```bash
npm run start:dev
```

The application will:

1. Load environment variables from `.env`
2. Validate all configuration against Zod schemas
3. Fail fast if configuration is invalid
4. Make configuration available via `ConfigService`

## Configuration Architecture

### Directory Structure

```
src/config/
├── schemas/              # Zod validation schemas
│   ├── app.schema.ts
│   ├── database.schema.ts
│   ├── cache.schema.ts
│   ├── security.schema.ts
│   ├── observability.schema.ts
│   ├── throttle.schema.ts
│   ├── pagination.schema.ts
│   ├── swagger.schema.ts
│   └── index.ts
├── providers/            # NestJS config providers
│   ├── app.config.ts
│   ├── database.config.ts
│   ├── cache.config.ts
│   ├── security.config.ts
│   ├── observability.config.ts
│   ├── throttle.config.ts
│   ├── pagination.config.ts
│   ├── swagger.config.ts
│   └── index.ts
├── constants/            # Static constants
│   ├── api.constants.ts
│   ├── cache-ttl.constants.ts
│   └── index.ts
├── config.module.ts      # Central config module
├── swagger.config.ts     # Swagger factory
├── helmet.config.ts      # Helmet factory
└── index.ts             # Barrel export
```

### Configuration Flow

```
.env file
    ↓
process.env
    ↓
Config Providers (registerAs)
    ↓
Zod Schema Validation
    ↓
ConfigService (type-safe access)
    ↓
Application Components
```

### Key Components

1. **Schemas (`schemas/*.ts`)**: Zod schemas that define structure, types, and defaults
2. **Providers (`providers/*.ts`)**: NestJS configuration providers using `registerAs()`
3. **AppConfigModule (`config.module.ts`)**: Global module that loads all providers
4. **ConfigService**: Injected service for accessing configuration

## Configuration Namespaces

### Application (`app.config`)

Controls core application settings.

**Namespace**: `app`

**Environment Variables**:

```bash
NODE_ENV=development          # Environment: development|staging|production|test
PORT=3000                     # Server port
HOST=localhost                # Server host
API_PREFIX=api                # API route prefix
API_VERSION=1                 # API version number
```

**Access in Code**:

```typescript
constructor(private configService: ConfigService) {}

const env = this.configService.get<string>('app.nodeEnv', 'development');
const port = this.configService.get<number>('app.port', 3000);
const host = this.configService.get<string>('app.host', 'localhost');
const apiPrefix = this.configService.get<string>('app.apiPrefix', 'api');
const apiVersion = this.configService.get<string>('app.apiVersion', '1');
```

**Defaults**:

- `nodeEnv`: `"development"`
- `port`: `3000`
- `host`: `"localhost"`
- `apiPrefix`: `"api"`
- `apiVersion`: `"1"`

---

### Database (`database.config`)

PostgreSQL database connection configuration.

**Namespace**: `database`

**Environment Variables**:

```bash
# Recommended: Use full connection URL
DATABASE_URL=postgresql://user:pass@localhost:5432/db

# Alternative: Individual parameters
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=mydb
DATABASE_SSL=false
```

**Access in Code**:

```typescript
const dbUrl = this.configService.get<string>("database.url");
const host = this.configService.get<string>("database.host", "localhost");
const port = this.configService.get<number>("database.port", 5432);
const ssl = this.configService.get<boolean>("database.ssl", false);
```

**Validation**:

- `url`: Required (connection string)
- `port`: Must be a valid port number (1-65535)
- `ssl`: Boolean value

**Production Notes**:

- Always use `DATABASE_SSL=true` in production
- Store DATABASE_URL in secure secrets management
- Use connection pooling for better performance

---

### Cache (`cache.config`)

Redis cache and TTL configuration.

**Namespace**: `cache`

**Environment Variables**:

```bash
# Redis Connection
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Cache TTL tiers (milliseconds)
CACHE_TTL_VERY_SHORT=30000      # 30 seconds
CACHE_TTL_SHORT=60000           # 1 minute
CACHE_TTL_MEDIUM=300000         # 5 minutes
CACHE_TTL_LONG=900000           # 15 minutes
CACHE_TTL_VERY_LONG=1800000     # 30 minutes
CACHE_TTL_HOUR=3600000          # 1 hour
CACHE_TTL_DAY=86400000          # 24 hours
```

**Access in Code**:

```typescript
// Redis connection
const host = this.configService.get<string>("cache.redis.host", "localhost");
const port = this.configService.get<number>("cache.redis.port", 6379);
const password = this.configService.get<string>("cache.redis.password");
const db = this.configService.get<number>("cache.redis.db", 0);

// TTL values
const shortTTL = this.configService.get<number>("cache.ttl.short", 60000);
const mediumTTL = this.configService.get<number>("cache.ttl.medium", 300000);
```

**TTL Tier Guidelines**:

- **Very Short (30s)**: Real-time data, user presence
- **Short (1m)**: Frequently changing data, session info
- **Medium (5m)**: Moderately stable data, user profiles
- **Long (15m)**: Stable data, settings
- **Very Long (30m)**: Rarely changing data
- **Hour (1h)**: Static reference data, lookups
- **Day (24h)**: Very static data, constants

**Validation**:

- All TTL values must be positive numbers
- Port must be valid (1-65535)
- DB must be 0-15 (Redis database number)

---

### Security (`security.config`)

JWT, CORS, and Helmet security configuration.

**Namespace**: `security`

**Environment Variables**:

```bash
# JWT
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=*                         # Or specific: https://example.com
CORS_CREDENTIALS=true

# Helmet Security Headers
HELMET_CSP_ENABLED=true
HELMET_CSP_DEFAULT_SRC=self
HELMET_CSP_STYLE_SRC=self,unsafe-inline
HELMET_CSP_SCRIPT_SRC=self,unsafe-inline
HELMET_CSP_IMG_SRC=self,data:,https:
HELMET_CROSS_ORIGIN_EMBEDDER_POLICY=false
HELMET_CROSS_ORIGIN_OPENER_POLICY=false
HELMET_CROSS_ORIGIN_RESOURCE_POLICY=false
```

**Access in Code**:

```typescript
// JWT
const jwtSecret = this.configService.get<string>("security.jwt.secret");
const jwtExpires = this.configService.get<string>("security.jwt.expiresIn", "15m");

// CORS
const corsOrigin = this.configService.get<string | string[]>("security.cors.origin", "*");
const corsCredentials = this.configService.get<boolean>("security.cors.credentials", true);

// Helmet
const cspEnabled = this.configService.get<boolean>("security.helmet.contentSecurityPolicy", true);
```

**Validation**:

- `jwt.secret`: Minimum 32 characters (enforced by Zod)
- `jwt.refreshSecret`: Minimum 32 characters, must differ from `jwt.secret`
- `jwt.expiresIn`: Valid time string (15m, 1h, 1d, etc.)
- `cors.origin`: String or array of strings

**Security Best Practices**:

- Generate JWT secrets using: `openssl rand -base64 64`
- Never use `CORS_ORIGIN=*` in production
- Set short JWT expiration in production (15m recommended)
- Enable all Helmet protections in production
- Rotate JWT secrets periodically

---

### Observability (`observability.config`)

Logging and health check configuration.

**Namespace**: `observability`

**Environment Variables**:

```bash
# Logging
LOG_LEVEL=info                       # error|warn|info|http|verbose|debug|silly
LOG_DIR=./logs
LOG_FILE_MAX_SIZE=10485760           # 10MB in bytes
LOG_FILE_MAX_FILES=5
LOG_TIMESTAMP_FORMAT=YYYY-MM-DD HH:mm:ss
LOG_APP_FILENAME=application.log
LOG_ERROR_FILENAME=error.log

# Health Checks
HEALTH_MEMORY_HEAP_MB=150            # Heap threshold in MB
HEALTH_MEMORY_RSS_MB=300             # RSS threshold in MB
HEALTH_DISK_THRESHOLD=0.9            # Disk usage threshold (0-1)
HEALTH_DISK_PATH=/                   # Path to monitor
```

**Access in Code**:

```typescript
// Logging
const logLevel = this.configService.get<string>("observability.logging.level", "info");
const logDir = this.configService.get<string>("observability.logging.dir", "./logs");
const maxSize = this.configService.get<number>("observability.logging.fileMaxSize", 10485760);

// Health
const heapThreshold = this.configService.get<number>("observability.health.memoryHeapMB", 150);
const rssThreshold = this.configService.get<number>("observability.health.memoryRssMB", 300);
const diskThreshold = this.configService.get<number>("observability.health.diskThreshold", 0.9);
```

**Log Levels**:

- **error**: Critical errors only
- **warn**: Warnings and errors
- **info**: General information (recommended for production)
- **http**: HTTP request logs
- **verbose**: Detailed information
- **debug**: Debug information (development only)
- **silly**: Everything (very verbose)

**Health Check Thresholds**:

- Adjust based on your container/server resources
- Monitor actual usage and set appropriate limits
- Health endpoints: `/health`, `/health/liveness`, `/health/readiness`

---

### Rate Limiting (`throttle.config`)

Multi-tier rate limiting configuration.

**Namespace**: `throttle`

**Environment Variables**:

```bash
# Short: Burst protection (1 second window)
THROTTLE_SHORT_TTL=1000
THROTTLE_SHORT_LIMIT=10

# Medium: Sustained usage (10 second window)
THROTTLE_MEDIUM_TTL=10000
THROTTLE_MEDIUM_LIMIT=50

# Long: Overall limit (60 second window)
THROTTLE_LONG_TTL=60000
THROTTLE_LONG_LIMIT=200

# Strict: Critical operations (1 second window)
THROTTLE_STRICT_TTL=1000
THROTTLE_STRICT_LIMIT=5
```

**Access in Code**:

```typescript
const shortTTL = this.configService.get<number>("throttle.short.ttl", 1000);
const shortLimit = this.configService.get<number>("throttle.short.limit", 10);

const strictLimit = this.configService.get<number>("throttle.strict.limit", 5);
```

**Usage in Controllers**:

```typescript
import { Throttle } from '@nestjs/throttler';

// Use specific tier
@Throttle({ short: { limit: 10, ttl: 1000 } })
@Get('resource')
getResource() {
  // Allows 10 requests per second
}

// Multiple tiers
@Throttle({
  short: { limit: 10, ttl: 1000 },
  medium: { limit: 50, ttl: 10000 }
})
@Post('action')
performAction() {
  // Must satisfy both limits
}
```

**Tier Guidelines**:

- **Short**: Prevent rapid-fire requests (10 req/sec)
- **Medium**: Normal usage protection (50 req/10sec)
- **Long**: Overall API limit (200 req/min)
- **Strict**: Sensitive operations (5 req/sec)

---

### Pagination (`pagination.config`)

Default pagination settings for list endpoints.

**Namespace**: `pagination`

**Environment Variables**:

```bash
PAGINATION_DEFAULT_LIMIT=10      # Default items per page
PAGINATION_MAX_LIMIT=100         # Maximum items per page
PAGINATION_DEFAULT_PAGE=1        # Default page number
```

**Access in Code**:

```typescript
const defaultLimit = this.configService.get<number>("pagination.defaultLimit", 10);
const maxLimit = this.configService.get<number>("pagination.maxLimit", 100);
const defaultPage = this.configService.get<number>("pagination.defaultPage", 1);
```

**Validation**:

- All values must be positive integers
- `maxLimit` should be greater than `defaultLimit`
- Consider performance when setting `maxLimit`

---

### API Documentation (`swagger.config`)

Swagger/OpenAPI documentation configuration.

**Namespace**: `swagger`

**Environment Variables**:

```bash
SWAGGER_ENABLED=true
SWAGGER_PATH=docs
SWAGGER_TITLE=NestJS Skeleton API
SWAGGER_DESCRIPTION=A production-ready NestJS REST API
SWAGGER_VERSION=1.0
SWAGGER_CONTACT_NAME=API Support
SWAGGER_CONTACT_EMAIL=support@example.com
SWAGGER_CONTACT_URL=https://github.com/jwstjacques
```

**Access in Code**:

```typescript
const enabled = this.configService.get<boolean>("swagger.enabled", true);
const path = this.configService.get<string>("swagger.path", "docs");
const title = this.configService.get<string>("swagger.title", "API");
```

**Production Recommendations**:

- Set `SWAGGER_ENABLED=false` in production
- Or protect Swagger route with authentication
- Access at: `http://localhost:3000/api/v1/docs`

## Environment-Specific Configuration

### Development

```bash
NODE_ENV=development
LOG_LEVEL=debug
SWAGGER_ENABLED=true
CORS_ORIGIN=*
DATABASE_SSL=false
```

### Staging

```bash
NODE_ENV=staging
LOG_LEVEL=info
SWAGGER_ENABLED=true  # Protected by auth
CORS_ORIGIN=https://staging.example.com
DATABASE_SSL=true
JWT_EXPIRES_IN=15m
```

### Production

```bash
NODE_ENV=production
LOG_LEVEL=warn
SWAGGER_ENABLED=false
CORS_ORIGIN=https://app.example.com
DATABASE_SSL=true
JWT_EXPIRES_IN=15m
HELMET_CSP_ENABLED=true
```

## Validation and Error Handling

### Startup Validation

All configuration is validated at application startup using Zod schemas. If validation fails, the application will not start.

**Example Error**:

```
[Nest] ERROR [ExceptionsHandler] Configuration validation error:
- database.url: Required
- jwt.secret: String must contain at least 32 character(s)
```

### Schema Validation Features

- **Type Coercion**: String environment variables converted to numbers/booleans
- **Required Fields**: Must be present or have defaults
- **Format Validation**: URLs, emails, time strings validated
- **Range Validation**: Numbers checked against min/max
- **Default Values**: Applied when env vars are missing

### Runtime Access Safety

```typescript
// Safe access with default
const value = this.configService.get<number>("app.port", 3000);

// Throws if missing (use for required config)
const secret = this.configService.getOrThrow<string>("security.jwt.secret");
```

## Testing Configuration

### Test Configuration Mock

Located at `test/utils/config.mock.ts`:

```typescript
import { createMockConfigService } from "@test/utils/config.mock";

// Use default test config
const config = createMockConfigService();

// Override specific values
const config = createMockConfigService({
  "app.port": 4000,
  "database.url": "postgresql://test-db",
});
```

### Test Setup

```typescript
import { ConfigService } from "@nestjs/config";
import { createMockConfigService } from "@test/utils/config.mock";

describe("MyService", () => {
  let service: MyService;
  let config: ConfigService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MyService,
        {
          provide: ConfigService,
          useValue: createMockConfigService(),
        },
      ],
    }).compile();

    service = module.get<MyService>(MyService);
  });
});
```

### Integration Tests

Integration tests use actual DATABASE_URL from `.env`:

```typescript
// test/setup.ts loads .env automatically
// Config mock uses process.env.DATABASE_URL for real database tests
```

## Best Practices

### 1. Environment Variables

✅ **Do**:

- Use `.env` for local development
- Use secret management systems in production (AWS Secrets Manager, Azure Key Vault, etc.)
- Validate all configuration at startup
- Provide sensible defaults where appropriate
- Document all environment variables

❌ **Don't**:

- Commit `.env` files to version control
- Store secrets in code
- Use production credentials in development
- Hardcode configuration values

### 2. Security

✅ **Do**:

- Generate strong random secrets (32+ characters)
- Use different secrets for different environments
- Rotate secrets periodically
- Restrict CORS origins in production
- Enable SSL for database connections in production
- Disable Swagger in production (or protect it)

❌ **Don't**:

- Use default or weak secrets
- Allow `CORS_ORIGIN=*` in production
- Expose sensitive config in logs
- Share secrets across teams without rotation

### 3. Configuration Access

✅ **Do**:

- Inject `ConfigService` in constructors
- Use namespaced config keys (`app.port` not `PORT`)
- Provide default values for optional config
- Use `getOrThrow()` for required configuration
- Type configuration values properly

❌ **Don't**:

- Access `process.env` directly in application code
- Use magic strings for config keys
- Assume configuration exists without validation
- Mix configuration concerns

### 4. Performance

✅ **Do**:

- Use `cache: true` in ConfigModule (enabled by default)
- Load configuration once at startup
- Use appropriate cache TTL values
- Set reasonable rate limits

❌ **Don't**:

- Reload configuration on every request
- Use excessively long cache TTLs for dynamic data
- Set unrealistic rate limits

## Migration Guide

### From Direct process.env Usage

**Before**:

```typescript
const port = parseInt(process.env.PORT || "3000", 10);
const dbUrl = process.env.DATABASE_URL;
```

**After**:

```typescript
constructor(private configService: ConfigService) {}

const port = this.configService.get<number>('app.port', 3000);
const dbUrl = this.configService.get<string>('database.url');
```

### From Old Config Files

**Before**:

```typescript
import { PAGINATION_DEFAULT_LIMIT } from "./config/pagination.config";
```

**After**:

```typescript
constructor(private configService: ConfigService) {}

const limit = this.configService.get<number>('pagination.defaultLimit', 10);
```

### Adding New Configuration

1. **Create/Update Schema** (`src/config/schemas/feature.schema.ts`):

```typescript
import { z } from "zod";

export const FeatureConfigSchema = z.object({
  enabled: z.boolean().default(true),
  apiKey: z.string().min(20),
});

export type FeatureConfig = z.infer<typeof FeatureConfigSchema>;
```

2. **Create Provider** (`src/config/providers/feature.config.ts`):

```typescript
import { registerAs } from "@nestjs/config";
import { FeatureConfigSchema } from "../schemas/feature.schema";

export default registerAs("feature", () => {
  const config = {
    enabled: process.env.FEATURE_ENABLED,
    apiKey: process.env.FEATURE_API_KEY,
  };
  return FeatureConfigSchema.parse(config);
});
```

3. **Register in AppConfigModule** (`src/config/config.module.ts`):

```typescript
import featureConfig from './providers/feature.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [
        // ... other configs
        featureConfig,
      ],
    }),
  ],
})
```

4. **Add to .env.example**:

```bash
# Feature Configuration
FEATURE_ENABLED=true
FEATURE_API_KEY=your-api-key-here
```

5. **Use in Application**:

```typescript
constructor(private configService: ConfigService) {}

const enabled = this.configService.get<boolean>('feature.enabled', true);
const apiKey = this.configService.get<string>('feature.apiKey');
```

## Troubleshooting

### Application Won't Start

**Symptom**: App crashes on startup with validation error

**Solution**: Check the error message for which config is invalid:

```bash
[Nest] ERROR Configuration validation error:
- jwt.secret: String must contain at least 32 character(s)
```

Fix the corresponding environment variable in `.env`.

### Configuration Not Loading

**Symptom**: Default values always used, environment variables ignored

**Solution**:

1. Ensure `.env` file exists in project root
2. Check `.env` file has correct syntax (no quotes for most values)
3. Restart the application (changes to `.env` require restart)
4. Verify environment variable names match exactly

### Type Errors

**Symptom**: TypeScript errors when accessing config

**Solution**:

```typescript
// Always specify types
const port = this.configService.get<number>("app.port", 3000);

// For arrays or complex types
const origins = this.configService.get<string[]>("security.cors.origin", ["*"]);
```

### Test Failures

**Symptom**: Tests fail with "ConfigService.get is not a function"

**Solution**: Ensure ConfigService is mocked in tests:

```typescript
import { createMockConfigService } from "@test/utils/config.mock";

providers: [
  {
    provide: ConfigService,
    useValue: createMockConfigService(),
  },
];
```

## Additional Resources

- [NestJS Configuration Documentation](https://docs.nestjs.com/techniques/configuration)
- [Zod Documentation](https://zod.dev/)
- [12-Factor App Methodology](https://12factor.net/config)
- [Environment Variables Best Practices](https://12factor.net/config)

## Support

For questions or issues:

- Review this documentation
- Check `.env.example` for all available variables
- See `src/config/schemas/` for validation rules
- Open an issue on GitHub

---

**Last Updated**: December 2024  
**Version**: 1.0  
**Maintained By**: NestJS Skeleton Team
