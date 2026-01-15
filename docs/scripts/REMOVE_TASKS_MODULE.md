# Remove Tasks Module Script

## Purpose

The `remove-tasks-module.sh` script cleanly removes the example Tasks module from the NestJS API Skeleton project. This allows developers to start with a clean slate when building their own custom modules, while preserving the core authentication, health check, and infrastructure components.

The script automates what would otherwise be a tedious manual process of finding and removing task-related code across multiple files, ensuring no orphaned references remain that could cause build failures.

---

## What the Script Accomplishes

### Step 1: Remove Task Source Files

**Action**: Deletes the entire `src/modules/tasks/` directory

**Files Removed**:

- `tasks.module.ts` - NestJS module definition
- `tasks.controller.ts` - V1 REST controller
- `tasks-v2.controller.ts` - V2 REST controller with enhanced features
- `tasks.service.ts` - Business logic layer
- `tasks.dal.ts` - Data Access Layer (Prisma queries)
- `dto/` - All Data Transfer Objects
  - `create-task.dto.ts`
  - `update-task.dto.ts`
  - `task-query.dto.ts`
  - `task-response.dto.ts`
- `constants/` - Module constants
  - `tasks.constants.ts`
  - `tasks-sort-fields.constant.ts`
- `exceptions/` - Custom exceptions
  - `tasks.exceptions.ts`

---

### Step 2: Remove Task Unit Tests

**Action**: Deletes the `test/unit/tasks/` directory

**Files Removed**:

- `tasks.service.spec.ts` - Service unit tests
- `tasks.controller.spec.ts` - Controller unit tests
- `tasks.dal.spec.ts` - DAL unit tests
- `tasks.exceptions.spec.ts` - Exception unit tests

---

### Step 3: Remove Task E2E Tests

**Action**: Deletes the `test/e2e/tasks/` directory

**Files Removed**:

- `tasks.e2e-spec.ts` - V1 endpoint E2E tests
- `tasks-v2.e2e-spec.ts` - V2 endpoint E2E tests

---

### Step 4: Update app.module.ts

**Action**: Removes TasksModule import and registration

**Changes**:

- Removes `import { TasksModule } from "./modules/tasks/tasks.module";`
- Removes `TasksModule` from the `imports` array

**Before**:

```typescript
import { TasksModule } from "./modules/tasks/tasks.module";

@Module({
  imports: [
    // ... other modules
    TasksModule,
  ],
})
export class AppModule {}
```

**After**:

```typescript
@Module({
  imports: [
    // ... other modules
  ],
})
export class AppModule {}
```

---

### Step 5: Update Prisma Schema

**Action**: Rewrites `prisma/schema.prisma` to remove Task-related definitions

**Removed**:

- `TaskStatus` enum (PENDING, IN_PROGRESS, COMPLETED, CANCELLED)
- `TaskPriority` enum (LOW, MEDIUM, HIGH, URGENT)
- `Task` model (id, title, description, status, priority, dueDate, userId, timestamps)
- `tasks Task[]` relation from User model

**Preserved**:

- `UserRole` enum
- `User` model (without tasks relation)
- All database configuration

---

### Step 6: Update Rate Limiting E2E Tests

**Action**: Converts task-dependent tests to skipped tests using `xit()`

**Why**: Rate limiting tests previously used task endpoints to verify throttling behavior. Since tasks are removed, these tests are skipped but preserved as reference for when a new module is added.

**Changes**:

- All `it()` calls that depended on task endpoints changed to `xit()`
- Endpoint placeholders updated to `/api/v1/health`
- Added TODO comments explaining how to re-enable
- `Public Endpoints Rate Limiting` test kept active (uses auth endpoints)

**Tests Skipped (7 total)**:

1. `should allow requests within rate limit`
2. `should allow requests again after rate limit window expires`
3. `should return 429 when exceeding rate limit`
4. `should include Retry-After header in 429 response`
5. `should return proper error response format for 429`
6. `should apply rate limiting across different endpoints using same throttle`
7. `should enforce rate limits per user/IP separately`

---

### Step 7: Clean Task References from Common Files

**Action**: Removes task-specific code from shared utilities

**swagger.config.ts**:

- Removes `.addTag("tasks", ...)` line
- Removes `.addTag("tasks-v2", ...)` line
- Updates description from "Includes Tasks module as example implementation" to "Ready for your custom modules"

**api-standard-responses.decorator.ts**:

- Removes deprecated `ApiTaskIdParam` function
- Removes deprecated `ApiForbiddenTaskResponse` function
- Keeps generic `ApiResourceIdParam` and `ApiForbiddenResourceResponse`

---

### Step 8: Regenerate Prisma Client

**Action**: Runs `npm run prisma:generate`

**Purpose**: Regenerates the Prisma client to reflect the updated schema without Task model. This ensures TypeScript types are correct and removes Task-related types from `@prisma/client`.

---

### Step 9: Create Database Migration

**Action**: Creates a timestamped migration file in `prisma/migrations/`

**Migration SQL**:

```sql
-- DropForeignKey
ALTER TABLE "tasks" DROP CONSTRAINT IF EXISTS "tasks_user_id_fkey";

-- DropTable
DROP TABLE IF EXISTS "tasks";

-- DropEnum
DROP TYPE IF EXISTS "TaskPriority";
DROP TYPE IF EXISTS "TaskStatus";
```

**Note**: The migration is created but NOT applied automatically. You must run it manually when ready.

---

### Step 10: Build the Project

**Action**: Runs `npm run build`

**Purpose**: Verifies that the project compiles successfully after all changes. The script exits with an error if the build fails.

---

## Usage

```bash
# From project root
./scripts/remove-tasks-module.sh
```

---

## Post-Script Steps

After running the script:

1. **Review changes**: `git diff`
2. **Apply migration** (when database is available): `npm run prisma:migrate:dev`
3. **Run unit tests**: `npm run test`
4. **Run E2E tests**: `npm run test:e2e`

---

## What is Preserved

The script intentionally preserves:

| Item                    | Reason                             |
| ----------------------- | ---------------------------------- |
| Documentation files     | Reference for building new modules |
| Rate limiting test file | Template for testing new modules   |
| Auth module             | Core functionality                 |
| Health module           | Core functionality                 |
| Common utilities        | Shared infrastructure              |
| Test utilities          | Framework for writing tests        |

---

## Re-enabling Rate Limiting Tests

When you add a new module with rate-limited endpoints:

1. Open `test/e2e/rate-limiting.e2e-spec.ts`
2. Replace `/api/v1/health` with your module's endpoint
3. Change `xit()` back to `it()` for each test
4. Update any test-specific logic for your module's behavior

---

## Troubleshooting

### Build fails after running script

The script may leave some edge-case references. Common fixes:

- **test/utils/fixtures.ts**: Remove any `Task` imports or `createTestTask` function
- **test/utils/mocks.ts**: Remove `mockTask`, `mockTasksDal`, and Task-related imports
- **api-standard-responses.decorator.ts**: If sed commands corrupt the file, manually remove deprecated task decorators

### Migration fails

Ensure the database is running and accessible before running migrations. The migration uses `IF EXISTS` clauses to handle cases where the table may not exist.

### E2E tests fail with Prisma AI agent warning

When running E2E tests, you may encounter this error:

```
Error: Prisma Migrate detected that it was invoked by Claude Code.

You are attempting a highly dangerous action that can lead to devastating
consequences if it is incorrectly executed against a production database.
```

**What's happening**: Prisma has a safety mechanism that detects when it's being run by an AI agent and blocks destructive database operations. The E2E test setup runs `npx prisma db push --force-reset` which resets the test database.

**Solutions**:

1. **Run E2E tests manually** (recommended for first run):

   ```bash
   # Reset test database first
   npx prisma db push --force-reset --accept-data-loss

   # Then run tests
   npm run test:e2e
   ```

2. **Set environment variable for explicit consent**:

   ```bash
   PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION="yes" npm run test:e2e
   ```

3. **Run tests outside of AI tooling**: Execute `npm run test:e2e` directly in your terminal rather than through an AI assistant.

**Important**: This protection only applies when the database command is invoked by AI tools. Direct terminal execution will work normally.

### Database not synced after migration creation

The script creates a migration file but does NOT apply it automatically. If your database still has the `tasks` table:

```bash
# Apply pending migrations
npm run prisma:migrate:dev

# Or force sync (development only)
npx prisma db push
```

### Test database has stale Task data

If E2E tests fail because the test database still references the Task model:

```bash
# Reset test database completely
npx prisma db push --force-reset --accept-data-loss

# Regenerate client
npm run prisma:generate
```

### Restoring the Tasks module after removal

If you ran the script but want to restore the Tasks module (e.g., you reverted code changes but the Prisma schema was already modified):

1. **Restore the Prisma schema** - Add back the Task model, enums, and User relation:

   ```prisma
   // Add these enums
   enum TaskStatus {
     TODO
     IN_PROGRESS
     COMPLETED
     CANCELLED
   }

   enum TaskPriority {
     LOW
     MEDIUM
     HIGH
     URGENT
   }

   // Add the Task model
   model Task {
     id          String       @id @default(cuid())
     title       String
     description String?
     status      TaskStatus   @default(TODO)
     priority    TaskPriority @default(MEDIUM)
     dueDate     DateTime?    @map("due_date") @db.Timestamptz
     completedAt DateTime?    @map("completed_at") @db.Timestamptz
     userId      String       @map("user_id")
     user        User         @relation(fields: [userId], references: [id], onDelete: Cascade)
     createdAt   DateTime     @default(now()) @map("created_at") @db.Timestamptz
     updatedAt   DateTime     @updatedAt @map("updated_at") @db.Timestamptz
     deletedAt   DateTime?    @map("deleted_at") @db.Timestamptz

     @@index([userId])
     @@index([status])
     @@index([priority])
     @@index([dueDate])
     @@index([createdAt])
     @@map("tasks")
   }

   // Add this relation to User model
   model User {
     // ... existing fields ...
     tasks     Task[]
   }
   ```

2. **Regenerate Prisma client**:

   ```bash
   npm run prisma:generate
   ```

3. **Rebuild the project**:

   ```bash
   npm run build
   ```

4. **Delete the removal migration** (if created):

   ```bash
   rm -rf prisma/migrations/*_remove_tasks_module
   ```

---

## See Also

- [MODULE-CREATION-CHECKLIST.md](../MODULE-CREATION-CHECKLIST.md) - Guide for creating new modules
- [TESTING.md](../TESTING.md) - Testing patterns and best practices
- [DATABASE.md](../DATABASE.md) - Prisma and migration guide
