# Scripts

Utility scripts for development, database management, and code generation.

## Usage

All scripts can be run via npm or directly:

```bash
# Via npm (recommended)
npm run db:backup

# Directly
./scripts/db-backup.sh
```

## Scripts

### Database

| Script          | npm command                 | Description                                  |
| --------------- | --------------------------- | -------------------------------------------- |
| `db-connect.sh` | `npm run db:connect`        | Open psql shell to PostgreSQL container      |
| `db-backup.sh`  | `npm run db:backup`         | Create timestamped database backup (gzipped) |
| `db-restore.sh` | `npm run db:restore <file>` | Restore database from backup file            |

### Docker

| Script            | npm command            | Description                                |
| ----------------- | ---------------------- | ------------------------------------------ |
| `docker-start.sh` | `npm run docker:start` | Start all Docker services                  |
| `docker-stop.sh`  | `npm run docker:stop`  | Stop all Docker services                   |
| `docker-reset.sh` | `npm run docker:reset` | Stop, remove volumes, and restart services |
| `docker-logs.sh`  | `npm run docker:logs`  | Tail logs from all containers              |

### Generators

| Script               | npm command                      | Description                                                         |
| -------------------- | -------------------------------- | ------------------------------------------------------------------- |
| `generate-module.sh` | `npm run generate:module <name>` | Generate complete NestJS module with DAL, service, controller, DTOs |
| `export-openapi.ts`  | `npm run openapi:export`         | Export OpenAPI spec to `swagger/openapi.json`                       |

### Utilities

| Script            | npm command | Description                                        |
| ----------------- | ----------- | -------------------------------------------------- |
| `health-check.sh` | -           | Check health of PostgreSQL, Redis, and application |

## Module Generator

The `generate-module.sh` script creates a complete module structure:

```bash
npm run generate:module products
```

Creates:

```
src/modules/products/
├── constants/
│   ├── product.constants.ts
│   ├── product-error-codes.constants.ts
│   └── index.ts
├── dto/
│   ├── create-product.dto.ts
│   ├── update-product.dto.ts
│   ├── query-product.dto.ts
│   ├── product-response.dto.ts
│   └── index.ts
├── exceptions/
│   ├── product.exceptions.ts
│   └── index.ts
├── products.dal.ts
├── products.service.ts
├── products.controller.ts
└── products.module.ts
```

After generating, follow the printed instructions to:

1. Add Prisma model to `schema.prisma`
2. Run migration
3. Uncomment DAL methods
4. Import module in `app.module.ts`
