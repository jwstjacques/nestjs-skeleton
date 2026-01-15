# Troubleshooting Guide

This document provides solutions to common issues you may encounter when developing or deploying the NestJS Task API.

## Table of Contents

- [Redis Connection Issues](#redis-connection-issues)
- [Database Connection Issues](#database-connection-issues)
- [Docker Issues](#docker-issues)
- [Build and Compilation Issues](#build-and-compilation-issues)
- [Port Already in Use](#port-already-in-use)
- [Testing Issues](#testing-issues)

---

## Redis Connection Issues

### Problem: ECONNREFUSED when starting the application

**Symptoms:**

```
Error: connect ECONNREFUSED ::1:6379
Error: connect ECONNREFUSED 127.0.0.1:6379
code: 'ECONNREFUSED'
errno: -61
```

**Root Cause:**
The application tries to connect to Redis on port 6379, but Redis is not running. This happens because:

- Redis service is not started
- Docker daemon is not running
- Redis container failed to start

#### Solution 1: Start Redis with Docker (Recommended for Development)

1. **Ensure Docker is running:**

   ```bash
   # For Docker Desktop users:
   open -a Docker

   # For OrbStack users:
   open -a OrbStack
   ```

2. **Verify Docker is running:**

   ```bash
   docker ps
   ```

3. **Start Redis container:**

   ```bash
   docker-compose up -d redis
   ```

4. **Verify Redis is running:**

   ```bash
   docker ps | grep redis
   # Should show: nestjs-task-redis container with status "Up" and "(healthy)"
   ```

5. **Test Redis connection:**

   ```bash
   redis-cli ping
   # Should return: PONG
   ```

6. **Start the application:**

   ```bash
   npm run start:dev
   ```

#### Solution 2: Start Redis Locally with Homebrew

If you prefer to run Redis outside Docker:

1. **Install Redis (if not installed):**

   ```bash
   brew install redis
   ```

2. **Start Redis:**

   ```bash
   brew services start redis
   ```

3. **Verify Redis is running:**

   ```bash
   redis-cli ping
   # Should return: PONG
   ```

4. **Start the application:**

   ```bash
   npm run start:dev
   ```

#### Solution 3: Use Docker Scripts

The project includes helpful scripts in `package.json`:

```bash
# Start all services (app, postgres, redis) with Docker
npm run docker:dev

# Stop all services
npm run docker:stop

# View logs
npm run docker:logs

# Reset all containers and volumes
npm run docker:reset
```

**Environment Variables:**

Ensure your `.env` file has the correct Redis configuration:

```env
REDIS_HOST=localhost  # Use 'redis' if app runs in Docker
REDIS_PORT=6379
```

**Notes:**

- For local development with `npm run start:dev`, use `REDIS_HOST=localhost`
- For containerized development with `npm run docker:dev`, use `REDIS_HOST=redis`
- Redis is used for caching, rate limiting, and session management

---

## Database Connection Issues

### Problem: Cannot connect to PostgreSQL

**Symptoms:**

```
Error: connect ECONNREFUSED localhost:5432
Can't reach database server at `localhost:5432`
```

**Solution:**

1. **Check if PostgreSQL is running:**

   ```bash
   docker ps | grep postgres
   ```

2. **Start PostgreSQL container:**

   ```bash
   docker-compose up -d postgres
   ```

3. **Verify connection:**

   ```bash
   npm run db:connect
   # Or manually:
   psql postgresql://postgres:postgres@localhost:5432/taskdb
   ```

4. **Run migrations if needed:**
   ```bash
   npm run prisma:migrate:dev
   ```

### Problem: Database schema is out of sync

**Symptoms:**

- Prisma errors about missing tables or columns
- Migration errors

**Solution:**

1. **Check migration status:**

   ```bash
   npm run prisma:migrate:status
   ```

2. **Apply pending migrations:**

   ```bash
   npm run prisma:migrate:dev
   ```

3. **If migrations are corrupted, reset database (⚠️ DEV ONLY):**
   ```bash
   # Reset requires confirmation to prevent accidental data loss
   npx prisma migrate reset
   # This will drop the database, recreate it, and run all migrations
   ```

---

## Docker Issues

### Problem: Docker daemon not running

**Symptoms:**

```
Cannot connect to the Docker daemon at unix:///var/run/docker.sock
Is the docker daemon running?
```

**Solution:**

1. **Start Docker Desktop or OrbStack:**

   ```bash
   open -a Docker
   # OR
   open -a OrbStack
   ```

2. **Wait 10-15 seconds for Docker to fully start**

3. **Verify Docker is running:**
   ```bash
   docker ps
   ```

### Problem: Port conflicts

**Symptoms:**

```
Error: Bind for 0.0.0.0:6379 failed: port is already allocated
```

**Solution:**

1. **Find process using the port:**

   ```bash
   lsof -i :6379
   # OR for other ports:
   lsof -i :5432  # PostgreSQL
   lsof -i :3000  # App server
   ```

2. **Stop the conflicting process:**

   ```bash
   kill -9 <PID>
   # OR stop the Docker container:
   docker stop <container-name>
   ```

3. **Restart the service:**
   ```bash
   docker-compose up -d redis
   ```

### Problem: Containers won't start or are unhealthy

**Solution:**

1. **Check container logs:**

   ```bash
   docker-compose logs redis
   docker-compose logs postgres
   ```

2. **Restart containers:**

   ```bash
   docker-compose restart redis postgres
   ```

3. **Full reset (⚠️ will delete data):**
   ```bash
   npm run docker:reset
   docker-compose up -d
   ```

---

## Build and Compilation Issues

### Problem: TypeScript compilation errors

**Solution:**

1. **Clean build artifacts:**

   ```bash
   rm -rf dist node_modules
   npm install
   npm run build
   ```

2. **Check for type errors:**
   ```bash
   npx tsc --noEmit
   ```

### Problem: Module not found errors

**Solution:**

1. **Reinstall dependencies:**

   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Clear NestJS cache:**
   ```bash
   rm -rf dist
   npm run build
   ```

---

## Port Already in Use

### Problem: Application fails to start - port 3000 in use

**Symptoms:**

```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:**

#### Option 1: Use Kill Scripts (Recommended)

The project includes convenient scripts to kill processes on common ports:

```bash
# Kill process on port 3000 (app server)
npm run kill:3000

# Kill process on port 6379 (Redis)
npm run kill:6379

# Kill process on port 5432 (PostgreSQL)
npm run kill:5432
```

These scripts safely terminate any process using the specified port, or display a message if no process is found.

#### Option 2: Manual Process Termination

1. **Find process using port 3000:**

   ```bash
   lsof -i :3000
   ```

2. **Kill the process:**

   ```bash
   kill -9 <PID>
   ```

#### Option 3: Change the Port

Change the port in `.env`:

```env
PORT=3001
```

---

## Testing Issues

### Problem: E2E tests fail with connection errors

**Solution:**

1. **Ensure test database is running:**

   ```bash
   docker ps | grep postgres
   ```

2. **Check `.env.test` configuration:**

   ```env
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/taskdb_test
   REDIS_HOST=localhost
   REDIS_PORT=6379
   ```

3. **Reset test database:**

   ```bash
   # Reset requires confirmation to prevent accidental data loss
   NODE_ENV=test npx prisma migrate reset
   ```

4. **Run tests:**
   ```bash
   npm run test:e2e
   ```

### Problem: Tests pass locally but fail in CI

**Common Issues:**

- Environment variables not set in CI
- Database not initialized
- Port conflicts
- Insufficient timeouts

**Solution:**

Check CI configuration in `.github/workflows/` and ensure:

- Services (postgres, redis) are started
- Environment variables are set
- Database migrations are run
- Adequate timeout values

---

## Getting Help

If you encounter an issue not covered here:

1. **Check the logs:**

   ```bash
   # Application logs
   tail -f logs/application.log
   tail -f logs/error.log

   # Docker logs
   docker-compose logs -f
   ```

2. **Check the documentation:**
   - [Development Guide](./DEVELOPMENT.md)
   - [Docker Guide](./DOCKER.md)
   - [Database Guide](./DATABASE.md)
   - [Testing Guide](./TESTING.md)
   - [Logging Guide](./LOGGING.md)
   - [Scripts Reference](./SCRIPTS.md)

3. **Health checks:**

   ```bash
   # Check app health
   curl http://localhost:3000/api/v1/health

   # Check database connectivity
   npm run db:connect

   # Check Redis connectivity
   redis-cli ping
   ```

4. **Common diagnostic commands:**

   ```bash
   # Check running containers
   docker ps -a

   # Check Docker networks
   docker network ls

   # Check Docker volumes
   docker volume ls

   # Inspect a container
   docker inspect <container-name>

   # Check system resources
   docker stats
   ```

---

## Prevention Tips

1. **Start services in the correct order:**

   ```bash
   # Start dependencies first
   docker-compose up -d postgres redis

   # Wait for health checks (10-15 seconds)
   docker-compose ps

   # Then start the app
   npm run start:dev
   ```

2. **Use health check scripts:**

   ```bash
   ./scripts/health-check.sh
   ```

3. **Keep Docker running:**
   - Add Docker Desktop/OrbStack to your system startup apps
   - Use `docker-compose up -d` to run services in background

4. **Monitor resource usage:**
   - Docker containers can consume significant memory
   - Monitor with `docker stats`
   - Prune unused resources: `docker system prune -a --volumes`

5. **Regular maintenance:**

   ```bash
   # Update dependencies
   npm update

   # Clean old Docker images
   docker image prune -a

   # Check for outdated packages
   npm outdated
   ```
