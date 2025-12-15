import { HttpException, HttpStatus } from "@nestjs/common";
import { ErrorCode, ErrorMessages } from "../constants/error-codes.constants";

export interface ApplicationExceptionResponse {
  statusCode: number;
  message: string;
  error: string;
  errorCode: string;
  timestamp: string;
  correlationId?: string;
  details?: unknown;
}

/**
 * Base exception class for all application-specific exceptions.
 * Provides error code support for frontend translation and tracking.
 *
 * HTTP status codes are provided by each exception class for flexibility.
 */
export class ApplicationException extends HttpException {
  constructor(
    public readonly errorCode: ErrorCode | string,
    messageOrDetails?: string | Record<string, unknown>,
    status?: HttpStatus,
  ) {
    const httpStatus = status || HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      typeof messageOrDetails === "string"
        ? messageOrDetails
        : errorCode in ErrorMessages
          ? ErrorMessages[errorCode as ErrorCode]
          : String(errorCode);

    const details = typeof messageOrDetails !== "string" ? messageOrDetails : undefined;

    const response: Partial<ApplicationExceptionResponse> = {
      statusCode: httpStatus,
      message,
      error: String(errorCode),
      errorCode: String(errorCode),
      timestamp: new Date().toISOString(),
    };

    if (details) {
      response.details = details;
    }

    super(response, httpStatus);
  }

  getErrorCode(): ErrorCode | string {
    return this.errorCode;
  }
}
