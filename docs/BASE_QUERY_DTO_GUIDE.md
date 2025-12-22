# Base Paginated Query DTO - Usage Guide

## Overview

The `PaginatedQueryDto` is a **base class** that provides common pagination, search, and sorting functionality for all resource query DTOs. This eliminates repetitive code and ensures consistency across all paginated endpoints.

## Location

`src/common/dto/paginated-query.dto.ts`

---

## What's Included

The base class provides these fields automatically:

| Field | Type | Description | Default |
| ----------- @ApiPropertyOptional({
description: "Sort field",
enum: Object.values(ProductSortBy),
example: ProductSortBy.NAME,
default: ProductSortBy.CREATED_AT,
})
@IsOptional()
@IsEnum(Object.values(ProductSortBy))
sortBy?: ProductSortBy = ProductSortBy.CREATED_AT;--- | ------------------------------ | ------- |
| `page` | number | Page number | 1 |
| `limit` | number | Items per page | 10 |
| `search` | string | Search term | - |
| `sortBy` | Generic | Sort field (resource-specific) | - |
| `sortOrder` | SortOrder | Sort order (ASC/DESC) | DESC |

All fields include:

- ✅ Validation decorators
- ✅ Swagger/OpenAPI documentation
- ✅ Proper typing with generics
- ✅ Standard error messages

---

## Basic Usage

### Step 1: Define Resource-Specific Sort Fields (Const Pattern - Recommended)

```typescript
import { BaseSortByFields } from "../../../common/constants";

// Use const object with spread for DRY code
export const ProductSortBy = {
  ...BaseSortByFields, // CREATED_AT, UPDATED_AT
  NAME: "name",
  PRICE: "price",
  STOCK: "stock",
} as const;

// Extract type from const
export type ProductSortBy = (typeof ProductSortBy)[keyof typeof ProductSortBy];
```

### Step 2: Extend PaginatedQueryDto

```typescript
import { IsOptional, IsEnum, IsString } from "class-validator";
import { Type } from "class-transformer";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { PaginatedQueryDto } from "../../../common/dto";
import { BaseSortByFields } from "../../../common/constants";

export const ProductSortBy = {
  ...BaseSortByFields,
  NAME: "name",
  PRICE: "price",
} as const;

export type ProductSortBy = (typeof ProductSortBy)[keyof typeof ProductSortBy];

export class QueryProductDto extends PaginatedQueryDto<ProductSortBy> {
  // ✅ page, limit, search, sortOrder inherited automatically!

  // Override sortBy with your type
  @ApiPropertyOptional({
    description: "Sort field",
    enum: Object.values(ProductSortBy),
    example: ProductSortBy.CREATED_AT,
    default: ProductSortBy.CREATED_AT,
  })
  @IsOptional()
  @IsEnum(Object.values(ProductSortBy), { message: "Invalid sort field" })
  sortBy?: ProductSortBy = ProductSortBy.CREATED_AT;

  // Add resource-specific filters below
  @ApiPropertyOptional({ description: "Filter by category" })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: "Filter by in-stock status" })
  @IsOptional()
  @Type(() => Boolean)
  inStock?: boolean;
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

## Real-World Example: Tasks Module

### Before (106 lines of boilerplate)

```typescript
export class QueryTaskDto {
  // 60+ lines of page/limit/search/sort definitions
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

  @ApiPropertyOptional({ ... })
  @IsOptional()
  @IsString({ ... })
  search?: string;

  @ApiPropertyOptional({ ... })
  @IsOptional()
  @IsEnum(TaskSortBy, { ... })
  sortBy?: TaskSortBy = TaskSortBy.CREATED_AT;

  @ApiPropertyOptional({ ... })
  @IsOptional()
  @IsEnum(SortOrder, { ... })
  sortOrder?: SortOrder = SortOrder.DESC;

  // Finally, the actual task-specific fields
  @ApiPropertyOptional({ ... })
  @IsOptional()
  @IsEnum(TaskStatus, { ... })
  status?: TaskStatus;

  @ApiPropertyOptional({ ... })
  @IsOptional()
  @IsEnum(TaskPriority, { ... })
  priority?: TaskPriority;
}
```

### After (70 lines - 34% reduction!)

```typescript
export const TaskSortBy = {
  ...BaseSortByFields,  // ✅ DRY - spreads CREATED_AT, UPDATED_AT
  DUE_DATE: "dueDate",
  TITLE: "title",
  PRIORITY: "priority",
  STATUS: "status",
} as const;

export type TaskSortBy = (typeof TaskSortBy)[keyof typeof TaskSortBy];

export class QueryTaskDto extends PaginatedQueryDto<TaskSortBy> {
  // ✅ Inherited: page, limit, search, sortOrder

  // Override sortBy
  @ApiPropertyOptional({
    description: "Sort field",
    enum: Object.values(TaskSortBy),
    example: TaskSortBy.CREATED_AT,
    default: TaskSortBy.CREATED_AT,
  })
  @IsOptional()
  @IsEnum(Object.values(TaskSortBy), { message: TASK_VALIDATION_MESSAGES.SORT_BY_INVALID })
  sortBy?: TaskSortBy = TaskSortBy.CREATED_AT;

  // Task-specific filters
  @ApiPropertyOptional({ ... })
  @IsOptional()
  @IsEnum(TaskStatus, { ... })
  status?: TaskStatus;

  @ApiPropertyOptional({ ... })
  @IsOptional()
  @IsEnum(TaskPriority, { ... })
  priority?: TaskPriority;
}
```

**Benefits:**

- ✅ 34% less code (106 → 70 lines)
- ✅ Focus on resource-specific logic
- ✅ No repetitive validation decorators
- ✅ Consistent across all modules
- ✅ More DRY with const pattern spread

---

## Customizing Search Description

The base class uses a generic search description. Override it in your child class for better documentation:

```typescript
export class QueryProductDto extends PaginatedQueryDto<ProductSortBy> {
  /**
   * Override search with resource-specific description
   */
  @ApiPropertyOptional({
    description: "Search products by name, description, or SKU",
    example: "laptop",
  })
  @IsOptional()
  @IsString({ message: ValidationMessages.mustBeString("Search") })
  search?: string;

  @ApiPropertyOptional({ ... })
  sortBy?: ProductSortBy = ProductSortBy.CREATED_AT;
}
```

---

## Advanced Patterns

### Pattern 1: Multiple Filter Enums

```typescript
export enum OrderStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export enum PaymentMethod {
  CREDIT_CARD = "credit_card",
  PAYPAL = "paypal",
  BANK_TRANSFER = "bank_transfer",
}

export class QueryOrderDto extends PaginatedQueryDto<OrderSortBy> {
  @ApiPropertyOptional({ enum: OrderStatus })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiPropertyOptional({ enum: PaymentMethod })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @ApiPropertyOptional({ description: "Filter by customer ID" })
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiPropertyOptional({ enum: Object.values(OrderSortBy) })
  @IsOptional()
  @IsEnum(Object.values(OrderSortBy))
  sortBy?: OrderSortBy = OrderSortBy.ORDER_DATE;
}
```

### Pattern 2: Date Range Filters

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

  @ApiPropertyOptional({ enum: Object.values(OrderSortBy) })
  @IsOptional()
  @IsEnum(Object.values(OrderSortBy))
  sortBy?: OrderSortBy = OrderSortBy.ORDER_DATE;
}
```

### Pattern 3: Numeric Range Filters

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

  @ApiPropertyOptional({ enum: Object.values(ProductSortBy) })
  @IsOptional()
  @IsEnum(Object.values(ProductSortBy))
  sortBy?: ProductSortBy = ProductSortBy.CREATED_AT;
}
```

### Pattern 4: Boolean Filters

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

  @ApiPropertyOptional({ enum: Object.values(ProductSortBy) })
  @IsOptional()
  @IsEnum(Object.values(ProductSortBy))
  sortBy?: ProductSortBy = ProductSortBy.CREATED_AT;
}
```

---

## Type Safety with Generics

The base class uses TypeScript generics to ensure type-safe sortBy fields:

```typescript
// ✅ Type-safe: ProductSortBy is enforced
export class QueryProductDto extends PaginatedQueryDto<ProductSortBy> {
  sortBy?: ProductSortBy = ProductSortBy.CREATED_AT;
}

// In your service
async findAll(query: QueryProductDto) {
  // TypeScript knows sortBy is ProductSortBy
  const sortField = query.sortBy; // Type: ProductSortBy | undefined
}
```

---

## What You Get Automatically

When you extend `PaginatedQueryDto`, you automatically get:

### ✅ Page Field

```typescript
@ApiPropertyOptional({
  description: "Page number for pagination",
  example: 1,
  minimum: 1,
  default: 1,
})
@IsOptional()
@Type(() => Number)
@IsInt()
@Min(1)
page?: number = 1;
```

### ✅ Limit Field

```typescript
@ApiPropertyOptional({
  description: "Number of items per page",
  example: 10,
  minimum: 1,
  maximum: 100,
  default: 10,
})
@IsOptional()
@Type(() => Number)
@IsInt()
@Min(1)
@Max(100)
limit?: number = 10;
```

### ✅ Search Field

```typescript
@ApiPropertyOptional({
  description: "Search term for filtering results",
  example: "search query",
})
@IsOptional()
@IsString()
search?: string;
```

### ✅ Sort Order Field

```typescript
@ApiPropertyOptional({
  description: "Sort order",
  enum: SortOrder,
  example: SortOrder.DESC,
  default: SortOrder.DESC,
})
@IsOptional()
@IsEnum(SortOrder)
sortOrder?: SortOrder = SortOrder.DESC;
```

---

## Swagger/OpenAPI Documentation

The Swagger UI automatically shows all inherited fields:

```
Query Parameters:

page          number    No    Page number for pagination (default: 1)
limit         number    No    Number of items per page (default: 10, max: 100)
search        string    No    Search term for filtering results
sortBy        string    No    Sort field (enum: createdAt, updatedAt, name, price)
sortOrder     string    No    Sort order (enum: asc, desc, default: desc)
category      string    No    Filter by category
inStock       boolean   No    Show only in-stock products
```

---

## Migration Checklist

For existing query DTOs:

- [ ] Import `PaginatedQueryDto` from `../../../common/dto`
- [ ] Import `BaseSortByFields` from `../../../common/constants`
- [ ] Convert sort enum to const pattern with spread: `const YourSortBy = { ...BaseSortByFields, ... } as const`
- [ ] Add type extraction: `type YourSortBy = typeof YourSortBy[keyof typeof YourSortBy]`
- [ ] Extend your DTO class: `extends PaginatedQueryDto<YourSortBy>`
- [ ] Remove `page`, `limit`, `search`, `sortOrder` field definitions
- [ ] Update `sortBy` override to use `Object.values()` for enum and validation
- [ ] Keep all resource-specific filter fields
- [ ] Test to ensure validation and Swagger docs work

---

## Complete Example: Products Module

```typescript
// src/modules/products/dto/query-product.dto.ts
import { IsOptional, IsEnum, IsString, IsNumber, IsBoolean } from "class-validator";
import { Type } from "class-transformer";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { PaginatedQueryDto } from "../../../common/dto";
import { BaseSortByFields } from "../../../common/constants";

export const ProductSortBy = {
  ...BaseSortByFields,
  NAME: "name",
  PRICE: "price",
  STOCK: "stock",
} as const;

export type ProductSortBy = (typeof ProductSortBy)[keyof typeof ProductSortBy];

export class QueryProductDto extends PaginatedQueryDto<ProductSortBy> {
  /**
   * Override search with product-specific description
   */
  @ApiPropertyOptional({
    description: "Search products by name, description, or SKU",
    example: "laptop",
  })
  @IsOptional()
  @IsString()
  search?: string;

  /**
   * Product sort field
   */
  @ApiPropertyOptional({
    description: "Sort field",
    enum: Object.values(ProductSortBy),
    example: ProductSortBy.NAME,
    default: ProductSortBy.CREATED_AT,
  })
  @IsOptional()
  @IsEnum(ProductSortBy)
  sortBy?: ProductSortBy = ProductSortBy.CREATED_AT;

  // Product-specific filters
  @ApiPropertyOptional({ description: "Filter by category" })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: "Minimum price" })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minPrice?: number;

  @ApiPropertyOptional({ description: "Maximum price" })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxPrice?: number;

  @ApiPropertyOptional({ description: "Show only in-stock products" })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  inStock?: boolean;
}
```

---

## Summary

**Benefits of Using PaginatedQueryDto:**

| Before                                        | After                         |
| --------------------------------------------- | ----------------------------- |
| 100+ lines per DTO                            | ~40-60 lines per DTO          |
| Repetitive page/limit/search/sort definitions | Inherited automatically       |
| Copy-paste validation decorators              | DRY - defined once            |
| Inconsistent defaults                         | Consistent across all modules |
| Manual Swagger documentation                  | Automatic documentation       |

**When to Use:**

- ✅ All query DTOs for list endpoints
- ✅ Any resource that needs pagination
- ✅ Endpoints with search functionality
- ✅ Endpoints with sorting requirements

**When NOT to Use:**

- ❌ Single-item GET endpoints (e.g., GET /products/:id)
- ❌ POST/PUT/PATCH request bodies
- ❌ Non-paginated list endpoints (rare)

---

## See Also

- **Pagination Constants**: `docs/PAGINATION_CONSTANTS_GUIDE.md`
- **Shared Enums**: `docs/PAGINATION_SHARED_ENUMS.md`
- **Quick Reference**: `docs/PAGINATION_QUICK_REFERENCE.md`
- **Base DTO Source**: `src/common/dto/paginated-query.dto.ts`
