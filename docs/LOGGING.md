# Logging Guide

This project uses Winston for structured logging with correlation ID tracking across requests.

## Overview

The logging system provides:

- **Structured JSON logs** for production
- **Colorized console logs** for development
- **Correlation ID tracking** across async operations
- **User ID tracking** for authenticated requests
- **File rotation** for log management
- **Error-specific log files** for quick debugging

## Log Format

### Console Output (Development)

```
2024-01-15 10:30:00 [abc123-def456] [user-42] [TasksService] info: Creating task for user 42
2024-01-15 10:30:01 [abc123-def456] [user-42] [TasksDal] debug: Executing INSERT query
2024-01-15 10:30:02 [abc123-def456] [user-42] [TasksController] error: Task validation failed
  at TasksController.create (/src/modules/tasks/tasks.controller.ts:45:11)
```

### JSON Output (File/Production)

```json
{
  "level": "info",
  "message": "Creating task for user 42",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "correlationId": "abc123-def456",
  "userId": 42,
  "context": "TasksService"
}
```

## Configuration

### Environment Variables

```bash
# Logging Configuration
LOG_DIR=./logs                           # Log file directory
LOG_TIMESTAMP_FORMAT=YYYY-MM-DD HH:mm:ss # Timestamp format
LOG_FILE_MAX_SIZE=10485760               # Max size per file (10MB)
LOG_FILE_MAX_FILES=5                     # Number of files to keep
LOG_APP_FILENAME=application.log         # Application log filename
LOG_ERROR_FILENAME=error.log             # Error log filename
```

### Logger Module

The logger is configured in [logger.module.ts](../src/common/logger/logger.module.ts):

```typescript
@Module({
  imports: [
    WinstonModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        transports: [
          // Console with colors
          new winston.transports.Console({
            format: winston.format.combine(
              correlationFormat(),
              winston.format.timestamp(),
              winston.format.colorize(),
              winston.format.printf((info) => {
                return `${info.timestamp} [${info.correlationId}] [${info.context}] ${info.level}: ${info.message}`;
              }),
            ),
          }),
          // Application log file
          new winston.transports.File({
            filename: "logs/application.log",
            format: winston.format.combine(
              correlationFormat(),
              winston.format.timestamp(),
              winston.format.json(),
            ),
          }),
          // Error-only log file
          new winston.transports.File({
            filename: "logs/error.log",
            level: "error",
          }),
        ],
      }),
    }),
  ],
})
export class LoggerModule {}
```

## Usage

### Injecting the Logger

```typescript
import { Logger, Injectable } from "@nestjs/common";

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  async create(dto: CreateTaskDto) {
    this.logger.log(`Creating task: ${dto.title}`);

    try {
      const task = await this.dal.create(dto);
      this.logger.log(`Task created: ${task.id}`);
      return task;
    } catch (error) {
      this.logger.error(`Failed to create task`, error.stack);
      throw error;
    }
  }
}
```

### Log Levels

| Level     | Use Case                       | Method             |
| --------- | ------------------------------ | ------------------ |
| `error`   | Exceptions, failures           | `logger.error()`   |
| `warn`    | Potential issues, deprecations | `logger.warn()`    |
| `log`     | Important events, operations   | `logger.log()`     |
| `debug`   | Detailed debugging info        | `logger.debug()`   |
| `verbose` | Very detailed tracing          | `logger.verbose()` |

### Examples

```typescript
// Standard log
this.logger.log("User logged in successfully");

// Warning
this.logger.warn("Rate limit approaching for user 42");

// Error with stack trace
this.logger.error("Database connection failed", error.stack);

// Debug info
this.logger.debug(`Query params: ${JSON.stringify(query)}`);

// Verbose (very detailed)
this.logger.verbose(`Full request body: ${JSON.stringify(body)}`);
```

## Correlation IDs

Every request is assigned a unique correlation ID for tracing.

### How It Works

1. **CorrelationMiddleware** generates/extracts correlation ID
2. Stored in **AsyncLocalStorage** for the request lifecycle
3. **correlationFormat** adds it to all log entries
4. Returned in **response headers** and error responses

### Accessing Correlation ID

```typescript
import { CorrelationService } from "../common/correlation";

@Injectable()
export class TasksService {
  constructor(private correlationService: CorrelationService) {}

  async create(dto: CreateTaskDto) {
    const correlationId = this.correlationService.getCorrelationId();
    this.logger.log(`[${correlationId}] Creating task`);
  }
}
```

### Request/Response Headers

```bash
# Request header (optional)
X-Correlation-ID: custom-trace-123

# Response header (always included)
X-Correlation-ID: abc123-def456
```

## File Logging

### Log Files

| File              | Contents                     |
| ----------------- | ---------------------------- |
| `application.log` | All logs (info, warn, debug) |
| `error.log`       | Error logs only              |

### Rotation

Files are rotated based on configuration:

- **Max size**: 10MB per file (configurable)
- **Max files**: 5 files kept (configurable)

When `application.log` reaches 10MB:

```
application.log      → Current
application1.log     → Previous
application2.log     → Older
...
```

### Viewing Logs

```bash
# Tail application logs
tail -f logs/application.log

# View errors only
tail -f logs/error.log

# Search for correlation ID
grep "abc123-def456" logs/application.log

# Search for user
grep "user-42" logs/application.log

# Parse JSON logs with jq
cat logs/application.log | jq 'select(.level == "error")'
```

## Best Practices

### 1. Use Meaningful Context

```typescript
// Good - clear context
private readonly logger = new Logger(TasksService.name);
// Logs: [TasksService] Creating task

// Bad - generic context
private readonly logger = new Logger("Service");
// Logs: [Service] Creating task
```

### 2. Include Relevant IDs

```typescript
// Good
this.logger.log(`Task ${taskId} updated by user ${userId}`);

// Bad
this.logger.log("Task updated");
```

### 3. Log at Appropriate Levels

```typescript
// Error - something failed
this.logger.error(`Failed to save task ${id}`, error.stack);

// Warn - something unexpected but handled
this.logger.warn(`Retrying database connection (attempt ${attempt})`);

// Log - important business event
this.logger.log(`Task ${id} completed successfully`);

// Debug - development/debugging info
this.logger.debug(`Query execution time: ${ms}ms`);
```

### 4. Don't Log Sensitive Data

```typescript
// Bad - logs password
this.logger.log(`Login attempt: ${email}, ${password}`);

// Good - no sensitive data
this.logger.log(`Login attempt: ${email}`);

// Bad - logs full token
this.logger.log(`Token: ${accessToken}`);

// Good - logs token prefix only
this.logger.log(`Token: ${accessToken.substring(0, 10)}...`);
```

### 5. Structure Error Logs

```typescript
try {
  await this.dal.update(id, dto);
} catch (error) {
  // Include: message, stack, context
  this.logger.error(`Failed to update task ${id}: ${error.message}`, error.stack);
  throw error;
}
```

## Production Configuration

For production, consider:

### Disable Console Colors

```typescript
new winston.transports.Console({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),  // JSON instead of colorized
  ),
}),
```

### External Log Aggregation

Add transports for external services:

```typescript
// Datadog
import { WinstonDatadog } from "winston-datadog";
transports.push(new WinstonDatadog({ apiKey: "..." }));

// Elasticsearch
import { ElasticsearchTransport } from "winston-elasticsearch";
transports.push(new ElasticsearchTransport({ node: "..." }));

// CloudWatch
import WinstonCloudWatch from "winston-cloudwatch";
transports.push(new WinstonCloudWatch({ logGroupName: "..." }));
```

### Log Level by Environment

```typescript
const level = process.env.NODE_ENV === "production" ? "info" : "debug";

new winston.transports.Console({ level }),
```

## Debugging with Logs

### Find All Logs for a Request

```bash
grep "abc123-def456" logs/application.log
```

### Find All Errors for a User

```bash
grep "user-42" logs/error.log
```

### Find Slow Operations

```bash
# If you log timing
grep "execution time" logs/application.log | grep -E "[0-9]{4,}ms"
```

### Parse JSON Logs

```bash
# All errors in last hour
cat logs/application.log | \
  jq 'select(.level == "error")' | \
  jq 'select(.timestamp > "2024-01-15T09:00:00")'

# Unique error messages
cat logs/error.log | jq -r '.message' | sort | uniq -c | sort -rn
```

## See Also

- [Error Codes](./ERROR_CODES.md)
- [Error Response Format](./ERROR_RESPONSE_FORMAT.md)
- [Production Guide](./PRODUCTION.md)
- [Troubleshooting](./TROUBLESHOOTING.md)
