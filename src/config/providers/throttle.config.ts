import { registerAs } from "@nestjs/config";
import { ThrottleConfigSchema } from "../schemas/throttle.schema";

/**
 * Throttle (Rate Limiting) Configuration Provider
 *
 * Loads and validates rate limiting settings from environment variables.
 * Uses Zod schema for runtime validation and type safety.
 *
 * Environment Variables:
 * Short-term:
 * - THROTTLE_SHORT_TTL: Time window in milliseconds
 * - THROTTLE_SHORT_LIMIT: Maximum requests per time window
 *
 * Medium-term:
 * - THROTTLE_MEDIUM_TTL: Time window in milliseconds
 * - THROTTLE_MEDIUM_LIMIT: Maximum requests per time window
 *
 * Long-term:
 * - THROTTLE_LONG_TTL: Time window in milliseconds
 * - THROTTLE_LONG_LIMIT: Maximum requests per time window
 *
 * Strict (for sensitive endpoints):
 * - THROTTLE_STRICT_TTL: Time window in milliseconds
 * - THROTTLE_STRICT_LIMIT: Maximum requests per time window
 *
 * @returns Validated ThrottleConfig object
 */
export default registerAs("throttle", () => {
  const config = {
    short: {
      ttl: process.env.THROTTLE_SHORT_TTL,
      limit: process.env.THROTTLE_SHORT_LIMIT,
    },
    medium: {
      ttl: process.env.THROTTLE_MEDIUM_TTL,
      limit: process.env.THROTTLE_MEDIUM_LIMIT,
    },
    long: {
      ttl: process.env.THROTTLE_LONG_TTL,
      limit: process.env.THROTTLE_LONG_LIMIT,
    },
    strict: {
      ttl: process.env.THROTTLE_STRICT_TTL,
      limit: process.env.THROTTLE_STRICT_LIMIT,
    },
  };

  // Validate and parse with Zod schema
  // Throws detailed error if validation fails
  return ThrottleConfigSchema.parse(config);
});
