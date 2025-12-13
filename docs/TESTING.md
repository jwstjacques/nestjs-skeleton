# Testing Guide

## Overview

This project uses Jest for unit testing, integration testing, and end-to-end (E2E) testing.

## Test Structure

```
test/
├── e2e/
│ ├── tasks/
│ │ └── tasks.e2e-spec.ts # Tasks E2E tests
│ └── app.e2e-spec.ts # App E2E tests
├── unit/
│ └── tasks/
│ ├── tasks.dal.spec.ts # DAL integration tests
│ ├── tasks.service.spec.ts # Service unit tests
│ └── tasks.controller.spec.ts # Controller unit tests
└── utils/ # Test utilities
├── test-cleanup.ts # Test data cleanup utility
└── e2e-app.helper.ts # E2E app setup helper
```

## Running Tests

### Unit Tests

```bash

# Run all unit tests

npm run test

# Run in watch mode

npm run test:watch

# Run with coverage

npm run test:cov
```

### E2E Tests

```bash

# Run E2E tests

npm run test:e2e

# Run E2E tests in watch mode

npm run test:e2e:watch
```

### All Tests

```bash

# Run both unit and E2E tests

npm run test:all
```

## Writing Tests

### Unit Tests

Unit tests should test individual functions/methods in isolation using mocks:

```typescript
describe("TasksService", () => {
let service: TasksService;
let mockTasksDal: jest.Mocked`<TasksDal>`;

beforeEach(async () => {
const module: TestingModule = await Test.createTestingModule({
providers: [
TasksService,
{
provide: TasksDal,
useValue: mockTasksDal,
},
],
}).compile();

    service = module.get`<TasksService>`(TasksService);

});

it("should create a task", async () => {
const createDto = { title: "Test", priority: TaskPriority.HIGH };
mockTasksDal.create.mockResolvedValue(mockTask);

    const result = await service.create(createDto);

    expect(result).toEqual(mockTask);
    expect(mockTasksDal.create).toHaveBeenCalledWith(createDto);

});
});
```

### E2E Tests

E2E tests test the entire request/response cycle with real HTTP server and database:

```typescript
describe("POST /tasks", () => {
  it("should create a new task", () => {
    return request(app.getHttpServer())
      .post("/api/v1/tasks")
      .set("x-user-id", userId) // Auth header for testing
      .send({
        title: "Test Task",
        priority: TaskPriority.HIGH,
      })
      .expect(HttpStatus.CREATED) // Use HttpStatus enum
      .expect((res: request.Response) => {
        expect(res.body.data).toHaveProperty("id");
        expect(res.body.data.title).toBe("Test Task");
      });
  });
});
```

**Key E2E Testing Patterns:**

1. **Use `HttpStatus` enum** instead of hardcoded numbers (201, 404, etc.)
2. **Set `x-user-id` header** for authentication before auth is implemented
3. **Use `describe("<METHOD> <endpoint>")`** format (e.g., "POST /tasks")
4. **Access response data via `res.body.data`** due to TransformInterceptor
5. **Create fresh test data in `beforeEach`** for test isolation
6. **Use TestCleanup utility** to track and cleanup test data
7. **Set global prefix `api/v1`** to match production configuration

## Test Coverage

Target coverage: >80% for all metrics

View coverage report:

```bash
npm run test:cov
open coverage/lcov-report/index.html
```

## Test Data Cleanup

The application uses the `TestCleanup` utility class for safe test data management:

```typescript
import { TestCleanup } from "test/utils/test-cleanup";

// Create test data
const task = await tasksDal.create({ title: "Test", priority: TaskPriority.HIGH });
cleanup.trackTask(task.id);

const user = await prisma.user.create({ data: { email: "test@example.com" } });
cleanup.trackUser(user.id);

// Retrieve tracked data
const taskIds = cleanup.getTrackedTaskIds();
const userIds = cleanup.getTrackedUserIds();

// Clean up only tracked entities (safe, granular)
await cleanup.cleanupTasks(); // Delete only tracked tasks
await cleanup.cleanupUsers(); // Delete only tracked users
await cleanup.cleanupAll(); // Delete all tracked entities
```

**Why this pattern is used:**

- ✅ Never uses `deleteMany()` (prevents accidental data loss)
- ✅ Only deletes explicitly tracked entities
- ✅ Test isolation: each test only cleans its own data
- ✅ Safe by default, respects foreign key constraints
- ✅ Clear intent: makes test expectations explicit

**Usage Pattern in E2E Tests:**

```typescript
describe("Tasks API", () => {
  let cleanup: TestCleanup;
  let userId: string;

  beforeAll(async () => {
    // Setup: Create test user
    const user = await prisma.user.create({
      data: { email: "test@tasks.com" },
    });
    userId = user.id;
    cleanup.trackUser(userId);
  });

  afterEach(async () => {
    // Cleanup: Delete tasks created during test
    await cleanup.cleanupTasks();
  });

  afterAll(async () => {
    // Final cleanup: Delete all tracked entities
    await cleanup.cleanupAll();
  });

  it("should create a task", () => {
    return request(app.getHttpServer())
      .post("/api/v1/tasks")
      .set("x-user-id", userId)
      .send({ title: "New Task", priority: TaskPriority.HIGH })
      .expect(HttpStatus.CREATED)
      .expect((res) => {
        // Track created task for cleanup
        cleanup.trackTask(res.body.data.id);
      });
  });
});
```

**Comparison:**

| Pattern           | Safety  | Isolation   | Control           | Best For                  |
| ----------------- | ------- | ----------- | ----------------- | ------------------------- |
| `cleanDatabase()` | ❌ Low  | ❌ Global   | ❌ All-or-nothing | ❌ Avoid - too dangerous  |
| `TestCleanup`     | ✅ High | ✅ Per-test | ✅ Granular       | ✅ All tests - preferred  |
| No cleanup        | ❌ None | ❌ None     | ❌ Manual         | ❌ Avoid - test pollution |

---

## Best Practices

1. **Test naming**: Use descriptive test names
2. **AAA pattern**: Arrange, Act, Assert
3. **One assertion per test**: Keep tests focused
4. **Mock external dependencies**: Use mocks for databases, APIs
5. **Clean up**: Use `TestCleanup` utility to track and cleanup test data
6. **Test edge cases**: Include error scenarios
7. **Correlation IDs**: Tests automatically generate correlation IDs for tracing
8. **Test isolation**: Each test should clean up its own data

## CI/CD

Tests run automatically on:

- Pull requests
- Pushes to main/develop branches

Coverage reports are uploaded to Codecov.
