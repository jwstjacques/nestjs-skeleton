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
import { ApplicationException } from "../exceptions/application.exception";
import { ErrorCode } from "../constants/error-codes.constants";

interface ErrorResponse {
  statusCode: number;
  message: string | string[];
  error: string;
  errorCode?: string;
  timestamp: string;
  path: string;
  correlationId: string;
  details?: unknown;
}

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
    let message: string | string[] = DEFAULT_ERROR_MESSAGE;
    let error = DEFAULT_ERROR_NAME;
    let errorCode: string | undefined;
    let details: unknown;

    // Handle ApplicationException (our custom exceptions with error codes)
    if (exception instanceof ApplicationException) {
      status = exception.getStatus();
      errorCode = exception.getErrorCode();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === "object" && exceptionResponse !== null) {
        const responseObj = exceptionResponse as Record<string, unknown>;

        message = (responseObj.message as string) || exception.message;
        error = (responseObj.error as string) || exception.name;
        details = responseObj.details;
      } else {
        message = String(exceptionResponse);
        error = exception.name;
      }
    }
    // Handle standard HttpException
    else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === "object" && exceptionResponse !== null) {
        const responseObj = exceptionResponse as Record<string, unknown>;
        const responseMessage = responseObj.message;

        message = Array.isArray(responseMessage)
          ? responseMessage
          : typeof responseMessage === "string"
            ? responseMessage
            : exception.message;

        const responseError = responseObj.error;

        error = typeof responseError === "string" ? responseError : exception.name;

        // Try to extract errorCode if present
        if (responseObj.errorCode && typeof responseObj.errorCode === "string") {
          errorCode = responseObj.errorCode as ErrorCode;
        }
      } else {
        message = String(exceptionResponse);
        error = exception.name;
      }

      // Add default error codes for standard HTTP exceptions if not already set
      if (!errorCode) {
        switch (status) {
          case HttpStatus.BAD_REQUEST:
            errorCode = ErrorCode.VALIDATION_FAILED;
            break;

          case HttpStatus.UNAUTHORIZED:
            errorCode = ErrorCode.AUTH_UNAUTHORIZED;
            break;

          case HttpStatus.FORBIDDEN:
            errorCode = ErrorCode.AUTH_FORBIDDEN;
            break;

          case HttpStatus.NOT_FOUND:
            errorCode = ErrorCode.RESOURCE_NOT_FOUND;
            break;

          case HttpStatus.CONFLICT:
            errorCode = ErrorCode.RESOURCE_CONFLICT;
            break;

          case HttpStatus.GONE:
            errorCode = ErrorCode.RESOURCE_GONE;
            break;

          case HttpStatus.TOO_MANY_REQUESTS:
            errorCode = ErrorCode.SYSTEM_RATE_LIMIT_EXCEEDED;
            break;

          case HttpStatus.SERVICE_UNAVAILABLE:
            errorCode = ErrorCode.SYSTEM_SERVICE_UNAVAILABLE;
            break;

          case HttpStatus.GATEWAY_TIMEOUT:
            errorCode = ErrorCode.SYSTEM_TIMEOUT;
            break;

          // No default for other status codes
        }
      }
    }
    // Handle standard Error
    else if (exception instanceof Error) {
      message = DEFAULT_ERROR_MESSAGE;
      error = DEFAULT_ERROR_NAME;
      errorCode = ErrorCode.SYSTEM_INTERNAL_ERROR;
    }
    // Handle unknown errors
    else {
      message = DEFAULT_ERROR_MESSAGE;
      error = DEFAULT_ERROR_NAME;
      errorCode = ErrorCode.SYSTEM_INTERNAL_ERROR;
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
      errorCode,
      stack: exception instanceof Error ? exception.stack : undefined,
    };

    // Use HttpStatusUtil to determine log level and log appropriately
    if (HttpStatusUtil.isServerError(status)) {
      this.logger.error(`${context} Server Error: ${JSON.stringify(errorLog)}`);
    } else if (HttpStatusUtil.isClientError(status)) {
      this.logger.warn(`${context} Client Error: ${JSON.stringify(errorLog)}`);
    }

    // Build error response
    const errorResponse: ErrorResponse = {
      statusCode: status,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
      correlationId: correlationId || "unknown",
    };

    // Add error code if present
    if (errorCode) {
      errorResponse.errorCode = errorCode;
    }

    // Add details if present (for validation errors, etc.)
    if (details) {
      errorResponse.details = details;
    }

    // Send response
    response.status(status).json(errorResponse);
  }
}
