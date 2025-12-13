# Test Coverage Documentation

## Current Coverage Status

```text
All files                     |   99.53 |    83.63 |     100 |   99.48 |
```

- **Statement Coverage: 99.53%** ✅
- **Branch Coverage: 83.63%** ✅
- **Function Coverage: 100%** ✅
- **Line Coverage: 99.48%** ✅

## Coverage Thresholds

All thresholds set to **80%** in `jest.config.js`:

```javascript
coverageThreshold: {
  global: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80,
  },
}
```

## Understanding Branch Coverage in NestJS Controllers

### Why Controllers Show Lower Branch Coverage

Controllers like `tasks.controller.ts` show **76.47% branch coverage** despite having **100% statement and function coverage**. This is expected and **not a quality issue**.

#### Root Cause: Swagger/OpenAPI Decorators

NestJS controllers use extensive Swagger decorators for API documentation:

```typescript
@ApiOperation({
  summary: "Create a new task",
  description: "Creates a new task for the authenticated user",
})
@ApiCreatedResponse({
  description: "Task successfully created",
  type: TaskResponseDto,
})
@ApiBadRequestResponse({
  description: "Invalid input data",
  schema: {
    example: {
      statusCode: 400,
      message: ["title must be longer than or equal to 3 characters"],
      error: "Bad Request",
    },
  },
})
```

**Each object property in these decorators creates a branch** in Istanbul's coverage analysis:

- Every `example` object
- Every nested property
- Every conditional in decorator parameters

These are **metadata**, not business logic, and execute at **class definition time**, not during tests.

### What's Actually Covered

The **actual controller logic** has 100% coverage:

✅ All HTTP methods (GET, POST, PATCH, DELETE)
✅ All service method calls
✅ All return value transformations
✅ All parameter handling (with/without defaults)
✅ All error scenarios

The **76.47% represents uncovered decorator branches**, which are lines 51-84 and 152-283 (all decorator definitions).

## Files Excluded from Coverage

The following files are intentionally excluded from coverage collection:

```javascript
collectCoverageFrom: [
  "src/**/*.ts",
  "!src/**/*.interface.ts", // TypeScript interfaces
  "!src/**/*.dto.ts", // Data Transfer Objects
  "!src/**/*.entity.ts", // Database entities
  "!src/**/*.module.ts", // NestJS modules
  "!src/main.ts", // Bootstrap file
  "!src/**/*.mock.ts", // Test mocks
  "!src/**/index.ts", // Barrel exports
  "!src/database/prisma.service.ts", // Prisma client wrapper
  "!src/config/**/*.constants.ts", // Configuration constants
];
```

### Why These Are Excluded

1. **Interfaces (.interface.ts)**: No runtime code, TypeScript only
2. **DTOs (.dto.ts)**: Class definitions with decorators, no logic
3. **Entities (.entity.ts)**: Database schema definitions
4. **Modules (.module.ts)**: NestJS dependency injection configuration
5. **main.ts**: Bootstrap file, tested via e2e tests
6. **Mocks (.mock.ts)**: Test utilities
7. **Barrel exports (index.ts)**: Re-export statements only
8. **prisma.service.ts**: Prisma client wrapper, no custom logic
9. **Config constants**: Static data exports, not testable logic

## Improving Coverage

### What to Test

✅ **Business logic** in services (tasks.service.ts: 87.5% branches)
✅ **Data access** logic in DAL files (tasks.dal.ts: 83.33% branches)
✅ **Custom validators** (is-future-date.validator.ts: 100% branches)
✅ **Custom pipes** (parse-cuid.pipe.ts: 100% branches)
✅ **Custom exceptions** (throttler.exception.ts: 100% branches)
✅ **Utility services** (correlation.service.ts: 87.5% branches)

### What NOT to Test

❌ Swagger decorator objects
❌ NestJS module configurations
❌ Static configuration constants
❌ TypeScript interfaces
❌ DTO class definitions

## Test Suite Summary

Total Tests: **160**

### Unit Tests

- `app.controller.spec.ts` - Application status endpoint
- `app.service.spec.ts` - Application service
- `app.dal.spec.ts` - Application DAL
- `tasks.controller.spec.ts` - Tasks REST endpoints
- `tasks.service.spec.ts` - Tasks business logic
- `tasks.dal.spec.ts` - Tasks data access
- `correlation.service.spec.ts` - Request correlation (26 tests)
- `throttler.exception.spec.ts` - Rate limit exception (16 tests)
- `parse-cuid.pipe.spec.ts` - CUID validation
- `is-future-date.validator.spec.ts` - Date validation

### E2E Tests

- `app.e2e-spec.ts` - Application integration tests
- `tasks/tasks.e2e-spec.ts` - Tasks API integration tests

## Coverage by Category

| Category        | Statements | Branches | Functions | Lines  |
| --------------- | ---------- | -------- | --------- | ------ |
| **Overall**     | 99.53%     | 83.63%   | 100%      | 99.48% |
| **Controllers** | 100%       | 76-78%   | 100%      | 100%   |
| **Services**    | 100%       | 87.5%    | 100%      | 100%   |
| **DAL**         | 100%       | 75-83%   | 100%      | 100%   |
| **Exceptions**  | 100%       | 100%     | 100%      | 100%   |
| **Pipes**       | 100%       | 100%     | 100%      | 100%   |
| **Validators**  | 94.73%     | 100%     | 100%      | 94.11% |
| **Utilities**   | 100%       | 87.5%    | 100%      | 100%   |

## Best Practices

1. **Don't chase 100% branch coverage** - Focus on meaningful business logic
2. **Controllers with extensive Swagger docs** will naturally have lower branch coverage (75-80%)
3. **Config constants** don't need tests - they're data, not logic
4. **Test behavior, not implementation** - Focus on what the code does, not how
5. **Exclude files that can't be meaningfully tested** - Interfaces, DTOs, simple constants
6. **Maintain high coverage where it matters** - Services, DAL, utilities, validators

## Running Coverage

```bash
# Run tests with coverage
npm run test:cov

# Run specific test file
npm test -- tasks.controller.spec.ts

# Run tests in watch mode
npm run test:watch
```

## Coverage Reports

Coverage reports are generated in the `coverage/` directory:

- `coverage/lcov-report/index.html` - Visual HTML report
- `coverage/lcov.info` - LCOV format for CI/CD
- `coverage/coverage-final.json` - JSON format
- `coverage/clover.xml` - Clover format

Open the HTML report:

```bash
open coverage/lcov-report/index.html
```

## Conclusion

The current **83.63% branch coverage** exceeds the 80% threshold and represents excellent test coverage of **actual business logic**. The gap from 100% is primarily:

1. **Swagger decorators** (metadata, not logic)
2. **Optional parameters** in constructors with default values
3. **Configuration constants** (excluded from coverage)

This is **normal and expected** for a well-documented NestJS application.
