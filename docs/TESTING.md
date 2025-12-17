# Testing Guide

## Overview

This project uses Jest for unit testing, integration testing, and end-to-end (E2E) testing.

## Test Environment Configuration

### Quick Setup

```bash
# Use pre-configured test settings
cp .env.test.example .env.test
```

This provides test-optimized defaults:

- **Test Database**: `taskdb_test` (isolated from development)
- **High Rate Limits**: 1000/5000/10000 (no throttling during tests)
- **Minimal Logging**: `LOG_LEVEL=error` (cleaner test output)
- **Test Port**: 3001 (avoids conflicts with dev server)
- **Permissive CORS**: `*` (allows all origins for testing)

### CI/CD Environment

For continuous integration, set these environment variables:

```bash
export NODE_ENV=test
export DATABASE_URL="${CI_DATABASE_URL}"
export SKIP_DB_SETUP=true  # If CI provides pre-configured DB
export LOG_LEVEL=error      # Minimal logging in CI
```

### Database Isolation

Tests should use a separate database to avoid conflicts:

```env
# .env.test
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/taskdb_test?schema=public
```

**Important**: E2E tests will reset this database between test suites.

For complete variable reference, see [Environment Variables Guide](./ENVIRONMENT_VARIABLES.md).

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

## Testing Your Custom Modules

When you create your own modules, follow the same testing patterns demonstrated in the **Tasks module**.

### Module Test Structure

For each custom module, create:

```
test/
├── unit/
│   └── your-module/
│       ├── your-module.dal.spec.ts      # DAL tests
│       ├── your-module.service.spec.ts  # Service tests
│       └── your-module.controller.spec.ts # Controller tests
└── e2e/
    └── your-module/
        └── your-module.e2e-spec.ts      # E2E tests
```

### Required Test Coverage

Each module should have:

1. **DAL Tests** (Integration tests with real database)
   - Test all database operations
   - Test error handling (unique constraints, not found, etc.)
   - Test pagination and filtering

2. **Service Tests** (Unit tests with mocks)
   - Test business logic in isolation
   - Mock the DAL layer
   - Test all service methods
   - Test error scenarios

3. **Controller Tests** (Unit tests with mocks)
   - Test request handling
   - Test DTO validation
   - Mock the service layer
   - Test response formatting

4. **E2E Tests** (Full integration tests)
   - Test all API endpoints
   - Test authentication/authorization
   - Test request/response formats
   - Test error responses
   - Use `TestCleanup` utility

### Example Test Template

Use the Tasks module as a template:

```typescript
// test/unit/your-module/your-module.service.spec.ts
import { Test, TestingModule } from "@nestjs/testing";
import { createMock } from "@golevelup/ts-jest";
import { YourModuleService } from "../../../src/modules/your-module/your-module.service";
import { YourModuleDal } from "../../../src/modules/your-module/your-module.dal";

describe("YourModuleService", () => {
  let service: YourModuleService;
  let dal: jest.Mocked<YourModuleDal>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        YourModuleService,
        {
          provide: YourModuleDal,
          useValue: createMock<YourModuleDal>(),
        },
      ],
    }).compile();

    service = module.get<YourModuleService>(YourModuleService);
    dal = module.get(YourModuleDal);
  });

  describe("create", () => {
    it("should create an item", async () => {
      const createDto = {
        /* your DTO */
      };
      const expectedResult = {
        /* expected result */
      };

      dal.create.mockResolvedValue(expectedResult);

      const result = await service.create(createDto);

      expect(result).toEqual(expectedResult);
      expect(dal.create).toHaveBeenCalledWith(createDto);
    });
  });
});
```

### Coverage Thresholds

When you remove the Tasks module or add your own modules, you may need to adjust coverage thresholds in `jest.config.js`:

```javascript
coverageThreshold: {
  global: {
    branches: 90,    // Adjust if needed
    functions: 90,   // Adjust if needed
    lines: 95,       // Adjust if needed
    statements: 95,  // Adjust if needed
  },
},
```

**Recommendation**: Keep thresholds high (90%+) to maintain code quality.

### Testing Best Practices for Custom Modules

1. **Follow the Tasks module patterns**: Use it as a reference
2. **Test error scenarios**: Not just happy paths
3. **Use TestCleanup**: Track and cleanup all test data
4. **Mock external dependencies**: Keep tests fast and isolated
5. **Test validation**: Ensure DTOs validate correctly
6. **Test pagination**: If your module supports it
7. **Test authentication**: Ensure endpoints are properly protected
8. **Update coverage thresholds**: After removing Tasks module

See the [CUSTOMIZATION.md](./CUSTOMIZATION.md) guide for more details on testing custom modules.

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
