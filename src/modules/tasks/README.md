# Tasks Module

## Overview

This is a **reference implementation** showing how to build a complete NestJS module with all best practices.

**Purpose**: Use this module as a template for building your own modules.

## Features Demonstrated

- Complete CRUD operations with soft delete
- Pagination, filtering, and sorting
- Redis caching with invalidation
- JWT authentication and ownership verification
- Input validation with class-validator
- Custom exceptions with error codes
- Full Swagger documentation
- > 95% test coverage

## File Structure

```
tasks/
├── constants/
│   ├── task.constants.ts              # API tags, swagger docs, cache keys, messages
│   ├── task-error-codes.constants.ts  # Module error codes enum
│   └── index.ts                       # Barrel export
├── dto/
│   ├── create-task.dto.ts
│   ├── update-task.dto.ts
│   ├── query-task.dto.ts
│   ├── task-response.dto.ts
│   └── index.ts                       # Barrel export
├── exceptions/
│   ├── task.exceptions.ts             # TaskNotFoundException, TaskForbiddenException
│   └── index.ts                       # Barrel export
├── tasks.dal.ts                       # Data Access Layer (Prisma)
├── tasks.service.ts                   # Business logic
├── tasks.controller.ts                # HTTP endpoints
├── tasks.module.ts                    # Module definition
└── README.md                          # This file
```

## API Endpoints

| Method | Endpoint                  | Description             | Auth     |
| ------ | ------------------------- | ----------------------- | -------- |
| POST   | `/api/v1/tasks`           | Create a new task       | Required |
| GET    | `/api/v1/tasks`           | List tasks (paginated)  | Required |
| GET    | `/api/v1/tasks/:id`       | Get single task by ID   | Required |
| PATCH  | `/api/v1/tasks/:id`       | Update task             | Required |
| DELETE | `/api/v1/tasks/:id`       | Soft delete task        | Required |
| DELETE | `/api/v1/tasks/:id/purge` | Permanently delete task | Admin    |

## Usage Examples

### Create Task

```bash
POST /api/v1/tasks
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "title": "Complete project documentation",
  "description": "Write comprehensive README files",
  "priority": "HIGH",
  "status": "TODO"
}
```

### List Tasks with Filters

```bash
GET /api/v1/tasks?page=1&limit=10&status=TODO&priority=HIGH&sortBy=createdAt&sortOrder=desc
Authorization: Bearer YOUR_JWT_TOKEN
```

### Update Task

```bash
PATCH /api/v1/tasks/:id
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "status": "IN_PROGRESS"
}
```

### Delete Task (Soft Delete)

```bash
DELETE /api/v1/tasks/:id
Authorization: Bearer YOUR_JWT_TOKEN
```

## Database Schema

```prisma
model Task {
  id          String       @id @default(cuid())
  title       String
  description String?
  status      TaskStatus   @default(TODO)
  priority    TaskPriority @default(MEDIUM)
  userId      String
  user        User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  dueDate     DateTime?
  completedAt DateTime?
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  deletedAt   DateTime?

  @@index([userId])
  @@index([status])
  @@index([priority])
  @@index([createdAt])
  @@map("tasks")
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

enum TaskPriority {
  LOW
  MEDIUM
  HIGH
}
```

## Architecture

```
Controller → Service → DAL → Prisma → Database
    ↓          ↓        ↓
  Swagger   Business  Data
   Docs      Logic   Access
```

- **Controller**: HTTP routing, request validation, Swagger docs
- **Service**: Business logic, caching, orchestration
- **DAL**: Database queries, Prisma operations
- **DTOs**: Data validation, type safety, API contracts

## Testing

```bash
# Unit tests
npm test -- tasks

# E2E tests
npm run test:e2e -- tasks
```

## Using as Template

To create a new module based on this one, use the generator:

```bash
npm run generate:module products
```

This creates all files with proper structure and a README with setup checklist.
