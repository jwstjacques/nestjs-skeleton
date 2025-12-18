# Architecture Patterns

## Overview

This document describes the key architectural patterns used in the NestJS API Skeleton. These patterns promote code quality, maintainability, and scalability.

---

## Table of Contents

1. [Layered Architecture](#1-layered-architecture)
2. [Repository Pattern (DAL)](#2-repository-pattern-dal)
3. [DTO Pattern](#3-dto-pattern)
4. [Exception Pattern](#4-exception-pattern)
5. [Dependency Injection](#5-dependency-injection)
6. [Caching Strategy](#6-caching-strategy)
7. [Pagination Pattern](#7-pagination-pattern)
8. [Soft Delete Pattern](#8-soft-delete-pattern)
9. [Response Wrapper Pattern](#9-response-wrapper-pattern)
10. [Correlation ID Pattern](#10-correlation-id-pattern)

---

## 1. Layered Architecture

### Pattern

Separate concerns into distinct layers, each with specific responsibilities.

### Implementation

```
Controller Layer    →  HTTP endpoints, routing, validation
     ↓
Service Layer      →  Business logic, orchestration
     ↓
DAL Layer         →  Database queries, data access
     ↓
Prisma            →  ORM, type safety
     ↓
Database          →  PostgreSQL
```

### Example

```typescript
// Controller - handles HTTP
@Controller("tasks")
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: "Create a new task" })
  async create(@Body() dto: CreateTaskDto, @CurrentUser("id") userId: string) {
    return this.tasksService.create(dto, userId);
  }
}

// Service - business logic
@Injectable()
export class TasksService {
  constructor(
    private readonly tasksDal: TasksDal,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(dto: CreateTaskDto, userId: string) {
    // Validation
    if (dto.dueDate && new Date(dto.dueDate) < new Date()) {
      throw new BadRequestException("Due date cannot be in the past");
    }

    // Create task
    const task = await this.tasksDal.create({ ...dto, userId });

    // Invalidate cache
    await this.cacheManager.del("tasks:list");

    return task;
  }
}

// DAL - database queries
@Injectable()
export class TasksDal {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.TaskCreateInput) {
    return this.prisma.task.create({ data });
  }
}
```

### Benefits

✅ Clear separation of concerns  
✅ Easy to test (mock each layer)  
✅ Business logic isolated from HTTP/DB  
✅ Can swap implementations  
✅ Improves maintainability

### When to Use

- ✅ Always use this pattern for all modules
- ✅ Keep each layer focused on its responsibility
- ❌ Don't skip layers (e.g., controller → DAL directly)

---

## 2. Repository Pattern (DAL)

### Pattern

Data Access Layer acts as a repository, abstracting database operations from business logic.

### Implementation

```typescript
// tasks.dal.ts
@Injectable()
export class TasksDal {
  constructor(private readonly prisma: PrismaService) {}

  // CRUD operations
  async create(data: Prisma.TaskCreateInput): Promise<Task> {
    return this.prisma.task.create({ data });
  }

  async findById(id: string): Promise<Task | null> {
    return this.prisma.task.findUnique({
      where: { id, deletedAt: null },
    });
  }

  async findMany(params: FindManyParams): Promise<Task[]> {
    return this.prisma.task.findMany({
      where: {
        deletedAt: null,
        ...params.where,
      },
      skip: params.skip,
      take: params.take,
      orderBy: params.orderBy,
    });
  }

  async count(where: Prisma.TaskWhereInput): Promise<number> {
    return this.prisma.task.count({
      where: { deletedAt: null, ...where },
    });
  }

  async update(id: string, data: Prisma.TaskUpdateInput): Promise<Task> {
    return this.prisma.task.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string): Promise<Task> {
    return this.prisma.task.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async purge(id: string): Promise<Task> {
    return this.prisma.task.delete({ where: { id } });
  }
}
```

### Benefits

✅ Database logic centralized  
✅ Easy to mock for testing  
✅ Can change ORM without affecting service  
✅ Cleaner service code  
✅ Reusable queries

### When to Use

- ✅ Always create a DAL for each module
- ✅ All Prisma queries go in DAL
- ❌ Never call Prisma directly from service

---

## 3. DTO Pattern

### Pattern

Use Data Transfer Objects for all API inputs and outputs with validation.

### Implementation

```typescript
// Input DTO
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

  @ApiPropertyOptional({ enum: TaskStatus })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus = TaskStatus.TODO;

  @ApiPropertyOptional({ enum: TaskPriority })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority = TaskPriority.MEDIUM;

  @ApiPropertyOptional({ example: "2025-12-31T23:59:59.000Z" })
  @IsOptional()
  @IsISO8601()
  @IsFutureDate()
  dueDate?: Date;
}

// Query DTO
export class QueryTasksDto extends PaginationDto {
  @ApiPropertyOptional({ enum: TaskStatus })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiPropertyOptional({ enum: TaskPriority })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @ApiPropertyOptional({ example: "title" })
  @IsOptional()
  @IsString()
  sortBy?: string = "createdAt";

  @ApiPropertyOptional({ enum: ["ASC", "DESC"] })
  @IsOptional()
  @IsIn(["ASC", "DESC"])
  sortOrder?: "ASC" | "DESC" = "DESC";
}

// Response DTO
export class TaskResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty({ enum: TaskStatus })
  status: TaskStatus;

  @ApiProperty({ enum: TaskPriority })
  priority: TaskPriority;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
```

### Benefits

✅ Type safety throughout  
✅ Validation at boundaries  
✅ API contract definition  
✅ Swagger documentation  
✅ Self-documenting code

### When to Use

- ✅ For all API inputs (create, update, query)
- ✅ For all API outputs
- ✅ Add validation decorators
- ✅ Add Swagger decorators

---

## 4. Exception Pattern

### Pattern

Module-specific exceptions extending base ApplicationException with error codes.

### Implementation

```typescript
// Base exception
export class ApplicationException extends HttpException {
  constructor(
    public readonly errorCode: string,
    message: string,
    statusCode: number,
  ) {
    super(
      {
        errorCode,
        message,
        statusCode,
      },
      statusCode,
    );
  }
}

// Module exception
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

// Usage
const task = await this.tasksDal.findById(id);
if (!task) {
  throw new TaskNotFoundException(id);
}

if (task.userId !== userId) {
  throw new TaskForbiddenException(id);
}
```

### Benefits

✅ Consistent error responses  
✅ Error codes for client handling  
✅ Type-safe exceptions  
✅ Easy to test  
✅ Clear error messages

### When to Use

- ✅ Create module-specific exceptions
- ✅ Use error codes from constants
- ✅ Provide helpful error messages
- ❌ Don't throw generic errors

---

## 5. Dependency Injection

### Pattern

Use NestJS DI container for all dependencies.

### Implementation

```typescript
@Injectable()
export class TasksService {
  constructor(
    private readonly tasksDal: TasksDal,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly logger: LoggerService,
  ) {}

  async create(dto: CreateTaskDto, userId: string) {
    this.logger.log(`Creating task for user: ${userId}`);
    // ... implementation
  }
}

// Module configuration
@Module({
  imports: [PrismaModule, CacheModule.register()],
  controllers: [TasksController],
  providers: [TasksService, TasksDal],
  exports: [TasksService],
})
export class TasksModule {}
```

### Benefits

✅ Loose coupling  
✅ Easy to mock dependencies  
✅ Centralized configuration  
✅ Testable code  
✅ Framework handles lifecycle

### When to Use

- ✅ Always use DI for dependencies
- ✅ Inject interfaces when possible
- ❌ Don't use `new ClassName()`

---

## 6. Caching Strategy

### Pattern

Cache frequently accessed data with appropriate TTLs and invalidation.

### Implementation

```typescript
@Injectable()
export class TasksService {
  constructor(
    private readonly tasksDal: TasksDal,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async findById(id: string, userId: string): Promise<Task> {
    const cacheKey = `tasks:${id}`;

    // Try cache first
    const cached = await this.cacheManager.get<Task>(cacheKey);
    if (cached) {
      this.logger.log(`Cache hit for task: ${id}`);

      // Verify ownership
      if (cached.userId !== userId) {
        throw new TaskForbiddenException(id);
      }

      return cached;
    }

    // Fetch from database
    const task = await this.tasksDal.findById(id);
    if (!task) {
      throw new TaskNotFoundException(id);
    }

    if (task.userId !== userId) {
      throw new TaskForbiddenException(id);
    }

    // Store in cache (5 minutes)
    await this.cacheManager.set(cacheKey, task, 300_000);

    return task;
  }

  async update(id: string, dto: UpdateTaskDto, userId: string): Promise<Task> {
    // Update task
    const task = await this.tasksDal.update(id, dto);

    // Invalidate caches
    await Promise.all([this.cacheManager.del(`tasks:${id}`), this.cacheManager.del("tasks:list")]);

    return task;
  }
}
```

### Cache TTL Guidelines

```typescript
export enum CacheTTL {
  SHORT = 60_000, // 1 minute - frequently changing data
  MEDIUM = 300_000, // 5 minutes - moderate changes
  LONG = 1_800_000, // 30 minutes - rarely changing
  VERY_LONG = 3_600_000, // 1 hour - static data
}
```

### Benefits

✅ Reduced database load  
✅ Faster response times  
✅ Scalable performance  
✅ Configurable TTLs

### When to Use

- ✅ For read-heavy operations
- ✅ Invalidate on writes
- ✅ Use appropriate TTLs
- ❌ Don't cache user-specific data globally

---

## 7. Pagination Pattern

### Pattern

Consistent pagination across all list endpoints with metadata.

### Implementation

```typescript
// Query DTO
export class QueryTasksDto extends PaginationDto {
  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}

// Service
async findAll(query: QueryTasksDto, userId: string) {
  const page = query.page || 1;
  const limit = query.limit || 10;
  const skip = (page - 1) * limit;

  // Fetch data and count in parallel
  const [data, total] = await Promise.all([
    this.tasksDal.findMany({
      where: { userId, ...query },
      skip,
      take: limit,
      orderBy: { [query.sortBy || 'createdAt']: query.sortOrder || 'desc' },
    }),
    this.tasksDal.count({ userId, ...query }),
  ]);

  return {
    success: true,
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
```

### Response Format

```json
{
  "success": true,
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5
  }
}
```

### Benefits

✅ Consistent API responses  
✅ Performance optimization  
✅ Client-friendly metadata  
✅ Configurable limits

### When to Use

- ✅ For all list endpoints
- ✅ Set reasonable defaults
- ✅ Enforce maximum limits

---

## 8. Soft Delete Pattern

### Pattern

Mark records as deleted instead of removing them permanently.

### Implementation

```typescript
// Prisma schema
model Task {
  id        String    @id @default(cuid())
  title     String
  deletedAt DateTime? // null = active, timestamp = deleted
  // ... other fields
}

// DAL implementation
async findMany(params: FindManyParams) {
  return this.prisma.task.findMany({
    where: {
      deletedAt: null, // Only active records
      ...params.where,
    },
    skip: params.skip,
    take: params.take,
    orderBy: params.orderBy,
  });
}

async softDelete(id: string): Promise<Task> {
  return this.prisma.task.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}

async purge(id: string): Promise<Task> {
  return this.prisma.task.delete({ where: { id } });
}

// Service
async remove(id: string, userId: string): Promise<void> {
  const task = await this.findById(id, userId);
  await this.tasksDal.softDelete(id);
  await this.cacheManager.del(`tasks:${id}`);
}

async purge(id: string, userId: string): Promise<void> {
  const task = await this.findById(id, userId);
  await this.tasksDal.purge(id);
  await this.cacheManager.del(`tasks:${id}`);
}
```

### Benefits

✅ Data recovery possible  
✅ Audit trail maintained  
✅ Safe deletions  
✅ Compliance friendly

### When to Use

- ✅ For user-generated content
- ✅ When data recovery is important
- ✅ For compliance requirements
- ❌ Not for truly temporary data

---

## 9. Response Wrapper Pattern

### Pattern

Consistent response structure across all endpoints.

### Implementation

```typescript
// Success response
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}

// Paginated response
{
  "success": true,
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5
  }
}

// Error response
{
  "success": false,
  "statusCode": 404,
  "errorCode": "TASK_NOT_FOUND",
  "message": "Task not found: xyz",
  "error": "Not Found",
  "timestamp": "2025-12-16T10:00:00.000Z",
  "path": "/api/v1/tasks/xyz",
  "correlationId": "abc-123-def-456"
}
```

### Benefits

✅ Predictable responses  
✅ Easy to parse  
✅ Type-safe on client  
✅ Consistent error handling

---

## 10. Correlation ID Pattern

### Pattern

Unique ID for each request to trace through logs.

### Implementation

```typescript
// Middleware adds correlation ID
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const correlationId = req.headers['x-correlation-id'] || uuidv4();
    req['correlationId'] = correlationId;
    res.setHeader('x-correlation-id', correlationId);
    next();
  }
}

// Logger includes correlation ID
this.logger.log({
  message: 'Task created',
  correlationId: req.correlationId,
  userId,
  taskId: task.id,
});

// Errors include correlation ID
{
  "errorCode": "TASK_NOT_FOUND",
  "message": "Task not found",
  "correlationId": "abc-123-def-456"
}
```

### Benefits

✅ Request tracing  
✅ Easier debugging  
✅ Performance analysis  
✅ Client can report issues

---

## Best Practices Summary

### ✅ Do

1. Use DTOs for all inputs/outputs
2. Add validation decorators
3. Implement proper error handling
4. Use dependency injection
5. Add Swagger documentation
6. Write comprehensive tests
7. Use module-specific constants
8. Implement caching strategically
9. Add proper logging
10. Follow layered architecture

### ❌ Don't

1. Put business logic in controllers
2. Call Prisma directly from services
3. Use magic strings/numbers
4. Skip input validation
5. Forget error handling
6. Mix module concerns
7. Skip documentation
8. Ignore test coverage
9. Cache user-specific data globally
10. Skip layers in architecture

---

**Follow these patterns for consistent, maintainable code!**
