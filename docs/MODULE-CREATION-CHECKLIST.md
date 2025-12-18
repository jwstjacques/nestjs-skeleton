# Module Creation Checklist

Use this checklist when creating a new module to ensure all best practices are followed.

---

## 📋 Planning Phase

- [ ] Define module purpose and scope
- [ ] Design database schema (fields, relations, indexes)
- [ ] List required API endpoints
- [ ] Identify validation rules and constraints
- [ ] Plan error scenarios and error codes
- [ ] Determine caching strategy
- [ ] Plan authentication/authorization requirements

---

## 🏗️ Initial Setup

### Generate Structure

- [ ] Run generator: `./scripts/generate-module.sh <module-name>`
- [ ] Review generated files in `src/modules/<module-name>/`
- [ ] Update generated `README.md` with module description

### Database Setup

- [ ] Update Prisma schema in `prisma/schema.prisma`
- [ ] Add appropriate indexes for query performance
- [ ] Add relations to other models (if needed)
- [ ] Run migration: `npm run prisma:migrate:dev --name add_<module-name>`
- [ ] Verify migration in database

### NestJS Resource

- [ ] Generate resource: `nest g resource <module-name> --no-spec`
- [ ] Remove auto-generated files not needed
- [ ] Update module imports in `app.module.ts`

---

## 📝 Implementation

### Constants & Configuration

- [ ] Review `constants/<module>.constants.ts`
- [ ] Add module-specific API response messages
- [ ] Add validation error messages
- [ ] Define Swagger examples
- [ ] Configure cache keys and TTLs
- [ ] Review `constants/<module>-error-codes.constants.ts`
- [ ] Add all needed error codes

### Data Models

- [ ] Create enums in `enums/` (if needed)
  - [ ] Add Swagger decorators (`@ApiProperty`)
  - [ ] Export from enum files
- [ ] Define entity type in `entities/`
  - [ ] Import Prisma generated type
  - [ ] Add any custom types or interfaces
- [ ] Add JSDoc comments to all entities

### DTOs (Data Transfer Objects)

- [ ] Create `create-<module>.dto.ts`
  - [ ] Add all required fields
  - [ ] Add validation decorators (`@IsNotEmpty`, `@IsString`, etc.)
  - [ ] Add Swagger decorators (`@ApiProperty`, `@ApiPropertyOptional`)
  - [ ] Use constants for validation messages
  - [ ] Add example values for Swagger
- [ ] Create `update-<module>.dto.ts`
  - [ ] Extend `PartialType(Create<Module>Dto)` if appropriate
  - [ ] Add validation decorators
  - [ ] Add Swagger decorators
- [ ] Create `query-<module>.dto.ts`
  - [ ] Extend `PaginationDto` for pagination support
  - [ ] Add filter fields with validation
  - [ ] Add sorting fields
  - [ ] Add search fields (if needed)
  - [ ] Add Swagger decorators
- [ ] Create `<module>-response.dto.ts`
  - [ ] Define response structure
  - [ ] Add Swagger decorators
  - [ ] Include example responses

### Exceptions

- [ ] Review generated exceptions in `exceptions/<module>.exceptions.ts`
- [ ] Add any additional custom exceptions needed
- [ ] Ensure all exceptions extend `ApplicationException`
- [ ] Use module-specific error codes from constants
- [ ] Add proper HTTP status codes

### Database Access Layer (DAL)

- [ ] Create `<module>.dal.ts`
- [ ] Inject `PrismaService`
- [ ] Implement CRUD methods:
  - [ ] `create(data)` - Create new record
  - [ ] `findById(id)` - Find single record
  - [ ] `findMany(params)` - Find multiple with filters
  - [ ] `count(where)` - Count records
  - [ ] `update(id, data)` - Update record
  - [ ] `softDelete(id)` - Soft delete (set deletedAt)
  - [ ] `purge(id)` - Hard delete (permanent removal)
- [ ] Add query methods (filters, search, etc.)
- [ ] Handle soft deletes (`where: { deletedAt: null }`)
- [ ] Add error handling for Prisma errors
- [ ] Add logging for database operations

### Service Layer

- [ ] Create/update `<module>.service.ts`
- [ ] Inject dependencies (DAL, CacheManager, Logger)
- [ ] Implement business logic methods:
  - [ ] `create(dto, userId)`
  - [ ] `findAll(query, userId)`
  - [ ] `findOne(id, userId)`
  - [ ] `update(id, dto, userId)`
  - [ ] `remove(id, userId)`
  - [ ] `purge(id, userId)`
- [ ] Add input validation
- [ ] Implement ownership verification
- [ ] Add caching logic:
  - [ ] Cache read operations
  - [ ] Invalidate cache on writes
  - [ ] Use appropriate TTLs
- [ ] Add proper error handling
- [ ] Add logging with correlation IDs
- [ ] Add comprehensive JSDoc comments

### Controller Layer

- [ ] Create/update `<module>.controller.ts`
- [ ] Add controller-level decorators:
  - [ ] `@Controller('<module-name>')`
  - [ ] `@ApiTags('<module-name>')`
  - [ ] `@UseGuards(JwtAuthGuard)`
- [ ] Define routes with HTTP verbs:
  - [ ] POST `create()`
  - [ ] GET `findAll()`
  - [ ] GET `:id` `findOne()`
  - [ ] PATCH `:id` `update()`
  - [ ] DELETE `:id` `remove()`
  - [ ] DELETE `:id/purge` `purge()` (if needed)
- [ ] Add Swagger decorators for each endpoint:
  - [ ] `@ApiOperation()` - Description
  - [ ] `@ApiResponse()` - Success responses
  - [ ] `@ApiResponse()` - Error responses
  - [ ] `@ApiParam()` - Path parameters
  - [ ] `@ApiQuery()` - Query parameters
  - [ ] `@ApiBody()` - Request body
- [ ] Add authentication decorators (`@CurrentUser()`)
- [ ] Add validation pipes
- [ ] Add response transformation
- [ ] Add proper HTTP status codes

### Module Configuration

- [ ] Update `<module>.module.ts`
- [ ] Import required modules:
  - [ ] `PrismaModule`
  - [ ] `CacheModule` (if using cache)
  - [ ] Other dependencies
- [ ] Declare controllers
- [ ] Declare providers (service, DAL)
- [ ] Export services if needed by other modules

---

## 🧪 Testing

### Unit Tests

- [ ] Create `test/unit/<module>/<module>.dal.spec.ts`
  - [ ] Test all DAL methods
  - [ ] Mock PrismaService
  - [ ] Test error scenarios
  - [ ] Aim for >95% coverage
- [ ] Create `test/unit/<module>/<module>.service.spec.ts`
  - [ ] Test all service methods
  - [ ] Mock DAL and CacheManager
  - [ ] Test business logic
  - [ ] Test validation
  - [ ] Test ownership verification
  - [ ] Test caching logic
  - [ ] Test error handling
  - [ ] Aim for >95% coverage
- [ ] Create `test/unit/<module>/<module>.controller.spec.ts`
  - [ ] Test all endpoints
  - [ ] Mock service
  - [ ] Test request validation
  - [ ] Test response formatting
  - [ ] Aim for >95% coverage

### E2E Tests

- [ ] Create `test/e2e/<module>/<module>.e2e-spec.ts`
- [ ] Test all endpoints with real HTTP requests:
  - [ ] POST create - success case
  - [ ] POST create - validation errors
  - [ ] GET list - with pagination
  - [ ] GET list - with filters
  - [ ] GET list - with sorting
  - [ ] GET single - success case
  - [ ] GET single - not found (404)
  - [ ] PATCH update - success case
  - [ ] PATCH update - not found (404)
  - [ ] PATCH update - forbidden (403)
  - [ ] DELETE remove - success case
  - [ ] DELETE remove - not found (404)
- [ ] Test authentication requirements
- [ ] Test ownership verification
- [ ] Clean up test data after each test
- [ ] Use test data factories

### Coverage

- [ ] Run tests: `npm test -- <module>`
- [ ] Check coverage: `npm run test:cov`
- [ ] Ensure >95% coverage for:
  - [ ] Service
  - [ ] Controller
  - [ ] DAL
- [ ] Fix any uncovered branches

---

## 📚 Documentation

### Module Documentation

- [ ] Complete `src/modules/<module>/README.md`
- [ ] Add module overview and purpose
- [ ] Document all features
- [ ] Add API endpoint table
- [ ] Include usage examples
- [ ] Document database schema
- [ ] Add implementation details
- [ ] Link to related documentation

### API Documentation

- [ ] Verify Swagger docs render correctly
  - [ ] Visit `/api/v1/docs`
  - [ ] Check all endpoints are listed
  - [ ] Verify request/response examples
  - [ ] Test "Try it out" functionality
- [ ] Update main API documentation
- [ ] Add examples to `docs/API_EXAMPLES.md`
- [ ] Update `docs/ENDPOINTS.md`

### Postman Collection

- [ ] Add module endpoints to Postman collection
- [ ] Create example requests
- [ ] Add tests for each endpoint
- [ ] Export updated collection

---

## ✅ Validation

### Code Quality

- [ ] Run linting: `npm run lint`
- [ ] Fix all lint errors
- [ ] Run prettier: `npm run format`
- [ ] Check TypeScript: `npm run build`
- [ ] No TypeScript errors
- [ ] All imports resolved

### Functional Testing

- [ ] Start application: `npm run start:dev`
- [ ] Test create endpoint
- [ ] Test list endpoint with pagination
- [ ] Test filter functionality
- [ ] Test update endpoint
- [ ] Test delete endpoint
- [ ] Verify caching is working
- [ ] Check logs for errors

### Error Handling

- [ ] Test with invalid IDs (404 responses)
- [ ] Test without authentication (401 responses)
- [ ] Test with wrong user (403 responses)
- [ ] Test with invalid data (400 responses)
- [ ] Verify error responses have correct format
- [ ] Check correlation IDs in error logs

### Performance

- [ ] Verify caching reduces database queries
- [ ] Check query performance with indexes
- [ ] Test with pagination on large datasets
- [ ] Monitor response times

---

## 🚀 Integration

### Code Integration

- [ ] Update `src/app.module.ts`:
  - [ ] Import module
  - [ ] Add to imports array
- [ ] Run all tests: `npm run test:all`
- [ ] Ensure all tests pass
- [ ] Check overall coverage maintained

### Database

- [ ] Verify migration applied successfully
- [ ] Check database schema is correct
- [ ] Verify indexes created
- [ ] Test with sample data

### Documentation Updates

- [ ] Update main `README.md` if needed
- [ ] Update `CHANGELOG.md` with new module
- [ ] Add migration notes if needed

---

## 📦 Deployment Preparation

### Environment Variables

- [ ] Add any new environment variables to `.env.example`
- [ ] Document variables in `docs/ENVIRONMENT_VARIABLES.md`
- [ ] Update `.env.template`

### Migration Planning

- [ ] Document breaking changes (if any)
- [ ] Create migration guide for existing data
- [ ] Plan rollback strategy

---

## ✨ Final Checklist

- [ ] All tests passing (unit + E2E)
- [ ] Code coverage >95%
- [ ] No linting errors
- [ ] TypeScript compiles without errors
- [ ] Swagger documentation complete
- [ ] Module README complete
- [ ] API examples documented
- [ ] Postman collection updated
- [ ] Code reviewed
- [ ] Ready for git commit

---

## 📖 Reference Implementation

For a complete example, refer to the **Tasks Module**:

- Source: `src/modules/tasks/`
- Tests: `test/unit/tasks/` and `test/e2e/tasks/`
- Documentation: `src/modules/tasks/README.md`

---

## 🔗 Related Documentation

- [Modules Directory README](../src/modules/README.md)
- [Architecture Patterns](./architecture/PATTERNS.md)
- [Testing Guide](./TESTING.md)
- [Development Guide](./DEVELOPMENT.md)
- [Tasks Module Guide](./examples/TASKS_MODULE_GUIDE.md)

---

**Use this checklist for every new module to ensure consistency and quality!**
