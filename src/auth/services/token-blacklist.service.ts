import { Inject, Injectable, Logger } from "@nestjs/common";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";

/**
 * Manages revoked JWT tokens via a Redis-backed blacklist.
 *
 * When a user logs out, their token's `jti` (JWT ID) is added to the
 * blacklist with a TTL matching the token's remaining lifetime. The JWT
 * strategy checks this blacklist on every request.
 *
 * Uses the shared CACHE_MANAGER (Redis in production, in-memory fallback
 * in development). Blacklist entries self-clean when the TTL expires,
 * so no garbage collection is needed.
 */
@Injectable()
export class TokenBlacklistService {
  private readonly logger = new Logger(TokenBlacklistService.name);
  private static readonly KEY_PREFIX = "token:blacklist:";

  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  /**
   * Revoke a token by adding its jti to the blacklist.
   * @param jti - The JWT ID to revoke
   * @param ttlSeconds - Time until the token would have expired naturally.
   *   The blacklist entry is removed after this period since the token
   *   would be invalid anyway.
   */
  async revoke(jti: string, ttlSeconds: number): Promise<void> {
    const key = `${TokenBlacklistService.KEY_PREFIX}${jti}`;

    try {
      await this.cacheManager.set(key, "1", ttlSeconds);
      this.logger.debug(`Token ${jti} blacklisted for ${ttlSeconds}s`);
    } catch (error) {
      // Log but don't throw -- if Redis is down, the token will expire
      // naturally. This is a degraded security mode, not a crash.
      this.logger.error(`Failed to blacklist token ${jti}: ${(error as Error).message}`);
    }
  }

  /**
   * Check if a token has been revoked.
   * @param jti - The JWT ID to check
   * @returns true if the token is blacklisted (revoked)
   */
  async isRevoked(jti: string): Promise<boolean> {
    const key = `${TokenBlacklistService.KEY_PREFIX}${jti}`;

    try {
      const result = await this.cacheManager.get(key);

      return result !== null && result !== undefined;
    } catch (error) {
      // If Redis is down, fail open -- allow the request.
      // The alternative (fail closed) would lock out all users when Redis is down.
      this.logger.error(`Failed to check blacklist for ${jti}: ${(error as Error).message}`);

      return false;
    }
  }
}
