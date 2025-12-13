import { Module } from "@nestjs/common";
import { WinstonModule } from "nest-winston";
import * as winston from "winston";
import * as path from "path";
import { AsyncLocalStorage } from "async_hooks";

const logDir = path.join(process.cwd(), "logs");

// Custom format to include correlation ID
const correlationFormat = winston.format((info) => {
  // Access AsyncLocalStorage to get correlation context
  // This is a workaround since we can't inject CorrelationService into winston format

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
            winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
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
          filename: path.join(logDir, "application.log"),
          format: winston.format.combine(
            correlationFormat(),
            winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
            winston.format.json(),
          ),
          maxsize: 10485760, // 10MB
          maxFiles: 5,
        }),
        // File transport - Error logs only
        new winston.transports.File({
          filename: path.join(logDir, "error.log"),
          level: "error",
          format: winston.format.combine(
            correlationFormat(),
            winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
            winston.format.json(),
          ),
          maxsize: 10485760, // 10MB
          maxFiles: 5,
        }),
      ],
    }),
  ],
  exports: [WinstonModule],
})
export class LoggerModule {}
