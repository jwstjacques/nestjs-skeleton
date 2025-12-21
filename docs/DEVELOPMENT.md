# Development Guide

## Prerequisites

- Node.js 20.x or higher
- npm 10.x or higher
- Docker and Docker Compose (for database)
- Git

## Development Workflow

### Environment Setup

**Quick Start**:

```bash
# Use pre-configured development settings
cp .env.development.example .env
```

This provides developer-friendly defaults:

- Relaxed rate limiting (100/500/2000 requests)
- Verbose logging (`LOG_LEVEL=debug`)
- Long JWT expiration (24h access, 30d refresh)
- Multiple CORS origins allowed
- Development database (`taskdb`)

**Customized Setup**:

```bash
# Start from detailed template
cp .env.template .env
# Edit variables following inline documentation
```

**Generate Secure Secrets** (for JWT authentication):

```bash
# Generate JWT access token secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate JWT refresh token secret (use different value)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Verify Configuration**:

All environment variables are validated at startup using Zod schemas. If validation fails, you'll see detailed error messages indicating which variables are invalid or missing.

For complete variable reference, see [Environment Variables Guide](./ENVIRONMENT_VARIABLES.md).

### Starting Development

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run start:dev
```

## API Documentation

### Swagger UI

Interactive API documentation is available at:

- **URL**: <http://localhost:3000/api/v1/docs>
- **Features**:
  - Try-it-out functionality for all endpoints
  - Request/response schemas
  - Authentication testing
  - Alpha-sorted tags and operations

### Exporting OpenAPI Specification

Generate the OpenAPI JSON specification:

```bash
npm run openapi:export
```

This creates `docs/openapi.json` which can be:

- Imported into Postman or Insomnia
- Used for client code generation
- Shared with frontend developers
- Versioned in Git for API contract tracking

### API Client Generation

You can generate typed API clients from the exported specification:

```bash
# TypeScript/JavaScript
npx @openapitools/openapi-generator-cli generate \
  -i docs/openapi.json \
  -g typescript-axios \
  -o ./generated/api-client

# Python
openapi-generator generate \
  -i docs/openapi.json \
  -g python \
  -o ./generated/python-client
```

## Customizing the Skeleton

This project is a **skeleton/boilerplate** designed to be customized for your specific needs. The included **Tasks module** serves as a reference implementation.

### Module Development Workflow

When creating your own modules:

1. **Plan Your Module**
   - Define the data model (Prisma schema)
   - Design the API endpoints
   - Plan validation rules and business logic

2. **Create the Module**
   - Use NestJS CLI: `nest g resource <name>` OR
   - Copy the Tasks module structure as a template
   - See [CUSTOMIZATION.md](./CUSTOMIZATION.md) for detailed instructions

3. **Implement Core Patterns**
   - **Constants**: Module-specific constants file
   - **Exceptions**: Custom exceptions extending `ApplicationException`
   - **DAL Layer**: Separate data access from business logic
   - **DTOs**: Input validation with `class-validator`
   - **Swagger**: Complete API documentation with decorators
   - **Tests**: Unit tests for all components + E2E tests for endpoints

4. **Update Documentation**
   - Add endpoint documentation
   - Update Swagger tags and descriptions
   - Add API examples
   - Update Postman collection

### Example Module Reference

The **Tasks module** (`src/modules/tasks`) demonstrates:

- ✅ Complete CRUD operations with pagination
- ✅ Custom endpoints (statistics)
- ✅ Proper DAL layer separation
- ✅ Comprehensive DTO validation
- ✅ Full Swagger documentation
- ✅ 100% test coverage (unit + E2E)
- ✅ Error handling patterns

**Study this module** to understand the patterns, then adapt them for your own needs.

### Removing the Tasks Module

If you don't need the Tasks module:

1. See the [CUSTOMIZATION.md](./CUSTOMIZATION.md) guide for complete removal instructions
2. The guide includes 8 detailed steps with commands
3. Covers: files, database schema, tests, coverage thresholds, and documentation

### Hot Reload

The development server uses hot reload. Changes to TypeScript files trigger automatic recompilation:

```bash
npm run start:dev
# Server watches for file changes and auto-restarts
```

### Database Changes

When you modify the Prisma schema:

```bash
# Push changes to development database
npm run prisma:push

# OR create a migration for production
npm run migrate:dev

# Regenerate Prisma Client
npm run prisma:generate
```

### Code Quality

Run quality checks before committing:

```bash
# Lint
npm run lint

# Format
npm run format

# Type check
npm run build

# All tests
npm test
npm run test:e2e
```

## Related Documentation

- [Customization Guide](./CUSTOMIZATION.md) - Detailed instructions for adapting the skeleton
- [Testing Guide](./TESTING.md) - Testing patterns and best practices
- [Database Guide](./DATABASE.md) - Prisma and database management
- [API Examples](./API_EXAMPLES.md) - Request/response examples
