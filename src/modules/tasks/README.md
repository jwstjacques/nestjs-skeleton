# Tasks Module

## Overview

This is a **reference implementation** showing how to build a complete NestJS module with all best practices.

**Purpose**: This module serves as a template for building your own modules. You can:

- ✅ Keep it as an example reference
- ✅ Use it as a starting point for similar features
- ✅ Remove it if not needed (see [CUSTOMIZATION.md](../../docs/CUSTOMIZATION.md))

## Features Demonstrated

### ✅ Complete CRUD Operations

- Create task (POST)
- Read task (GET single)
- List tasks (GET paginated)
- Update task (PATCH)
- Delete task (DELETE soft delete)
- Purge task (DELETE permanent)

### ✅ Advanced Querying

- **Pagination**: `page`, `limit` parameters
- **Filtering**: By `status`, `priority`, `userId`
- **Sorting**: Any field with `sortBy` and `sortOrder` (ASC/DESC)
- **Search**: Across `title` and `description` fields

### ✅ Performance Optimizations

- Redis caching for list and single item queries
- Cache invalidation on create/update/delete
- Efficient database queries with Prisma
- Proper indexes on database tables

### ✅ Security & Validation

- JWT authentication required on all endpoints
- User ownership verification (users can only access their own tasks)
- Input validation with class-validator
- CUID validation for ID parameters
- SQL injection prevention via Prisma ORM

### ✅ Error Handling

- Custom exceptions extending `ApplicationException`
- Module-specific error codes
- Consistent error response format
- Proper HTTP status codes
- Correlation IDs for tracking

### ✅ API Documentation

- Complete Swagger/OpenAPI specifications
- Request/response examples
- Error response documentation
- Interactive API docs at `/api/v1/docs`

### ✅ Testing

- > 95% code coverage
- Unit tests for all components (service, controller, DAL)
- E2E tests for all endpoints
- Mock services and test data factories
- Test utilities for common assertions

## Architecture

### Layer Pattern

```
Controller → Service → DAL → Prisma → Database
    ↓          ↓        ↓
  Swagger   Business  Data
   Docs      Logic   Access
```

### Responsibilities

- **Controller**: HTTP routing, request validation, Swagger docs
- **Service**: Business logic, caching, orchestration
- **DAL**: Database queries, Prisma operations
- **DTOs**: Data validation, type safety, API contracts

### File Structure

```
tasks/
├── constants/
│   └── tasks.constants.ts          # Swagger tags, API paths
├── dto/
│   ├── create-task.dto.ts          # Task creation payload
│   ├── update-task.dto.ts          # Task update payload
│   ├── query-tasks.dto.ts          # Query parameters (pagination, filters)
│   └── task-response.dto.ts        # API response structure
├── entities/
│   └── task.entity.ts              # Prisma Task type
├── enums/
│   ├── task-priority.enum.ts       # LOW, MEDIUM, HIGH
│   └── task-status.enum.ts         # TODO, IN_PROGRESS, COMPLETED, CANCELLED
├── exceptions/
│   └── task.exceptions.ts          # Task-specific exceptions
├── tasks.controller.ts             # HTTP endpoints
├── tasks.service.ts                # Business logic
├── tasks.dal.ts                    # Database queries
├── tasks.module.ts                 # Module definition
└── README.md                       # This file
```

## API Endpoints

| Method | Endpoint                  | Description             | Auth     |
| ------ | ------------------------- | ----------------------- | -------- |
| POST   | `/api/v1/tasks`           | Create a new task       | Required |
| GET    | `/api/v1/tasks`           | List tasks (paginated)  | Required |
| GET    | `/api/v1/tasks/:id`       | Get single task by ID   | Required |
| PATCH  | `/api/v1/tasks/:id`       | Update task             | Required |
| DELETE | `/api/v1/tasks/:id`       | Soft delete task        | Required |
| DELETE | `/api/v1/tasks/:id/purge` | Permanently delete task | Required |

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

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "cmixpvpir0001p9yp5xq8r7ks",
    "title": "Complete project documentation",
    "description": "Write comprehensive README files",
    "priority": "HIGH",
    "status": "TODO",
    "userId": "cm1a2b3c4d5e6f7g8h9i0j1k",
    "createdAt": "2025-12-16T10:00:00.000Z",
    "updatedAt": "2025-12-16T10:00:00.000Z",
    "deletedAt": null
  },
  "message": "Task created successfully"
}
```

### List Tasks with Filters

```bash
GET /api/v1/tasks?page=1&limit=10&status=TODO&priority=HIGH&sortBy=createdAt&sortOrder=DESC
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "id": "cmixpvpir0001p9yp5xq8r7ks",
      "title": "Complete project documentation",
      "status": "TODO",
      "priority": "HIGH",
      "createdAt": "2025-12-16T10:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

### Update Task

```bash
PATCH /api/v1/tasks/cmixpvpir0001p9yp5xq8r7ks
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "status": "IN_PROGRESS",
  "description": "Updated: Working on documentation now"
}
```

### Delete Task (Soft Delete)

```bash
DELETE /api/v1/tasks/cmixpvpir0001p9yp5xq8r7ks
Authorization: Bearer YOUR_JWT_TOKEN
```

**Note**: Task is marked as deleted but can be recovered (sets `deletedAt` timestamp).

### Purge Task (Permanent Delete)

```bash
DELETE /api/v1/tasks/cmixpvpir0001p9yp5xq8r7ks/purge
Authorization: Bearer YOUR_JWT_TOKEN
```

**Warning**: Task is permanently removed from database. Cannot be recovered.

## Database Schema

```prisma
model Task {
  id          String       @id @default(cuid())
  title       String
  description String?
  status      TaskStatus   @default(TODO)
  priority    TaskPriority @default(MEDIUM)
  userId      String
  user        User         @relation(fields: [userId], references: [id])
  dueDate     DateTime?
  completedAt DateTime?
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  deletedAt   DateTime?

  @@index([userId])
  @@index([status])
  @@index([priority])
  @@index([deletedAt])
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

## Key Implementation Details

### 1. Validation

All DTOs use class-validator decorators:

```typescript
// create-task.dto.ts
export class CreateTaskDto {
  @ApiProperty({ example: "Complete documentation" })
  @IsNotEmpty({ message: "Title is required" })
  @IsString({ message: "Title must be a string" })
  @MinLength(3, { message: "Title must be at least 3 characters" })
  @MaxLength(200, { message: "Title cannot exceed 200 characters" })
  title: string;

  @ApiPropertyOptional({ example: "Write comprehensive README" })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ enum: TaskStatus, example: TaskStatus.TODO })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus = TaskStatus.TODO;

  @ApiPropertyOptional({ enum: TaskPriority, example: TaskPriority.MEDIUM })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority = TaskPriority.MEDIUM;
}
```

### 2. Caching Strategy

```typescript
// tasks.service.ts
async findById(id: string, userId: string) {
  const cacheKey = `tasks:${id}`;

  // Try cache first
  const cached = await this.cacheManager.get<Task>(cacheKey);
  if (cached) {
    this.logger.log(`Cache hit for task: ${id}`);
    return cached;
  }

  // Fetch from database
  const task = await this.tasksDal.findById(id);

  // Verify ownership
  if (task.userId !== userId) {
    throw new TaskForbiddenException(id);
  }

  // Cache for 5 minutes
  await this.cacheManager.set(cacheKey, task, 300_000);

  return task;
}
```

### 3. Error Handling

```typescript
// exceptions/task.exceptions.ts
export class TaskNotFoundException extends ApplicationException {
  constructor(id: string) {
    super(TaskErrorCode.TASK_NOT_FOUND, `Task not found: ${id}`, HttpStatus.NOT_FOUND);
  }
}

export class TaskForbiddenException extends ApplicationException {
  constructor(taskId?: string) {
    super(
      TaskErrorCode.TASK_FORBIDDEN,
      taskId ? `You do not have permission to access task: ${taskId}` : "Access forbidden",
      HttpStatus.FORBIDDEN,
    );
  }
}
```

### 4. Query Building

```typescript
// tasks.dal.ts
async findMany(params: FindManyTasksParams) {
  const { skip, take, userId, status, priority, sortBy, sortOrder } = params;

  return this.prisma.task.findMany({
    where: {
      userId,
      deletedAt: null, // Only active tasks
      ...(status && { status }),
      ...(priority && { priority }),
    },
    orderBy: sortBy ? { [sortBy]: sortOrder || 'desc' } : { createdAt: 'desc' },
    skip,
    take,
  });
}
```

## Testing

### Unit Tests

```bash
# Test service
npm test -- tasks.service

# Test controller
npm test -- tasks.controller

# Test DAL
npm test -- tasks.dal
```

**Coverage**: >95% for all components

### E2E Tests

```bash
# Run E2E tests
npm run test:e2e -- tasks
```

Tests cover:

- All CRUD operations
- Authentication requirements
- Ownership verification
- Pagination and filtering
- Error scenarios (404, 403, 400)

### Example Test

```typescript
describe("TasksService", () => {
  let service: TasksService;
  let mockTasksDal: jest.Mocked<TasksDal>;

  it("should create a task", async () => {
    const dto: CreateTaskDto = {
      title: "Test Task",
      priority: TaskPriority.HIGH,
    };
    const userId = "user-123";

    mockTasksDal.create.mockResolvedValue(mockTask);

    const result = await service.create(dto, userId);

    expect(result).toEqual(mockTask);
    expect(mockTasksDal.create).toHaveBeenCalledWith({
      ...dto,
      userId,
      status: TaskStatus.TODO,
    });
  });
});
```

## Customization Guide

### To Adapt This Module

1. **Rename Files**:

   ```bash
   # Use find/replace
   find src/modules/tasks -type f -name "tasks.*" -exec rename 's/tasks/your-module/' {} \;
   ```

2. **Update Imports**:

   ```typescript
   // Change all references
   TasksService → YourModuleService
   TasksDal → YourModuleDal
   Task → YourEntity
   ```

3. **Modify Schema**:

   ```prisma
   // Update in prisma/schema.prisma
   model YourEntity {
     id    String @id @default(cuid())
     // Your fields...
   }
   ```

4. **Update DTOs**:

   ```typescript
   // Adjust validation rules for your data model
   export class CreateYourEntityDto {
     @IsNotEmpty()
     @IsString()
     name: string;

     // Your fields...
   }
   ```

5. **Run Migration**:

   ```bash
   npm run prisma:migrate:dev
   ```

6. **Update Tests**:
   - Modify mock data
   - Update test assertions
   - Adjust E2E scenarios

### To Remove This Module

See [CUSTOMIZATION.md](../../docs/CUSTOMIZATION.md) for complete removal instructions.

## Related Documentation

- [Module Creation Checklist](../../docs/MODULE-CREATION-CHECKLIST.md) - Step-by-step guide
- [Architecture Patterns](../../docs/architecture/PATTERNS.md) - Design patterns used
- [Tasks Module Guide](../../docs/examples/TASKS_MODULE_GUIDE.md) - Complete usage examples
- [Testing Guide](../../docs/TESTING.md) - Testing strategies
- [Development Guide](../../docs/DEVELOPMENT.md) - Development workflow

## Common Questions

**Q: Can I remove this module?**  
A: Yes! See [CUSTOMIZATION.md](../../docs/CUSTOMIZATION.md) for instructions.

**Q: How do I add a new field?**  
A: Update Prisma schema → Create migration → Update DTOs → Update tests.

**Q: How do I add authentication?**  
A: Already implemented! All endpoints require JWT tokens.

**Q: How do I implement caching?**  
A: See the caching strategy section above. Redis is already configured.

**Q: How do I add pagination to my module?**  
A: Extend `PaginationDto` in your query DTO (see `query-tasks.dto.ts`).

---

**Last Updated**: December 16, 2025  
**Module Status**: Reference Implementation  
**Test Coverage**: >95%
