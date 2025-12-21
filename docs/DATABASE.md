# Database Documentation

## Overview

This application uses PostgreSQL as the primary database with Prisma ORM for type-safe database access.

## Schema

### Users Table

| Column    | Type      | Description           |
| --------- | --------- | --------------------- |
| id        | UUID      | Primary key           |
| email     | String    | Unique user email     |
| username  | String    | Unique username       |
| password  | String    | Hashed password       |
| firstName | String?   | User's first name     |
| lastName  | String?   | User's last name      |
| role      | Enum      | USER or ADMIN         |
| isActive  | Boolean   | Account status        |
| createdAt | DateTime  | Creation timestamp    |
| updatedAt | DateTime  | Last update timestamp |
| deletedAt | DateTime? | Soft delete timestamp |

### Tasks Table

| Column      | Type      | Description                             |
| ----------- | --------- | --------------------------------------- |
| id          | UUID      | Primary key                             |
| title       | String    | Task title                              |
| description | String?   | Task description                        |
| status      | Enum      | TODO, IN_PROGRESS, COMPLETED, CANCELLED |
| priority    | Enum      | LOW, MEDIUM, HIGH, URGENT               |
| dueDate     | DateTime? | Task due date                           |
| completedAt | DateTime? | Completion timestamp                    |
| userId      | UUID      | Foreign key to users                    |
| createdAt   | DateTime  | Creation timestamp                      |
| updatedAt   | DateTime  | Last update timestamp                   |
| deletedAt   | DateTime? | Soft delete timestamp                   |

## Relationships

- User → Tasks (One-to-Many)
- Task → User (Many-to-One) with CASCADE delete

## Indexes

### Users

- email (unique)
- username (unique)

### Tasks

- userId
- status
- priority
- dueDate
- createdAt

## Commands

### Migrations

```bash
# Create new migration
npm run migrate:dev

# Apply migrations (production)
npm run migrate:deploy

# Reset database (⚠️ destructive - requires confirmation)
npx prisma migrate reset
```

### Seeding

```bash
# Seed database
npm run db:seed
```

### Utilities

```bash
# Open Prisma Studio
npm run prisma:studio

# Check migration status
npm run migrate:status

# Generate Prisma Client
npm run prisma:generate
```

## Seeded Data

Default users:

- **Admin**: `admin@example.com` (Password123!)
- **User 1**: `john.doe@example.com` (Password123!)
- **User 2**: `jane.smith@example.com` (Password123!)

Each user has sample tasks with various statuses and priorities.

## Best Practices

1. **Never commit migrations**: Migrations are generated, not hand-written
2. **Always seed after reset**: Ensures consistent dev data
3. **Use transactions**: For multi-step operations
4. **Soft deletes**: Use deletedAt instead of hard deletes
5. **Index frequently queried fields**: For performance
