import { Injectable, NestMiddleware, Logger } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { CorrelationService } from "../correlation";
import { HttpStatusUtil } from "../utils/http-status.util";
import { LogContextUtil } from "../utils/log-context.util";

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

      const context = LogContextUtil.buildContext(correlationId, userId);

      const logMessage = `${context} ${method} ${originalUrl} ${statusCode} ${duration}ms - ${ip} - ${userAgent}`;

      // Use HttpStatusUtil to determine log level based on status code
      const logLevel = HttpStatusUtil.getLogLevel(statusCode);

      this.logger[logLevel](logMessage);
    });

    next();
  }
}
