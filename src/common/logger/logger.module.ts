import { Module } from "@nestjs/common";
import { WinstonModule } from "nest-winston";
import * as winston from "winston";
import * as path from "path";
import { AsyncLocalStorage } from "async_hooks";
import {
  LOG_DIR,
  LOG_FILE_MAX_SIZE,
  LOG_FILE_MAX_FILES,
  LOG_TIMESTAMP_FORMAT,
} from "../../config/logger.constants";
import { LogLevel } from "../enums";

/**
 * Custom Winston format to include correlation ID and user ID in log entries
 *
 * IMPORTANT: This format function accesses AsyncLocalStorage via the global object
 * because Winston format functions are created during module initialization, before
 * NestJS dependency injection is fully available. We cannot inject CorrelationService here.
 *
 * Why this approach is safe:
 * 1. AsyncLocalStorage is a singleton shared across the application
 * 2. The global reference is set once during CorrelationService initialization
 * 3. Winston formats are synchronous and run in the same async context
 * 4. This is a documented pattern for integrating AsyncLocalStorage with Winston
 *
 * Alternative approaches considered:
 * - Injecting CorrelationService: Not possible due to Winston initialization timing
 * - Using cls-hooked: Deprecated in favor of native AsyncLocalStorage
 * - Request-scoped loggers: Performance overhead and complexity
 *
 * @see https://github.com/nestjs/nest/issues/1884
 * @see https://nodejs.org/api/async_context.html#class-asynclocalstorage
 */
const correlationFormat = winston.format((info) => {
  // WORKAROUND: Access AsyncLocalStorage from global scope (see documentation above)
  const asyncLocalStorage = (global as Record<string, unknown>)
    .correlationStorage as AsyncLocalStorage<Record<string, unknown>>;

  if (asyncLocalStorage) {
    const store = asyncLocalStorage.getStore();

    if (store) {
      info.correlationId = store.correlationId;

      info.userId = store.userId;
    }
  }

  return info;
});

@Module({
  imports: [
    WinstonModule.forRoot({
      transports: [
        // Console transport
        new winston.transports.Console({
          format: winston.format.combine(
            correlationFormat(),
            winston.format.timestamp({ format: LOG_TIMESTAMP_FORMAT }),
            winston.format.colorize(),
            winston.format.printf((info: winston.Logform.TransformableInfo) => {
              const correlationIdValue = info.correlationId as string | undefined;
              const userIdValue = info.userId as number | undefined;
              const contextValue = info.context as string | undefined;
              const traceValue = info.trace as string | undefined;

              const correlationPart = correlationIdValue ? `[${correlationIdValue}]` : "";
              const userPart = userIdValue ? `[user-${userIdValue}]` : "";
              const contextPart = contextValue ? `[${contextValue}]` : "[Application]";

              return `${String(info.timestamp)} ${correlationPart} ${userPart} ${contextPart} ${String(info.level)}: ${String(info.message)}${
                traceValue ? `\n${traceValue}` : ""
              }`;
            }),
          ),
        }),
        // File transport - All logs
        new winston.transports.File({
          filename: path.join(LOG_DIR, "application.log"),
          format: winston.format.combine(
            correlationFormat(),
            winston.format.timestamp({ format: LOG_TIMESTAMP_FORMAT }),
            winston.format.json(),
          ),
          maxsize: LOG_FILE_MAX_SIZE,
          maxFiles: LOG_FILE_MAX_FILES,
        }),
        // File transport - Error logs only
        new winston.transports.File({
          filename: path.join(LOG_DIR, "error.log"),
          level: LogLevel.ERROR,
          format: winston.format.combine(
            correlationFormat(),
            winston.format.timestamp({ format: LOG_TIMESTAMP_FORMAT }),
            winston.format.json(),
          ),
          maxsize: LOG_FILE_MAX_SIZE,
          maxFiles: LOG_FILE_MAX_FILES,
        }),
      ],
    }),
  ],
  exports: [WinstonModule],
})
export class LoggerModule {}
