# Scripts Reference

This project includes utility shell scripts in the `scripts/` directory for common development operations.

## Quick Reference

| Script                   | Description                              |
| ------------------------ | ---------------------------------------- |
| `docker-start.sh`        | Start Docker containers                  |
| `docker-stop.sh`         | Stop Docker containers                   |
| `docker-reset.sh`        | Reset Docker environment (removes data!) |
| `docker-logs.sh`         | Follow Docker container logs             |
| `db-connect.sh`          | Open PostgreSQL CLI                      |
| `db-backup.sh`           | Backup database to file                  |
| `db-restore.sh`          | Restore database from backup             |
| `prisma-studio.sh`       | Open Prisma Studio (non-production only) |
| `health-check.sh`        | Check service health status              |
| `generate-module.sh`     | Generate new NestJS module               |
| `remove-tasks-module.sh` | Remove Tasks example module              |

## Docker Scripts

### docker-start.sh

Starts Docker containers for PostgreSQL and Redis.

```bash
./scripts/docker-start.sh
```

**What it does:**

1. Runs `docker-compose up -d`
2. Waits for services to be ready
3. Displays container status

**Output:**

```
🐳 Starting Docker containers...
⏳ Waiting for services to be ready...
NAME                  STATUS
nestjs-task-postgres   Up
nestjs-task-redis      Up
✅ Docker containers started successfully!
📊 PostgreSQL: localhost:5432
📦 Redis: localhost:6379
```

### docker-stop.sh

Stops running Docker containers.

```bash
./scripts/docker-stop.sh
```

**Output:**

```
🛑 Stopping Docker containers...
✅ Docker containers stopped successfully!
```

### docker-reset.sh

Removes all Docker containers and volumes. **This deletes all data!**

```bash
./scripts/docker-reset.sh
```

**Prompts for confirmation:**

```
⚠️  This will remove all Docker containers and volumes!
Are you sure? (y/N): y
🗑️  Removing Docker containers and volumes...
✅ Docker environment reset complete!
```

### docker-logs.sh

Follow logs from Docker containers.

```bash
# All services
./scripts/docker-logs.sh

# Specific service
./scripts/docker-logs.sh postgres
./scripts/docker-logs.sh redis
```

## Database Scripts

### db-connect.sh

Opens an interactive PostgreSQL CLI session.

```bash
./scripts/db-connect.sh
```

**Requires:** `.env` file with `POSTGRES_USER` and `POSTGRES_DB`

**Opens:**

```
psql (15.4)
Type "help" for help.

taskdb=#
```

**Useful commands inside psql:**

```sql
-- List tables
\dt

-- Describe a table
\d users

-- Run a query
SELECT * FROM users LIMIT 5;

-- Exit
\q
```

### db-backup.sh

Creates a timestamped database backup.

```bash
./scripts/db-backup.sh
```

**Requires:** `.env` file with database credentials

**Output:**

```
Creating database backup...
✅ Backup created: ./backups/taskdb_backup_20240115_103000.sql
✅ Backup compressed: ./backups/taskdb_backup_20240115_103000.sql.gz
```

**Backup location:** `./backups/`

### db-restore.sh

Restores database from a backup file.

```bash
# From gzipped backup
./scripts/db-restore.sh ./backups/taskdb_backup_20240115_103000.sql.gz

# From SQL file
./scripts/db-restore.sh ./backups/taskdb_backup_20240115_103000.sql
```

**Prompts for confirmation:**

```
⚠️  This will restore the database from backup!
Are you sure? (y/N): y
Decompressing backup...
Restoring database...
✅ Database restored successfully!
```

### prisma-studio.sh

Opens Prisma Studio, a visual database management interface. **Blocked in production environments for security.**

```bash
npm run prisma:studio
# or
./scripts/prisma-studio.sh
```

**Safety features:**

1. Blocks execution when `NODE_ENV=production`
2. Warns if `DATABASE_URL` contains "prod" or "production"
3. Requires confirmation for production-like database URLs

**Output (development):**

```
🔍 Starting Prisma Studio...
   Environment: development

Prisma Studio is up on http://localhost:5555
```

**Output (production - blocked):**

```
❌ Error: Prisma Studio is disabled in production environments

Prisma Studio provides direct database access and should not
be used in production for security reasons.

For production database access, use:
  - Read replicas with proper access controls
  - Database admin tools with audit logging
  - ./scripts/db-connect.sh for CLI access
```

---

## Health Check

### health-check.sh

Checks the health of all services.

```bash
./scripts/health-check.sh
```

**Output:**

```
🏥 Performing health checks...
PostgreSQL: ✅ Healthy
Redis: ✅ Healthy
Application: ✅ Healthy (HTTP 200)
```

**Possible statuses:**

- `✅ Healthy` - Service is running correctly
- `❌ Unhealthy` - Service is down or failing
- `⚠️ Not running` - Application not started

## Module Generator

### generate-module.sh

Generates a complete NestJS module following project patterns.

```bash
./scripts/generate-module.sh <module-name>

# Examples
./scripts/generate-module.sh products
./scripts/generate-module.sh order-items
```

**Generated structure:**

```
src/modules/products/
├── constants/
│   ├── index.ts
│   ├── product.constants.ts
│   └── product-error-codes.constants.ts
├── dto/
│   ├── index.ts
│   ├── create-product.dto.ts
│   ├── update-product.dto.ts
│   ├── query-product.dto.ts
│   └── product-response.dto.ts
├── exceptions/
│   ├── index.ts
│   └── product.exceptions.ts
├── products.controller.ts
├── products.service.ts
├── products.dal.ts
├── products.module.ts
└── README.md
```

**Next steps after generation:**

1. Add Prisma model to `prisma/schema.prisma`
2. Run migration: `npm run prisma:migrate:dev -- --name add-products`
3. Uncomment and update DAL methods
4. Import module in `app.module.ts`
5. Add tests

See [MODULE-CREATION-CHECKLIST.md](./MODULE-CREATION-CHECKLIST.md) for complete steps.

## Remove Tasks Module

### remove-tasks-module.sh

Removes the example Tasks module from the skeleton project, leaving a clean slate for your own modules.

```bash
./scripts/remove-tasks-module.sh
```

**What it does:**

1. Removes `src/modules/tasks/` directory
2. Removes `test/unit/tasks/` and `test/e2e/tasks/` directories
3. Updates `app.module.ts` to remove TasksModule
4. Updates Prisma schema to remove Task model and enums
5. Updates rate-limiting tests to use `xit()` (skipped)
6. Cleans task references from swagger config
7. Regenerates Prisma client
8. Creates a migration to drop the tasks table
9. Builds the project to verify changes

**Output:**

```
==============================================================================
                     Remove Tasks Module Script
==============================================================================

Step 1: Removing task source files...
  ✓ Removed src/modules/tasks/

Step 2: Removing task unit tests...
  ✓ Removed test/unit/tasks/

...

==============================================================================
Tasks module removal complete!
==============================================================================

Next steps:
  1. Review the changes with: git diff
  2. Apply the migration with: npm run prisma:migrate:dev
  3. Run tests to verify: npm run test
  4. Run E2E tests: npm run test:e2e
```

**Important notes:**

- Documentation files are preserved for reference
- Rate limiting tests are skipped (not deleted) until you add a new module
- The migration is created but NOT applied automatically

See [scripts/REMOVE_TASKS_MODULE.md](./scripts/REMOVE_TASKS_MODULE.md) for detailed documentation.

## Making Scripts Executable

If scripts aren't executable, run:

```bash
chmod +x scripts/*.sh
```

## Environment Requirements

Most scripts require a `.env` file with:

```bash
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_DB=taskdb
```

## npm Script Alternatives

Some operations are also available as npm scripts:

| Shell Script      | npm Alternative        |
| ----------------- | ---------------------- |
| `docker-start.sh` | `npm run docker:up`    |
| `docker-stop.sh`  | `npm run docker:down`  |
| `health-check.sh` | `npm run health:check` |

## Troubleshooting

### "Permission denied"

```bash
chmod +x scripts/your-script.sh
```

### "Command not found: docker-compose"

Install Docker Compose or use the Docker plugin:

```bash
# Modern Docker (plugin)
docker compose up -d

# Legacy
docker-compose up -d
```

### Scripts fail on Windows

These scripts are for Unix-like systems (macOS, Linux). On Windows:

- Use WSL (Windows Subsystem for Linux)
- Use Git Bash
- Run equivalent Docker/npm commands manually

### Database scripts fail

Ensure:

1. Docker containers are running: `./scripts/docker-start.sh`
2. `.env` file exists with correct credentials
3. Container name matches: `nestjs-task-postgres`

## See Also

- [Development Guide](./DEVELOPMENT.md)
- [Docker Guide](./DOCKER.md)
- [Database Guide](./DATABASE.md)
- [Module Creation Checklist](./MODULE-CREATION-CHECKLIST.md)
