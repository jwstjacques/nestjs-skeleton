import { Injectable, ExecutionContext } from "@nestjs/common";
import { ThrottlerGuard, ThrottlerLimitDetail } from "@nestjs/throttler";
import { ThrottlerException } from "../../common/exceptions/throttler.exception";

/**
 * Rate-limits login attempts by username, not IP.
 *
 * Prevents distributed brute-force attacks where thousands of IPs
 * target the same account. The "strict" throttle tier is used:
 * 5 attempts per 15 minutes by default.
 *
 * Apply this guard to the login endpoint in addition to (not instead of)
 * the global IP-based throttler.
 */
@Injectable()
export class LoginThrottlerGuard extends ThrottlerGuard {
  protected getTracker(req: Record<string, unknown>): Promise<string> {
    const body = req.body as { username?: string } | undefined;
    const username = body?.username;

    if (username && typeof username === "string") {
      return Promise.resolve(`login:${username.toLowerCase().trim()}`);
    }

    return Promise.resolve(`login:${(req.ip as string) || "unknown"}`);
  }

  protected throwThrottlingException(
    context: ExecutionContext,
    throttlerLimitDetail: ThrottlerLimitDetail,
  ): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const response = context.switchToHttp().getResponse();
    const retryAfterSeconds = Math.ceil(throttlerLimitDetail.ttl / 1000);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    response.header("Retry-After", String(retryAfterSeconds));

    throw new ThrottlerException(
      "Too many login attempts for this account. Please try again later.",
    );
  }
}
