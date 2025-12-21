# Testing Guide

Complete guide for writing tests in this NestJS API skeleton.

## Table of Contents

1. [Overview](#overview)
2. [Test Structure](#test-structure)
3. [Test Utilities](#test-utilities)
4. [Unit Tests](#unit-tests)
5. [E2E Tests](#e2e-tests)
6. [Test Templates](#test-templates)
7. [Best Practices](#best-practices)
8. [Coverage Requirements](#coverage-requirements)
9. [Common Patterns](#common-patterns)
10. [Troubleshooting](#troubleshooting)

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
│   ├── fixtures.ts         # Test data fixtures
│   ├── mocks.ts            # Mock factories
│   └── index.ts            # Exports
└── setup.ts                 # Global test setup
```

---

## Test Utilities

### Available Utilities

The project provides comprehensive test utilities in `test/utils/`:

#### test-helpers.ts

Generic helpers and assertions for all test types:

- **DataFactory** - Generate test data
- **Assertions** - Standardized test assertions
- **Setup** - Application setup/teardown
- **AuthHelper** - Authentication workflows
- **HttpHelper** - HTTP request helpers
- **MockBuilder** - Create mock services
- **DbHelper** - Database operations

#### test-constants.ts

Common constants used across tests:

- HTTP status codes
- Test timeouts
- Field length constants
- Test patterns (regex)
- Environment helpers

#### test-templates.ts

Reusable test templates:

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

### Basic Unit Test Structure

```typescript
import { Test, TestingModule } from "@nestjs/testing";
import { ExampleService } from "./example.service";
import { ExampleDal } from "./example.dal";
import { Mocks } from "../../../test/utils";

describe("ExampleService", () => {
  let service: ExampleService;
  let dal: jest.Mocked<ExampleDal>;

  beforeEach(async () => {
    // Create mock DAL
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
// Create mocks for common services
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

### Basic E2E Test Structure

```typescript
import { INestApplication } from "@nestjs/common";
import { AppModule } from "../../src/app.module";
import { Setup, AuthHelper, HttpHelper, Assertions } from "../utils";
import { HTTP_STATUS } from "../utils/test-constants";

describe("Example E2E", () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    // Create test app
    app = await Setup.createTestApp([AppModule]);

    // Register and login user
    const { accessToken } = await AuthHelper.registerUser(app);
    authToken = accessToken;
  });

  afterAll(async () => {
    await Setup.closeTestApp(app);
  });

  it("should create resource", async () => {
    const response = await HttpHelper.post(app, "/api/v1/resources", authToken, { title: "Test" });

    Assertions.assertSuccessResponse(response, HTTP_STATUS.CREATED);
    expect(response.body.data).toHaveProperty("id");
  });

  it("should list resources", async () => {
    const response = await HttpHelper.get(app, "/api/v1/resources?page=1&limit=10", authToken);

    Assertions.assertPaginatedResponse(response.body);
  });
});
```

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

// Create date range
const range = DataFactory.createDateRange(7); // Last 7 days

// Random strings/numbers
const str = DataFactory.randomString(15);
const num = DataFactory.randomNumber(1, 100);
```

### Assertion Examples

```typescript
// Success responses
Assertions.assertSuccessResponse(response, HTTP_STATUS.CREATED);
Assertions.assertSuccessResponse(response, HTTP_STATUS.OK);

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

// Dates
Assertions.assertDatesEqual(date1, date2, 1000); // Within 1 second

// Arrays
Assertions.assertArrayContains(array, { status: "TODO" });
```

### HTTP Helper Usage

```typescript
// GET request
const response = await HttpHelper.get(app, "/api/v1/resources", token);

// POST request
const response = await HttpHelper.post(app, "/api/v1/resources", token, { title: "Test" });

// PATCH request
const response = await HttpHelper.patch(app, "/api/v1/resources/123", token, { title: "Updated" });

// DELETE request
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

// Test forbidden access
CrudTemplate.testForbiddenAccess(app, "/api/v1/resources/123", "patch", authToken, "ACCESS_DENIED");

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
  { priority: "HIGH" }, // Base data
);

// Test string length
ValidationTemplate.testStringLength(
  app,
  "/api/v1/resources",
  authToken,
  "title",
  3, // Min length
  200, // Max length
  { description: "Test" }, // Base data
);

// Test enum validation
ValidationTemplate.testEnumValidation(
  app,
  "/api/v1/resources",
  authToken,
  "status",
  ["TODO", "IN_PROGRESS", "COMPLETED"],
  { title: "Test" }, // Base data
);

// Test email validation
ValidationTemplate.testEmailValidation(
  app,
  "/api/v1/users",
  authToken,
  "email",
  { username: "testuser" }, // Base data
);

// Test type validation
ValidationTemplate.testTypeValidation(
  app,
  "/api/v1/resources",
  authToken,
  "priority",
  "number",
  { title: "Test" }, // Base data
);
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
await SecurityTemplate.testRateLimit(
  app,
  "/api/v1/resources",
  authToken,
  10, // Max requests
);
```

---

## Best Practices

### ✅ Do

- Use test utilities for common operations
- Follow AAA pattern (Arrange, Act, Assert)
- Write descriptive test names describing the scenario
- Clean up test data in afterEach/afterAll
- Mock external dependencies (database, APIs, services)
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
- Ignore test failures
- Skip cleanup

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

## Coverage Requirements

### Coverage Thresholds

Coverage thresholds are configured in `jest.config.js`. Adjust these based on your project's needs and the criticality of different modules.

**Recommendation**: Maintain high coverage (90%+) for critical code like authentication, security features, and core utilities. Business logic should aim for 85-90% coverage.

### Excluded from Coverage

The following file types are excluded from coverage reports:

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

Coverage reports are generated in multiple formats:

- **HTML**: `coverage/lcov-report/index.html` (interactive, detailed)
- **JSON**: `coverage/coverage-final.json` (machine-readable)
- **LCOV**: `coverage/lcov.info` (for CI/CD tools)

### Coverage Best Practices

- Focus on meaningful tests, not just coverage percentages
- Critical security code (auth, validation) should have very high coverage
- Test edge cases and error scenarios
- Don't write tests solely to increase coverage metrics
- Use coverage reports to identify untested code paths

---

## Common Patterns

### Testing Services

```typescript
describe("ExampleService", () => {
  let service: ExampleService;
  let mockDal: jest.Mocked<ExampleDal>;

  beforeEach(async () => {
    mockDal = {
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    } as any;

    const module = await Test.createTestingModule({
      providers: [ExampleService, { provide: ExampleDal, useValue: mockDal }],
    }).compile();

    service = module.get(ExampleService);
  });

  it("should create resource", async () => {
    const input = { title: "Test" };
    const expected = { id: "123", ...input };

    mockDal.create.mockResolvedValue(expected);

    const result = await service.create(input);

    expect(result).toEqual(expected);
    expect(mockDal.create).toHaveBeenCalledWith(input);
  });
});
```

### Testing Controllers

```typescript
describe("ExampleController", () => {
  let controller: ExampleController;
  let mockService: jest.Mocked<ExampleService>;

  beforeEach(async () => {
    mockService = {
      findAll: jest.fn(),
      create: jest.fn(),
    } as any;

    const module = await Test.createTestingModule({
      controllers: [ExampleController],
      providers: [{ provide: ExampleService, useValue: mockService }],
    }).compile();

    controller = module.get(ExampleController);
  });

  it("should return paginated list", async () => {
    const query = { page: 1, limit: 10 };
    const expected = { data: [], meta: { page: 1, limit: 10, total: 0, totalPages: 0 } };

    mockService.findAll.mockResolvedValue(expected);

    const result = await controller.findAll(query);

    expect(result).toEqual(expected);
  });
});
```

### Testing with Database

```typescript
describe("ExampleDal", () => {
  let dal: ExampleDal;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [ExampleDal, PrismaService],
    }).compile();

    dal = module.get(ExampleDal);
    prisma = module.get(PrismaService);
  });

  afterEach(async () => {
    // Clean up test data
    await prisma.example.deleteMany();
  });

  it("should create record", async () => {
    const data = { title: "Test" };

    const result = await dal.create(data);

    expect(result).toHaveProperty("id");
    expect(result.title).toBe(data.title);
  });
});
```

### Testing Authentication Flows

```typescript
describe("Auth Flow", () => {
  it("should register, login, and refresh token", async () => {
    // Register
    const { user, accessToken, refreshToken, credentials } = await AuthHelper.registerUser(app);

    expect(user).toHaveProperty("id");
    expect(accessToken).toBeDefined();

    // Login
    const loginResult = await AuthHelper.login(app, credentials);
    expect(loginResult.accessToken).toBeDefined();

    // Refresh token
    const refreshResult = await AuthHelper.refreshToken(app, refreshToken);
    expect(refreshResult.accessToken).toBeDefined();
  });
});
```

---

## Troubleshooting

### Tests Timeout

**Symptom**: Tests fail with timeout error

**Solutions**:

```typescript
// Increase timeout for specific test
it("should complete long operation", async () => {
  // Test code
}, 10000); // 10 second timeout

// Increase timeout for entire suite
jest.setTimeout(30000); // 30 seconds
```

### Database Connection Issues

**Symptoms**:

- Cannot connect to database
- Tests fail with connection errors

**Solutions**:

1. Check DATABASE_URL in test environment
2. Ensure Docker containers are running
3. Run migrations: `npm run migrate:dev`
4. Verify database exists

```bash
# Check containers
docker ps

# Start containers
docker-compose up -d

# Check database
npm run db:connect
```

### Flaky Tests

**Symptoms**: Tests pass sometimes, fail other times

**Common Causes**:

1. **Race conditions** - Use proper async/await
2. **Shared test data** - Isolate test data
3. **Time-dependent assertions** - Use flexible time checks
4. **External service dependencies** - Mock external services

**Solutions**:

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

**Symptom**: Mock functions not being called

**Solutions**:

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

**Solutions**:

```bash
# Clear coverage cache
rm -rf coverage

# Clear Jest cache
npm run test -- --clearCache

# Regenerate coverage
npm run test:cov
```

---

## Example: Complete Test File

See `test/e2e/example-refactored.e2e-spec.ts` for a complete example demonstrating:

- Setup and teardown
- Using all test utilities
- Data factories
- Assertions
- HTTP helpers
- Test templates
- Common patterns

---

**Last Updated**: December 17, 2025
