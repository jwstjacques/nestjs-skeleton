import { Injectable, ExecutionContext } from "@nestjs/common";
import { ThrottlerGuard, ThrottlerLimitDetail } from "@nestjs/throttler";
import { ThrottlerException } from "../exceptions/throttler.exception";

/**
 * Custom Throttler Guard
 *
 * Extends the default NestJS ThrottlerGuard to:
 * 1. Throw our custom ThrottlerException with standardized error code
 * 2. Set rate limit response headers (X-RateLimit-Limit, X-RateLimit-Remaining, Retry-After)
 */
@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected throwThrottlingException(
    context: ExecutionContext,
    throttlerLimitDetail: ThrottlerLimitDetail,
  ): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const response = context.switchToHttp().getResponse();

    const retryAfterSeconds = Math.ceil(throttlerLimitDetail.ttl / 1000);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    response.header("Retry-After", String(retryAfterSeconds));
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    response.header("X-RateLimit-Limit", String(throttlerLimitDetail.limit));
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    response.header("X-RateLimit-Remaining", "0");

    throw new ThrottlerException("Too Many Requests");
  }
}
