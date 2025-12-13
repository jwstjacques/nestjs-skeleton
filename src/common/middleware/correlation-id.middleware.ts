import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import { CorrelationService } from "../correlation";
import { CORRELATION_ID_HEADER, UUID_V4_REGEX } from "../constants";

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  constructor(private readonly correlationService: CorrelationService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    // Get correlation ID from header or generate new one
    const correlationId = (req.headers[CORRELATION_ID_HEADER] as string) || uuidv4();

    // Validate correlation ID format (UUID v4)
    const isValidUUID = UUID_V4_REGEX.test(correlationId);

    const finalCorrelationId = isValidUUID ? correlationId : uuidv4();

    // Set correlation ID in response header
    res.setHeader(CORRELATION_ID_HEADER, finalCorrelationId);

    // Run rest of request in correlation context
    this.correlationService.run({ correlationId: finalCorrelationId }, () => {
      next();
    });
  }
}
