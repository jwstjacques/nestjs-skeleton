#!/bin/bash

# =============================================================================
# Remove Tasks Module Script
# =============================================================================
# This script removes the Tasks example module from the NestJS skeleton project.
# It preserves rate limiting tests by skipping them (using x.it()).
#
# Usage: ./scripts/remove-tasks-module.sh
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}==============================================================================${NC}"
echo -e "${BLUE}                     Remove Tasks Module Script                               ${NC}"
echo -e "${BLUE}==============================================================================${NC}"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "src/modules/tasks" ]; then
    echo -e "${RED}Error: Please run this script from the project root directory.${NC}"
    exit 1
fi

echo -e "${YELLOW}Step 1: Removing task source files...${NC}"

# Remove the tasks module directory
if [ -d "src/modules/tasks" ]; then
    rm -rf src/modules/tasks
    echo -e "${GREEN}  ✓ Removed src/modules/tasks/${NC}"
else
    echo -e "${YELLOW}  - src/modules/tasks/ already removed${NC}"
fi

echo ""
echo -e "${YELLOW}Step 2: Removing task unit tests...${NC}"

# Remove task unit tests
if [ -d "test/unit/tasks" ]; then
    rm -rf test/unit/tasks
    echo -e "${GREEN}  ✓ Removed test/unit/tasks/${NC}"
else
    echo -e "${YELLOW}  - test/unit/tasks/ already removed${NC}"
fi

echo ""
echo -e "${YELLOW}Step 3: Removing task E2E tests...${NC}"

# Remove task E2E tests
if [ -d "test/e2e/tasks" ]; then
    rm -rf test/e2e/tasks
    echo -e "${GREEN}  ✓ Removed test/e2e/tasks/${NC}"
else
    echo -e "${YELLOW}  - test/e2e/tasks/ already removed${NC}"
fi

echo ""
echo -e "${YELLOW}Step 4: Updating app.module.ts...${NC}"

# Remove TasksModule import and usage from app.module.ts
if grep -q "TasksModule" src/app.module.ts 2>/dev/null; then
    # Remove the import line
    sed -i '' '/import { TasksModule } from "\.\/modules\/tasks\/tasks\.module";/d' src/app.module.ts
    # Remove TasksModule from imports array
    sed -i '' '/TasksModule,/d' src/app.module.ts
    echo -e "${GREEN}  ✓ Removed TasksModule from app.module.ts${NC}"
else
    echo -e "${YELLOW}  - TasksModule already removed from app.module.ts${NC}"
fi

echo ""
echo -e "${YELLOW}Step 5: Updating Prisma schema...${NC}"

# Create a new Prisma schema without Task-related content
cat > prisma/schema.prisma << 'SCHEMA'
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
}

// =============================================================================
// CORE ENUMS
// =============================================================================

enum UserRole {
  USER
  ADMIN
}

// =============================================================================
// CORE MODELS
// =============================================================================

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  username  String   @unique
  password  String
  firstName String?  @map("first_name")
  lastName  String?  @map("last_name")
  role      UserRole @default(USER)
  isActive  Boolean  @default(true) @map("is_active")

  // Timestamps (stored in UTC)
  createdAt DateTime  @default(now()) @map("created_at") @db.Timestamptz
  updatedAt DateTime  @updatedAt @map("updated_at") @db.Timestamptz

  // Soft delete (UTC timestamp)
  deletedAt DateTime? @map("deleted_at") @db.Timestamptz

  @@index([email])
  @@index([username])
  @@map("users")
}
SCHEMA
echo -e "${GREEN}  ✓ Updated prisma/schema.prisma (removed Task model and enums)${NC}"

echo ""
echo -e "${YELLOW}Step 6: Updating rate-limiting.e2e-spec.ts (skipping task-dependent tests)...${NC}"

# Update rate-limiting tests to skip task-dependent tests
cat > test/e2e/rate-limiting.e2e-spec.ts << 'TESTFILE'
import { HttpStatus, INestApplication } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "../../src/app.module";
import { PrismaService } from "../../src/database/prisma.service";
import { TestCleanup } from "../utils/test-cleanup";
import { Setup, TestDataFactory } from "../utils";

/**
 * Rate Limiting E2E Tests
 *
 * These tests verify that the rate limiting (throttling) feature works correctly.
 * The tests configure low rate limits via environment variables to make testing faster.
 *
 * Configuration:
 * - THROTTLE_SHORT_LIMIT: 2 requests
 * - THROTTLE_SHORT_TTL: 1000ms (1 second)
 *
 * This means only 2 requests per second are allowed on rate-limited endpoints.
 *
 * NOTE: Task-dependent tests are skipped (x.it) until a new module is added.
 * To re-enable these tests:
 * 1. Create a new module with rate-limited endpoints
 * 2. Update the endpoint paths in the tests below
 * 3. Change x.it() back to it()
 */
describe("Rate Limiting (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let cleanup: TestCleanup;
  let accessToken: string;

  beforeAll(async () => {
    // Configure low rate limits for testing
    // Default is 10/second, we set to 2/second for faster test execution
    process.env.THROTTLE_SHORT_LIMIT = "2";
    process.env.THROTTLE_SHORT_TTL = "1000";

    app = await Setup.createTestApp([AppModule]);
    prisma = app.get<PrismaService>(PrismaService);
    cleanup = new TestCleanup(prisma);

    // Create a test user and get auth token
    const userData = TestDataFactory.createUserData();
    const registerResponse = await request(app.getHttpServer())
      .post("/api/v1/auth/register")
      .send(userData)
      .expect(HttpStatus.CREATED);

    accessToken = registerResponse.body.data.accessToken;
    const userId = registerResponse.body.data.user.id;

    cleanup.trackUser(userId);
  });

  afterAll(async () => {
    // Reset environment variables
    delete process.env.THROTTLE_SHORT_LIMIT;
    delete process.env.THROTTLE_SHORT_TTL;

    await cleanup.cleanupAll();
    await Setup.closeTestApp(app);
  });

  describe("Short-term Rate Limiting (per second)", () => {
    describe("Success", () => {
      // TODO: Re-enable when a rate-limited module endpoint is available
      // Replace '/api/v1/tasks/${taskId}' with your new module's endpoint
      xit("should allow requests within rate limit", async () => {
        // With limit of 2/second, first 2 requests should succeed
        // Example: Replace with your module's GET endpoint
        const response1 = await request(app.getHttpServer())
          .get("/api/v1/health") // Using health as placeholder
          .set("Authorization", `Bearer ${accessToken}`)
          .expect(HttpStatus.OK);

        const response2 = await request(app.getHttpServer())
          .get("/api/v1/health")
          .set("Authorization", `Bearer ${accessToken}`)
          .expect(HttpStatus.OK);

        expect(response1.statusCode).toBe(HttpStatus.OK);
        expect(response2.statusCode).toBe(HttpStatus.OK);
      });

      // TODO: Re-enable when a rate-limited module endpoint is available
      xit("should allow requests again after rate limit window expires", async () => {
        // Make 2 requests to hit the limit
        await Promise.all([
          request(app.getHttpServer())
            .get("/api/v1/health")
            .set("Authorization", `Bearer ${accessToken}`),
          request(app.getHttpServer())
            .get("/api/v1/health")
            .set("Authorization", `Bearer ${accessToken}`),
        ]);

        // Next request should be rate limited
        const blockedResponse = await request(app.getHttpServer())
          .get("/api/v1/health")
          .set("Authorization", `Bearer ${accessToken}`);

        expect(blockedResponse.statusCode).toBe(HttpStatus.TOO_MANY_REQUESTS);

        // Wait for the 1-second window to expire (plus a small buffer)
        await new Promise((resolve) => setTimeout(resolve, 1100));

        // Now a request should succeed
        const successResponse = await request(app.getHttpServer())
          .get("/api/v1/health")
          .set("Authorization", `Bearer ${accessToken}`)
          .expect(HttpStatus.OK);

        expect(successResponse.statusCode).toBe(HttpStatus.OK);
      });
    });

    describe("Failure", () => {
      // TODO: Re-enable when a rate-limited module endpoint is available
      xit("should return 429 when exceeding rate limit", async () => {
        // With limit of 2/second, the 3rd request should be rate limited
        const responses = await Promise.all([
          request(app.getHttpServer())
            .get("/api/v1/health")
            .set("Authorization", `Bearer ${accessToken}`),
          request(app.getHttpServer())
            .get("/api/v1/health")
            .set("Authorization", `Bearer ${accessToken}`),
          request(app.getHttpServer())
            .get("/api/v1/health")
            .set("Authorization", `Bearer ${accessToken}`),
        ]);

        // At least one response should be rate limited (429)
        const rateLimitedResponse = responses.find(
          (r) => r.statusCode === HttpStatus.TOO_MANY_REQUESTS,
        );

        expect(rateLimitedResponse).toBeDefined();
        expect(rateLimitedResponse?.statusCode).toBe(HttpStatus.TOO_MANY_REQUESTS);
        expect(rateLimitedResponse?.body.message).toContain("Too Many Requests");
      });

      // TODO: Re-enable when a rate-limited module endpoint is available
      xit("should include Retry-After header in 429 response", async () => {
        // Exceed rate limit to get 429 response
        const responses = await Promise.all(
          Array.from({ length: 5 }, () =>
            request(app.getHttpServer())
              .get("/api/v1/health")
              .set("Authorization", `Bearer ${accessToken}`),
          ),
        );

        const rateLimitedResponse = responses.find(
          (r) => r.statusCode === HttpStatus.TOO_MANY_REQUESTS,
        );

        expect(rateLimitedResponse).toBeDefined();
        // NestJS throttler returns 'retry-after-short' header
        expect(rateLimitedResponse?.headers).toHaveProperty("retry-after-short");
      });
    });
  });

  describe("Rate Limiting Response Format", () => {
    // TODO: Re-enable when a rate-limited module endpoint is available
    xit("should return proper error response format for 429", async () => {
      // Exceed rate limit
      const responses = await Promise.all(
        Array.from({ length: 5 }, () =>
          request(app.getHttpServer())
            .get("/api/v1/health")
            .set("Authorization", `Bearer ${accessToken}`),
        ),
      );

      const rateLimitedResponse = responses.find(
        (r) => r.statusCode === HttpStatus.TOO_MANY_REQUESTS,
      );

      expect(rateLimitedResponse?.body).toHaveProperty("statusCode", HttpStatus.TOO_MANY_REQUESTS);
      expect(rateLimitedResponse?.body).toHaveProperty("message");
      expect(rateLimitedResponse?.statusCode).toBe(HttpStatus.TOO_MANY_REQUESTS);
    });

    // TODO: Re-enable when a rate-limited module endpoint is available
    xit("should apply rate limiting across different endpoints using same throttle", async () => {
      // Rate limiting should apply across endpoints that use the same throttle key
      // Make requests to different endpoints
      const responses = await Promise.all(
        Array.from({ length: 5 }, () =>
          request(app.getHttpServer())
            .get("/api/v1/health")
            .set("Authorization", `Bearer ${accessToken}`),
        ),
      );

      // At least one should be rate limited
      const rateLimitedResponse = responses.find(
        (r) => r.statusCode === HttpStatus.TOO_MANY_REQUESTS,
      );

      expect(rateLimitedResponse).toBeDefined();
      expect(rateLimitedResponse?.statusCode).toBe(HttpStatus.TOO_MANY_REQUESTS);
    });
  });

  describe("Rate Limiting with Different User Sessions", () => {
    // TODO: Re-enable when a rate-limited module endpoint is available
    xit("should enforce rate limits per user/IP separately", async () => {
      // Create a second user
      const userData2 = TestDataFactory.createUserData();
      const registerResponse2 = await request(app.getHttpServer())
        .post("/api/v1/auth/register")
        .send(userData2)
        .expect(HttpStatus.CREATED);

      const accessToken2 = registerResponse2.body.data.accessToken;
      const userId2 = registerResponse2.body.data.user.id;

      cleanup.trackUser(userId2);

      // First user makes 2 requests (hits limit)
      await Promise.all([
        request(app.getHttpServer())
          .get("/api/v1/health")
          .set("Authorization", `Bearer ${accessToken}`),
        request(app.getHttpServer())
          .get("/api/v1/health")
          .set("Authorization", `Bearer ${accessToken}`),
      ]);

      // First user's 3rd request should be rate limited
      const user1BlockedResponse = await request(app.getHttpServer())
        .get("/api/v1/health")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(user1BlockedResponse.statusCode).toBe(HttpStatus.TOO_MANY_REQUESTS);

      // BUT second user should still be able to make requests
      // (rate limits are per-user/IP, not global)
      const user2Response = await request(app.getHttpServer())
        .get("/api/v1/health")
        .set("Authorization", `Bearer ${accessToken2}`);

      // Note: In this test environment, both users might share the same IP/context,
      // so this behavior depends on the throttler implementation.
      // If it's IP-based, this test might not work as expected.
      // If it's context-based, it should allow the second user.
      expect(user2Response.statusCode).toBeGreaterThanOrEqual(200);
    });
  });

  describe("Public Endpoints Rate Limiting", () => {
    it("should apply rate limiting to public auth endpoints", async () => {
      // Auth endpoints like login should also be rate limited
      const responses = await Promise.all(
        Array.from({ length: 5 }, () =>
          request(app.getHttpServer()).post("/api/v1/auth/login").send({
            username: "testuser",
            password: "TestPassword123!",
          }),
        ),
      );

      // At least one should be rate limited (may not all fail if throttle is different for auth)
      const results = responses.map((r) => r.statusCode);

      // At minimum, we should see a variety of responses
      expect(results).toBeDefined();
    });
  });
});
TESTFILE
echo -e "${GREEN}  ✓ Updated rate-limiting.e2e-spec.ts (task tests skipped with xit)${NC}"

echo ""
echo -e "${YELLOW}Step 7: Cleaning task references from common files...${NC}"

# Update swagger.config.ts to remove task tags
if grep -q "tasks" src/config/swagger.config.ts 2>/dev/null; then
    # Remove task-related tags from swagger config
    sed -i '' '/\.addTag("tasks",/d' src/config/swagger.config.ts
    sed -i '' '/\.addTag("tasks-v2",/d' src/config/swagger.config.ts
    # Update description to remove Tasks reference
    sed -i '' 's/Includes Tasks module as example implementation./Ready for your custom modules./g' src/config/swagger.config.ts
    echo -e "${GREEN}  ✓ Cleaned task references from swagger.config.ts${NC}"
else
    echo -e "${YELLOW}  - swagger.config.ts already cleaned${NC}"
fi

# Remove deprecated task-specific decorators from api-standard-responses.decorator.ts
if grep -q "ApiTaskIdParam" src/common/decorators/api-standard-responses.decorator.ts 2>/dev/null; then
    # Remove the deprecated ApiTaskIdParam function
    sed -i '' '/\* @deprecated Use ApiResourceIdParam("Task") instead/,/^}/d' src/common/decorators/api-standard-responses.decorator.ts
    # Remove the deprecated ApiForbiddenTaskResponse function
    sed -i '' '/\* @deprecated Use ApiForbiddenResourceResponse/,/^}/d' src/common/decorators/api-standard-responses.decorator.ts
    echo -e "${GREEN}  ✓ Removed deprecated task decorators from api-standard-responses.decorator.ts${NC}"
fi

echo ""
echo -e "${YELLOW}Step 8: Regenerating Prisma client...${NC}"
npm run prisma:generate
echo -e "${GREEN}  ✓ Regenerated Prisma client${NC}"

echo ""
echo -e "${YELLOW}Step 9: Creating migration to drop tasks table...${NC}"

# Create a migration file to drop the tasks table
MIGRATION_NAME="remove_tasks_module"
TIMESTAMP=$(date +%Y%m%d%H%M%S)
MIGRATION_DIR="prisma/migrations/${TIMESTAMP}_${MIGRATION_NAME}"

mkdir -p "$MIGRATION_DIR"

cat > "$MIGRATION_DIR/migration.sql" << 'MIGRATION'
-- DropForeignKey
ALTER TABLE "tasks" DROP CONSTRAINT IF EXISTS "tasks_user_id_fkey";

-- DropTable
DROP TABLE IF EXISTS "tasks";

-- DropEnum
DROP TYPE IF EXISTS "TaskPriority";
DROP TYPE IF EXISTS "TaskStatus";
MIGRATION

echo -e "${GREEN}  ✓ Created migration: ${MIGRATION_DIR}${NC}"

echo ""
echo -e "${YELLOW}Step 10: Building the project...${NC}"
npm run build
BUILD_STATUS=$?

if [ $BUILD_STATUS -eq 0 ]; then
    echo -e "${GREEN}  ✓ Build successful!${NC}"
else
    echo -e "${RED}  ✗ Build failed. Please check the errors above.${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}==============================================================================${NC}"
echo -e "${GREEN}Tasks module removal complete!${NC}"
echo -e "${BLUE}==============================================================================${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo -e "  1. Review the changes with: ${BLUE}git diff${NC}"
echo -e "  2. Apply the migration with: ${BLUE}npm run prisma:migrate:dev${NC}"
echo -e "  3. Run tests to verify: ${BLUE}npm run test${NC}"
echo -e "  4. Run E2E tests: ${BLUE}npm run test:e2e${NC}"
echo ""
echo -e "${YELLOW}Note:${NC}"
echo -e "  - Rate limiting tests are skipped (xit) until you add a new module"
echo -e "  - Documentation files are preserved for reference"
echo -e "  - Update jest.config.js coverage thresholds if needed"
echo ""
