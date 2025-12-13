import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import { CorrelationService } from "../correlation";

export const CORRELATION_ID_HEADER = "x-correlation-id";

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  constructor(private readonly correlationService: CorrelationService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    // Get correlation ID from header or generate new one
    const correlationId = (req.headers[CORRELATION_ID_HEADER] as string) || uuidv4();

    // Validate correlation ID format (UUID v4)
    const isValidUUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(correlationId);

    const finalCorrelationId = isValidUUID ? correlationId : uuidv4();

    // Set correlation ID in response header
    res.setHeader(CORRELATION_ID_HEADER, finalCorrelationId);

    // Run rest of request in correlation context
    this.correlationService.run({ correlationId: finalCorrelationId }, () => {
      next();
    });
  }
}
