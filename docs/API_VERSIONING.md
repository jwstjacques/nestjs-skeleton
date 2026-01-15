# API Versioning Guide

This project uses URI-based API versioning to support backward-compatible API evolution.

## Overview

The API supports multiple versions running simultaneously:

- **v1**: Default version, stable API
- **v2**: Enhanced features, permission checks

```
/api/v1/tasks     → TasksController (v1)
/api/v2/tasks     → TasksV2Controller (v2)
```

## Configuration

API versioning is configured in [main.ts](../src/main.ts):

```typescript
import { VersioningType } from "@nestjs/common";

// Enable URI versioning
app.enableVersioning({
  type: VersioningType.URI,
  prefix: "v", // Adds 'v' before version number
  defaultVersion: "1", // Default to v1 if not specified
});
```

## URL Structure

```
https://api.example.com/api/v1/tasks
                        ├── ├── └── Resource
                        │   └── Version
                        └── Global prefix
```

## Creating Versioned Controllers

### v1 Controller (Default)

```typescript
import { Controller, Get, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("tasks")
@Controller("tasks") // No version specified = uses defaultVersion (v1)
export class TasksController {
  @Get()
  findAll() {
    return this.tasksService.findAll();
  }

  @Post()
  create(@Body() dto: CreateTaskDto) {
    return this.tasksService.create(dto);
  }
}
```

Accessible at: `/api/v1/tasks`

### v2 Controller (Enhanced)

```typescript
import { Controller, Get, Param } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("tasks-v2")
@Controller({ path: "tasks", version: "2" }) // Explicit version
export class TasksV2Controller {
  @Get("next-due-date")
  getNextDueTask(@CurrentUser() user: UserPayload) {
    return this.tasksService.findNextDueTask(user.id);
  }

  @Get(":id")
  findOne(@Param("id") id: string, @CurrentUser() user: UserPayload) {
    return this.tasksService.findOneWithPermissions(id, user);
  }
}
```

Accessible at: `/api/v2/tasks`

### Multi-Version Controller

Same controller handling multiple versions:

```typescript
@Controller({
  path: "users",
  version: ["1", "2"], // Both versions
})
export class UsersController {
  @Get()
  findAll() {
    return this.usersService.findAll();
  }
}
```

Accessible at both: `/api/v1/users` and `/api/v2/users`

## Version-Specific Endpoints

### v1 Only

```typescript
@Controller({ path: "legacy", version: "1" })
export class LegacyController {
  // Only available at /api/v1/legacy
}
```

### v2 Only (New Features)

```typescript
@Controller({ path: "analytics", version: "2" })
export class AnalyticsController {
  // Only available at /api/v2/analytics
}
```

## Current v2 Features

The Tasks v2 API includes enhanced features:

### Permission-Aware Get

```typescript
@Get(":id")
async findOne(
  @Param("id") id: string,
  @CurrentUser() user: UserPayload,
): Promise<TaskResponseDto> {
  // v2 checks user is owner or admin
  return this.tasksService.findOneWithPermissions(id, user);
}
```

### New Endpoints

```typescript
@Get("next-due-date")
async getNextDueTask(@CurrentUser() user: UserPayload) {
  // Returns task with nearest due date
  // Only active tasks (TODO, IN_PROGRESS)
  return this.tasksService.findNextDueTask(user.id);
}
```

## v1 vs v2 Comparison

| Feature           | v1            | v2                   |
| ----------------- | ------------- | -------------------- |
| Get by ID         | Owner only    | Owner or Admin       |
| Next due date     | Not available | `GET /next-due-date` |
| Status filtering  | All statuses  | Active only          |
| Permission checks | Basic         | Enhanced             |

## Module Registration

Register both controllers in the module:

```typescript
// tasks.module.ts
import { TasksController } from "./tasks.controller";
import { TasksV2Controller } from "./tasks-v2.controller";

@Module({
  controllers: [TasksController, TasksV2Controller],
  providers: [TasksService, TasksDal],
})
export class TasksModule {}
```

## Swagger Documentation

Each version appears as a separate tag in Swagger:

```typescript
// v1 controller
@ApiTags("tasks")  // Groups under "tasks"

// v2 controller
@ApiTags("tasks-v2")  // Groups under "tasks-v2"
```

In Swagger UI:

- **tasks** - v1 endpoints
- **tasks-v2** - v2 endpoints

## Best Practices

### 1. When to Create a New Version

Create v2 when:

- Breaking changes to request/response format
- Removing required fields
- Changing authentication requirements
- Adding mandatory parameters

Don't create v2 for:

- Adding optional fields
- Bug fixes
- Performance improvements
- New endpoints that don't affect existing ones

### 2. Maintain Backward Compatibility

v1 should continue working as documented:

```typescript
// v1 - Original behavior
@Get(":id")
async findOne(@Param("id") id: string) {
  return this.service.findOne(id);
}

// v2 - Enhanced behavior
@Get(":id")
async findOne(
  @Param("id") id: string,
  @CurrentUser() user: UserPayload,
) {
  return this.service.findOneWithPermissions(id, user);
}
```

### 3. Share Service Logic

Both controllers use the same service:

```typescript
@Injectable()
export class TasksService {
  // v1 method
  findOne(id: string) {
    return this.dal.findUnique(id);
  }

  // v2 method with permissions
  findOneWithPermissions(id: string, user: UserPayload) {
    const task = await this.findOne(id);
    if (task.userId !== user.id && user.role !== "ADMIN") {
      throw new TaskForbiddenException(id);
    }
    return task;
  }
}
```

### 4. Document Deprecation

When deprecating v1:

```typescript
@Controller("tasks")
@ApiTags("tasks")
@ApiOperation({
  deprecated: true,
  summary: "List tasks (Deprecated - use v2)",
})
export class TasksController {}
```

### 5. Version Naming

Use semantic versioning concepts:

- **v1** → Initial stable release
- **v2** → Breaking changes or major features
- **v3** → Next major iteration

## Migration Path

### Deprecation Timeline

1. **Announce**: Document v2 availability
2. **Encourage**: Update client docs to use v2
3. **Warn**: Add deprecation headers to v1
4. **Sunset**: Remove v1 (after 6-12 months)

### Deprecation Headers

```typescript
@Get()
@Header("Deprecation", "true")
@Header("Sunset", "2025-01-01")
async findAllV1() {
  return this.service.findAll();
}
```

## Testing Versioned APIs

### E2E Tests

```typescript
describe("Tasks API Versioning", () => {
  it("v1 should return task for owner", async () => {
    await request(app.getHttpServer())
      .get("/api/v1/tasks/abc123")
      .set("Authorization", `Bearer ${ownerToken}`)
      .expect(200);
  });

  it("v2 should allow admin access to any task", async () => {
    await request(app.getHttpServer())
      .get("/api/v2/tasks/abc123")
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);
  });

  it("v2 should have next-due-date endpoint", async () => {
    await request(app.getHttpServer())
      .get("/api/v2/tasks/next-due-date")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);
  });
});
```

## See Also

- [Tasks Module Guide](./examples/TASKS_MODULE_GUIDE.md)
- [Authentication Guide](./AUTHENTICATION.md)
- [Error Codes](./ERROR_CODES.md)
