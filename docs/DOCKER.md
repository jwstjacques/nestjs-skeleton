# Docker Guide

## Overview

This project uses Docker for containerization and Docker Compose for orchestration.

## Services

- **postgres**: PostgreSQL 15 database
- **redis**: Redis 7 cache
- **app**: NestJS application (production)

## Quick Start

### Start Services

```bash
# Start all services

docker-compose up -d

# Or using npm script

npm run docker:start
```

### Stop Services

```bash
# Stop all services

docker-compose down

# Or using npm script

npm run docker:stop
```

### View Logs

```bash
# View all logs

docker-compose logs -f

# View specific service

docker-compose logs -f postgres
```

## Development

### Local Development with Docker

```bash
# Start with hot reload

docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

### Access Services

- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`
- Application: `localhost:3000`

## Database Management

### Connect to Database

```bash
npm run db:connect
```

### Backup Database

```bash
npm run db:backup
```

### Restore Database

```bash
npm run db:restore ./backups/taskdb_backup_YYYYMMDD_HHMMSS.sql.gz
```

## Troubleshooting

### Port Already in Use

```bash
# Find process using port

lsof -i :5432

# Change port in .env

POSTGRES_PORT=5433
```

### Reset Everything

```bash
# Warning: This deletes all data!

npm run docker:reset
```

### View Container Status

```bash
docker-compose ps
```

### Inspect Container

```bash
docker exec -it nestjs-task-postgres sh
```
