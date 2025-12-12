# 🚀 NestJS Application - Endpoint Guide

## Server Status

✅ **Application Running**: http://localhost:3000  
✅ **API Base URL**: http://localhost:3000/api/v1  
✅ **Swagger Documentation**: http://localhost:3000/api/v1/docs

> **💡 Tip**: For interactive API testing, visit the [Swagger UI](http://localhost:3000/api/v1/docs) where you can try all endpoints directly in your browser.

---

## 📍 Available Endpoints

### Health Check Endpoint

**URL**: http://localhost:3000/api/v1/health  
**Method**: GET  
**Description**: Returns application health status including database connectivity

```bash
curl http://localhost:3000/api/v1/health
```

**Expected Response**:

```json
{
  "status": "ok",
  "timestamp": "2025-12-09T08:22:07.000Z",
  "uptime": 123.45,
  "environment": "development",
  "database": {
    "status": "connected",
    "latency": "5ms"
  }
}
```

---

### Stats Endpoint

**URL**: http://localhost:3000/api/v1/stats  
**Method**: GET  
**Description**: Returns database statistics (users, tasks, tasks by status)

```bash
curl http://localhost:3000/api/v1/stats
```

**Expected Response**:

```json
{
  "users": 3,
  "tasks": 11,
  "tasksByStatus": {
    "TODO": 5,
    "IN_PROGRESS": 4,
    "COMPLETED": 2
  }
}
```

---

### Tasks Endpoints

#### List All Tasks

**URL**: http://localhost:3000/api/v1/tasks  
**Method**: GET  
**Description**: Get all tasks with pagination

```bash
curl http://localhost:3000/api/v1/tasks
```

---

#### Get Task by ID

**URL**: http://localhost:3000/api/v1/tasks/:id  
**Method**: GET  
**Description**: Get a single task by CUID

```bash
# Replace {cuid} with an actual CUID from your database
curl http://localhost:3000/api/v1/tasks/{cuid}
```

---

#### Create Task

**URL**: http://localhost:3000/api/v1/tasks  
**Method**: POST  
**Description**: Create a new task

```bash
curl -X POST http://localhost:3000/api/v1/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Task",
    "description": "This is a test task",
    "status": "TODO",
    "priority": "MEDIUM"
  }'
```

---

#### Update Task

**URL**: http://localhost:3000/api/v1/tasks/:id  
**Method**: PATCH  
**Description**: Update an existing task

```bash
curl -X PATCH http://localhost:3000/api/v1/tasks/{cuid} \
  -H "Content-Type: application/json" \
  -d '{
    "status": "IN_PROGRESS"
  }'
```

---

#### Delete Task

**URL**: http://localhost:3000/api/v1/tasks/:id  
**Method**: DELETE  
**Description**: Soft delete a task

```bash
curl -X DELETE http://localhost:3000/api/v1/tasks/{cuid}
```

---

#### Get Task Statistics

**URL**: http://localhost:3000/api/v1/tasks/statistics  
**Method**: GET  
**Description**: Get task statistics

```bash
curl http://localhost:3000/api/v1/tasks/statistics
```

---

## 🔑 Important Notes

### API Prefix

- **All endpoints** are prefixed with `/api/v1`
- This is configured in `.env` as `API_PREFIX=api/v1`
- The root endpoint is therefore at `/api/v1/` (not just `/`)

### CUID Format

- All IDs now use CUID format (25 characters, starts with 'c')
- Example: `clh9k7x2a0000qmxbzv0q0001`
- You need actual CUIDs from your database to test GET/PATCH/DELETE endpoints

### Getting Actual CUIDs

To get actual task IDs from your database:

```bash
# Option 1: Use the stats endpoint
curl http://localhost:3000/api/v1/stats

# Option 2: Use the tasks list endpoint
curl http://localhost:3000/api/v1/tasks

# Option 3: Open Prisma Studio
npm run prisma:studio
# Then visit http://localhost:51212 (or whatever port it shows)
```

---

## 🌐 Browser Access

You can also access these endpoints directly in your browser:

- **Health Check**: <http://localhost:3000/api/v1/health>
- **Stats**: <http://localhost:3000/api/v1/stats>
- **Tasks List**: <http://localhost:3000/api/v1/tasks>
- **Prisma Studio**: Run `npm run prisma:studio` and open the URL it provides

---

## 🐛 Troubleshooting

### "Cannot GET /"

**Problem**: Accessing <http://localhost:3000/> returns 404  
**Solution**: Use <http://localhost:3000/api/v1/health> or <http://localhost:3000/api/v1/tasks> instead

### "Connection Refused"

**Problem**: Server is not running  
**Solution**: Run `npm run start:dev` in a terminal

### Database Connection Issues

**Problem**: Health check shows database disconnected  
**Solution**:

1. Ensure Docker containers are running: `npm run docker:start`
2. Check database connection: `docker ps`
3. Verify .env DATABASE_URL is correct

---

## 🎯 Quick Test Commands

```bash
# Test all main endpoints
curl http://localhost:3000/api/v1/
curl http://localhost:3000/api/v1/health
curl http://localhost:3000/api/v1/stats
curl http://localhost:3000/api/v1/tasks
```

---

## ✅ Current Status

- ✅ Server running on port 3000
- ✅ Database connected (PostgreSQL)
- ✅ CUID implementation complete
- ✅ All CRUD endpoints available
- ✅ Health check working
- ✅ Stats endpoint working
