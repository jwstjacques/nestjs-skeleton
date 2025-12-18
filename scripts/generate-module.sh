#!/bin/bash

# ============================================================================
# Module Generator Script
# ============================================================================
# Generates a new NestJS module following the skeleton pattern
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
MODULE_NAME_UPPER=$(echo "$MODULE_NAME" | tr '[:lower:]' '[:upper:]')
MODULE_NAME_PASCAL=$(echo "$MODULE_NAME" | sed -r 's/(^|-)(\w)/\U\2/g')
MODULE_NAME_SINGULAR=$(echo "$MODULE_NAME" | sed 's/s$//')

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         NestJS Module Generator                ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}📦 Module Name:${NC} $MODULE_NAME"
echo -e "${GREEN}📁 Path:${NC} $MODULE_PATH"
echo ""

# Check if module already exists
if [ -d "$MODULE_PATH" ]; then
    echo -e "${RED}❌ Error: Module already exists at $MODULE_PATH${NC}"
    echo ""
    exit 1
fi

# Create directory structure
echo -e "${YELLOW}📁 Creating directory structure...${NC}"
mkdir -p "$MODULE_PATH"/{constants,dto,entities,exceptions,enums}
echo -e "${GREEN}   ✓ Created directories${NC}"

# Create constants file
echo -e "${YELLOW}📝 Creating constants file...${NC}"
cat > "$MODULE_PATH/constants/${MODULE_NAME}.constants.ts" << EOF
/**
 * $MODULE_NAME_PASCAL module-specific constants
 * All module-related strings, messages, and configuration
 */

// ============================================================================
// API Configuration
// ============================================================================

/** Swagger API tag for $MODULE_NAME endpoints */
export const ${MODULE_NAME_UPPER}_API_TAG = '$MODULE_NAME';

/** Controller route path */
export const ${MODULE_NAME_UPPER}_CONTROLLER_PATH = '$MODULE_NAME';

// ============================================================================
// API Response Messages
// ============================================================================

export const ${MODULE_NAME_UPPER}_MESSAGES = {
  CREATED: '$MODULE_NAME_PASCAL created successfully',
  UPDATED: '$MODULE_NAME_PASCAL updated successfully',
  DELETED: '$MODULE_NAME_PASCAL deleted successfully',
  PURGED: '$MODULE_NAME_PASCAL permanently deleted',
  NOT_FOUND: (id: string) => \`$MODULE_NAME_PASCAL not found: \${id}\`,
  FORBIDDEN: (id?: string) =>
    id
      ? \`You do not have permission to access this $MODULE_NAME_SINGULAR: \${id}\`
      : 'Access forbidden',
};

// ============================================================================
// Validation Messages
// ============================================================================

export const ${MODULE_NAME_UPPER}_VALIDATION = {
  // Add your validation messages here
  // Example:
  // NAME_REQUIRED: 'Name is required',
  // NAME_TOO_SHORT: 'Name must be at least 3 characters',
};

// ============================================================================
// Swagger Examples
// ============================================================================

export const ${MODULE_NAME_UPPER}_SWAGGER_EXAMPLES = {
  EXAMPLE_ID: 'cmixpvpir0001p9yp5xq8r7ks',
  CREATE_REQUEST: {
    // Add your example here
  },
  UPDATE_REQUEST: {
    // Add your example here
  },
};

// ============================================================================
// Cache Configuration
// ============================================================================

export const ${MODULE_NAME_UPPER}_CACHE = {
  LIST_KEY: \`\${${MODULE_NAME_UPPER}_CONTROLLER_PATH}:list\`,
  ITEM_KEY: (id: string) => \`\${${MODULE_NAME_UPPER}_CONTROLLER_PATH}:\${id}\`,
  TTL_LIST: 60_000, // 1 minute
  TTL_ITEM: 300_000, // 5 minutes
};
EOF
echo -e "${GREEN}   ✓ Created constants file${NC}"

# Create error codes file
echo -e "${YELLOW}📝 Creating error codes...${NC}"
cat > "$MODULE_PATH/constants/${MODULE_NAME}-error-codes.constants.ts" << EOF
/**
 * $MODULE_NAME_PASCAL module error codes
 * Used for client-side error handling
 */
export enum ${MODULE_NAME_PASCAL}ErrorCode {
  ${MODULE_NAME_UPPER}_NOT_FOUND = '${MODULE_NAME_UPPER}_NOT_FOUND',
  ${MODULE_NAME_UPPER}_FORBIDDEN = '${MODULE_NAME_UPPER}_FORBIDDEN',
  ${MODULE_NAME_UPPER}_INVALID = '${MODULE_NAME_UPPER}_INVALID',
  // Add more error codes as needed
}
EOF
echo -e "${GREEN}   ✓ Created error codes${NC}"

# Create exceptions file
echo -e "${YELLOW}📝 Creating exceptions...${NC}"
cat > "$MODULE_PATH/exceptions/${MODULE_NAME}.exceptions.ts" << EOF
import { HttpStatus } from '@nestjs/common';
import { ApplicationException } from '../../../common/exceptions/application.exception';
import { ${MODULE_NAME_PASCAL}ErrorCode } from '../constants/${MODULE_NAME}-error-codes.constants';
import { ${MODULE_NAME_UPPER}_MESSAGES } from '../constants/${MODULE_NAME}.constants';

/**
 * Exception thrown when $MODULE_NAME_SINGULAR is not found
 */
export class ${MODULE_NAME_PASCAL}NotFoundException extends ApplicationException {
  constructor(id: string) {
    super(
      ${MODULE_NAME_PASCAL}ErrorCode.${MODULE_NAME_UPPER}_NOT_FOUND,
      ${MODULE_NAME_UPPER}_MESSAGES.NOT_FOUND(id),
      HttpStatus.NOT_FOUND,
    );
  }
}

/**
 * Exception thrown when user doesn't have permission to access $MODULE_NAME_SINGULAR
 */
export class ${MODULE_NAME_PASCAL}ForbiddenException extends ApplicationException {
  constructor(id?: string) {
    super(
      ${MODULE_NAME_PASCAL}ErrorCode.${MODULE_NAME_UPPER}_FORBIDDEN,
      ${MODULE_NAME_UPPER}_MESSAGES.FORBIDDEN(id),
      HttpStatus.FORBIDDEN,
    );
  }
}

/**
 * Exception thrown when $MODULE_NAME_SINGULAR data is invalid
 */
export class ${MODULE_NAME_PASCAL}InvalidException extends ApplicationException {
  constructor(message: string) {
    super(
      ${MODULE_NAME_PASCAL}ErrorCode.${MODULE_NAME_UPPER}_INVALID,
      message,
      HttpStatus.BAD_REQUEST,
    );
  }
}
EOF
echo -e "${GREEN}   ✓ Created exceptions${NC}"

# Create module README
echo -e "${YELLOW}📝 Creating module README...${NC}"
cat > "$MODULE_PATH/README.md" << EOF
# $MODULE_NAME_PASCAL Module

## Overview

TODO: Add module description

## Features

- [ ] CRUD operations
- [ ] Pagination support
- [ ] Filtering capabilities
- [ ] Caching implementation
- [ ] Authentication/authorization
- [ ] Comprehensive testing

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | \`/api/v1/$MODULE_NAME\` | Create new $MODULE_NAME_SINGULAR |
| GET | \`/api/v1/$MODULE_NAME\` | List $MODULE_NAME (paginated) |
| GET | \`/api/v1/$MODULE_NAME/:id\` | Get single $MODULE_NAME_SINGULAR |
| PATCH | \`/api/v1/$MODULE_NAME/:id\` | Update $MODULE_NAME_SINGULAR |
| DELETE | \`/api/v1/$MODULE_NAME/:id\` | Soft delete $MODULE_NAME_SINGULAR |

## Database Schema

\`\`\`prisma
model ${MODULE_NAME_PASCAL} {
  id        String   @id @default(cuid())
  // Add your fields here
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  deletedAt DateTime?
}
\`\`\`

## Implementation Checklist

- [ ] Update Prisma schema
- [ ] Run migration: \`npm run prisma:migrate:dev\`
- [ ] Generate NestJS resource: \`nest g resource $MODULE_NAME --no-spec\`
- [ ] Create DTOs with validation
- [ ] Implement DAL (Database Access Layer)
- [ ] Implement service logic
- [ ] Add Swagger decorators
- [ ] Implement caching
- [ ] Write unit tests (service, controller, DAL)
- [ ] Write E2E tests
- [ ] Update API documentation

## Usage Examples

### Create $MODULE_NAME_PASCAL

\`\`\`bash
POST /api/v1/$MODULE_NAME
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  // Add your fields
}
\`\`\`

### List $MODULE_NAME_PASCAL

\`\`\`bash
GET /api/v1/$MODULE_NAME?page=1&limit=10
Authorization: Bearer YOUR_JWT_TOKEN
\`\`\`

## Testing

\`\`\`bash
# Unit tests
npm test -- $MODULE_NAME.service
npm test -- $MODULE_NAME.controller
npm test -- $MODULE_NAME.dal

# E2E tests
npm run test:e2e -- $MODULE_NAME
\`\`\`

## Related Documentation

- [Module Creation Checklist](../../docs/MODULE-CREATION-CHECKLIST.md)
- [Architecture Patterns](../../docs/architecture/PATTERNS.md)
- [Testing Guide](../../docs/TESTING.md)

---

**Created**: $(date +"%Y-%m-%d")  
**Status**: In Development
EOF
echo -e "${GREEN}   ✓ Created module README${NC}"

# Summary
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              ✅ Success!                        ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}✅ Module structure created at:${NC} $MODULE_PATH"
echo ""
echo -e "${BLUE}📋 Next Steps:${NC}"
echo ""
echo -e "  ${YELLOW}1.${NC} Update Prisma schema:"
echo -e "     ${GREEN}Edit:${NC} prisma/schema.prisma"
echo ""
echo -e "  ${YELLOW}2.${NC} Generate NestJS resource:"
echo -e "     ${GREEN}Run:${NC} nest g resource $MODULE_NAME --no-spec"
echo ""
echo -e "  ${YELLOW}3.${NC} Create database migration:"
echo -e "     ${GREEN}Run:${NC} npm run prisma:migrate:dev"
echo ""
echo -e "  ${YELLOW}4.${NC} Create DTOs in:"
echo -e "     ${GREEN}Path:${NC} $MODULE_PATH/dto/"
echo ""
echo -e "  ${YELLOW}5.${NC} Implement service logic:"
echo -e "     ${GREEN}File:${NC} $MODULE_PATH/${MODULE_NAME}.service.ts"
echo ""
echo -e "  ${YELLOW}6.${NC} Add comprehensive tests:"
echo -e "     ${GREEN}Path:${NC} test/unit/$MODULE_NAME/"
echo ""
echo -e "  ${YELLOW}7.${NC} Update app.module.ts:"
echo -e "     ${GREEN}Import:${NC} ${MODULE_NAME_PASCAL}Module"
echo ""
echo -e "${BLUE}📚 Reference Implementation:${NC}"
echo -e "  Check ${GREEN}src/modules/tasks/${NC} for complete example"
echo ""
echo -e "${GREEN}🚀 Happy coding!${NC}"
echo ""
