import {
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
  ExceptionFilter,
} from "@nestjs/common";
import { Request, Response } from "express";
import { CorrelationService } from "../correlation";

export const CORRELATION_ID_HEADER = "x-correlation-id";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  constructor(private readonly correlationService: CorrelationService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const correlationId = this.correlationService.getCorrelationId();
    const userId = this.correlationService.getUserId();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = "Internal server error";
    let error = "Internal Server Error";

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === "object" && exceptionResponse !== null) {
        const responseObj = exceptionResponse;

        const responseMessage = (responseObj as Record<string, unknown>).message;

        message = typeof responseMessage === "string" ? responseMessage : exception.message;

        const responseError = (responseObj as Record<string, unknown>).error;

        error = typeof responseError === "string" ? responseError : exception.name;
      } else {
        message = exceptionResponse;
        error = exception.name;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      error = exception.name;
    }

    // Build correlation context string
    const contextParts = [];

    if (correlationId) {
      contextParts.push(`[${correlationId}]`);
    }

    if (userId) {
      contextParts.push(`[user-${userId}]`);
    }

    const context = contextParts.join(" ");

    // Log the error with correlation ID
    const errorLog = {
      correlationId,
      userId,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      statusCode: status,
      message,
      error,
      stack: exception instanceof Error ? exception.stack : undefined,
    };

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(`${context} Server Error: ${JSON.stringify(errorLog)}`);
    } else if (status >= HttpStatus.BAD_REQUEST) {
      this.logger.warn(`${context} Client Error: ${JSON.stringify(errorLog)}`);
    }

    // Include correlation ID in error response
    response.status(status).json({
      statusCode: status,
      message,
      error,
      correlationId, // Include in response for debugging
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
