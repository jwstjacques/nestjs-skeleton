# Modules Directory

This directory contains all business logic modules. Each module should be self-contained and follow NestJS best practices.

## Module Structure Template

```
module-name/
├── constants/
│   ├── module-name.constants.ts           # Module-specific constants
│   └── module-name-error-codes.constants.ts
├── dto/
│   ├── create-module-name.dto.ts
│   ├── update-module-name.dto.ts
│   ├── query-module-name.dto.ts
│   └── module-name-response.dto.ts
├── entities/
│   └── module-name.entity.ts              # Prisma model type
├── exceptions/
│   └── module-name.exceptions.ts          # Module-specific exceptions
├── module-name.controller.ts
├── module-name.service.ts
├── module-name.dal.ts                     # Database Access Layer
├── module-name.module.ts
└── README.md                              # Module documentation
```

## Included Modules

### Core Modules (Skeleton)

- **auth/** - JWT authentication (register, login, refresh)
- **users/** - User management

### Example Modules (Reference Implementation)

- **tasks/** - Complete CRUD example with all features
  - Can be removed or used as template
  - Shows pagination, filtering, caching, etc.
  - Demonstrates all best practices

## Creating a New Module

### Quick Start

```bash
# 1. Use the generator script
./scripts/generate-module.sh products

# 2. Generate NestJS resource
nest g resource products --no-spec

# 3. Update Prisma schema
# Add your model to prisma/schema.prisma

# 4. Run migration
npm run prisma:migrate:dev
```

### Manual Steps

1. Copy structure from `tasks/` module
2. Create constants file for messages and config
3. Create module-specific exceptions
4. Implement DTOs with validation decorators
5. Add comprehensive tests (unit + E2E)
6. Document in module README
7. Update API documentation

## Module Guidelines

### 1. Self-Contained

Each module should work independently:

- All module-specific code lives within the module folder
- No cross-module dependencies (except shared/common)
- Constants, exceptions, and error codes are module-scoped

### 2. Constants

Keep all strings in `constants/` folder:

```typescript
// constants/products.constants.ts
export const PRODUCTS_API_TAG = "products";
export const PRODUCTS_MESSAGES = {
  CREATED: "Product created successfully",
  UPDATED: "Product updated successfully",
  // ...
};
```

### 3. Exceptions

Extend ApplicationException and use module error codes:

```typescript
// exceptions/product.exceptions.ts
export class ProductNotFoundException extends ApplicationException {
  constructor(id: string) {
    super(ProductErrorCode.PRODUCT_NOT_FOUND, `Product not found: ${id}`, HttpStatus.NOT_FOUND);
  }
}
```

### 4. Testing

Aim for >95% coverage:

- Unit tests for service, controller, DAL
- E2E tests for all endpoints
- Mock external dependencies
- Use test data factories

### 5. Documentation

Add comprehensive documentation:

- Swagger decorators on all endpoints
- Module README with examples
- API usage examples
- Error response documentation

## Layered Architecture

All modules follow this pattern:

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

### Example Flow

```typescript
// 1. Controller receives HTTP request
@Post()
async create(@Body() dto: CreateProductDto) {
  return this.productsService.create(dto);
}

// 2. Service validates and processes
async create(dto: CreateProductDto) {
  // Validation, business rules
  const product = await this.productsDal.create(dto);
  await this.cacheManager.del('products:list');
  return product;
}

// 3. DAL executes database query
async create(data: CreateProductDto) {
  return this.prisma.product.create({ data });
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
- Add proper logging

### ❌ Don't

- Put business logic in controllers
- Call Prisma directly from services
- Use magic strings/numbers
- Skip input validation
- Forget error handling
- Mix module concerns
- Skip documentation
- Ignore test coverage

## Common Patterns

### Pagination

```typescript
// query-products.dto.ts
export class QueryProductsDto extends PaginationDto {
  @IsOptional()
  @IsEnum(ProductCategory)
  category?: ProductCategory;
}

// products.service.ts
async findAll(query: QueryProductsDto) {
  const { page, limit, skip } = this.getPaginationParams(query);

  const [data, total] = await Promise.all([
    this.productsDal.findMany({ skip, take: limit, where: query }),
    this.productsDal.count({ where: query }),
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

### Caching

```typescript
// products.service.ts
async findById(id: string) {
  const cacheKey = `products:${id}`;

  // Try cache first
  const cached = await this.cacheManager.get(cacheKey);
  if (cached) return cached;

  // Fetch from database
  const product = await this.productsDal.findById(id);

  // Store in cache
  await this.cacheManager.set(cacheKey, product, 300_000); // 5 minutes

  return product;
}
```

### Soft Deletes

```typescript
// products.dal.ts
async softDelete(id: string) {
  return this.prisma.product.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}

async findMany(params: FindManyParams) {
  return this.prisma.product.findMany({
    ...params,
    where: {
      ...params.where,
      deletedAt: null, // Only active records
    },
  });
}
```

## Resources

- [Module Creation Checklist](../../docs/MODULE-CREATION-CHECKLIST.md)
- [Architecture Patterns](../../docs/architecture/PATTERNS.md)
- [Tasks Module Guide](../../docs/examples/TASKS_MODULE_GUIDE.md)
- [Testing Guide](../../docs/TESTING.md)
- [Development Guide](../../docs/DEVELOPMENT.md)

## Need Help?

1. Check the Tasks module for reference implementation
2. Review architecture documentation
3. Follow the module creation checklist
4. Run the generator script for boilerplate

---

**Last Updated**: December 16, 2025
