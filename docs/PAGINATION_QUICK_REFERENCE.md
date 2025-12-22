# Pagination Constants - Quick Reference

## Import Statements

### For Query DTOs (Const Pattern - Recommended)

```typescript
import { PaginatedQueryDto } from "../../../common/dto";
import { BaseSortByFields, SortOrder } from "../../../common/constants";
```

### For Controllers

```typescript
import {
  PAGINATION_SWAGGER_QUERIES,
  PAGINATION_CONSTANTS,
  PAGINATION_VALIDATION_MESSAGES,
  SortOrder,
  BaseSortByFields,
} from "../../common/constants";
```

---

## Query DTO (Recommended Approach - Const Pattern)

### Step 1: Define Sort Fields

```typescript
export const ProductSortBy = {
  ...BaseSortByFields, // CREATED_AT, UPDATED_AT
  NAME: "name",
  PRICE: "price",
} as const;

export type ProductSortBy = (typeof ProductSortBy)[keyof typeof ProductSortBy];
```

### Step 2: Extend Base DTO

```typescript
export class QueryProductDto extends PaginatedQueryDto<ProductSortBy> {
  // ✅ page, limit, search, sortOrder inherited!

  @ApiPropertyOptional({ enum: Object.values(ProductSortBy) })
  @IsOptional()
  @IsEnum(Object.values(ProductSortBy))
  sortBy?: ProductSortBy = ProductSortBy.CREATED_AT;

  // Add resource-specific filters
  @ApiPropertyOptional()
  @IsOptional()
  category?: string;
}
```

---

## Controller Decorators

### Basic (Use defaults)

```typescript
@ApiQuery(PAGINATION_SWAGGER_QUERIES.page())
@ApiQuery(PAGINATION_SWAGGER_QUERIES.limit())
@ApiQuery(PAGINATION_SWAGGER_QUERIES.sortOrder())
```

### Customized

```typescript
// Custom example values
@ApiQuery(PAGINATION_SWAGGER_QUERIES.page({ example: 2 }))
@ApiQuery(PAGINATION_SWAGGER_QUERIES.limit({ example: 20, max: 50 }))

// Sort by with your fields
@ApiQuery(PAGINATION_SWAGGER_QUERIES.sortBy({
  enum: ["name", "createdAt", "price"],
  default: "createdAt",
  example: "name"
}))

// Sort order with default
@ApiQuery(PAGINATION_SWAGGER_QUERIES.sortOrder({ default: "DESC" }))

// Search with field hints
@ApiQuery(PAGINATION_SWAGGER_QUERIES.search({
  example: "search term",
  fields: "name, description"
}))
```

---

## DTO Properties

### Page

```typescript
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
```

### Limit

```typescript
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
```

### Sort Order

```typescript
@ApiPropertyOptional({
  description: "Sort order",
  enum: SortOrder,  // ✅ Use shared enum
  default: SortOrder.DESC,
})
@IsOptional()
@IsEnum(SortOrder, { message: PAGINATION_VALIDATION_MESSAGES.SORT_ORDER_INVALID })
sortOrder?: SortOrder = SortOrder.DESC;  // ✅ Use shared enum
```

---

## Available Constants

```typescript
PAGINATION_CONSTANTS = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  MIN_PAGE: 1,
  MIN_LIMIT: 1,
};

// ✅ Shared sort order enum (use this, don't create your own!)
enum SortOrder {
  ASC = "asc",
  DESC = "desc",
}

// ✅ Base sortable fields (extend in your module)
enum BaseSortBy {
  CREATED_AT = "createdAt",
  UPDATED_AT = "updatedAt",
}

PAGINATION_VALIDATION_MESSAGES = {
  PAGE_MIN: "Page must be at least 1",
  PAGE_MUST_BE_NUMBER: "Page must be a number",
  LIMIT_MIN: "Limit must be at least 1",
  LIMIT_MAX: "Limit must not exceed 100",
  LIMIT_MUST_BE_NUMBER: "Limit must be a number",
  SORT_ORDER_INVALID: "Sort order must be either ASC or DESC",
};
```

---

## Module-Specific Sort Fields

**Always extend `BaseSortBy` in your module:**

```typescript
import { BaseSortBy } from "../../common/constants";

// ✅ Correct: Extend base fields
export enum ProductSortBy {
  CREATED_AT = BaseSortBy.CREATED_AT, // Include base
  UPDATED_AT = BaseSortBy.UPDATED_AT, // Include base
  NAME = "name", // Add your fields
  PRICE = "price",
  STOCK = "stock",
}
```

---

## Complete Example

```typescript
import { BaseSortBy, SortOrder } from "../../common/constants";

// Define module-specific sort fields
export enum ProductSortBy {
  CREATED_AT = BaseSortBy.CREATED_AT,
  UPDATED_AT = BaseSortBy.UPDATED_AT,
  NAME = "name",
  PRICE = "price",
}

// Controller
@Get()
@ApiQuery(PAGINATION_SWAGGER_QUERIES.page())
@ApiQuery(PAGINATION_SWAGGER_QUERIES.limit())
@ApiQuery(PAGINATION_SWAGGER_QUERIES.sortBy({
  enum: ["name", "price"],
  default: "name"
}))
@ApiQuery(PAGINATION_SWAGGER_QUERIES.sortOrder({ default: "DESC" }))
async findAll(@Query() query: QueryDto) {
  return this.service.findAll(query);
}

// DTO
import { PAGINATION_CONSTANTS, PAGINATION_VALIDATION_MESSAGES, SortOrder, BaseSortBy } from "../../common/constants";

export class QueryDto {
  @Max(PAGINATION_CONSTANTS.MAX_LIMIT)
  limit?: number = PAGINATION_CONSTANTS.DEFAULT_LIMIT;

  @Min(PAGINATION_CONSTANTS.MIN_PAGE)
  page?: number = PAGINATION_CONSTANTS.DEFAULT_PAGE;

  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;

  @IsEnum(ProductSortBy)
  sortBy?: ProductSortBy = ProductSortBy.CREATED_AT;
}
```

---

## See Also

- **Shared Enums Guide**: `docs/PAGINATION_SHARED_ENUMS.md`
- **Full Guide**: `docs/PAGINATION_CONSTANTS_GUIDE.md`
- **Working Example**: `docs/examples/PAGINATION_USAGE_EXAMPLE.ts`
- **Implementation Details**: `temp/PAGINATION_CONSTANTS_IMPLEMENTATION.md`
