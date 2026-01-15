import { Injectable } from "@nestjs/common";
import { ThrottlerGuard } from "@nestjs/throttler";
import { ThrottlerException } from "../exceptions/throttler.exception";

/**
 * Custom Throttler Guard
 *
 * Extends the default NestJS ThrottlerGuard to throw our custom
 * ThrottlerException which includes a standardized error code
 * (SYSTEM_RATE_LIMIT_EXCEEDED) for consistent error handling.
 *
 * This ensures rate limit errors follow the same error response
 * format as other application exceptions with proper error codes.
 */
@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  /**
   * Override throwThrottlingException to throw custom exception
   * with error code instead of the default ThrottlerException
   */
  protected throwThrottlingException(): Promise<void> {
    throw new ThrottlerException("Too Many Requests");
  }
}
