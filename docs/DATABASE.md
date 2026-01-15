# Database Documentation

## Overview

This application uses PostgreSQL as the primary database with Prisma ORM for type-safe database access.

## Schema

### Users Table

| Column    | Type      | Description           |
| --------- | --------- | --------------------- |
| id        | CUID      | Primary key           |
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
| id          | CUID      | Primary key                             |
| title       | String    | Task title                              |
| description | String?   | Task description                        |
| status      | Enum      | TODO, IN_PROGRESS, COMPLETED, CANCELLED |
| priority    | Enum      | LOW, MEDIUM, HIGH, URGENT               |
| dueDate     | DateTime? | Task due date                           |
| completedAt | DateTime? | Completion timestamp                    |
| userId      | CUID      | Foreign key to users                    |
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
npm run prisma:migrate:dev

# Apply migrations (production)
npm run prisma:migrate:deploy

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
# Open Prisma Studio (standalone)
npm run prisma:studio

# Check migration status
npm run prisma:migrate:status

# Generate Prisma Client
npm run prisma:generate
```

## Prisma Studio

Prisma Studio is a visual database browser that allows you to view and edit data directly.

### Automatic Launch (Development)

When running `npm run start:dev`, Prisma Studio automatically starts in the background:

- **URL**: <http://localhost:5555>
- Only runs in development mode (not in production)
- Runs silently without opening a browser window
- Shuts down automatically when the dev server stops

### Manual Launch

To run Prisma Studio separately:

```bash
npm run prisma:studio
```

### Features

- Browse all database tables
- View, filter, and sort records
- Create, update, and delete records
- View relationships between tables
- Export data as JSON

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
