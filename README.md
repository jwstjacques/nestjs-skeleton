# NestJS API Skeleton

A production-ready, full-featured NestJS API skeleton with authentication, caching, comprehensive testing, and error handling.

## Features

- **JWT Authentication** - Complete auth system with refresh tokens
- **User Management** - User registration, login, and profile management
- **Database Integration** - PostgreSQL with Prisma ORM
- **Redis Caching** - High-performance caching layer
- **Comprehensive Testing** - >99% code coverage with unit and E2E tests
- **Production-Ready Error Handling** - Custom exceptions and global filters
- **API Documentation** - Swagger/OpenAPI specification
- **Docker Support** - Containerized development environment
- **Configuration Management** - Environment-based config with validation
- **Health Checks** - Database and Redis health monitoring
- **Rate Limiting** - Multiple throttling strategies
- **Security** - Helmet, CORS, input validation
- **Logging** - Winston logger with correlation IDs
- **Code Quality** - ESLint, Prettier, Husky git hooks
- **CI/CD** - GitHub Actions workflow

## Example Module

The skeleton includes a complete **Tasks** module as a reference implementation showing:

- Full CRUD operations
- Pagination, filtering, and sorting
- Module-specific exceptions and error codes
- Data validation with class-validator
- Comprehensive unit and E2E tests
- API documentation with Swagger
- DAL (Data Access Layer) pattern

## Prerequisites

- Node.js 20.x or higher
- npm 10.x or higher
- Docker and Docker Compose
- PostgreSQL 15.x (via Docker)
- Redis 7.x (via Docker)

## Quick Start

```bash
# 1. Clone repository
git clone https://github.com/jwstjacques/nestjs-skeleton.git
cd nestjs-skeleton

# 2. Install dependencies
npm install

# 3. Copy environment variables
cp .env.example .env

# 4. Start Docker services (PostgreSQL + Redis)
docker-compose up -d

# 5. Run database migrations
npm run prisma:migrate:dev

# 6. Seed database with sample data
npm run prisma:seed

# 7. Start development server
npm run start:dev
```

Visit http://localhost:3000/api/v1/docs to see the Swagger documentation.

### Verify Installation

```bash
curl http://localhost:3000/api/v1/health
```

Expected response:

```json
{
  "status": "ok",
  "timestamp": "2025-12-16T10:30:00.000Z",
  "uptime": 15.123,
  "environment": "development"
}
```

## Running the Application

```bash
# Development mode (with hot reload)
npm run start:dev

# Production mode
npm run start:prod

# Debug mode
npm run start:debug
```

## Testing

```bash
# Run unit tests
npm run test

# Run E2E tests
npm run test:e2e

# Run all tests with coverage
npm run test:cov

# Watch mode for unit tests
npm run test:watch
```

Current coverage: **>99%**

## API Documentation

Interactive API documentation is available via Swagger UI:

- **Development**: http://localhost:3000/api/v1/docs
- **JSON**: `/api/v1/docs-json`
- **YAML**: `/api/v1/docs-yaml`

### Export OpenAPI Specification

```bash
npm run openapi:export
```

This generates `swagger/openapi.json` which can be imported into Postman, Insomnia, or API client generators.

### Postman Collection

Import `postman/api-collection.json` into Postman for pre-configured requests, environment variables, and test workflows.

See [postman/POSTMAN-TESTING-GUIDE.md](postman/POSTMAN-TESTING-GUIDE.md) for details.

## Environment Configuration

Copy `.env.example` to `.env` and adjust values as needed. Key variables:

| Variable             | Description                               | Default     |
| -------------------- | ----------------------------------------- | ----------- |
| `NODE_ENV`           | Environment (development/production/test) | development |
| `PORT`               | Server port                               | 3000        |
| `DATABASE_URL`       | PostgreSQL connection string              | -           |
| `JWT_SECRET`         | JWT signing secret (min 32 chars)         | -           |
| `JWT_REFRESH_SECRET` | Refresh token secret (min 32 chars)       | -           |
| `REDIS_HOST`         | Redis host                                | localhost   |
| `REDIS_PORT`         | Redis port                                | 6379        |
| `SWAGGER_ENABLED`    | Enable Swagger UI                         | true        |
| `SWAGGER_PATH`       | Swagger UI path                           | api/docs    |

See `.env.example` for complete variable documentation.

## Project Structure

```
src/
├── common/           # Shared utilities, decorators, filters
├── config/           # Configuration modules
├── modules/
│   ├── auth/         # Authentication module
│   ├── health/       # Health check endpoints
│   ├── tasks/        # Example CRUD module
│   └── users/        # User management
├── prisma/           # Database schema and migrations
└── main.ts           # Application entry point
```

## Deployment

### Docker

```bash
# Build production image
docker build -t nestjs-api .

# Run container
docker run -p 3000:3000 --env-file .env nestjs-api
```

### Production Checklist

- Set `NODE_ENV=production`
- Generate strong JWT secrets (min 32 chars)
- Configure specific CORS origins
- Enable database SSL
- Set appropriate rate limits
- Configure logging level to `warn` or `error`

## Contributing

Contributions are welcome! This skeleton is meant to evolve with best practices.

## License

This project is [MIT licensed](LICENSE).

## Documentation

Comprehensive documentation is available in the [docs/](docs/) folder:

| Guide                                                     | Description                         |
| --------------------------------------------------------- | ----------------------------------- |
| [Development](docs/DEVELOPMENT.md)                        | Local development setup             |
| [Configuration](docs/CONFIGURATION.md)                    | Environment variables and config    |
| [Authentication](docs/AUTHENTICATION.md)                  | JWT auth, login, registration       |
| [Testing](docs/TESTING.md)                                | Unit tests, E2E tests, coverage     |
| [Debugging](docs/DEBUGGING.md)                            | VS Code breakpoint debugging        |
| [Production](docs/PRODUCTION.md)                          | Deployment, health checks, security |
| [Architecture Patterns](docs/architecture/PATTERNS.md)    | DAL, DTOs, exceptions               |
| [Module Creation](docs/MODULE-CREATION-CHECKLIST.md)      | Adding new modules                  |
| [Tasks Module Guide](docs/examples/TASKS_MODULE_GUIDE.md) | Reference implementation            |

See [docs/README.md](docs/README.md) for the complete documentation index.

## Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Jest Documentation](https://jestjs.io/)
