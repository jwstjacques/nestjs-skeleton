# Getting Started

This guide walks you through setting up and running the NestJS API Skeleton for the first time.

## Prerequisites

Before you begin, ensure you have:

- **Node.js** 18.x or later
- **npm** 9.x or later
- **Docker** and **Docker Compose**
- A code editor (VS Code recommended)

## Quick Start (5 minutes)

### 1. Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd nestjs-skeleton

# Install dependencies
npm install
```

### 2. Set Up Environment

```bash
# Copy the example environment file
cp .env.example .env
```

The default `.env` works out of the box for local development.

### 3. Start Infrastructure

```bash
# Start PostgreSQL and Redis via Docker
./scripts/docker-start.sh
```

### 4. Set Up Database

```bash
# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate:dev

# (Optional) Seed with demo data
npm run prisma:seed
```

### 5. Start the Application

```bash
# Development mode with hot reload
npm run start:dev
```

### 6. Verify It Works

Open in your browser:

- **API Documentation**: http://localhost:3000/api/docs
- **Health Check**: http://localhost:3000/api/v1/health

You should see:

```json
{
  "status": "ok",
  "info": {
    "database": { "status": "up" },
    "redis": { "status": "up" }
  }
}
```

## First API Calls

### Register a User

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@example.com",
    "password": "Password123!",
    "username": "demo"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@example.com",
    "password": "Password123!"
  }'
```

Save the `accessToken` from the response.

### Create a Task

```bash
curl -X POST http://localhost:3000/api/v1/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "title": "My First Task",
    "description": "Learning the API",
    "priority": "HIGH",
    "status": "TODO"
  }'
```

### List Tasks

```bash
curl http://localhost:3000/api/v1/tasks \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Project Structure

```
nestjs-skeleton/
├── src/
│   ├── auth/           # Authentication (JWT, login, register)
│   ├── common/         # Shared utilities, filters, pipes
│   ├── config/         # Configuration providers
│   ├── database/       # Prisma service
│   ├── health/         # Health check endpoints
│   ├── modules/
│   │   ├── tasks/      # Example CRUD module
│   │   └── users/      # User management
│   ├── app.module.ts   # Root module
│   └── main.ts         # Application entry point
├── prisma/
│   ├── schema.prisma   # Database schema
│   ├── migrations/     # Migration files
│   └── seed.ts         # Seed data
├── test/
│   ├── unit/           # Unit tests
│   └── e2e/            # End-to-end tests
├── docs/               # Documentation
├── scripts/            # Utility scripts
└── postman/            # API collection
```

## Key Concepts

### Modules

The application is organized into feature modules. Each module contains:

- **Controller** - HTTP endpoints
- **Service** - Business logic
- **DAL** - Data Access Layer (Prisma queries)
- **DTOs** - Request/response validation
- **Exceptions** - Custom error types

### Authentication

All endpoints (except `/health` and `/auth/*`) require a JWT token:

```bash
Authorization: Bearer <token>
```

Tokens expire after 15 minutes. Use the refresh token to get a new access token.

### Error Responses

Errors follow a consistent format:

```json
{
  "success": false,
  "error": {
    "statusCode": 404,
    "errorCode": "TASK_NOT_FOUND",
    "message": "Task not found: clxyz123",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "path": "/api/v1/tasks/clxyz123"
  }
}
```

### Pagination

List endpoints support pagination:

```bash
GET /api/v1/tasks?page=1&limit=10&sortBy=createdAt&sortOrder=desc
```

## Development Workflow

### Running Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage report
npm run test:cov
```

### Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format

# Type check
npm run typecheck
```

### Database Operations

```bash
# Create a migration
npm run prisma:migrate:dev -- --name add_feature

# Reset database
npm run prisma:reset

# Open Prisma Studio
npm run prisma:studio
```

## Using Postman

Import the collection for interactive testing:

1. Open Postman
2. File → Import
3. Select `postman/api-collection.json`
4. Set up environment variables

See [postman/POSTMAN-TESTING-GUIDE.md](../postman/POSTMAN-TESTING-GUIDE.md) for details.

## Adding Your First Feature

### Generate a New Module

```bash
./scripts/generate-module.sh products
```

### Add to Database Schema

Edit `prisma/schema.prisma`:

```prisma
model Product {
  id          String   @id @default(cuid())
  name        String
  price       Decimal
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("products")
}
```

### Run Migration

```bash
npm run prisma:migrate:dev -- --name add_products
```

### Register Module

In `src/app.module.ts`:

```typescript
import { ProductsModule } from "./modules/products/products.module";

@Module({
  imports: [
    // ... existing imports
    ProductsModule,
  ],
})
export class AppModule {}
```

### Test Your Endpoint

```bash
curl http://localhost:3000/api/v1/products \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Common Issues

### "ECONNREFUSED" on startup

Docker containers aren't running:

```bash
./scripts/docker-start.sh
```

### "Invalid token"

Token expired. Login again or refresh:

```bash
curl -X POST http://localhost:3000/api/v1/auth/refresh \
  -H "Authorization: Bearer YOUR_REFRESH_TOKEN"
```

### Prisma client errors

Regenerate the client:

```bash
npm run prisma:generate
```

### Port 3000 in use

Change the port in `.env`:

```bash
PORT=3001
```

## Next Steps

1. **Explore the Tasks module** - See [examples/TASKS_MODULE_GUIDE.md](./examples/TASKS_MODULE_GUIDE.md)
2. **Add a new module** - See [MODULE-CREATION-CHECKLIST.md](./MODULE-CREATION-CHECKLIST.md)
3. **Write tests** - See [TESTING.md](./TESTING.md)
4. **Deploy to production** - See [PRODUCTION.md](./PRODUCTION.md)

## Helpful Resources

| Guide                                    | Description                    |
| ---------------------------------------- | ------------------------------ |
| [AUTHENTICATION.md](./AUTHENTICATION.md) | JWT auth, tokens, user roles   |
| [PAGINATION.md](./PAGINATION.md)         | Filtering, sorting, pagination |
| [ERROR_CODES.md](./ERROR_CODES.md)       | All error codes and meanings   |
| [CONFIGURATION.md](./CONFIGURATION.md)   | Environment variables          |
| [DOCKER.md](./DOCKER.md)                 | Container setup                |
