import { registerAs } from "@nestjs/config";
import { SecurityConfigSchema } from "../schemas/security.schema";

/**
 * Security Configuration Provider
 *
 * Loads and validates security settings (JWT, CORS, Helmet) from environment variables.
 * Uses Zod schema for runtime validation and type safety.
 *
 * Environment Variables:
 * JWT:
 * - JWT_SECRET: Secret for signing access tokens (REQUIRED, min 32 chars)
 * - JWT_EXPIRES_IN: Access token expiration time
 * - JWT_REFRESH_SECRET: Secret for signing refresh tokens (REQUIRED, min 32 chars)
 * - JWT_REFRESH_EXPIRES_IN: Refresh token expiration time
 *
 * CORS:
 * - CORS_ORIGIN: Allowed origins (string, comma-separated list, or '*')
 * - CORS_CREDENTIALS: Allow credentials (true/false)
 *
 * Helmet:
 * - HELMET_CSP_ENABLED: Enable Content Security Policy (true/false)
 * - HELMET_CROSS_ORIGIN_EMBEDDER_POLICY: Enable COEP header (true/false)
 * - HELMET_CROSS_ORIGIN_OPENER_POLICY: Enable COOP header (true/false)
 * - HELMET_CROSS_ORIGIN_RESOURCE_POLICY: Enable CORP header (true/false)
 *
 * @returns Validated SecurityConfig object
 */
export default registerAs("security", () => {
  // Parse CORS origins (handle comma-separated list)
  let corsOrigin: string | string[] | boolean = process.env.CORS_ORIGIN || "*";

  if (corsOrigin === "true") {
    corsOrigin = true;
  } else if (corsOrigin === "false") {
    corsOrigin = false;
  } else if (corsOrigin.includes(",")) {
    corsOrigin = corsOrigin.split(",").map((origin) => origin.trim());
  }

  const config = {
    jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN,
      refreshSecret: process.env.JWT_REFRESH_SECRET,
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
    },
    cors: {
      origin: corsOrigin,
      credentials: process.env.CORS_CREDENTIALS,
    },
    helmet: {
      contentSecurityPolicy: process.env.HELMET_CSP_ENABLED
        ? {
            directives: {
              // Default CSP directives - can be customized via env vars
              defaultSrc: ["'self'"],
              styleSrc: ["'self'", "'unsafe-inline'"],
              scriptSrc: ["'self'"],
              imgSrc: ["'self'", "data:", "https:"],
            },
          }
        : undefined,
      crossOriginEmbedderPolicy: process.env.HELMET_CROSS_ORIGIN_EMBEDDER_POLICY,
      crossOriginOpenerPolicy: process.env.HELMET_CROSS_ORIGIN_OPENER_POLICY,
      crossOriginResourcePolicy: process.env.HELMET_CROSS_ORIGIN_RESOURCE_POLICY,
    },
  };

  // Validate and parse with Zod schema
  // Throws detailed error if validation fails
  return SecurityConfigSchema.parse(config);
});
