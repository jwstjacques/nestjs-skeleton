# 🚀 Tasks Module - Endpoint Guide (Example)

> **Note**: This document demonstrates the endpoints of the **Tasks module**, which serves as an example implementation. When building your own API, you can use this as a reference for documenting your custom endpoints.

## Server Status

✅ **Application Running**: http://localhost:3000  
✅ **API Base URL**: http://localhost:3000/api/v1  
✅ **Swagger Documentation**: http://localhost:3000/api/v1/docs

> **💡 Tip**: For interactive API testing, visit the [Swagger UI](http://localhost:3000/api/v1/docs) where you can try all endpoints directly in your browser.

---

## 📍 Available Endpoints

### API Versioning

This Tasks module supports two API versions:

- **v1 (default)**: `/api/v1/tasks` - Basic CRUD operations with soft deletes
- **v2 (enhanced)**: `/api/v2/tasks` - Additional endpoints with permission checks

#### Version Differences

| Feature           | v1       | v2                       |
| ----------------- | -------- | ------------------------ |
| List all tasks    | ✅       | ⏸️ (Use v1)              |
| Get task by ID    | ✅ Basic | ✅ With ownership checks |
| Create task       | ✅       | ⏸️ (Use v1)              |
| Update task       | ✅       | ⏸️ (Use v1)              |
| Delete task       | ✅       | ⏸️ (Use v1)              |
| Get statistics    | ✅       | ⏸️ (Use v1)              |
| Get next due task | ❌       | ✅ New in v2             |
| Permission checks | ❌       | ✅ Owner/Admin only      |

> **Note**: v2 focuses on enhanced read operations with security. Use v1 for write operations (create, update, delete).

---

## 📍 Version 1 Endpoints (v1)

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
# Option 1: Use the tasks list endpoint
curl http://localhost:3000/api/v1/tasks

# Option 2: Open Prisma Studio
npm run prisma:studio
# Then visit http://localhost:51212 (or whatever port it shows)
```

---

## 🌐 Browser Access

You can also access these endpoints directly in your browser:

- **Health Check**: <http://localhost:3000/api/v1/health>
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
curl http://localhost:3000/api/v1/tasks
```

---

## ✅ Current Status

- ✅ Server running on port 3000
- ✅ Database connected (PostgreSQL)
- ✅ CUID implementation complete
- ✅ All CRUD endpoints available
- ✅ Health check working
- ✅ API versioning available (v1 and v2)

---

## 📍 Version 2 Endpoints (v2)

> **New in v2**: Enhanced endpoints with permission checks and additional functionality

### Get Next Due Task

**URL**: http://localhost:3000/api/v2/tasks/next-due-date  
**Method**: GET  
**Authentication**: Required (Bearer token)  
**Description**: Get the task with the nearest upcoming due date (only active tasks: TODO or IN_PROGRESS)

```bash
curl -X GET http://localhost:3000/api/v2/tasks/next-due-date \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response (200)**:

```json
{
  "id": "cmixpvpir0001p9yp5xq8r7ks",
  "title": "Complete project documentation",
  "description": "Write comprehensive docs for all endpoints",
  "status": "TODO",
  "priority": "HIGH",
  "dueDate": "2025-12-31T23:59:59.000Z",
  "completedAt": null,
  "userId": "cmixpvpir0000p9ypdk6za4qc",
  "createdAt": "2025-12-11T10:30:00.000Z",
  "updatedAt": "2025-12-11T10:30:00.000Z"
}
```

**Features**:

- Returns task with soonest due date that hasn't passed yet
- Only includes active tasks (TODO or IN_PROGRESS status)
- Excludes COMPLETED and CANCELLED tasks
- Returns `null` if no upcoming active tasks exist
- User-specific (returns only the authenticated user's tasks)

---

### Get Task by ID (with Permission Checks)

**URL**: http://localhost:3000/api/v2/tasks/:id  
**Method**: GET  
**Authentication**: Required (Bearer token)  
**Description**: Get a single task by CUID with ownership verification

```bash
curl -X GET http://localhost:3000/api/v2/tasks/{cuid} \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response (200)**:

```json
{
  "id": "cmixpvpir0001p9yp5xq8r7ks",
  "title": "Complete project documentation",
  "description": "Write comprehensive docs for all endpoints",
  "status": "TODO",
  "priority": "HIGH",
  "dueDate": "2025-12-31T23:59:59.000Z",
  "completedAt": null,
  "userId": "cmixpvpir0000p9ypdk6za4qc",
  "createdAt": "2025-12-11T10:30:00.000Z",
  "updatedAt": "2025-12-11T10:30:00.000Z"
}
```

**Error Response (403 Forbidden)**:

```json
{
  "statusCode": 403,
  "message": "You do not have permission to access this task",
  "error": "Forbidden"
}
```

**Features**:

- Verifies user is the task owner OR has admin role
- Returns 403 Forbidden if user doesn't have permission
- Returns 404 Not Found if task doesn't exist
- More secure than v1 which returns any task by ID

---

### Permission Model (v2)

v2 endpoints implement ownership-based access control:

**Access Rules**:

- ✅ Task owner can access their own tasks
- ✅ Admin users can access any task
- ❌ Regular users cannot access other users' tasks

**Example Scenarios**:

```bash
# User A creates a task
curl -X POST http://localhost:3000/api/v1/tasks \
  -H "Authorization: Bearer USER_A_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "User A Task"}'

# User A can access it via v2 (owner)
curl http://localhost:3000/api/v2/tasks/{task_id} \
  -H "Authorization: Bearer USER_A_TOKEN"
# ✅ Returns 200 OK

# User B cannot access it via v2 (not owner)
curl http://localhost:3000/api/v2/tasks/{task_id} \
  -H "Authorization: Bearer USER_B_TOKEN"
# ❌ Returns 403 Forbidden

# Admin can access it via v2 (admin privilege)
curl http://localhost:3000/api/v2/tasks/{task_id} \
  -H "Authorization: Bearer ADMIN_TOKEN"
# ✅ Returns 200 OK
```

---

### When to Use v1 vs v2

**Use v1 when**:

- You need full CRUD operations (create, update, delete)
- You're building admin tools that need to see all tasks
- You need task statistics
- You want simpler, unrestricted access

**Use v2 when**:

- You need permission-aware read operations
- You want to enforce ownership checks
- You need the "next due task" feature
- You're building user-facing features with security requirements

---

### Migration from v1 to v2

If you're currently using v1 and want to migrate to v2:

1. **Read Operations**: Switch `GET /api/v1/tasks/:id` to `GET /api/v2/tasks/:id`
   - ⚠️ Update error handling to expect 403 Forbidden responses
   - ⚠️ Ensure you're sending valid JWT tokens in Authorization header

2. **New Features**: Add `GET /api/v2/tasks/next-due-date` for next task functionality

3. **Write Operations**: Keep using v1 endpoints (create, update, delete)
   - No v2 equivalents exist for these operations yet

**Example Migration**:

```typescript
// Before (v1)
const task = await fetch(`http://localhost:3000/api/v1/tasks/${id}`);

// After (v2) - with permission check
const task = await fetch(`http://localhost:3000/api/v2/tasks/${id}`, {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

if (task.status === 403) {
  console.error("Access denied: You do not own this task");
}
```
