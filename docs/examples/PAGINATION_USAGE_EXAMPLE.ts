/**
 * Example: Using Modern Pagination System
 *
 * ⚠️  THIS IS DOCUMENTATION ONLY - NOT EXECUTABLE CODE
 *
 * This demonstrates the MODERN APPROACH using:
 * - PaginatedQueryDto base class
 * - Const pattern for sort fields with spread
 * - BaseSortByFields for DRY code
 * - Object.values() for Swagger enum
 *
 * @file PAGINATION_USAGE_EXAMPLE.ts
 * @type {documentation}
 */

/* eslint-disable */
// @ts-nocheck

// ============================================================================
// 1. DTO EXAMPLE (Modern Approach)
// ============================================================================

import { IsOptional, IsEnum, IsString } from "class-validator";
import { Type } from "class-transformer";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { PaginatedQueryDto } from "../../../common/dto";
import { BaseSortByFields } from "../../../common/constants";

/**
 * Step 1: Define sort fields using const pattern with spread
 * ✅ DRY - Spreads CREATED_AT, UPDATED_AT from BaseSortByFields
 */
export const ProductSortBy = {
  ...BaseSortByFields, // CREATED_AT: "createdAt", UPDATED_AT: "updatedAt"
  NAME: "name",
  PRICE: "price",
  STOCK: "stock",
} as const;

/**
 * Step 2: Extract type from const
 * Result type: "createdAt" | "updatedAt" | "name" | "price" | "stock"
 */
export type ProductSortBy = (typeof ProductSortBy)[keyof typeof ProductSortBy];

/**
 * Step 3: Extend PaginatedQueryDto
 * ✅ Inherits: page, limit, search, sortOrder
 * ✅ Only define: sortBy override and resource-specific filters
 */
export class QueryProductDto extends PaginatedQueryDto<ProductSortBy> {
  /**
   * Override sortBy with product-specific sort fields
   * Use Object.values() to convert const object to array for Swagger enum
   */
  @ApiPropertyOptional({
    description: "Sort field for products",
    enum: Object.values(ProductSortBy),
    example: ProductSortBy.NAME,
    default: ProductSortBy.CREATED_AT,
  })
  @IsOptional()
  @IsEnum(Object.values(ProductSortBy), {
    message: "Invalid sort field",
  })
  sortBy?: ProductSortBy = ProductSortBy.CREATED_AT;

  // ✅ Product-specific filters below
  @ApiPropertyOptional({
    description: "Filter by product category",
    example: "electronics",
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: "Filter by in-stock status",
    example: true,
  })
  @IsOptional()
  @Type(() => Boolean)
  inStock?: boolean;
}

// ============================================================================
// 2. CONTROLLER EXAMPLE
// ============================================================================

import { Controller, Get, Query } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiOkResponse, ApiQuery } from "@nestjs/swagger";
import { PAGINATION_SWAGGER_QUERIES } from "../../common/constants";
import { ProductsService } from "./products.service";

@ApiTags("products")
@Controller("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: "Get all products with pagination" })
  @ApiOkResponse({ description: "Products retrieved successfully" })
  // ✅ Use shared pagination query decorators
  @ApiQuery(PAGINATION_SWAGGER_QUERIES.page())
  @ApiQuery(PAGINATION_SWAGGER_QUERIES.limit())
  @ApiQuery(
    PAGINATION_SWAGGER_QUERIES.search({
      example: "laptop",
      fields: "name, description, sku",
    }),
  )
  @ApiQuery(
    PAGINATION_SWAGGER_QUERIES.sortBy({
      enum: Object.values(ProductSortBy),
      default: ProductSortBy.CREATED_AT,
      example: ProductSortBy.PRICE,
    }),
  )
  @ApiQuery(PAGINATION_SWAGGER_QUERIES.sortOrder({ default: "DESC" }))
  async findAll(@Query() query: QueryProductDto) {
    return this.productsService.findAll(query);
  }
}

// ============================================================================
// 3. SERVICE EXAMPLE
// ============================================================================

import { Injectable, Inject } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import paginationConfig from "../../config/providers/pagination.config";
import { ProductsDAL } from "./products.dal";

@Injectable()
export class ProductsService {
  constructor(
    private readonly productsDAL: ProductsDAL,
    // ✅ Inject runtime pagination config
    @Inject(paginationConfig.KEY)
    private readonly paginationConfig: ConfigType<typeof paginationConfig>,
  ) {}

  async findAll(query: QueryProductDto) {
    // ✅ Use runtime config for defaults
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

  private buildWhereClause(query: QueryProductDto) {
    const where: any = {};

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: "insensitive" } },
        { description: { contains: query.search, mode: "insensitive" } },
        { sku: { contains: query.search, mode: "insensitive" } },
      ];
    }

    if (query.category) {
      where.category = query.category;
    }

    if (query.inStock !== undefined) {
      where.stock = query.inStock ? { gt: 0 } : 0;
    }

    return where;
  }
}

// ============================================================================
// KEY BENEFITS
// ============================================================================

/*
✅ 50-70% LESS CODE per DTO (page, limit, search, sortOrder inherited)
✅ SINGLE SOURCE OF TRUTH (PAGINATION_CONSTANTS)
✅ TYPE-SAFE (Generic type parameter with const pattern)
✅ SWAGGER COMPATIBLE (Object.values() for enum display)
✅ VALIDATION WORKS (class-validator with Object.values())
✅ MORE DRY (...BaseSortByFields spread pattern)
✅ CONSISTENT across all modules

See docs/BASE_QUERY_DTO_GUIDE.md for complete documentation
See docs/CONST_SORT_FIELDS_PATTERN.md for const pattern details
*/
