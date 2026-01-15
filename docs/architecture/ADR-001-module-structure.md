# ADR 001: Module Structure and Organization

## Status

**Accepted**

## Date

December 16, 2025

## Context

We need a consistent, scalable way to organize modules in the NestJS application that:

- Promotes code reusability and maintainability
- Maintains clear separation of concerns
- Makes modules self-contained and portable
- Provides clear guidelines for developers
- Supports rapid development of new features
- Ensures consistency across the codebase
- Facilitates testing and debugging

### Current Challenges

1. **Inconsistent Organization**: Without a standard structure, different developers might organize modules differently
2. **Tight Coupling**: Module-specific code mixed with shared code creates dependencies
3. **Poor Testability**: Business logic mixed with data access makes testing difficult
4. **Scaling Issues**: As the application grows, poorly organized code becomes unmaintainable
5. **Onboarding Friction**: New developers struggle without clear patterns to follow

## Decision

We have decided to adopt a **layered, feature-based module structure** with the following characteristics:

### 1. Module Structure

Each module follows this standardized structure:

```
module-name/
├── constants/                                # Module-specific constants
│   ├── index.ts                             # Barrel export
│   ├── module-name.constants.ts             # API messages, Swagger config
│   └── module-name-error-codes.constants.ts # Error code enums
├── dto/                                     # Data Transfer Objects
│   ├── index.ts                             # Barrel export
│   ├── create-module-name.dto.ts
│   ├── update-module-name.dto.ts
│   ├── query-module-name.dto.ts
│   └── module-name-response.dto.ts
├── exceptions/                              # Custom exceptions
│   ├── index.ts                             # Barrel export
│   └── module-name.exceptions.ts
├── module-name.controller.ts                # HTTP layer
├── module-name.service.ts                   # Business logic
├── module-name.dal.ts                       # Data Access Layer
├── module-name.module.ts                    # Module definition
└── README.md                                # Module documentation
```

**Note**: Entity types and enums come from Prisma (`@prisma/client`) rather than separate module files. This ensures type safety between database schema and application code.

### 2. Layered Architecture

```
┌─────────────────────────────────────────────┐
│         Controller Layer                    │
│  • HTTP routing                             │
│  • Request validation                       │
│  • Swagger documentation                    │
│  • Response formatting                      │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│         Service Layer                       │
│  • Business logic                           │
│  • Validation                               │
│  • Caching                                  │
│  • Orchestration                            │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│         DAL Layer (Repository)              │
│  • Database queries                         │
│  • Prisma operations                        │
│  • Query building                           │
│  • Error handling                           │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│         Prisma ORM                          │
│  • Type-safe queries                        │
│  • Database abstraction                     │
│  • Migration management                     │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│         PostgreSQL Database                 │
└─────────────────────────────────────────────┘
```

### 3. Key Principles

#### A. Self-Contained Modules

- All module-specific code lives within the module directory
- No task-specific code in common/shared areas
- Constants, exceptions, and error codes are module-scoped
- Modules can be easily moved, copied, or removed

#### B. Consistent Patterns

- All modules follow the same structure
- DTOs use class-validator decorators
- Exceptions extend ApplicationException
- Swagger decorators on all endpoints
- Same caching strategies

#### C. Database Access Layer (DAL)

- Separates data access from business logic
- Makes testing easier (can mock DAL)
- Centralizes Prisma queries
- Handles database errors consistently
- Provides abstraction over ORM

#### D. Error Handling

- Module-specific error codes
- Custom exceptions per module
- Consistent error response format
- Proper HTTP status codes
- Correlation IDs for tracing

#### E. Documentation

- Every module has a README
- Swagger documentation on all endpoints
- Usage examples included
- Architecture explained

### 4. Module Types

We distinguish between three types of modules:

#### Core Modules (Skeleton)

Essential modules that provide base functionality:

- `auth/` - JWT authentication
- `users/` - User management
- `health/` - Health checks

These should **not** be removed.

#### Example Modules (Reference)

Demonstration modules showing best practices:

- `tasks/` - Complete CRUD example

These **can** be removed or modified.

#### Feature Modules (Your Code)

Business-specific modules you create:

- `products/`
- `orders/`
- etc.

### 5. Communication Patterns

Modules communicate through well-defined interfaces:

```typescript
// ✅ Good: Module imports another module's service
@Module({
  imports: [UsersModule],  // Import the module
  // ...
})
export class TasksModule {}

// In TasksService:
constructor(
  private readonly usersService: UsersService  // Inject the service
) {}
```

```typescript
// ❌ Bad: Direct DAL access across modules
constructor(
  private readonly usersDal: UsersDal  // Don't do this!
) {}
```

## Consequences

### Positive Consequences ✅

1. **Clear Organization**: Developers know exactly where to find code
2. **Easy Testing**: Each layer can be mocked independently
3. **Portability**: Modules can be easily reused in other projects
4. **Maintainability**: Changes are isolated to specific modules
5. **Scalability**: Adding new features is straightforward
6. **Onboarding**: New developers can follow existing patterns
7. **Consistency**: All modules look and work the same way
8. **Documentation**: Structure is self-documenting

### Negative Consequences ❌

1. **Initial Overhead**: More setup required for new modules
2. **Boilerplate**: Each module needs similar files (mitigated by generator script)
3. **Discipline Required**: Developers must follow the structure
4. **Some Duplication**: Patterns repeated across modules

### Mitigation Strategies

1. **Generator Script**: `./scripts/generate-module.sh` reduces boilerplate
2. **Documentation**: Clear guides and checklists
3. **Reference Implementation**: Tasks module as example
4. **Code Reviews**: Ensure adherence to standards
5. **Templates**: Provide starting points for common patterns

## Alternatives Considered

### Alternative 1: Flat Structure

```
src/
├── tasks.controller.ts
├── tasks.service.ts
├── tasks.dto.ts
├── tasks.dal.ts
```

**Rejected Because**:

- Becomes unmanageable as application grows
- Hard to find related files
- No clear organization
- Difficult to remove/move features

### Alternative 2: Feature-Based Structure (Extremely Granular)

```
tasks/
├── create-task/
│   ├── create-task.controller.ts
│   ├── create-task.service.ts
│   └── create-task.dto.ts
├── update-task/
│   ├── update-task.controller.ts
│   └── ...
```

**Rejected Because**:

- Too granular for most applications
- Lots of duplication
- Harder to understand relationships
- Overkill for typical REST APIs

### Alternative 3: Domain-Driven Design (Full DDD)

```
tasks/
├── domain/
│   ├── entities/
│   ├── repositories/
│   ├── value-objects/
│   └── aggregates/
├── application/
│   ├── commands/
│   └── queries/
├── infrastructure/
│   └── persistence/
```

**Rejected Because**:

- Too complex for most APIs
- Steep learning curve
- Requires deep DDD knowledge
- Overhead outweighs benefits for typical CRUD APIs

### Alternative 4: Vertical Slice Architecture

```
features/
├── create-task/
│   └── create-task.feature.ts  # Everything in one file
├── update-task/
│   └── update-task.feature.ts
```

**Rejected Because**:

- NestJS doesn't support this well
- Breaks framework conventions
- Hard to share code
- Testing becomes complex

## Implementation Notes

### Generator Script

We provide `./scripts/generate-module.sh` to automate module creation:

```bash
./scripts/generate-module.sh products
```

This creates the full module structure with:

- Constants files with barrel exports
- Error codes
- Exceptions with barrel exports
- DTOs with barrel exports
- Module README
- Proper naming conventions

### Migration Path

For existing code:

1. Identify module boundaries
2. Create new module structure
3. Move files into appropriate folders
4. Update imports
5. Update tests
6. Verify functionality

### Examples

See `src/modules/tasks/` for a complete reference implementation demonstrating all patterns.

## References

- [NestJS Modules](https://docs.nestjs.com/modules)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Vertical Slice Architecture](https://www.jimmybogard.com/vertical-slice-architecture/)
- [Feature-Sliced Design](https://feature-sliced.design/)

## Related ADRs

- ADR-002: Caching Strategy (future)
- ADR-003: Error Handling Patterns (future)
- ADR-004: Testing Strategy (future)

---

**Last Updated**: December 16, 2025  
**Authors**: Development Team  
**Reviewers**: All  
**Status**: Accepted and Implemented
