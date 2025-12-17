# NestJS API Skeleton

A production-ready, full-featured NestJS API skeleton with authentication, caching, comprehensive testing, and error handling.

## 🎯 Purpose

This skeleton provides a complete foundation for building any REST API with NestJS. It includes:

- ✅ **JWT Authentication** - Complete auth system with refresh tokens
- ✅ **User Management** - User registration, login, and profile management
- ✅ **Database Integration** - PostgreSQL with Prisma ORM
- ✅ **Redis Caching** - High-performance caching layer
- ✅ **Comprehensive Testing** - >99% code coverage with unit and E2E tests
- ✅ **Production-Ready Error Handling** - Custom exceptions and global filters
- ✅ **API Documentation** - Swagger/OpenAPI specification
- ✅ **Docker Support** - Containerized development environment
- ✅ **Configuration Management** - Environment-based config with validation
- ✅ **Health Checks** - Database and Redis health monitoring
- ✅ **Rate Limiting** - Multiple throttling strategies
- ✅ **Security** - Helmet, CORS, input validation
- ✅ **Logging** - Winston logger with correlation IDs
- ✅ **Code Quality** - ESLint, Prettier, Husky git hooks
- ✅ **CI/CD** - GitHub Actions workflow

## 📦 Example Module Included

The skeleton includes a complete **Tasks** module as a reference implementation showing:

- Full CRUD operations
- Pagination, filtering, and sorting
- Module-specific exceptions and error codes
- Data validation with class-validator
- Comprehensive unit and E2E tests
- API documentation with Swagger
- DAL (Data Access Layer) pattern

**You can keep, modify, or delete this module** based on your needs. See the [Customization Guide](docs/CUSTOMIZATION.md) for details.

## 🚀 Quick Start

### For New Projects

1. **Clone this repository**

   ```bash
   git clone https://github.com/jwstjacques/nestjs-skeleton.git my-api
   cd my-api
   ```

2. **Customize for your needs**
   - Keep the Tasks module as a reference
   - Or remove it (see [Customization Guide](docs/CUSTOMIZATION.md))
   - Build your own domain modules following the Tasks example

3. **Set up your environment**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start Docker services**

   ```bash
   docker-compose up -d  # Start PostgreSQL and Redis
   ```

5. **Install and setup**

   ```bash
   npm install
   npm run prisma:migrate:dev
   npm run prisma:seed
   ```

6. **Start development**

   ```bash
   npm run start:dev
   ```

7. **Enjoy a production-ready API structure!**

Visit http://localhost:3000/api/docs to see the Swagger documentation.

## 📚 What You Get

### Architecture

- Clean, modular architecture following NestJS best practices
- Separation of concerns (Controllers → Services → DAL → Database)
- Dependency injection throughout
- Configuration management with runtime validation

### Authentication & Authorization

- JWT-based authentication with refresh tokens
- Role-based access control (RBAC)
- Protected routes with guards
- Secure password hashing with bcrypt

### Database

- Prisma ORM for type-safe database access
- PostgreSQL integration with connection pooling
- Migration system for schema management
- Database health checks

### Caching

- Redis integration for performance
- Configurable cache TTL
- Cache invalidation patterns

### Testing

- > 99% code coverage
- Unit tests for all components
- E2E tests for API endpoints
- Test utilities and helpers
- Mock services and data

### Documentation

- Swagger/OpenAPI specification
- Interactive API documentation
- Comprehensive guides in `/docs` folder
- Example implementations

### DevOps

- Docker development environment
- Docker production builds
- Health check endpoints
- Graceful shutdown handling
- CI/CD with GitHub Actions

## 🔧 Customization

This skeleton is designed to be customized for your specific needs:

- **Keep the Tasks module** if building a task management system
- **Remove the Tasks module** to start with just authentication (see guide below)
- **Use Tasks as a template** for building your own domain modules

### Quick Links

- [Customization Guide](docs/CUSTOMIZATION.md) - How to remove/modify the Tasks module
- [Development Guide](docs/DEVELOPMENT.md) - Development workflow and best practices
- [Testing Guide](docs/TESTING.md) - Writing and running tests
- [API Examples](docs/API_EXAMPLES.md) - API usage examples

## 📋 Prerequisites

- Node.js 20.x or higher
- npm 10.x or higher
- Docker and Docker Compose
- PostgreSQL 15.x (via Docker)
- Redis 7.x (via Docker)

## 🛠️ Installation & Setup

### Development Environment

```bash
# 1. Clone repository
git clone https://github.com/jwstjacques/nestjs-skeleton.git
cd nestjs-skeleton

# 2. Install dependencies
npm install

# 3. Copy environment variables
cp .env.example .env
# Edit .env with your configuration

# 4. Start Docker services (PostgreSQL + Redis)
docker-compose up -d

# 5. Run database migrations
npm run prisma:migrate:dev

# 6. Seed database with sample data
npm run prisma:seed

# 7. Start development server
npm run start:dev
```

### Environment Configuration

This skeleton provides multiple environment configuration options:

**Quick Start (Development)**:

```bash
# Use pre-configured development settings
cp .env.development.example .env
```

**From Template (Customized)**:

```bash
# Start from comprehensive template
cp .env.template .env
# Edit variables based on inline documentation
```

**For Production**:

```bash
# Production environments should use secrets manager
# See docs/ENVIRONMENT_VARIABLES.md for details
```

**Environment Files**:

- `.env.example` - Main example with all variables documented
- `.env.template` - Detailed template with explanations
- `.env.development.example` - Development preset (relaxed security, verbose logging)
- `.env.production.example` - Production preset (security-focused, secrets placeholders)
- `.env.test.example` - Test preset (high limits, minimal logging)

For complete variable reference, see [Environment Variables Guide](docs/ENVIRONMENT_VARIABLES.md).

### Verify Installation

```bash
# Check health endpoint
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

## 🏃 Running the Application

```bash
# Development mode (with hot reload)
npm run start:dev

# Production mode
npm run start:prod

# Debug mode
npm run start:debug
```

## 🧪 Testing

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

## 📚 API Documentation

Interactive API documentation is available via Swagger UI:

**Development**: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

**Production**: [https://api.yourdomain.com/api/docs](https://api.yourdomain.com/api/docs)

### OpenAPI Specification

The OpenAPI (Swagger) specification is available at:

- JSON: `/api/docs-json`
- YAML: `/api/docs-yaml`

You can also export the specification:
\`\`\`bash
npm run openapi:export
\`\`\`

This generates `docs/openapi.json` which can be imported into:

- Postman
- Insomnia
- API client generators

### Postman Collection

Import `postman/api-collection.json` into Postman for:

- Pre-configured requests
- Environment variables
- Test workflows
- Example responses

See [Postman Testing Guide](docs/POSTMAN-TESTING-GUIDE.md) for details.

## 📖 Documentation

- [API Examples](docs/API_EXAMPLES.md) - Request/response examples
- [Endpoints](docs/ENDPOINTS.md) - All available endpoints
- [Development Guide](docs/DEVELOPMENT.md) - Development workflow
- [Testing Guide](docs/TESTING.md) - Testing strategies
- [Customization Guide](docs/CUSTOMIZATION.md) - Adapting the skeleton
- [Database Guide](docs/DATABASE.md) - Database setup and migrations
- [Docker Guide](docs/DOCKER.md) - Docker usage
- [Production Guide](docs/PRODUCTION.md) - Deployment best practices

## 📦 Deployment

See the [Production Guide](docs/PRODUCTION.md) for detailed deployment instructions.

### Quick Deploy Options

- **Docker**: Use the included Dockerfile for containerized deployment
- **Traditional**: Deploy to any Node.js hosting platform
- **Cloud Platforms**: AWS, Azure, Google Cloud, Heroku, etc.

## 🤝 Contributing

Contributions are welcome! This skeleton is meant to evolve with best practices.

## 📄 License

This project is [MIT licensed](LICENSE).

## 🙏 Acknowledgments

Built with [NestJS](https://nestjs.com/) - A progressive Node.js framework.

## 📚 Resources

- [NestJS Documentation](https://docs.nestjs.com) - Official NestJS docs
- [Prisma Documentation](https://www.prisma.io/docs) - Prisma ORM docs
- [Jest Documentation](https://jestjs.io/) - Testing framework docs
