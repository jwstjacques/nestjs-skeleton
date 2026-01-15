# Location Header Interceptor

## Overview

The `LocationHeaderInterceptor` automatically adds a `Location` header to successful POST, PUT, and PATCH responses. This follows REST best practices by indicating the URI of the created or modified resource.

## When It's Applied

The interceptor is registered globally in `app.module.ts` and automatically applies to:

- **POST requests** (status code 2xx): Appends the resource ID to the request path
- **PUT requests** (status code 2xx): Uses the current full path (which already includes the ID)
- **PATCH requests** (status code 2xx): Uses the current full path (which already includes the ID)

The interceptor does **not** run for:

- GET, DELETE, HEAD, OPTIONS requests
- Error responses (4xx, 5xx status codes)
- Responses without an identifiable resource ID

## How It Works

### ID Extraction

The interceptor intelligently extracts resource IDs from various response structures:

1. **Direct ID**:

   ```json
   { "id": "cm4abc123xyz456def789ghi" }
   ```

2. **Wrapped in `data` field**:

   ```json
   { "data": { "id": "cm4abc123xyz456def789ghi" } }
   ```

### Location Header Format

#### POST Requests

For POST requests, the interceptor appends the resource ID to the request path:

**Request**: `POST /api/v1/tasks`  
**Response**: `Location: https://api.example.com/api/v1/tasks/cm4abc123xyz456def789ghi`

#### PUT/PATCH Requests

For PUT and PATCH requests, the interceptor uses the full request path:

**Request**: `PUT /api/v1/tasks/cm4abc123xyz456def789ghi`  
**Response**: `Location: https://api.example.com/api/v1/tasks/cm4abc123xyz456def789ghi`

## Example Usage

### Creating a Task (POST)

```bash
curl -X POST https://api.example.com/api/v1/tasks \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title": "New Task", "description": "Task description"}'
```

**Response Headers**:

```
HTTP/1.1 201 Created
Location: https://api.example.com/api/v1/tasks/cm4abc123xyz456def789ghi
Content-Type: application/json
```

**Response Body**:

```json
{
  "data": {
    "id": "cm4abc123xyz456def789ghi",
    "title": "New Task",
    "description": "Task description",
    "status": "TODO",
    "createdAt": "2025-12-22T22:00:00.000Z",
    "updatedAt": "2025-12-22T22:00:00.000Z"
  }
}
```

### Updating a Task (PUT)

```bash
curl -X PUT https://api.example.com/api/v1/tasks/cm4abc123xyz456def789ghi \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated Task", "status": "IN_PROGRESS"}'
```

**Response Headers**:

```
HTTP/1.1 200 OK
Location: https://api.example.com/api/v1/tasks/cm4abc123xyz456def789ghi
Content-Type: application/json
```

## Implementation Details

### File Structure

```
src/common/interceptors/
├── location-header.interceptor.ts    # Main interceptor implementation
├── index.ts                          # Exports interceptor
```

### Registration

The interceptor is registered globally in `src/app.module.ts`:

```typescript
{
  provide: APP_INTERCEPTOR,
  useClass: LocationHeaderInterceptor,
}
```

### Order of Execution

Interceptors run in the order they're registered:

1. `HttpCacheInterceptor` - Handles caching
2. `LocationHeaderInterceptor` - Adds Location header
3. `PerformanceInterceptor` - Logs performance metrics

## Testing

The interceptor has comprehensive unit tests covering:

- ✅ POST requests with direct ID
- ✅ POST requests with wrapped data
- ✅ PUT requests
- ✅ PATCH requests
- ✅ GET requests (should not add header)
- ✅ DELETE requests (should not add header)
- ✅ Error responses (4xx, 5xx)
- ✅ Responses without IDs
- ✅ Null/primitive responses
- ✅ Trailing slashes in paths

Run the tests:

```bash
npm test -- location-header.interceptor.spec.ts
```

## Benefits

1. **REST Compliance**: Follows RFC 7231 and REST best practices
2. **Client Convenience**: Clients can immediately access the created/updated resource
3. **Caching**: Helps with HTTP caching strategies
4. **Automatic**: No need to manually add Location headers in controllers
5. **Flexible**: Handles multiple response structures automatically

## Notes

- The interceptor logs each Location header addition for debugging
- If no resource ID can be extracted, the header is silently skipped
- The interceptor respects the request protocol (http/https) and host
- Works with both direct and wrapped response structures
- Handles trailing slashes in paths correctly
