import { Injectable, NestMiddleware, Logger } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { CorrelationService } from "../correlation";

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger(RequestLoggerMiddleware.name);

  constructor(private readonly correlationService: CorrelationService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get("user-agent") || "";
    const startTime = Date.now();
    const correlationId = this.correlationService.getCorrelationId();

    res.on("finish", () => {
      const { statusCode } = res;
      const duration = Date.now() - startTime;
      const userId = this.correlationService.getUserId();

      const contextParts = [correlationId ? `[${correlationId}]` : ""];

      if (userId) {
        contextParts.push(`[user-${userId}]`);
      }

      const context = contextParts.filter(Boolean).join(" ");

      const logMessage = `${context} ${method} ${originalUrl} ${statusCode} ${duration}ms - ${ip} - ${userAgent}`;

      if (statusCode >= 500) {
        this.logger.error(logMessage);
      } else if (statusCode >= 400) {
        this.logger.warn(logMessage);
      } else {
        this.logger.log(logMessage);
      }
    });

    next();
  }
}
