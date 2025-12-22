# Shared Pagination Enums

## Overview

The pagination constants now include **shared enums** that are common to all paginated endpoints:

- `SortOrder` - Standard ASC/DESC sorting
- `BaseSortBy` - Common sortable fields (createdAt, updatedAt)

## Location

`src/common/constants/pagination.constants.ts`

---

## SortOrder Enum

**Use this instead of creating your own sort order enum in each module.**

```typescript
export enum SortOrder {
  ASC = "asc",
  DESC = "desc",
}
```

### Usage in DTO

```typescript
import { SortOrder } from "../../../common/constants";

export class QueryProductDto {
  @ApiPropertyOptional({
    description: "Sort order",
    enum: SortOrder,
    example: SortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(SortOrder, { message: PAGINATION_VALIDATION_MESSAGES.SORT_ORDER_INVALID })
  sortOrder?: SortOrder = SortOrder.DESC;
}
```

### Usage in Service

```typescript
import { SortOrder } from "../../common/constants";

// Convert enum to Prisma format
const sortOrder = query.sortOrder?.toLowerCase() as "asc" | "desc";

// Or use directly
orderBy: { [query.sortBy]: query.sortOrder }
```

---

## BaseSortBy Enum

**Base sortable fields that exist on all entities.**

```typescript
export enum BaseSortBy {
  CREATED_AT = "createdAt",
  UPDATED_AT = "updatedAt",
}
```

### How to Extend for Your Module

Every module should extend `BaseSortBy` with entity-specific fields:

```typescript
import { BaseSortBy } from "../../../common/constants";

// ✅ Recommended: Extend with base fields
export enum ProductSortBy {
  CREATED_AT = BaseSortBy.CREATED_AT,  // From base
  UPDATED_AT = BaseSortBy.UPDATED_AT,  // From base
  NAME = "name",                        // Product-specific
  PRICE = "price",                      // Product-specific
  STOCK = "stock",                      // Product-specific
}

// ✅ Usage in DTO
@ApiPropertyOptional({
  description: "Sort field",
  enum: ProductSortBy,
  example: ProductSortBy.CREATED_AT,
})
@IsOptional()
@IsEnum(ProductSortBy)
sortBy?: ProductSortBy = ProductSortBy.CREATED_AT;
```

### Alternative: Using Spread (TypeScript 5+)

```typescript
import { BaseSortBy } from "../../../common/constants";

export enum ProductSortBy {
  ...BaseSortBy,  // Automatically includes CREATED_AT and UPDATED_AT
  NAME = "name",
  PRICE = "price",
}
```

---

## Complete Example: Tasks Module

### Before (Duplicated)

```typescript
// ❌ Every module had its own SortOrder enum
export enum SortOrder {
  ASC = "asc",
  DESC = "desc",
}

// ❌ Hardcoded createdAt and updatedAt in every module
export enum TaskSortBy {
  CREATED_AT = "createdAt",
  UPDATED_AT = "updatedAt",
  DUE_DATE = "dueDate",
  TITLE = "title",
}
```

### After (Shared)

```typescript
import { SortOrder, BaseSortBy } from "../../../common/constants";

// ✅ Reuse base fields
export enum TaskSortBy {
  CREATED_AT = BaseSortBy.CREATED_AT,
  UPDATED_AT = BaseSortBy.UPDATED_AT,
  DUE_DATE = "dueDate",        // Task-specific
  TITLE = "title",              // Task-specific
  PRIORITY = "priority",        // Task-specific
  STATUS = "status",            // Task-specific
}

// ✅ Use shared SortOrder
sortOrder?: SortOrder = SortOrder.DESC;
```

---

## Complete Module Example

### DTO

```typescript
import { IsOptional, IsEnum, IsString, IsInt, Min, Max } from "class-validator";
import { Type } from "class-transformer";
import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  ValidationMessages,
  PAGINATION_CONSTANTS,
  PAGINATION_VALIDATION_MESSAGES,
  SortOrder,
  BaseSortBy,
} from "../../../common/constants";

// Extend base sort fields
export enum ProductSortBy {
  CREATED_AT = BaseSortBy.CREATED_AT,
  UPDATED_AT = BaseSortBy.UPDATED_AT,
  NAME = "name",
  PRICE = "price",
  STOCK = "stock",
}

export class QueryProductDto {
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
    description: "Sort field",
    enum: ProductSortBy,
    example: ProductSortBy.CREATED_AT,
  })
  @IsOptional()
  @IsEnum(ProductSortBy, { message: "Invalid sort field" })
  sortBy?: ProductSortBy = ProductSortBy.CREATED_AT;

  @ApiPropertyOptional({
    description: "Sort order",
    enum: SortOrder,
    example: SortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(SortOrder, { message: PAGINATION_VALIDATION_MESSAGES.SORT_ORDER_INVALID })
  sortOrder?: SortOrder = SortOrder.DESC;

  // Add entity-specific filters below
  @ApiPropertyOptional({ description: "Filter by category" })
  @IsOptional()
  @IsString()
  category?: string;
}
```

### Controller

```typescript
import { PAGINATION_SWAGGER_QUERIES } from "../../common/constants";

@Get()
@ApiQuery(PAGINATION_SWAGGER_QUERIES.page())
@ApiQuery(PAGINATION_SWAGGER_QUERIES.limit())
@ApiQuery(
  PAGINATION_SWAGGER_QUERIES.sortBy({
    enum: Object.values(ProductSortBy),  // Use your enum values
    default: ProductSortBy.CREATED_AT,
    example: ProductSortBy.NAME,
  }),
)
@ApiQuery(
  PAGINATION_SWAGGER_QUERIES.sortOrder({
    default: "DESC",
    example: "ASC",
  }),
)
async findAll(@Query() query: QueryProductDto) {
  return this.productsService.findAll(query);
}
```

---

## Benefits

### 1. **Consistency**

- ✅ All modules use the same `SortOrder` enum
- ✅ All modules have `createdAt` and `updatedAt` sort fields
- ✅ Consistent naming across the entire API

### 2. **Type Safety**

- ✅ TypeScript enforces valid sort orders
- ✅ Autocomplete for sort fields
- ✅ Compile-time errors for typos

### 3. **Maintainability**

- ✅ Update sort order logic once, applies everywhere
- ✅ Add new base fields (e.g., `deletedAt`) in one place
- ✅ Easy to standardize across all modules

### 4. **DRY (Don't Repeat Yourself)**

- ✅ No duplicate `SortOrder` enums
- ✅ No duplicate `CREATED_AT`/`UPDATED_AT` definitions
- ✅ Less code to maintain

---

## Migration Checklist

For existing modules:

- [ ] Remove local `SortOrder` enum definition
- [ ] Import `SortOrder` from `../../../common/constants`
- [ ] Import `BaseSortBy` from `../../../common/constants`
- [ ] Update your `SortBy` enum to use `BaseSortBy.CREATED_AT` and `BaseSortBy.UPDATED_AT`
- [ ] Update imports in test files
- [ ] Run tests to verify

For new modules:

- [ ] Import `SortOrder` and `BaseSortBy` from common constants
- [ ] Create module-specific `SortBy` enum extending `BaseSortBy`
- [ ] Never create your own `SortOrder` enum
- [ ] Always include `createdAt` and `updatedAt` via `BaseSortBy`

---

## Common Patterns

### Pattern 1: Minimal Sortable Fields

```typescript
// For simple entities (e.g., categories, tags)
export enum CategorySortBy {
  CREATED_AT = BaseSortBy.CREATED_AT,
  UPDATED_AT = BaseSortBy.UPDATED_AT,
  NAME = "name",
}
```

### Pattern 2: Many Sortable Fields

```typescript
// For complex entities (e.g., orders, products)
export enum OrderSortBy {
  CREATED_AT = BaseSortBy.CREATED_AT,
  UPDATED_AT = BaseSortBy.UPDATED_AT,
  ORDER_DATE = "orderDate",
  STATUS = "status",
  TOTAL = "total",
  CUSTOMER_NAME = "customerName",
  PAYMENT_METHOD = "paymentMethod",
}
```

### Pattern 3: Related Entity Fields

```typescript
// Sorting by related entity fields (with proper Prisma relations)
export enum OrderSortBy {
  CREATED_AT = BaseSortBy.CREATED_AT,
  UPDATED_AT = BaseSortBy.UPDATED_AT,
  ORDER_DATE = "orderDate",
  CUSTOMER_NAME = "customer.name", // Nested field
  SHIPPING_ADDRESS = "shippingAddress", // Related field
}
```

---

## API Documentation Examples

### Swagger UI Display

```
Query Parameters:

sortBy: Enum
  - createdAt (default)
  - updatedAt
  - name
  - price
  - stock

sortOrder: Enum
  - asc
  - desc (default)
```

### OpenAPI Schema

```json
{
  "sortBy": {
    "type": "string",
    "enum": ["createdAt", "updatedAt", "name", "price", "stock"],
    "default": "createdAt"
  },
  "sortOrder": {
    "type": "string",
    "enum": ["asc", "desc"],
    "default": "desc"
  }
}
```

---

## Summary

**What's Shared:**

| Constant                         | Location                  | Usage                          |
| -------------------------------- | ------------------------- | ------------------------------ |
| `SortOrder`                      | `pagination.constants.ts` | All modules (ASC/DESC)         |
| `BaseSortBy`                     | `pagination.constants.ts` | Extend in each module          |
| `PAGINATION_CONSTANTS`           | `pagination.constants.ts` | All modules (limits, defaults) |
| `PAGINATION_VALIDATION_MESSAGES` | `pagination.constants.ts` | All modules (error messages)   |
| `PAGINATION_SWAGGER_QUERIES`     | `pagination.constants.ts` | All controllers (decorators)   |

**What's Module-Specific:**

- Entity-specific sort fields (price, status, etc.)
- Filter fields (category, inStock, etc.)
- Search implementation

**Import Statement:**

```typescript
import {
  SortOrder,
  BaseSortBy,
  PAGINATION_CONSTANTS,
  PAGINATION_VALIDATION_MESSAGES,
  PAGINATION_SWAGGER_QUERIES,
} from "../../../common/constants";
```

---

## See Also

- **Main Guide**: `docs/PAGINATION_CONSTANTS_GUIDE.md`
- **Quick Reference**: `docs/PAGINATION_QUICK_REFERENCE.md`
- **Example Code**: `docs/examples/PAGINATION_USAGE_EXAMPLE.ts`
