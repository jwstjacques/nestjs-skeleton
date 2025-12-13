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
import { HttpStatusUtil } from "../utils/http-status.util";
import { LogContextUtil } from "../utils/log-context.util";
import { DEFAULT_ERROR_MESSAGE, DEFAULT_ERROR_NAME } from "../constants/error-messages.constants";

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
    let message = DEFAULT_ERROR_MESSAGE;
    let error = DEFAULT_ERROR_NAME;

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
    const context = LogContextUtil.buildContext(correlationId, userId);

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

    // Use HttpStatusUtil to determine log level and log appropriately
    if (HttpStatusUtil.isServerError(status)) {
      this.logger.error(`${context} Server Error: ${JSON.stringify(errorLog)}`);
    } else if (HttpStatusUtil.isClientError(status)) {
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
