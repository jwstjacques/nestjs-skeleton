# Testing Guide

Complete guide for writing tests in this NestJS API skeleton.

## Table of Contents

1. [Overview](#overview)
2. [Test Environment](#test-environment)
3. [Test Structure](#test-structure)
4. [Test Utilities](#test-utilities)
5. [Unit Tests](#unit-tests)
6. [E2E Tests](#e2e-tests)
7. [Test Templates](#test-templates)
8. [Test Data Cleanup](#test-data-cleanup)
9. [Coverage Requirements](#coverage-requirements)
10. [Best Practices](#best-practices)
11. [Troubleshooting](#troubleshooting)

---

## Overview

This project uses:

- **Jest** - Testing framework
- **Supertest** - HTTP assertions for E2E tests
- **Custom utilities** - Test helpers, assertions, and templates

### Test Commands

```bash
# Run all tests
npm run test

# Run unit tests only
npm run test:unit

# Run E2E tests only
npm run test:e2e

# Run with coverage
npm run test:cov

# Run in watch mode
npm run test:watch

# Run both unit and E2E tests
npm run test:all
```

---

## Test Environment

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

### Database Isolation

Tests should use a separate database to avoid conflicts:

```env
# .env.test
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/taskdb_test?schema=public
```

**Important**: E2E tests will reset this database between test suites.

### CI/CD Environment

For continuous integration:

```bash
export NODE_ENV=test
export DATABASE_URL="${CI_DATABASE_URL}"
export SKIP_DB_SETUP=true  # If CI provides pre-configured DB
export LOG_LEVEL=error      # Minimal logging in CI
```

---

## Test Structure

```
test/
├── unit/                    # Unit tests
│   ├── common/             # Common utilities tests
│   ├── config/             # Configuration tests
│   └── modules/            # Module tests
│       ├── auth/
│       ├── tasks/
│       └── users/
├── e2e/                     # End-to-end tests
│   ├── auth/
│   ├── tasks/
│   └── users/
├── utils/                   # Test utilities
│   ├── test-helpers.ts     # Generic helpers and assertions
│   ├── test-constants.ts   # Test constants
│   ├── test-templates.ts   # Reusable test templates
│   ├── test-cleanup.ts     # Test data cleanup utility
│   └── index.ts            # Exports
└── setup.ts                 # Global test setup
```

---

## Test Utilities

### Available Utilities

The project provides comprehensive test utilities in `test/utils/`:

#### test-helpers.ts

- **DataFactory** - Generate test data
- **Assertions** - Standardized test assertions
- **Setup** - Application setup/teardown
- **AuthHelper** - Authentication workflows
- **HttpHelper** - HTTP request helpers
- **Mocks** - Create mock services

#### test-constants.ts

- HTTP status codes
- Test timeouts
- Field length constants
- Test patterns (regex)

#### test-templates.ts

- **CrudTemplate** - CRUD operation tests
- **ValidationTemplate** - Validation tests
- **SecurityTemplate** - Security tests

### Import Utilities

```typescript
import {
  Setup,
  AuthHelper,
  DataFactory,
  Assertions,
  HttpHelper,
  Mocks,
  CrudTemplate,
  ValidationTemplate,
} from "../utils";
import { HTTP_STATUS } from "../utils/test-constants";
```

---

## Unit Tests

Unit tests focus on individual components in isolation.

### Basic Structure

```typescript
import { Test, TestingModule } from "@nestjs/testing";
import { ExampleService } from "./example.service";
import { ExampleDal } from "./example.dal";

describe("ExampleService", () => {
  let service: ExampleService;
  let dal: jest.Mocked<ExampleDal>;

  beforeEach(async () => {
    const mockDal = {
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [ExampleService, { provide: ExampleDal, useValue: mockDal }],
    }).compile();

    service = module.get<ExampleService>(ExampleService);
    dal = module.get(ExampleDal);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findById", () => {
    it("should return resource when found", async () => {
      const mockResource = { id: "123", title: "Test" };
      dal.findById.mockResolvedValue(mockResource);

      const result = await service.findById("123");

      expect(result).toEqual(mockResource);
      expect(dal.findById).toHaveBeenCalledWith("123");
    });

    it("should throw when resource not found", async () => {
      dal.findById.mockResolvedValue(null);

      await expect(service.findById("123")).rejects.toThrow();
    });
  });
});
```

### Using Mock Builders

```typescript
const mockPrisma = Mocks.createMockPrismaService();
const mockCache = Mocks.createMockCacheManager();
const mockConfig = Mocks.createMockConfigService({
  JWT_SECRET: "test-secret",
  PORT: 3000,
});
const mockLogger = Mocks.createMockLogger();
```

---

## E2E Tests

E2E tests validate full request/response cycles.

### Basic Structure

```typescript
import { INestApplication, HttpStatus } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "../../src/app.module";
import { Setup, AuthHelper, HttpHelper, Assertions } from "../utils";

describe("Example E2E", () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    app = await Setup.createTestApp([AppModule]);
    const { accessToken } = await AuthHelper.registerUser(app);
    authToken = accessToken;
  });

  afterAll(async () => {
    await Setup.closeTestApp(app);
  });

  it("should create resource", async () => {
    const response = await HttpHelper.post(app, "/api/v1/resources", authToken, {
      title: "Test",
    });

    Assertions.assertSuccessResponse(response, HttpStatus.CREATED);
    expect(response.body.data).toHaveProperty("id");
  });

  it("should list resources", async () => {
    const response = await HttpHelper.get(app, "/api/v1/resources?page=1&limit=10", authToken);

    Assertions.assertPaginatedResponse(response.body);
  });
});
```

### Key E2E Patterns

1. **Use `HttpStatus` enum** instead of hardcoded numbers (201, 404, etc.)
2. **Set authentication header** for protected endpoints
3. **Use `describe("<METHOD> <endpoint>")`** format (e.g., "POST /tasks")
4. **Access response data via `res.body.data`** due to TransformInterceptor
5. **Create fresh test data in `beforeEach`** for test isolation
6. **Use TestCleanup utility** to track and cleanup test data
7. **Set global prefix `api/v1`** to match production configuration

### Data Factory Usage

```typescript
// Generate user data
const userData = DataFactory.createUserData({
  email: "custom@example.com",
});

// Generate CUID
const testId = DataFactory.generateCuid();

// Invalid CUID for error testing
const invalidId = DataFactory.generateInvalidCuid();

// Create pagination query
const query = DataFactory.createPaginationQuery({ limit: 20 });

// Get random enum value
const status = DataFactory.randomEnumValue(TaskStatus);
```

### Assertion Examples

```typescript
// Success responses
Assertions.assertSuccessResponse(response, HttpStatus.CREATED);

// Paginated responses
Assertions.assertPaginatedResponse(response.body);
Assertions.assertPaginatedResponse(response.body, 5); // Expect 5 items

// Error responses
Assertions.assertNotFound(response, "RESOURCE_NOT_FOUND");
Assertions.assertForbidden(response, "ACCESS_DENIED");
Assertions.assertUnauthorized(response);
Assertions.assertConflict(response, "DUPLICATE_RESOURCE");

// Validation errors
Assertions.assertValidationError(response);
Assertions.assertValidationError(response, ["Field is required"]);

// Resource validation
Assertions.assertResourceFields(resource, ["id", "title", "status"]);
Assertions.assertSoftDeleteFields(resource, false);
Assertions.assertRecentTimestamp(resource.createdAt);
```

### HTTP Helper Usage

```typescript
const response = await HttpHelper.get(app, "/api/v1/resources", token);
const response = await HttpHelper.post(app, "/api/v1/resources", token, { title: "Test" });
const response = await HttpHelper.patch(app, "/api/v1/resources/123", token, {
  title: "Updated",
});
const response = await HttpHelper.delete(app, "/api/v1/resources/123", token);
```

---

## Test Templates

### CRUD Templates

```typescript
// Test unauthorized access
CrudTemplate.testUnauthorizedAccess(app, [
  { method: "get", path: "/api/v1/resources" },
  { method: "post", path: "/api/v1/resources" },
  { method: "patch", path: "/api/v1/resources/123" },
  { method: "delete", path: "/api/v1/resources/123" },
]);

// Test pagination
CrudTemplate.testPagination(app, "/api/v1/resources", authToken);

// Test sorting
CrudTemplate.testSorting(app, "/api/v1/resources", authToken, ["title", "createdAt", "priority"]);

// Test not found
CrudTemplate.testNotFound(app, "/api/v1/resources/invalid-id", authToken, "RESOURCE_NOT_FOUND");

// Test soft delete
CrudTemplate.testSoftDelete(app, "/api/v1/resources", resourceId, authToken);
```

### Validation Templates

```typescript
// Test required fields
ValidationTemplate.testRequiredFields(
  app,
  "/api/v1/resources",
  authToken,
  ["title", "description"],
  { priority: "HIGH" },
);

// Test string length
ValidationTemplate.testStringLength(app, "/api/v1/resources", authToken, "title", 3, 200, {
  description: "Test",
});

// Test enum validation
ValidationTemplate.testEnumValidation(
  app,
  "/api/v1/resources",
  authToken,
  "status",
  ["TODO", "IN_PROGRESS", "COMPLETED"],
  { title: "Test" },
);

// Test email validation
ValidationTemplate.testEmailValidation(app, "/api/v1/users", authToken, "email", {
  username: "testuser",
});
```

### Security Templates

```typescript
// Test SQL injection protection
SecurityTemplate.testSqlInjection(app, "/api/v1/resources", authToken, "title", {
  description: "Test",
});

// Test XSS protection
SecurityTemplate.testXssProtection(app, "/api/v1/resources", authToken, "description", {
  title: "Test",
});

// Test rate limiting
await SecurityTemplate.testRateLimit(app, "/api/v1/resources", authToken, 10);
```

---

## Test Data Cleanup

The `TestCleanup` utility class provides safe test data management:

```typescript
import { TestCleanup } from "test/utils/test-cleanup";

// Create test data
const task = await tasksDal.create({ title: "Test", priority: TaskPriority.HIGH });
cleanup.trackTask(task.id);

const user = await prisma.user.create({ data: { email: "test@example.com" } });
cleanup.trackUser(user.id);

// Clean up only tracked entities
await cleanup.cleanupTasks(); // Delete only tracked tasks
await cleanup.cleanupUsers(); // Delete only tracked users
await cleanup.cleanupAll(); // Delete all tracked entities
```

**Why this pattern:**

- ✅ Never uses `deleteMany()` (prevents accidental data loss)
- ✅ Only deletes explicitly tracked entities
- ✅ Test isolation: each test only cleans its own data
- ✅ Safe by default, respects foreign key constraints

### Usage Pattern

```typescript
describe("Tasks API", () => {
  let cleanup: TestCleanup;
  let userId: string;

  beforeAll(async () => {
    const user = await prisma.user.create({ data: { email: "test@tasks.com" } });
    userId = user.id;
    cleanup.trackUser(userId);
  });

  afterEach(async () => {
    await cleanup.cleanupTasks();
  });

  afterAll(async () => {
    await cleanup.cleanupAll();
  });

  it("should create a task", () => {
    return request(app.getHttpServer())
      .post("/api/v1/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "New Task", priority: TaskPriority.HIGH })
      .expect(HttpStatus.CREATED)
      .expect((res) => {
        cleanup.trackTask(res.body.data.id);
      });
  });
});
```

---

## Coverage Requirements

### Thresholds

Coverage thresholds are configured in `jest.config.js`. Recommendation: maintain high coverage (90%+) for critical code.

### Excluded from Coverage

- `*.module.ts` files
- `*.interface.ts` files
- `*.dto.ts` files
- `*.entity.ts` files
- `*.enum.ts` files
- `*.constants.ts` files
- `main.ts`

### Viewing Coverage

```bash
# Generate coverage report
npm run test:cov

# View in browser
open coverage/lcov-report/index.html
```

---

## Best Practices

### ✅ Do

- Use test utilities for common operations
- Follow AAA pattern (Arrange, Act, Assert)
- Write descriptive test names describing the scenario
- Clean up test data in afterEach/afterAll
- Mock external dependencies
- Test error scenarios, not just happy paths
- Use constants from test-constants.ts
- Test edge cases (empty arrays, null values, etc.)
- Use templates for common test patterns
- Keep tests isolated and independent

### ❌ Don't

- Depend on test execution order
- Leave database in dirty state
- Hardcode test data (use DataFactory)
- Skip error cases
- Test implementation details
- Use real external services
- Share state between tests
- Make tests too complex

### Test Naming Convention

```typescript
describe("ComponentName", () => {
  describe("methodName", () => {
    it("should do X when Y condition", () => {
      // Test
    });

    it("should throw error when Z invalid", () => {
      // Test
    });

    it("should return empty array when no results", () => {
      // Test
    });
  });
});
```

---

## Troubleshooting

### Tests Timeout

```typescript
// Increase timeout for specific test
it("should complete long operation", async () => {
  // Test code
}, 10000); // 10 second timeout

// Increase timeout for entire suite
jest.setTimeout(30000);
```

### Database Connection Issues

1. Check DATABASE_URL in test environment
2. Ensure Docker containers are running
3. Run migrations: `npm run migrate:dev`

```bash
# Check containers
docker ps

# Start containers
docker-compose up -d
```

### Flaky Tests

**Common Causes:**

1. Race conditions - Use proper async/await
2. Shared test data - Isolate test data
3. Time-dependent assertions - Use flexible time checks
4. External service dependencies - Mock external services

**Solutions:**

```typescript
// Bad - race condition
const result = service.asyncOperation();
expect(result).toBeDefined();

// Good - await completion
const result = await service.asyncOperation();
expect(result).toBeDefined();

// Bad - exact time check
expect(resource.createdAt).toBe(new Date());

// Good - flexible time check
Assertions.assertRecentTimestamp(resource.createdAt);
```

### Mock Not Working

```typescript
// Ensure mock is set before test
beforeEach(() => {
  mockService.method.mockResolvedValue(expectedValue);
});

// Reset mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});

// Check mock was called correctly
expect(mockService.method).toHaveBeenCalled();
expect(mockService.method).toHaveBeenCalledWith(expectedArgs);
expect(mockService.method).toHaveBeenCalledTimes(1);
```

### Coverage Not Updating

```bash
# Clear coverage cache
rm -rf coverage

# Clear Jest cache
npm run test -- --clearCache

# Regenerate coverage
npm run test:cov
```

---

## Testing Custom Modules

When creating your own modules, follow the Tasks module patterns:

### Module Test Structure

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

### Required Coverage

1. **DAL Tests** - Database operations, error handling, pagination
2. **Service Tests** - Business logic, mocked DAL
3. **Controller Tests** - Request handling, DTO validation
4. **E2E Tests** - Full integration, authentication, error responses

**Reference:** See `src/modules/tasks/` and `test/` for complete working examples.
