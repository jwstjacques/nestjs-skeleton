# Pagination Guide

Complete guide for implementing pagination, sorting, and filtering in this NestJS API skeleton.

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Architecture](#architecture)
4. [Base DTO Usage](#base-dto-usage)
5. [Sort Fields Pattern](#sort-fields-pattern)
6. [Swagger Integration](#swagger-integration)
7. [Service Implementation](#service-implementation)
8. [Constants Reference](#constants-reference)
9. [Migration Guide](#migration-guide)

---

## Overview

The pagination system provides a **three-tier architecture** for consistent, DRY pagination across all modules:

1. **Constants Layer**: Shared values, enums, and Swagger helpers
2. **Base DTO Layer**: Generic base class with common pagination fields
3. **Module Layer**: Resource-specific DTOs extending the base class

### Key Files

| File                                           | Purpose                                  |
| ---------------------------------------------- | ---------------------------------------- |
| `src/common/constants/pagination.constants.ts` | Shared constants, enums, Swagger helpers |
| `src/common/dto/paginated-query.dto.ts`        | Base DTO class for pagination            |
| `src/config/providers/pagination.config.ts`    | Runtime configuration from env vars      |

---

## Quick Start

### Step 1: Define Sort Fields (Const Pattern)

```typescript
import { BaseSortByFields } from "../../../common/constants";

export const ProductSortBy = {
  ...BaseSortByFields, // CREATED_AT, UPDATED_AT
  NAME: "name",
  PRICE: "price",
} as const;

export type ProductSortBy = (typeof ProductSortBy)[keyof typeof ProductSortBy];
```

### Step 2: Extend PaginatedQueryDto

```typescript
import { PaginatedQueryDto } from "../../../common/dto";
import { IsOptional, IsEnum, IsString } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class QueryProductDto extends PaginatedQueryDto<ProductSortBy> {
  // ✅ page, limit, search, sortOrder inherited!

  @ApiPropertyOptional({
    description: "Sort field",
    enum: Object.values(ProductSortBy),
    default: ProductSortBy.CREATED_AT,
  })
  @IsOptional()
  @IsEnum(Object.values(ProductSortBy))
  sortBy?: ProductSortBy = ProductSortBy.CREATED_AT;

  // Add resource-specific filters
  @ApiPropertyOptional({ description: "Filter by category" })
  @IsOptional()
  @IsString()
  category?: string;
}
```

### Step 3: Use in Controller

```typescript
@Get()
async findAll(@Query() query: QueryProductDto) {
  return this.productsService.findAll(query);
}
```

That's it! You get pagination, search, and sorting with **zero boilerplate**.

---

## Architecture

### Build-Time vs Runtime

| Constant               | Purpose                             | Location                  | Usage                                   |
| ---------------------- | ----------------------------------- | ------------------------- | --------------------------------------- |
| `PAGINATION_CONSTANTS` | Static values for decorators & DTOs | `pagination.constants.ts` | Build-time (decorators, class defaults) |
| `PaginationConfig`     | Runtime configuration from env vars | `pagination.config.ts`    | Runtime (service logic, dynamic values) |

### Inherited Fields

When you extend `PaginatedQueryDto`, you automatically get:

| Field       | Type      | Description           | Default |
| ----------- | --------- | --------------------- | ------- |
| `page`      | number    | Page number           | 1       |
| `limit`     | number    | Items per page        | 10      |
| `search`    | string    | Search term           | -       |
| `sortOrder` | SortOrder | Sort order (ASC/DESC) | DESC    |

All fields include validation decorators, Swagger documentation, and proper typing.

---

## Base DTO Usage

### Before (100+ lines of boilerplate)

```typescript
export class QueryTaskDto {
  @ApiPropertyOptional({ ... })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ ... })
  @Min(1, { ... })
  page?: number = 1;

  @ApiPropertyOptional({ ... })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ ... })
  @Min(1, { ... })
  @Max(100, { ... })
  limit?: number = 10;

  // ... 60+ more lines for search, sortBy, sortOrder
}
```

### After (40-60 lines)

```typescript
export const TaskSortBy = {
  ...BaseSortByFields,
  DUE_DATE: "dueDate",
  TITLE: "title",
  PRIORITY: "priority",
  STATUS: "status",
} as const;

export type TaskSortBy = (typeof TaskSortBy)[keyof typeof TaskSortBy];

export class QueryTaskDto extends PaginatedQueryDto<TaskSortBy> {
  @ApiPropertyOptional({ enum: Object.values(TaskSortBy) })
  @IsOptional()
  @IsEnum(Object.values(TaskSortBy))
  sortBy?: TaskSortBy = TaskSortBy.CREATED_AT;

  // Task-specific filters only
  @ApiPropertyOptional({ enum: TaskStatus })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;
}
```

**Benefits:**

- ✅ 50-70% less code per DTO
- ✅ Focus on resource-specific logic
- ✅ No repetitive validation decorators
- ✅ Consistent across all modules

---

## Sort Fields Pattern

### Why Const Pattern Over Enums?

| Feature                  | Enum Pattern               | Const Object Pattern                 |
| ------------------------ | -------------------------- | ------------------------------------ |
| **DRY with base fields** | ❌ Must repeat assignments | ✅ Spread with `...BaseSortByFields` |
| **Type safety**          | ✅ Full                    | ✅ Full (with derived type)          |
| **Swagger compatible**   | ✅ Direct use              | ✅ Via `Object.values()`             |
| **Runtime overhead**     | ⚠️ Enum object created     | ✅ Plain object                      |
| **Composability**        | ❌ Cannot spread enums     | ✅ Easy to spread                    |

### The Pattern Explained

```typescript
// Step 1: Define const object with spread
export const ProductSortBy = {
  ...BaseSortByFields, // CREATED_AT: "createdAt", UPDATED_AT: "updatedAt"
  NAME: "name",
  PRICE: "price",
} as const;

// Step 2: Extract type from const
// Result: "createdAt" | "updatedAt" | "name" | "price"
export type ProductSortBy = (typeof ProductSortBy)[keyof typeof ProductSortBy];

// Step 3: Use in DTO with Object.values()
@ApiPropertyOptional({
  enum: Object.values(ProductSortBy), // Converts to array for Swagger
})
@IsEnum(Object.values(ProductSortBy))
sortBy?: ProductSortBy = ProductSortBy.CREATED_AT;
```

### BaseSortByFields Reference

Located in `src/common/constants/pagination.constants.ts`:

```typescript
export const BaseSortByFields = {
  CREATED_AT: "createdAt",
  UPDATED_AT: "updatedAt",
} as const;
```

---

## Swagger Integration

### Using PAGINATION_SWAGGER_QUERIES

```typescript
import { PAGINATION_SWAGGER_QUERIES } from "../../common/constants";

@Get()
@ApiQuery(PAGINATION_SWAGGER_QUERIES.page())
@ApiQuery(PAGINATION_SWAGGER_QUERIES.limit())
@ApiQuery(PAGINATION_SWAGGER_QUERIES.sortOrder({ default: "DESC" }))
@ApiQuery(PAGINATION_SWAGGER_QUERIES.sortBy({
  enum: Object.values(ProductSortBy),
  default: ProductSortBy.CREATED_AT,
}))
@ApiQuery(PAGINATION_SWAGGER_QUERIES.search({
  example: "laptop",
  fields: "name, description, sku",
}))
async findAll(@Query() query: QueryProductDto) {
  return this.productsService.findAll(query);
}
```

### Available Helpers

- `page(options?)` - Page number query parameter
- `limit(options?)` - Items per page query parameter
- `sortBy(options)` - Sort field with custom enum
- `sortOrder(options?)` - Sort order (ASC/DESC)
- `search(options?)` - Search term with field hints

### Before vs After

**Before (12 lines):**

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
```

**After (3 lines):**

```typescript
@ApiQuery(PAGINATION_SWAGGER_QUERIES.page())
@ApiQuery(PAGINATION_SWAGGER_QUERIES.limit())
```

---

## Service Implementation

### Using Runtime Config

```typescript
import { Injectable, Inject } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import paginationConfig from "../../config/providers/pagination.config";

@Injectable()
export class ProductsService {
  constructor(
    private readonly productsDAL: ProductsDAL,
    @Inject(paginationConfig.KEY)
    private readonly paginationConfig: ConfigType<typeof paginationConfig>,
  ) {}

  async findAll(query: QueryProductDto) {
    const page = query.page || this.paginationConfig.defaultPage;
    const limit = Math.min(
      query.limit || this.paginationConfig.defaultLimit,
      this.paginationConfig.maxLimit,
    );
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.productsDAL.findMany({
        skip,
        take: limit,
        where: this.buildWhereClause(query),
        orderBy: { [query.sortBy]: query.sortOrder?.toLowerCase() },
      }),
      this.productsDAL.count({
        where: this.buildWhereClause(query),
      }),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
      },
    };
  }
}
```

---

## Constants Reference

### PAGINATION_CONSTANTS

```typescript
export const PAGINATION_CONSTANTS = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  MIN_PAGE: 1,
  MIN_LIMIT: 1,
} as const;
```

### SortOrder Enum

```typescript
export enum SortOrder {
  ASC = "asc",
  DESC = "desc",
}
```

### PAGINATION_VALIDATION_MESSAGES

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

### Import Statement

```typescript
import {
  SortOrder,
  BaseSortByFields,
  PAGINATION_CONSTANTS,
  PAGINATION_VALIDATION_MESSAGES,
  PAGINATION_SWAGGER_QUERIES,
} from "../../../common/constants";
```

---

## Migration Guide

### For Existing Query DTOs

1. Import `PaginatedQueryDto` from `../../../common/dto`
2. Import `BaseSortByFields` from `../../../common/constants`
3. Convert sort enum to const pattern:
   ```typescript
   export const YourSortBy = { ...BaseSortByFields, ... } as const;
   export type YourSortBy = (typeof YourSortBy)[keyof typeof YourSortBy];
   ```
4. Extend your DTO: `extends PaginatedQueryDto<YourSortBy>`
5. Remove `page`, `limit`, `search`, `sortOrder` field definitions
6. Update `sortBy` to use `Object.values()` for enum and validation
7. Keep all resource-specific filter fields

### For New Modules

When adding a new module with pagination:

- [ ] Import `PaginatedQueryDto` in your query DTO
- [ ] Define sort fields using const pattern with `...BaseSortByFields`
- [ ] Extend `PaginatedQueryDto<YourSortBy>` in your DTO class
- [ ] Override `sortBy` with your enum values
- [ ] Add resource-specific filters (status, category, etc.)
- [ ] Use `PAGINATION_SWAGGER_QUERIES` in controller

---

## Advanced Patterns

### Date Range Filters

```typescript
export class QueryOrderDto extends PaginatedQueryDto<OrderSortBy> {
  @ApiPropertyOptional({ description: "Filter orders from this date" })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  fromDate?: Date;

  @ApiPropertyOptional({ description: "Filter orders until this date" })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  toDate?: Date;
}
```

### Numeric Range Filters

```typescript
export class QueryProductDto extends PaginatedQueryDto<ProductSortBy> {
  @ApiPropertyOptional({ description: "Minimum price" })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ description: "Maximum price" })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;
}
```

### Boolean Filters

```typescript
export class QueryProductDto extends PaginatedQueryDto<ProductSortBy> {
  @ApiPropertyOptional({ description: "Show only in-stock products" })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  inStock?: boolean;

  @ApiPropertyOptional({ description: "Show only featured products" })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  featured?: boolean;
}
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

**Reference Implementation:** See `src/modules/tasks/dto/query-task.dto.ts` for a complete working example.
