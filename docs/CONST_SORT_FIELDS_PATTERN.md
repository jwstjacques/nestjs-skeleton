# Const Object Pattern for Sort Fields

## Overview

This guide shows the **recommended pattern** for defining sort fields using `as const` objects instead of enums. This approach is:

- ✅ **More DRY** - Spread base fields with `...BaseSortByFields`
- ✅ **Better type inference** - TypeScript infers exact literal types
- ✅ **Simpler runtime** - No enum overhead
- ✅ **Swagger compatible** - Works with `Object.values()` for enum display
- ✅ **More flexible** - Easier to compose and extend

## The Pattern

### Step 1: Import Base Sort Fields

```typescript
import { BaseSortByFields, SortOrder } from "../../../common/constants";
```

### Step 2: Define Your Sort Fields (with spread)

```typescript
/**
 * Product-specific sortable fields (as const pattern)
 * Extends BaseSortByFields (createdAt, updatedAt) with product-specific fields
 */
export const ProductSortBy = {
  ...BaseSortByFields, // ✅ Spreads CREATED_AT, UPDATED_AT
  NAME: "name",
  PRICE: "price",
  STOCK: "stock",
} as const;

/**
 * Type derived from ProductSortBy constant
 * Type: "createdAt" | "updatedAt" | "name" | "price" | "stock"
 */
export type ProductSortBy = (typeof ProductSortBy)[keyof typeof ProductSortBy];
```

### Step 3: Use in DTO with Object.values()

```typescript
export class QueryProductDto extends PaginatedQueryDto<ProductSortBy> {
  @ApiPropertyOptional({
    description: "Sort field",
    example: ProductSortBy.CREATED_AT,
    enum: Object.values(ProductSortBy), // ✅ Convert to array for Swagger
    default: ProductSortBy.CREATED_AT,
  })
  @IsOptional()
  @IsEnum(Object.values(ProductSortBy), {
    message: "Invalid sort field",
  })
  sortBy?: ProductSortBy = ProductSortBy.CREATED_AT;
}
```

### Step 4: Usage

```typescript
// In service or controller
const sortField = ProductSortBy.NAME; // Type: "name"
const query = { sortBy: ProductSortBy.PRICE }; // Type-safe! ✅

// TypeScript catches errors
const invalid = ProductSortBy.INVALID; // ❌ Error: Property 'INVALID' does not exist
```

---

## Real Example: Tasks Module

### Before (Enum Pattern)

```typescript
export enum TaskSortBy {
  CREATED_AT = BaseSortBy.CREATED_AT, // ❌ Repetitive
  UPDATED_AT = BaseSortBy.UPDATED_AT, // ❌ Repetitive
  DUE_DATE = "dueDate",
  TITLE = "title",
  PRIORITY = "priority",
  STATUS = "status",
}

export class QueryTaskDto extends PaginatedQueryDto<TaskSortBy> {
  @ApiPropertyOptional({
    enum: TaskSortBy, // Works but verbose
  })
  @IsEnum(TaskSortBy)
  sortBy?: TaskSortBy = TaskSortBy.CREATED_AT;
}
```

### After (Const Pattern)

```typescript
export const TaskSortBy = {
  ...BaseSortByFields, // ✅ DRY - spreads CREATED_AT, UPDATED_AT
  DUE_DATE: "dueDate",
  TITLE: "title",
  PRIORITY: "priority",
  STATUS: "status",
} as const;

export type TaskSortBy = (typeof TaskSortBy)[keyof typeof TaskSortBy];

export class QueryTaskDto extends PaginatedQueryDto<TaskSortBy> {
  @ApiPropertyOptional({
    enum: Object.values(TaskSortBy), // ✅ Same result, cleaner source
  })
  @IsEnum(Object.values(TaskSortBy))
  sortBy?: TaskSortBy = TaskSortBy.CREATED_AT;
}
```

**Benefits:**

- Cleaner, more DRY
- Better type inference
- No enum overhead at runtime
- Same Swagger output

---

## Understanding the Type Magic

### The Const Object

```typescript
export const ProductSortBy = {
  ...BaseSortByFields,
  NAME: "name",
  PRICE: "price",
} as const;
```

**What `as const` does:**

- Makes all properties readonly
- TypeScript infers **literal types** instead of `string`
- Result: `{ readonly CREATED_AT: "createdAt", readonly NAME: "name", ... }`

### The Type Extraction

```typescript
export type ProductSortBy = (typeof ProductSortBy)[keyof typeof ProductSortBy];
```

**Breaking it down:**

1. `typeof ProductSortBy` = The type of the constant object
2. `keyof typeof ProductSortBy` = Union of keys: `"CREATED_AT" | "UPDATED_AT" | "NAME" | "PRICE"`
3. `(typeof ProductSortBy)[...]` = Get values for those keys
4. **Result:** `"createdAt" | "updatedAt" | "name" | "price"` (literal union type)

This is exactly what you'd get from an enum, but with better composability!

---

## Swagger/OpenAPI Integration

### The Key: Object.values()

```typescript
@ApiPropertyOptional({
  enum: Object.values(ProductSortBy),  // Converts to ["createdAt", "updatedAt", "name", "price"]
})
```

**Swagger sees:**

```json
{
  "enum": ["createdAt", "updatedAt", "name", "price"],
  "default": "createdAt"
}
```

**Result in Swagger UI:**

- Dropdown with all sort options ✅
- Type safety in TypeScript ✅
- No difference from enum approach ✅

---

## Validation with class-validator

### Works Exactly Like Enums

```typescript
@IsEnum(Object.values(ProductSortBy), {
  message: "Invalid sort field"
})
sortBy?: ProductSortBy;
```

**At runtime:**

- `Object.values(ProductSortBy)` = `["createdAt", "updatedAt", "name", "price"]`
- Validator checks if value is in array
- Same validation as enum approach ✅

---

## Complete Example: Orders Module

```typescript
// orders/dto/query-order.dto.ts
import { IsOptional, IsEnum } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { BaseSortByFields, SortOrder } from "../../../common/constants";
import { PaginatedQueryDto } from "../../../common/dto";

/**
 * Order-specific sortable fields
 */
export const OrderSortBy = {
  ...BaseSortByFields, // CREATED_AT, UPDATED_AT
  ORDER_DATE: "orderDate",
  TOTAL_AMOUNT: "totalAmount",
  STATUS: "status",
  CUSTOMER_NAME: "customerName",
} as const;

export type OrderSortBy = (typeof OrderSortBy)[keyof typeof OrderSortBy];

/**
 * Query DTO for order filtering and pagination
 */
export class QueryOrderDto extends PaginatedQueryDto<OrderSortBy> {
  @ApiPropertyOptional({
    description: "Sort field for orders",
    example: OrderSortBy.ORDER_DATE,
    enum: Object.values(OrderSortBy),
    default: OrderSortBy.ORDER_DATE,
  })
  @IsOptional()
  @IsEnum(Object.values(OrderSortBy), {
    message:
      "Invalid sort field. Must be one of: createdAt, updatedAt, orderDate, totalAmount, status, customerName",
  })
  sortBy?: OrderSortBy = OrderSortBy.ORDER_DATE;

  // Order-specific filters
  @ApiPropertyOptional({ description: "Filter by order status" })
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ description: "Filter by customer ID" })
  @IsOptional()
  customerId?: string;
}
```

### Usage in Service

```typescript
export class OrdersService {
  async findAll(query: QueryOrderDto) {
    const { sortBy = OrderSortBy.ORDER_DATE, sortOrder = SortOrder.DESC } = query;

    return this.ordersRepository.findMany({
      orderBy: { [sortBy]: sortOrder },
      // ✅ Type-safe! sortBy is "createdAt" | "updatedAt" | "orderDate" | ...
    });
  }
}
```

### Usage in Tests

```typescript
describe("OrdersService", () => {
  it("should sort orders by order date", async () => {
    const query = {
      sortBy: OrderSortBy.ORDER_DATE, // ✅ Type-safe
      sortOrder: SortOrder.DESC,
    };

    const result = await service.findAll(query);
    expect(result).toBeDefined();
  });

  it("should default to ORDER_DATE sort", async () => {
    const query = {};
    const result = await service.findAll(query);
    // Default sortBy is OrderSortBy.ORDER_DATE ✅
  });
});
```

---

## Comparison: Enum vs Const Object

| Feature                  | Enum Pattern               | Const Object Pattern                 |
| ------------------------ | -------------------------- | ------------------------------------ |
| **DRY with base fields** | ❌ Must repeat assignments | ✅ Spread with `...BaseSortByFields` |
| **Type safety**          | ✅ Full                    | ✅ Full (with derived type)          |
| **Swagger compatible**   | ✅ Direct use              | ✅ Via `Object.values()`             |
| **Validation**           | ✅ `@IsEnum(Enum)`         | ✅ `@IsEnum(Object.values())`        |
| **Runtime overhead**     | ⚠️ Enum object created     | ✅ Plain object                      |
| **Type inference**       | ✅ Good                    | ✅ Better (literal types)            |
| **Composability**        | ❌ Cannot spread enums     | ✅ Easy to spread                    |
| **Code size**            | ⚠️ Slightly larger         | ✅ Smaller                           |

---

## When to Use Each Pattern

### Use Const Object Pattern (Recommended) When:

- ✅ You need to extend base sort fields
- ✅ You want maximum DRY
- ✅ You prefer modern TypeScript patterns
- ✅ You're defining sort fields for resources
- ✅ You want smaller bundle size

### Use Enum Pattern When:

- ⚠️ You have legacy code with enums
- ⚠️ You prefer explicit enum syntax
- ⚠️ You don't need to spread/extend fields
- ⚠️ Team is more familiar with enums

**Verdict:** Const object pattern is recommended for new code, especially for sort fields!

---

## Migration from Enum to Const

### Step 1: Replace Enum Definition

**Before:**

```typescript
export enum ProductSortBy {
  CREATED_AT = BaseSortBy.CREATED_AT,
  UPDATED_AT = BaseSortBy.UPDATED_AT,
  NAME = "name",
}
```

**After:**

```typescript
export const ProductSortBy = {
  ...BaseSortByFields,
  NAME: "name",
} as const;

export type ProductSortBy = (typeof ProductSortBy)[keyof typeof ProductSortBy];
```

### Step 2: Update Decorators

**Before:**

```typescript
@IsEnum(ProductSortBy)
enum: ProductSortBy,
```

**After:**

```typescript
@IsEnum(Object.values(ProductSortBy))
enum: Object.values(ProductSortBy),
```

### Step 3: Test

```bash
npm run build
npm test
```

**No other changes needed!** Usage remains the same:

```typescript
const sort = ProductSortBy.NAME; // Still works! ✅
```

---

## BaseSortByFields Reference

Located in `src/common/constants/pagination.constants.ts`:

```typescript
/**
 * Base sortable fields common to all entities (as const object)
 * Modules can spread this into their own sort fields
 */
export const BaseSortByFields = {
  CREATED_AT: "createdAt",
  UPDATED_AT: "updatedAt",
} as const;
```

**Usage:**

```typescript
export const YourSortBy = {
  ...BaseSortByFields, // Includes CREATED_AT, UPDATED_AT
  YOUR_FIELD: "yourField",
} as const;
```

---

## Summary

The **const object pattern** with `as const` is the recommended approach for sort fields because:

1. **More DRY** - Spread base fields instead of repeating assignments
2. **Type-safe** - Derived type gives exact literal union
3. **Simpler** - Plain object, no enum overhead
4. **Swagger works** - `Object.values()` converts to array
5. **Validation works** - Same as enum with `Object.values()`
6. **Modern** - Uses latest TypeScript best practices

**Tasks module** now uses this pattern as the reference implementation! 🎉

## See Also

- **Base Query DTO Guide**: `docs/BASE_QUERY_DTO_GUIDE.md`
- **Pagination Constants**: `docs/PAGINATION_CONSTANTS_GUIDE.md`
- **Quick Reference**: `docs/PAGINATION_QUICK_REFERENCE.md`
- **Source**: `src/common/constants/pagination.constants.ts`
