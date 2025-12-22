# Shared Pagination Constants - Usage Guide

## Overview

The pagination system provides a **three-tier architecture** for consistent, DRY pagination across all modules:

1. **Constants Layer**: Shared values, enums, and Swagger helpers
2. **Base DTO Layer**: Generic base class with common pagination fields
3. **Module Layer**: Resource-specific DTOs extending the base class

This guide covers the constants layer. For the base DTO, see [Base Query DTO Guide](./BASE_QUERY_DTO_GUIDE.md).

## Location

- **Constants File**: `src/common/constants/pagination.constants.ts`
- **Base DTO**: `src/common/dto/paginated-query.dto.ts`
- **Runtime Config**: `src/config/providers/pagination.config.ts`
- **Config Schema**: `src/config/schemas/pagination.schema.ts`

## Quick Start (Recommended - Const Pattern)

**For new modules, use the base DTO with const pattern:**

```typescript
import { PaginatedQueryDto } from "../../../common/dto";
import { BaseSortByFields } from "../../../common/constants";

export const ProductSortBy = {
  ...BaseSortByFields, // CREATED_AT, UPDATED_AT
  NAME: "name",
  PRICE: "price",
} as const;

export type ProductSortBy = (typeof ProductSortBy)[keyof typeof ProductSortBy];

export class QueryProductDto extends PaginatedQueryDto<ProductSortBy> {
  @ApiPropertyOptional({ enum: Object.values(ProductSortBy) })
  @IsOptional()
  @IsEnum(Object.values(ProductSortBy))
  sortBy?: ProductSortBy = ProductSortBy.CREATED_AT;
  // Add resource-specific filters...
}
```

See [Base Query DTO Guide](./BASE_QUERY_DTO_GUIDE.md) and [Const Sort Fields Pattern](./CONST_SORT_FIELDS_PATTERN.md) for complete documentation.

---

## What's Included

### 1. `PAGINATION_CONSTANTS`

Core pagination values (static, build-time):

```typescript
export const PAGINATION_CONSTANTS = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  MIN_PAGE: 1,
  MIN_LIMIT: 1,
} as const;
```

### 2. `SORT_ORDER`

Standard sort order values:

```typescript
export const SORT_ORDER = {
  ASC: "ASC",
  DESC: "DESC",
} as const;
```

### 3. `PAGINATION_SWAGGER_QUERIES`

Reusable Swagger `@ApiQuery` decorators:

- `page()` - Page number query parameter
- `limit()` - Items per page query parameter
- `sortBy()` - Sort field query parameter
- `sortOrder()` - Sort order (ASC/DESC) query parameter
- `search()` - Search term query parameter

### 4. `PAGINATION_VALIDATION_MESSAGES`

Standard validation error messages:

```typescript
export const PAGINATION_VALIDATION_MESSAGES = {
  PAGE_MIN: "Page must be at least 1",
  PAGE_MUST_BE_NUMBER: "Page must be a number",
  LIMIT_MIN: "Limit must be at least 1",
  LIMIT_MAX: "Limit must not exceed 100",
  LIMIT_MUST_BE_NUMBER: "Limit must be a number",
  SORT_ORDER_INVALID: "Sort order must be either ASC or DESC",
} as const;
```

---

## Usage Examples

### Example 1: Basic Pagination in Controller

**Simple usage with defaults:**

```typescript
import { Controller, Get, Query } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiOkResponse } from "@nestjs/swagger";
import { PAGINATION_SWAGGER_QUERIES } from "../../common/constants";

@ApiTags("products")
@Controller("products")
export class ProductsController {
  @Get()
  @ApiOperation({ summary: "Get all products" })
  @ApiOkResponse({ description: "Products retrieved successfully" })
  @ApiQuery(PAGINATION_SWAGGER_QUERIES.page())
  @ApiQuery(PAGINATION_SWAGGER_QUERIES.limit())
  @ApiQuery(PAGINATION_SWAGGER_QUERIES.sortOrder({ default: "ASC" }))
  async findAll(@Query() query: QueryProductDto) {
    return this.productsService.findAll(query);
  }
}
```

### Example 2: Customized Pagination Examples

**Custom examples for specific use cases:**

```typescript
@Get()
@ApiQuery(PAGINATION_SWAGGER_QUERIES.page({ example: 2 })) // Show page 2 example
@ApiQuery(
  PAGINATION_SWAGGER_QUERIES.limit({
    example: 25,
    default: 20,
    max: 50, // Override default max
  }),
)
@ApiQuery(
  PAGINATION_SWAGGER_QUERIES.search({
    example: "laptop",
    fields: "name, description, sku",
  }),
)
@ApiQuery(
  PAGINATION_SWAGGER_QUERIES.sortBy({
    enum: ["name", "price", "createdAt", "stock"],
    default: "createdAt",
    example: "price",
  }),
)
@ApiQuery(PAGINATION_SWAGGER_QUERIES.sortOrder({ default: "DESC", example: "ASC" }))
async findAll(@Query() query: QueryProductDto) {
  return this.productsService.findAll(query);
}
```

### Example 3: Query DTO with Shared Constants

**In your DTO file:**

```typescript
import { IsOptional, IsInt, Min, Max } from "class-validator";
import { Type } from "class-transformer";
import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  PAGINATION_CONSTANTS,
  PAGINATION_VALIDATION_MESSAGES,
  ValidationMessages,
} from "../../common/constants";

export class QueryProductDto {
  @ApiPropertyOptional({
    description: "Page number for pagination",
    example: 1,
    default: PAGINATION_CONSTANTS.DEFAULT_PAGE,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: ValidationMessages.mustBeNumber("Page") })
  @Min(PAGINATION_CONSTANTS.MIN_PAGE, { message: PAGINATION_VALIDATION_MESSAGES.PAGE_MIN })
  page?: number = PAGINATION_CONSTANTS.DEFAULT_PAGE;

  @ApiPropertyOptional({
    description: "Number of items per page",
    example: PAGINATION_CONSTANTS.DEFAULT_LIMIT,
    maximum: PAGINATION_CONSTANTS.MAX_LIMIT,
    default: PAGINATION_CONSTANTS.DEFAULT_LIMIT,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: ValidationMessages.mustBeNumber("Limit") })
  @Min(PAGINATION_CONSTANTS.MIN_LIMIT, { message: PAGINATION_VALIDATION_MESSAGES.LIMIT_MIN })
  @Max(PAGINATION_CONSTANTS.MAX_LIMIT, { message: PAGINATION_VALIDATION_MESSAGES.LIMIT_MAX })
  limit?: number = PAGINATION_CONSTANTS.DEFAULT_LIMIT;

  @ApiPropertyOptional({
    description: "Sort order",
    enum: ["ASC", "DESC"],
    default: "DESC",
  })
  @IsOptional()
  @IsEnum(["ASC", "DESC"], { message: PAGINATION_VALIDATION_MESSAGES.SORT_ORDER_INVALID })
  sortOrder?: "ASC" | "DESC" = "DESC";
}
```

### Example 4: Module-Specific Sort Fields

**Different modules can have different sortable fields:**

```typescript
// Products module
@ApiQuery(
  PAGINATION_SWAGGER_QUERIES.sortBy({
    enum: ["name", "price", "stock", "createdAt"],
    default: "createdAt",
  }),
);

// Orders module
@ApiQuery(
  PAGINATION_SWAGGER_QUERIES.sortBy({
    enum: ["orderDate", "status", "total", "customerId"],
    default: "orderDate",
  }),
);

// Tasks module (existing example)
@ApiQuery(
  PAGINATION_SWAGGER_QUERIES.sortBy({
    enum: ["CREATED_AT", "UPDATED_AT", "DUE_DATE", "TITLE", "PRIORITY", "STATUS"],
    default: "CREATED_AT",
  }),
);
```

### Example 5: Custom Descriptions

**Override default descriptions for module-specific context:**

```typescript
@Get()
@ApiQuery(PAGINATION_SWAGGER_QUERIES.page())
@ApiQuery(PAGINATION_SWAGGER_QUERIES.limit({ example: 50 }))
@ApiQuery(
  PAGINATION_SWAGGER_QUERIES.search({
    example: "Premium customer",
    fields: "name, email, phone",
    description: "Search customers by name, email, or phone number",
  }),
)
@ApiQuery(
  PAGINATION_SWAGGER_QUERIES.sortBy({
    enum: ["firstName", "lastName", "email", "createdAt"],
    default: "lastName",
    description: "Sort customers by field (default: lastName)",
  }),
)
async findAll(@Query() query: QueryCustomerDto) {
  return this.customersService.findAll(query);
}
```

---

## Real-World Example: Tasks Module

**Before (Hardcoded):**

```typescript
@ApiQuery({
  name: "page",
  required: false,
  type: Number,
  description: "Page number (default: 1)",
  example: 1,
})
@ApiQuery({
  name: "limit",
  required: false,
  type: Number,
  description: "Items per page (default: 10, max: 100)",
  example: 10,
})
@ApiQuery({
  name: "sortOrder",
  required: false,
  enum: ["ASC", "DESC"],
  description: "Sort order: ascending or descending",
})
```

**After (Using Shared Constants):**

```typescript
@ApiQuery(PAGINATION_SWAGGER_QUERIES.page())
@ApiQuery(PAGINATION_SWAGGER_QUERIES.limit())
@ApiQuery(PAGINATION_SWAGGER_QUERIES.sortOrder({ default: "DESC" }))
```

**Benefits:**

- ✅ 12 lines reduced to 3 lines
- ✅ Consistent descriptions across all endpoints
- ✅ Easy to update examples globally
- ✅ Type-safe and autocomplete-friendly

---

## Configuration Relationship

### Build-Time vs Runtime

| Constant               | Purpose                             | Location                  | Usage                                   |
| ---------------------- | ----------------------------------- | ------------------------- | --------------------------------------- |
| `PAGINATION_CONSTANTS` | Static values for decorators & DTOs | `pagination.constants.ts` | Build-time (decorators, class defaults) |
| `PaginationConfig`     | Runtime configuration from env vars | `pagination.config.ts`    | Runtime (service logic, dynamic values) |

### Example: Using Both

**DTO (Build-Time):**

```typescript
// Uses static constants for decorator metadata
@Max(PAGINATION_CONSTANTS.MAX_LIMIT)
limit?: number = PAGINATION_CONSTANTS.DEFAULT_LIMIT;
```

**Service (Runtime):**

```typescript
// Uses injected config for business logic
constructor(
  @Inject(paginationConfig.KEY)
  private readonly paginationConfig: ConfigType<typeof paginationConfig>,
) {}

async findAll(query: QueryDto) {
  const limit = Math.min(
    query.limit || this.paginationConfig.defaultLimit,
    this.paginationConfig.maxLimit,
  );
  // ...
}
```

---

## Advanced: Creating a Base Query DTO

**For maximum reusability, create a base class:**

```typescript
// src/common/dto/paginated-query.dto.ts
import { IsOptional, IsInt, Min, Max, IsEnum } from "class-validator";
import { Type } from "class-transformer";
import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  PAGINATION_CONSTANTS,
  PAGINATION_VALIDATION_MESSAGES,
  ValidationMessages,
} from "../constants";

export class PaginatedQueryDto {
  @ApiPropertyOptional({
    description: "Page number",
    example: 1,
    default: PAGINATION_CONSTANTS.DEFAULT_PAGE,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: ValidationMessages.mustBeNumber("Page") })
  @Min(PAGINATION_CONSTANTS.MIN_PAGE, { message: PAGINATION_VALIDATION_MESSAGES.PAGE_MIN })
  page?: number = PAGINATION_CONSTANTS.DEFAULT_PAGE;

  @ApiPropertyOptional({
    description: "Items per page",
    example: PAGINATION_CONSTANTS.DEFAULT_LIMIT,
    maximum: PAGINATION_CONSTANTS.MAX_LIMIT,
    default: PAGINATION_CONSTANTS.DEFAULT_LIMIT,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: ValidationMessages.mustBeNumber("Limit") })
  @Min(PAGINATION_CONSTANTS.MIN_LIMIT, { message: PAGINATION_VALIDATION_MESSAGES.LIMIT_MIN })
  @Max(PAGINATION_CONSTANTS.MAX_LIMIT, { message: PAGINATION_VALIDATION_MESSAGES.LIMIT_MAX })
  limit?: number = PAGINATION_CONSTANTS.DEFAULT_LIMIT;

  @ApiPropertyOptional({
    description: "Sort order",
    enum: ["ASC", "DESC"],
    default: "DESC",
  })
  @IsOptional()
  @IsEnum(["ASC", "DESC"], { message: PAGINATION_VALIDATION_MESSAGES.SORT_ORDER_INVALID })
  sortOrder?: "ASC" | "DESC" = "DESC";
}

// Then extend it in module-specific DTOs
export class QueryProductDto extends PaginatedQueryDto {
  @ApiPropertyOptional({ enum: ["name", "price", "stock"] })
  @IsOptional()
  @IsEnum(["name", "price", "stock"])
  sortBy?: string = "name";

  @ApiPropertyOptional({ description: "Filter by category" })
  @IsOptional()
  category?: string;
}
```

---

## Migration Checklist

When adding a new module with pagination:

- [ ] Import `PAGINATION_SWAGGER_QUERIES` in your controller
- [ ] Use `@ApiQuery(PAGINATION_SWAGGER_QUERIES.page())` for page parameter
- [ ] Use `@ApiQuery(PAGINATION_SWAGGER_QUERIES.limit())` for limit parameter
- [ ] Use `@ApiQuery(PAGINATION_SWAGGER_QUERIES.sortOrder())` for sort order
- [ ] Use `@ApiQuery(PAGINATION_SWAGGER_QUERIES.sortBy({ enum: [...] }))` with your fields
- [ ] Import `PAGINATION_CONSTANTS` in your DTO
- [ ] Use `PAGINATION_CONSTANTS` for `@Max`, `@Min`, default values
- [ ] Import `PAGINATION_VALIDATION_MESSAGES` for validation error messages
- [ ] Consider extending `PaginatedQueryDto` if you create the base class

---

## API Documentation Examples

The Swagger UI will show:

```
GET /api/v1/products

Query Parameters:
┌──────────┬──────────┬─────────┬────────────────────────────────┐
│ Name     │ Type     │ Required│ Description                    │
├──────────┼──────────┼─────────┼────────────────────────────────┤
│ page     │ number   │ No      │ Page number (default: 1)       │
│ limit    │ number   │ No      │ Items per page (default: 10,   │
│          │          │         │ max: 100)                      │
│ sortBy   │ string   │ No      │ Field to sort by (default:     │
│          │          │         │ createdAt)                     │
│ sortOrder│ string   │ No      │ Sort order: ascending (ASC) or │
│          │          │         │ descending (DESC) (default:    │
│          │          │         │ DESC)                          │
│ search   │ string   │ No      │ Search term to filter results  │
│          │          │         │ (searches: name, description)  │
└──────────┴──────────┴─────────┴────────────────────────────────┘
```

---

## Summary

**Key Benefits:**

✅ **Consistency** - All modules use the same pagination patterns  
✅ **DRY** - No repeated decorator code  
✅ **Maintainability** - Update descriptions in one place  
✅ **Flexibility** - Customize examples per endpoint  
✅ **Type Safety** - Full TypeScript support with autocomplete  
✅ **Documentation** - Clear, consistent API docs

**Files Modified:**

- ✅ Created: `src/common/constants/pagination.constants.ts`
- ✅ Updated: `src/common/constants/index.ts` (added export)
- ✅ Updated: `src/modules/tasks/tasks.controller.ts` (uses new constants)
- ✅ Updated: `src/modules/tasks/dto/query-task.dto.ts` (uses new constants)

**Next Steps:**

When creating new modules, use these shared constants from day one!
