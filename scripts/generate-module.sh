#!/bin/bash

# ============================================================================
# Module Generator Script
# ============================================================================
# Generates a complete NestJS module following the skeleton pattern
# Usage: ./scripts/generate-module.sh <module-name>
# Example: ./scripts/generate-module.sh products
# ============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if module name provided
if [ -z "$1" ]; then
    echo -e "${RED}Error: Module name is required${NC}"
    echo ""
    echo "Usage: $0 <module-name>"
    echo "Example: $0 products"
    echo ""
    exit 1
fi

MODULE_NAME=$1
MODULE_PATH="src/modules/$MODULE_NAME"

# Convert naming conventions
# Helper function to convert to PascalCase (works on macOS and Linux)
to_pascal_case() {
  echo "$1" | awk -F'[-_]' '{
    result = ""
    for (i = 1; i <= NF; i++) {
      result = result toupper(substr($i, 1, 1)) substr($i, 2)
    }
    print result
  }'
}

MODULE_NAME_UPPER=$(echo "$MODULE_NAME" | tr '[:lower:]' '[:upper:]' | tr '-' '_')
MODULE_NAME_PASCAL=$(to_pascal_case "$MODULE_NAME")
MODULE_NAME_SINGULAR=$(echo "$MODULE_NAME" | sed 's/s$//')
MODULE_NAME_SINGULAR_PASCAL=$(to_pascal_case "$MODULE_NAME_SINGULAR")
MODULE_NAME_CAMEL=$(echo "$MODULE_NAME_PASCAL" | awk '{print tolower(substr($0,1,1)) substr($0,2)}')
MODULE_NAME_SINGULAR_UPPER=$(echo "$MODULE_NAME_SINGULAR" | tr '[:lower:]' '[:upper:]' | tr '-' '_')

echo ""
echo -e "${BLUE}+================================================+${NC}"
echo -e "${BLUE}|         NestJS Module Generator                |${NC}"
echo -e "${BLUE}+================================================+${NC}"
echo ""
echo -e "${GREEN}Module Name:${NC} $MODULE_NAME"
echo -e "${GREEN}Pascal Case:${NC} $MODULE_NAME_PASCAL"
echo -e "${GREEN}Singular:${NC} $MODULE_NAME_SINGULAR"
echo -e "${GREEN}Path:${NC} $MODULE_PATH"
echo ""

# Check if module already exists
if [ -d "$MODULE_PATH" ]; then
    echo -e "${RED}Error: Module already exists at $MODULE_PATH${NC}"
    echo ""
    exit 1
fi

# Create directory structure
echo -e "${YELLOW}Creating directory structure...${NC}"
mkdir -p "$MODULE_PATH"/{constants,dto,exceptions}
echo -e "${GREEN}   Created directories${NC}"

# ============================================================================
# CONSTANTS
# ============================================================================

echo -e "${YELLOW}Creating constants...${NC}"

# Main constants file
cat > "$MODULE_PATH/constants/${MODULE_NAME_SINGULAR}.constants.ts" << EOF
/**
 * ${MODULE_NAME_PASCAL} Module Constants
 */

// ============================================================================
// API Configuration
// ============================================================================

export const ${MODULE_NAME_SINGULAR_UPPER}_API_TAG = "${MODULE_NAME}";
export const ${MODULE_NAME_SINGULAR_UPPER}_CONTROLLER_PATH = "${MODULE_NAME}";

// ============================================================================
// Validation Messages
// ============================================================================

export const ${MODULE_NAME_SINGULAR_UPPER}_VALIDATION_MESSAGES = {
  // Add validation messages here
};

// ============================================================================
// Response Messages
// ============================================================================

export const ${MODULE_NAME_SINGULAR_UPPER}_MESSAGES = {
  CREATED: "${MODULE_NAME_SINGULAR_PASCAL} created successfully",
  UPDATED: "${MODULE_NAME_SINGULAR_PASCAL} updated successfully",
  DELETED: "${MODULE_NAME_SINGULAR_PASCAL} deleted successfully",
  PURGED: "${MODULE_NAME_SINGULAR_PASCAL} permanently deleted",
  NOT_FOUND: (id: string) => \`${MODULE_NAME_SINGULAR_PASCAL} not found: \${id}\`,
  FORBIDDEN: (id?: string) =>
    id
      ? \`You do not have permission to access this ${MODULE_NAME_SINGULAR}: \${id}\`
      : "Access forbidden",
};

// ============================================================================
// Swagger Documentation
// ============================================================================

export const ${MODULE_NAME_SINGULAR_UPPER}_SWAGGER_DOCS = {
  CREATE_SUMMARY: "Create a new ${MODULE_NAME_SINGULAR}",
  GET_ALL_SUMMARY: "Get all ${MODULE_NAME}",
  GET_BY_ID_SUMMARY: "Get a ${MODULE_NAME_SINGULAR} by ID",
  UPDATE_SUMMARY: "Update a ${MODULE_NAME_SINGULAR}",
  DELETE_SUMMARY: "Delete a ${MODULE_NAME_SINGULAR} (soft delete)",
  PURGE_SUMMARY: "Permanently delete a ${MODULE_NAME_SINGULAR}",

  CREATE_DESCRIPTION: "Creates a new ${MODULE_NAME_SINGULAR} for the authenticated user",
  GET_ALL_DESCRIPTION: "Retrieve ${MODULE_NAME} with optional filtering, sorting, and pagination",
  GET_BY_ID_DESCRIPTION: "Retrieves a single ${MODULE_NAME_SINGULAR} by its ID",
  UPDATE_DESCRIPTION: "Updates an existing ${MODULE_NAME_SINGULAR}",
  DELETE_DESCRIPTION: "Soft deletes a ${MODULE_NAME_SINGULAR} (moves to trash)",
  PURGE_DESCRIPTION: "Permanently deletes a ${MODULE_NAME_SINGULAR}. Admin only.",

  CREATE_SUCCESS: "${MODULE_NAME_SINGULAR_PASCAL} successfully created",
  DELETE_SUCCESS: "${MODULE_NAME_SINGULAR_PASCAL} successfully deleted",
  PURGE_SUCCESS: "${MODULE_NAME_SINGULAR_PASCAL} permanently deleted",
};

// ============================================================================
// Swagger Examples
// ============================================================================

export const ${MODULE_NAME_SINGULAR_UPPER}_SWAGGER_EXAMPLES = {
  EXAMPLE_ID: "cmixpvpir0001p9yp5xq8r7ks",
  CREATE_REQUEST: {},
  UPDATE_REQUEST: {},
};

// ============================================================================
// Cache Configuration
// ============================================================================

export const ${MODULE_NAME_SINGULAR_UPPER}_CACHE_PREFIX = "${MODULE_NAME}";

export const ${MODULE_NAME_SINGULAR_UPPER}_CACHE_KEYS = {
  LIST: \`\${${MODULE_NAME_SINGULAR_UPPER}_CACHE_PREFIX}:list\`,
  ITEM: (id: string) => \`\${${MODULE_NAME_SINGULAR_UPPER}_CACHE_PREFIX}:item:\${id}\`,
  PATTERN_ALL: \`\${${MODULE_NAME_SINGULAR_UPPER}_CACHE_PREFIX}:*\`,
};

// ============================================================================
// Limits & Configuration
// ============================================================================

export const ${MODULE_NAME_SINGULAR_UPPER}_LIMITS = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
};
EOF

# Error codes file
cat > "$MODULE_PATH/constants/${MODULE_NAME_SINGULAR}-error-codes.constants.ts" << EOF
/**
 * ${MODULE_NAME_PASCAL} module error codes
 */
export enum ${MODULE_NAME_SINGULAR_PASCAL}ErrorCode {
  ${MODULE_NAME_SINGULAR_UPPER}_NOT_FOUND = "${MODULE_NAME_SINGULAR_UPPER}_NOT_FOUND",
  ${MODULE_NAME_SINGULAR_UPPER}_FORBIDDEN = "${MODULE_NAME_SINGULAR_UPPER}_FORBIDDEN",
  ${MODULE_NAME_SINGULAR_UPPER}_INVALID = "${MODULE_NAME_SINGULAR_UPPER}_INVALID",
}
EOF

# Constants index
cat > "$MODULE_PATH/constants/index.ts" << EOF
export * from "./${MODULE_NAME_SINGULAR}.constants";
export * from "./${MODULE_NAME_SINGULAR}-error-codes.constants";
EOF

echo -e "${GREEN}   Created constants${NC}"

# ============================================================================
# EXCEPTIONS
# ============================================================================

echo -e "${YELLOW}Creating exceptions...${NC}"

cat > "$MODULE_PATH/exceptions/${MODULE_NAME_SINGULAR}.exceptions.ts" << EOF
import { HttpStatus } from "@nestjs/common";
import { ApplicationException } from "../../../common/exceptions/application.exception";
import { ${MODULE_NAME_SINGULAR_PASCAL}ErrorCode } from "../constants/${MODULE_NAME_SINGULAR}-error-codes.constants";
import { ${MODULE_NAME_SINGULAR_UPPER}_MESSAGES } from "../constants/${MODULE_NAME_SINGULAR}.constants";

export class ${MODULE_NAME_SINGULAR_PASCAL}NotFoundException extends ApplicationException {
  constructor(id: string) {
    super(
      ${MODULE_NAME_SINGULAR_PASCAL}ErrorCode.${MODULE_NAME_SINGULAR_UPPER}_NOT_FOUND,
      ${MODULE_NAME_SINGULAR_UPPER}_MESSAGES.NOT_FOUND(id),
      HttpStatus.NOT_FOUND,
    );
  }
}

export class ${MODULE_NAME_SINGULAR_PASCAL}ForbiddenException extends ApplicationException {
  constructor(id?: string) {
    super(
      ${MODULE_NAME_SINGULAR_PASCAL}ErrorCode.${MODULE_NAME_SINGULAR_UPPER}_FORBIDDEN,
      ${MODULE_NAME_SINGULAR_UPPER}_MESSAGES.FORBIDDEN(id),
      HttpStatus.FORBIDDEN,
    );
  }
}

export class ${MODULE_NAME_SINGULAR_PASCAL}InvalidException extends ApplicationException {
  constructor(message: string) {
    super(
      ${MODULE_NAME_SINGULAR_PASCAL}ErrorCode.${MODULE_NAME_SINGULAR_UPPER}_INVALID,
      message,
      HttpStatus.BAD_REQUEST,
    );
  }
}
EOF

cat > "$MODULE_PATH/exceptions/index.ts" << EOF
export * from "./${MODULE_NAME_SINGULAR}.exceptions";
EOF

echo -e "${GREEN}   Created exceptions${NC}"

# ============================================================================
# DTOs
# ============================================================================

echo -e "${YELLOW}Creating DTOs...${NC}"

# Create DTO
cat > "$MODULE_PATH/dto/create-${MODULE_NAME_SINGULAR}.dto.ts" << EOF
import { IsString, IsNotEmpty, IsOptional, MaxLength, MinLength } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { ValidationMessages } from "../../../common/constants";

export class Create${MODULE_NAME_SINGULAR_PASCAL}Dto {
  // TODO: Add your fields here
  @ApiProperty({
    description: "Name of the ${MODULE_NAME_SINGULAR}",
    example: "Example name",
    minLength: 3,
    maxLength: 200,
  })
  @IsString({ message: ValidationMessages.mustBeString("Name") })
  @IsNotEmpty({ message: ValidationMessages.required("Name") })
  @MinLength(3, { message: ValidationMessages.minLength("Name", 3) })
  @MaxLength(200, { message: ValidationMessages.maxLength("Name", 200) })
  name!: string;

  @ApiPropertyOptional({
    description: "Description of the ${MODULE_NAME_SINGULAR}",
    example: "Example description",
    maxLength: 1000,
  })
  @IsString({ message: ValidationMessages.mustBeString("Description") })
  @IsOptional()
  @MaxLength(1000, { message: ValidationMessages.maxLength("Description", 1000) })
  description?: string;
}
EOF

# Update DTO
cat > "$MODULE_PATH/dto/update-${MODULE_NAME_SINGULAR}.dto.ts" << EOF
import { PartialType } from "@nestjs/swagger";
import { Create${MODULE_NAME_SINGULAR_PASCAL}Dto } from "./create-${MODULE_NAME_SINGULAR}.dto";

export class Update${MODULE_NAME_SINGULAR_PASCAL}Dto extends PartialType(Create${MODULE_NAME_SINGULAR_PASCAL}Dto) {}
EOF

# Query DTO
cat > "$MODULE_PATH/dto/query-${MODULE_NAME_SINGULAR}.dto.ts" << EOF
import { IsOptional } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { BaseSortByFields, SortOrder } from "../../../common/constants";
import { PaginatedQueryDto } from "../../../common/dto";

export const ${MODULE_NAME_SINGULAR_PASCAL}SortBy = {
  ...BaseSortByFields,
  NAME: "name",
} as const;

export type ${MODULE_NAME_SINGULAR_PASCAL}SortBy = (typeof ${MODULE_NAME_SINGULAR_PASCAL}SortBy)[keyof typeof ${MODULE_NAME_SINGULAR_PASCAL}SortBy];

export class Query${MODULE_NAME_SINGULAR_PASCAL}Dto extends PaginatedQueryDto<${MODULE_NAME_SINGULAR_PASCAL}SortBy> {
  @ApiPropertyOptional({
    description: "Sort field",
    example: ${MODULE_NAME_SINGULAR_PASCAL}SortBy.CREATED_AT,
    enum: Object.values(${MODULE_NAME_SINGULAR_PASCAL}SortBy),
    default: ${MODULE_NAME_SINGULAR_PASCAL}SortBy.CREATED_AT,
  })
  @IsOptional()
  sortBy?: ${MODULE_NAME_SINGULAR_PASCAL}SortBy = ${MODULE_NAME_SINGULAR_PASCAL}SortBy.CREATED_AT;

  @ApiPropertyOptional({
    description: "Sort order",
    example: "desc",
    enum: ["asc", "desc"],
  })
  @IsOptional()
  sortOrder?: SortOrder = SortOrder.DESC;
}
EOF

# Response DTO
cat > "$MODULE_PATH/dto/${MODULE_NAME_SINGULAR}-response.dto.ts" << EOF
import { Exclude, Expose, Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

@Exclude()
export class ${MODULE_NAME_SINGULAR_PASCAL}ResponseDto {
  @ApiProperty({ description: "Unique identifier", example: "clxyz123456789" })
  @Expose()
  id!: string;

  @ApiProperty({ description: "Name", example: "Example name" })
  @Expose()
  name!: string;

  @ApiPropertyOptional({ description: "Description", example: "Example description" })
  @Expose()
  description!: string | null;

  @ApiProperty({ description: "Owner user ID", example: "cluserid123456" })
  @Expose()
  userId!: string;

  @ApiProperty({ description: "Created timestamp", type: Date })
  @Expose()
  @Type(() => Date)
  createdAt!: Date;

  @ApiProperty({ description: "Updated timestamp", type: Date })
  @Expose()
  @Type(() => Date)
  updatedAt!: Date;

  @Exclude()
  deletedAt!: Date | null;

  constructor(partial: Partial<${MODULE_NAME_SINGULAR_PASCAL}ResponseDto>) {
    Object.assign(this, partial);
  }
}

export class PaginationMetaDto {
  @ApiProperty({ example: 42 })
  total!: number;

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 10 })
  limit!: number;

  @ApiProperty({ example: 5 })
  totalPages!: number;

  @ApiProperty({ example: true })
  hasNextPage!: boolean;

  @ApiProperty({ example: false })
  hasPrevPage!: boolean;
}

export class Paginated${MODULE_NAME_PASCAL}ResponseDto {
  @ApiProperty({ type: [${MODULE_NAME_SINGULAR_PASCAL}ResponseDto] })
  @Expose()
  @Type(() => ${MODULE_NAME_SINGULAR_PASCAL}ResponseDto)
  data!: ${MODULE_NAME_SINGULAR_PASCAL}ResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  @Expose()
  meta!: PaginationMetaDto;

  constructor(items: any[], total: number, page: number, limit: number) {
    this.data = items.map((item) => new ${MODULE_NAME_SINGULAR_PASCAL}ResponseDto(item));
    const totalPages = Math.ceil(total / limit);
    this.meta = {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }
}
EOF

# DTO index
cat > "$MODULE_PATH/dto/index.ts" << EOF
export * from "./create-${MODULE_NAME_SINGULAR}.dto";
export * from "./update-${MODULE_NAME_SINGULAR}.dto";
export * from "./query-${MODULE_NAME_SINGULAR}.dto";
export * from "./${MODULE_NAME_SINGULAR}-response.dto";
EOF

echo -e "${GREEN}   Created DTOs${NC}"

# ============================================================================
# DAL
# ============================================================================

echo -e "${YELLOW}Creating DAL...${NC}"

cat > "$MODULE_PATH/${MODULE_NAME}.dal.ts" << EOF
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
// TODO: Import your Prisma model type
// import { ${MODULE_NAME_SINGULAR_PASCAL}, Prisma } from "@prisma/client";

/**
 * Data Access Layer for ${MODULE_NAME_PASCAL}
 */
@Injectable()
export class ${MODULE_NAME_PASCAL}Dal {
  constructor(private prisma: PrismaService) {}

  // TODO: Uncomment and update with your Prisma model name

  /*
  async create(data: Prisma.${MODULE_NAME_SINGULAR_PASCAL}CreateInput): Promise<${MODULE_NAME_SINGULAR_PASCAL}> {
    return this.prisma.${MODULE_NAME_CAMEL}.create({ data });
  }

  async findMany(
    where: Prisma.${MODULE_NAME_SINGULAR_PASCAL}WhereInput,
    skip: number,
    take: number,
    orderBy?: Prisma.${MODULE_NAME_SINGULAR_PASCAL}OrderByWithRelationInput,
  ): Promise<${MODULE_NAME_SINGULAR_PASCAL}[]> {
    return this.prisma.${MODULE_NAME_CAMEL}.findMany({
      where: { ...where, deletedAt: null },
      skip,
      take,
      orderBy,
    });
  }

  async findUnique(id: string): Promise<${MODULE_NAME_SINGULAR_PASCAL} | null> {
    return this.prisma.${MODULE_NAME_CAMEL}.findUnique({
      where: { id, deletedAt: null },
    });
  }

  async count(where: Prisma.${MODULE_NAME_SINGULAR_PASCAL}WhereInput): Promise<number> {
    return this.prisma.${MODULE_NAME_CAMEL}.count({
      where: { ...where, deletedAt: null },
    });
  }

  async update(id: string, data: Prisma.${MODULE_NAME_SINGULAR_PASCAL}UpdateInput): Promise<${MODULE_NAME_SINGULAR_PASCAL}> {
    return this.prisma.${MODULE_NAME_CAMEL}.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string): Promise<${MODULE_NAME_SINGULAR_PASCAL}> {
    return this.prisma.${MODULE_NAME_CAMEL}.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.\$executeRaw\`DELETE FROM "${MODULE_NAME}" WHERE id = \${id}\`;
  }
  */
}
EOF

echo -e "${GREEN}   Created DAL${NC}"

# ============================================================================
# SERVICE
# ============================================================================

echo -e "${YELLOW}Creating service...${NC}"

cat > "$MODULE_PATH/${MODULE_NAME}.service.ts" << EOF
import { Injectable, Logger } from "@nestjs/common";
import { UserRole } from "@prisma/client";
import {
  Create${MODULE_NAME_SINGULAR_PASCAL}Dto,
  Update${MODULE_NAME_SINGULAR_PASCAL}Dto,
  Query${MODULE_NAME_SINGULAR_PASCAL}Dto,
  Paginated${MODULE_NAME_PASCAL}ResponseDto,
} from "./dto";
import { ${MODULE_NAME_SINGULAR_PASCAL}NotFoundException, ${MODULE_NAME_SINGULAR_PASCAL}ForbiddenException } from "./exceptions";
import { ${MODULE_NAME_PASCAL}Dal } from "./${MODULE_NAME}.dal";

interface UserContext {
  id: string;
  role: UserRole;
}

@Injectable()
export class ${MODULE_NAME_PASCAL}Service {
  private readonly logger = new Logger(${MODULE_NAME_PASCAL}Service.name);

  constructor(private readonly ${MODULE_NAME_CAMEL}Dal: ${MODULE_NAME_PASCAL}Dal) {}

  async create(createDto: Create${MODULE_NAME_SINGULAR_PASCAL}Dto, user: UserContext): Promise<any> {
    this.logger.log(\`Creating ${MODULE_NAME_SINGULAR} for user \${user.id}\`);
    // TODO: Implement with DAL
    throw new Error("Not implemented");
  }

  async findAll(query: Query${MODULE_NAME_SINGULAR_PASCAL}Dto, user: UserContext): Promise<Paginated${MODULE_NAME_PASCAL}ResponseDto> {
    const { page = 1, limit = 10, sortBy, sortOrder } = query;
    // TODO: Implement with DAL
    throw new Error("Not implemented");
  }

  async findOne(id: string, user: UserContext): Promise<any> {
    // TODO: Implement with DAL
    throw new Error("Not implemented");
  }

  async update(id: string, updateDto: Update${MODULE_NAME_SINGULAR_PASCAL}Dto, user: UserContext): Promise<any> {
    await this.findOne(id, user);
    this.logger.log(\`Updating ${MODULE_NAME_SINGULAR} \${id}\`);
    // TODO: Implement with DAL
    throw new Error("Not implemented");
  }

  async remove(id: string, user: UserContext): Promise<any> {
    await this.findOne(id, user);
    this.logger.log(\`Soft deleting ${MODULE_NAME_SINGULAR} \${id}\`);
    // TODO: Implement with DAL
    throw new Error("Not implemented");
  }

  async purge(id: string): Promise<void> {
    this.logger.warn(\`Hard deleting ${MODULE_NAME_SINGULAR} \${id}\`);
    // TODO: Implement with DAL
    throw new Error("Not implemented");
  }
}
EOF

echo -e "${GREEN}   Created service${NC}"

# ============================================================================
# CONTROLLER
# ============================================================================

echo -e "${YELLOW}Creating controller...${NC}"

cat > "$MODULE_PATH/${MODULE_NAME}.controller.ts" << EOF
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  UseInterceptors,
} from "@nestjs/common";
import { ApiTags, ApiResponse } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import { CacheInterceptor, CacheTTL } from "@nestjs/cache-manager";
import { UserRole } from "@prisma/client";
import { ${MODULE_NAME_PASCAL}Service } from "./${MODULE_NAME}.service";
import {
  Create${MODULE_NAME_SINGULAR_PASCAL}Dto,
  Update${MODULE_NAME_SINGULAR_PASCAL}Dto,
  Query${MODULE_NAME_SINGULAR_PASCAL}Dto,
  ${MODULE_NAME_SINGULAR_PASCAL}ResponseDto,
  Paginated${MODULE_NAME_PASCAL}ResponseDto,
} from "./dto";
import { ParseCuidPipe } from "../../common/pipes";
import { CurrentUser, Roles } from "../../auth/decorators";
import { CacheTTL as CacheTTLEnum } from "../../common/cache/cache-keys.constants";
import {
  ApiCreateOperation,
  ApiReadListOperation,
  ApiReadOneOperation,
  ApiUpdateOperation,
  ApiDeleteOperation,
  ApiAdminDeleteOperation,
} from "../../common/decorators";
import { ${MODULE_NAME_SINGULAR_UPPER}_API_TAG, ${MODULE_NAME_SINGULAR_UPPER}_SWAGGER_DOCS } from "./constants";
import { ${MODULE_NAME_SINGULAR_PASCAL}ErrorCode } from "./constants";

const THROTTLE_LIMITS = {
  SHORT: { ttl: 1000, limit: 10 },
  MEDIUM: { ttl: 10000, limit: 50 },
} as const;

@ApiTags(${MODULE_NAME_SINGULAR_UPPER}_API_TAG)
@Controller("${MODULE_NAME}")
export class ${MODULE_NAME_PASCAL}Controller {
  constructor(private readonly ${MODULE_NAME_CAMEL}Service: ${MODULE_NAME_PASCAL}Service) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ short: THROTTLE_LIMITS.SHORT })
  @ApiCreateOperation({
    summary: ${MODULE_NAME_SINGULAR_UPPER}_SWAGGER_DOCS.CREATE_SUMMARY,
    description: ${MODULE_NAME_SINGULAR_UPPER}_SWAGGER_DOCS.CREATE_DESCRIPTION,
    resourceName: "${MODULE_NAME_SINGULAR_PASCAL}",
    responseType: ${MODULE_NAME_SINGULAR_PASCAL}ResponseDto,
    path: "/api/v1/${MODULE_NAME}",
  })
  async create(
    @Body() createDto: Create${MODULE_NAME_SINGULAR_PASCAL}Dto,
    @CurrentUser() user: { id: string; role: UserRole },
  ): Promise<${MODULE_NAME_SINGULAR_PASCAL}ResponseDto> {
    const item = await this.${MODULE_NAME_CAMEL}Service.create(createDto, user);
    return new ${MODULE_NAME_SINGULAR_PASCAL}ResponseDto(item);
  }

  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(CacheTTLEnum.SHORT)
  @Throttle({ medium: THROTTLE_LIMITS.MEDIUM })
  @ApiReadListOperation({
    summary: ${MODULE_NAME_SINGULAR_UPPER}_SWAGGER_DOCS.GET_ALL_SUMMARY,
    description: ${MODULE_NAME_SINGULAR_UPPER}_SWAGGER_DOCS.GET_ALL_DESCRIPTION,
    resourceName: "${MODULE_NAME_SINGULAR_PASCAL}",
    responseType: Paginated${MODULE_NAME_PASCAL}ResponseDto,
    path: "/api/v1/${MODULE_NAME}",
  })
  async findAll(
    @Query() query: Query${MODULE_NAME_SINGULAR_PASCAL}Dto,
    @CurrentUser() user: { id: string; role: UserRole },
  ) {
    return this.${MODULE_NAME_CAMEL}Service.findAll(query, user);
  }

  @Get(":id")
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(CacheTTLEnum.MEDIUM)
  @Throttle({ medium: THROTTLE_LIMITS.MEDIUM })
  @ApiReadOneOperation({
    summary: ${MODULE_NAME_SINGULAR_UPPER}_SWAGGER_DOCS.GET_BY_ID_SUMMARY,
    description: ${MODULE_NAME_SINGULAR_UPPER}_SWAGGER_DOCS.GET_BY_ID_DESCRIPTION,
    resourceName: "${MODULE_NAME_SINGULAR_PASCAL}",
    responseType: ${MODULE_NAME_SINGULAR_PASCAL}ResponseDto,
    notFoundErrorCode: ${MODULE_NAME_SINGULAR_PASCAL}ErrorCode.${MODULE_NAME_SINGULAR_UPPER}_NOT_FOUND,
    path: "/api/v1/${MODULE_NAME}/:id",
  })
  async findOne(
    @Param("id", ParseCuidPipe) id: string,
    @CurrentUser() user: { id: string; role: UserRole },
  ): Promise<${MODULE_NAME_SINGULAR_PASCAL}ResponseDto> {
    const item = await this.${MODULE_NAME_CAMEL}Service.findOne(id, user);
    return new ${MODULE_NAME_SINGULAR_PASCAL}ResponseDto(item);
  }

  @Patch(":id")
  @Throttle({ short: THROTTLE_LIMITS.SHORT })
  @ApiUpdateOperation({
    summary: ${MODULE_NAME_SINGULAR_UPPER}_SWAGGER_DOCS.UPDATE_SUMMARY,
    description: ${MODULE_NAME_SINGULAR_UPPER}_SWAGGER_DOCS.UPDATE_DESCRIPTION,
    resourceName: "${MODULE_NAME_SINGULAR_PASCAL}",
    responseType: ${MODULE_NAME_SINGULAR_PASCAL}ResponseDto,
    notFoundErrorCode: ${MODULE_NAME_SINGULAR_PASCAL}ErrorCode.${MODULE_NAME_SINGULAR_UPPER}_NOT_FOUND,
    path: "/api/v1/${MODULE_NAME}/:id",
  })
  async update(
    @Param("id", ParseCuidPipe) id: string,
    @Body() updateDto: Update${MODULE_NAME_SINGULAR_PASCAL}Dto,
    @CurrentUser() user: { id: string; role: UserRole },
  ): Promise<${MODULE_NAME_SINGULAR_PASCAL}ResponseDto> {
    const item = await this.${MODULE_NAME_CAMEL}Service.update(id, updateDto, user);
    return new ${MODULE_NAME_SINGULAR_PASCAL}ResponseDto(item);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @Throttle({ short: THROTTLE_LIMITS.SHORT })
  @ApiDeleteOperation({
    summary: ${MODULE_NAME_SINGULAR_UPPER}_SWAGGER_DOCS.DELETE_SUMMARY,
    description: ${MODULE_NAME_SINGULAR_UPPER}_SWAGGER_DOCS.DELETE_DESCRIPTION,
    resourceName: "${MODULE_NAME_SINGULAR_PASCAL}",
    notFoundErrorCode: ${MODULE_NAME_SINGULAR_PASCAL}ErrorCode.${MODULE_NAME_SINGULAR_UPPER}_NOT_FOUND,
    path: "/api/v1/${MODULE_NAME}/:id",
  })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: ${MODULE_NAME_SINGULAR_UPPER}_SWAGGER_DOCS.DELETE_SUCCESS })
  async remove(
    @Param("id", ParseCuidPipe) id: string,
    @CurrentUser() user: { id: string; role: UserRole },
  ): Promise<void> {
    await this.${MODULE_NAME_CAMEL}Service.remove(id, user);
  }

  @Delete(":id/purge")
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Throttle({ short: THROTTLE_LIMITS.SHORT })
  @ApiAdminDeleteOperation({
    summary: ${MODULE_NAME_SINGULAR_UPPER}_SWAGGER_DOCS.PURGE_SUMMARY,
    description: ${MODULE_NAME_SINGULAR_UPPER}_SWAGGER_DOCS.PURGE_DESCRIPTION,
    resourceName: "${MODULE_NAME_SINGULAR_PASCAL}",
    notFoundErrorCode: ${MODULE_NAME_SINGULAR_PASCAL}ErrorCode.${MODULE_NAME_SINGULAR_UPPER}_NOT_FOUND,
    path: "/api/v1/${MODULE_NAME}/:id/purge",
  })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: ${MODULE_NAME_SINGULAR_UPPER}_SWAGGER_DOCS.PURGE_SUCCESS })
  async purge(@Param("id", ParseCuidPipe) id: string): Promise<void> {
    await this.${MODULE_NAME_CAMEL}Service.purge(id);
  }
}
EOF

echo -e "${GREEN}   Created controller${NC}"

# ============================================================================
# MODULE
# ============================================================================

echo -e "${YELLOW}Creating module...${NC}"

cat > "$MODULE_PATH/${MODULE_NAME}.module.ts" << EOF
import { Module } from "@nestjs/common";
import { ${MODULE_NAME_PASCAL}Service } from "./${MODULE_NAME}.service";
import { ${MODULE_NAME_PASCAL}Controller } from "./${MODULE_NAME}.controller";
import { ${MODULE_NAME_PASCAL}Dal } from "./${MODULE_NAME}.dal";

@Module({
  controllers: [${MODULE_NAME_PASCAL}Controller],
  providers: [${MODULE_NAME_PASCAL}Service, ${MODULE_NAME_PASCAL}Dal],
  exports: [${MODULE_NAME_PASCAL}Service],
})
export class ${MODULE_NAME_PASCAL}Module {}
EOF

echo -e "${GREEN}   Created module${NC}"

# ============================================================================
# MODULE README
# ============================================================================

cat > "$MODULE_PATH/README.md" << EOF
# ${MODULE_NAME_PASCAL} Module

Generated module for the NestJS API skeleton.

## Prisma Schema Changes

Add the following model to \`prisma/schema.prisma\`:

\`\`\`prisma
model ${MODULE_NAME_SINGULAR_PASCAL} {
  id          String    @id @default(cuid())
  name        String
  description String?
  userId      String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  deletedAt   DateTime?

  @@index([userId])
  @@index([createdAt])
  @@map("${MODULE_NAME}")
}
\`\`\`

Add the relation to the \`User\` model:

\`\`\`prisma
model User {
  // ... existing fields ...
  ${MODULE_NAME}  ${MODULE_NAME_SINGULAR_PASCAL}[]
}
\`\`\`

## TODO Checklist

- [ ] **Prisma Schema**: Add the model above to \`prisma/schema.prisma\`
- [ ] **User Relation**: Add \`${MODULE_NAME}  ${MODULE_NAME_SINGULAR_PASCAL}[]\` to the User model
- [ ] **Migration**: Run \`npm run prisma:migrate:dev -- --name add-${MODULE_NAME}\`
- [ ] **Generate Client**: Run \`npm run prisma:generate\`
- [ ] **DAL Implementation**: Uncomment and update methods in \`${MODULE_NAME}.dal.ts\`
- [ ] **App Module**: Import \`${MODULE_NAME_PASCAL}Module\` in \`src/app.module.ts\`
- [ ] **Unit Tests**: Create tests in \`test/unit/${MODULE_NAME}/\`
- [ ] **E2E Tests**: Create tests in \`test/e2e/${MODULE_NAME}.e2e-spec.ts\`
- [ ] **Update DTOs**: Customize DTOs with your actual fields
- [ ] **Update Constants**: Review and update validation messages and swagger docs
- [ ] **Delete This README**: Remove this file once setup is complete

## File Structure

\`\`\`
${MODULE_NAME}/
├── constants/
│   ├── ${MODULE_NAME_SINGULAR}.constants.ts    # API tags, swagger docs, cache keys
│   ├── ${MODULE_NAME_SINGULAR}-error-codes.constants.ts
│   └── index.ts
├── dto/
│   ├── create-${MODULE_NAME_SINGULAR}.dto.ts
│   ├── update-${MODULE_NAME_SINGULAR}.dto.ts
│   ├── query-${MODULE_NAME_SINGULAR}.dto.ts
│   ├── ${MODULE_NAME_SINGULAR}-response.dto.ts
│   └── index.ts
├── exceptions/
│   ├── ${MODULE_NAME_SINGULAR}.exceptions.ts
│   └── index.ts
├── ${MODULE_NAME}.dal.ts         # Data Access Layer (Prisma)
├── ${MODULE_NAME}.service.ts     # Business logic
├── ${MODULE_NAME}.controller.ts  # HTTP endpoints
├── ${MODULE_NAME}.module.ts      # NestJS module
└── README.md                     # This file
\`\`\`

## Reference

See \`src/modules/tasks/\` for a complete working example.
EOF

echo -e "${GREEN}   Created README.md${NC}"

# ============================================================================
# SUMMARY
# ============================================================================

echo ""
echo -e "${GREEN}+================================================+${NC}"
echo -e "${GREEN}|              Success!                          |${NC}"
echo -e "${GREEN}+================================================+${NC}"
echo ""
echo -e "${GREEN}Module created at:${NC} $MODULE_PATH"
echo ""
echo -e "${BLUE}Files created:${NC}"
echo "  constants/${MODULE_NAME_SINGULAR}.constants.ts"
echo "  constants/${MODULE_NAME_SINGULAR}-error-codes.constants.ts"
echo "  constants/index.ts"
echo "  dto/create-${MODULE_NAME_SINGULAR}.dto.ts"
echo "  dto/update-${MODULE_NAME_SINGULAR}.dto.ts"
echo "  dto/query-${MODULE_NAME_SINGULAR}.dto.ts"
echo "  dto/${MODULE_NAME_SINGULAR}-response.dto.ts"
echo "  dto/index.ts"
echo "  exceptions/${MODULE_NAME_SINGULAR}.exceptions.ts"
echo "  exceptions/index.ts"
echo "  ${MODULE_NAME}.dal.ts"
echo "  ${MODULE_NAME}.service.ts"
echo "  ${MODULE_NAME}.controller.ts"
echo "  ${MODULE_NAME}.module.ts"
echo "  README.md"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo ""
echo -e "  ${YELLOW}1.${NC} Add Prisma model to schema.prisma:"
echo -e "     model ${MODULE_NAME_SINGULAR_PASCAL} {"
echo -e "       id          String   @id @default(cuid())"
echo -e "       name        String"
echo -e "       description String?"
echo -e "       userId      String"
echo -e "       user        User     @relation(fields: [userId], references: [id])"
echo -e "       createdAt   DateTime @default(now())"
echo -e "       updatedAt   DateTime @updatedAt"
echo -e "       deletedAt   DateTime?"
echo -e "     }"
echo ""
echo -e "  ${YELLOW}2.${NC} Add relation to User model:"
echo -e "     ${MODULE_NAME} ${MODULE_NAME_SINGULAR_PASCAL}[]"
echo ""
echo -e "  ${YELLOW}3.${NC} Run migration:"
echo -e "     npm run prisma:migrate:dev -- --name add-${MODULE_NAME}"
echo ""
echo -e "  ${YELLOW}4.${NC} Uncomment DAL methods and update with Prisma model"
echo ""
echo -e "  ${YELLOW}5.${NC} Import module in app.module.ts:"
echo -e "     import { ${MODULE_NAME_PASCAL}Module } from \"./modules/${MODULE_NAME}/${MODULE_NAME}.module\";"
echo ""
echo -e "  ${YELLOW}6.${NC} Add tests in test/unit/${MODULE_NAME}/ and test/e2e/"
echo ""
echo -e "${BLUE}Reference:${NC} See src/modules/tasks/ for complete example"
echo ""
