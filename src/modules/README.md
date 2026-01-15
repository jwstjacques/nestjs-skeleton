# Modules Directory

This directory contains all business logic modules. Each module should be self-contained and follow NestJS best practices.

## Module Structure

```
module-name/
├── constants/
│   ├── module-name.constants.ts           # API tags, swagger docs, cache keys
│   ├── module-name-error-codes.constants.ts
│   └── index.ts                           # Barrel export
├── dto/
│   ├── create-module-name.dto.ts
│   ├── update-module-name.dto.ts
│   ├── query-module-name.dto.ts
│   ├── module-name-response.dto.ts
│   └── index.ts                           # Barrel export
├── exceptions/
│   ├── module-name.exceptions.ts
│   └── index.ts                           # Barrel export
├── module-name.dal.ts                     # Data Access Layer (Prisma)
├── module-name.service.ts                 # Business logic
├── module-name.controller.ts              # HTTP endpoints
├── module-name.module.ts                  # NestJS module definition
└── README.md                              # Setup checklist (generated)
```

## Included Modules

### Core Modules

- **auth/** - JWT authentication (register, login, refresh)
- **users/** - User management

### Example Module

- **tasks/** - Complete CRUD reference implementation
  - Pagination, filtering, sorting
  - Caching with Redis
  - Soft deletes
  - Role-based access control
  - Full Swagger documentation

## Creating a New Module

### Using the Generator (Recommended)

```bash
npm run generate:module products
```

This creates all 15 files with proper structure, including a README with Prisma schema and TODO checklist.

### After Generation

1. Add Prisma model to `prisma/schema.prisma`
2. Add relation to User model
3. Run `npm run prisma:migrate:dev -- --name add-<module>`
4. Run `npm run prisma:generate`
5. Uncomment DAL methods in `<module>.dal.ts`
6. Import module in `src/app.module.ts`
7. Add tests in `test/unit/<module>/` and `test/e2e/`

## Layered Architecture

```
Controller Layer    → HTTP endpoints, routing, Swagger docs
    ↓
Service Layer      → Business logic, validation, orchestration
    ↓
DAL Layer         → Database queries, data access
    ↓
Prisma            → ORM, type safety
    ↓
Database          → PostgreSQL
```

## Module Guidelines

### Self-Contained

- All module-specific code lives within the module folder
- No cross-module dependencies (except shared/common)
- Constants, exceptions, and error codes are module-scoped

### Constants Pattern

Keep all strings in `constants/` folder:

```typescript
// constants/product.constants.ts
export const PRODUCT_API_TAG = "products";
export const PRODUCT_MESSAGES = {
  CREATED: "Product created successfully",
  NOT_FOUND: (id: string) => `Product not found: ${id}`,
};
```

### Exception Pattern

Extend ApplicationException with module error codes:

```typescript
// exceptions/product.exceptions.ts
export class ProductNotFoundException extends ApplicationException {
  constructor(id: string) {
    super(ProductErrorCode.PRODUCT_NOT_FOUND, PRODUCT_MESSAGES.NOT_FOUND(id), HttpStatus.NOT_FOUND);
  }
}
```

### DAL Pattern

Separate database access from business logic:

```typescript
// products.dal.ts
@Injectable()
export class ProductsDal {
  constructor(private prisma: PrismaService) {}

  async findMany(where, skip, take, orderBy) {
    return this.prisma.product.findMany({
      where: { ...where, deletedAt: null },
      skip,
      take,
      orderBy,
    });
  }
}
```

## Best Practices

### ✅ Do

- Use DTOs for all inputs/outputs
- Add validation decorators
- Implement proper error handling
- Use dependency injection
- Add Swagger documentation
- Write comprehensive tests
- Use module-specific constants
- Implement caching where appropriate

### ❌ Don't

- Put business logic in controllers
- Call Prisma directly from services
- Use magic strings/numbers
- Skip input validation
- Mix module concerns

## Reference

See `src/modules/tasks/` for a complete working example.
