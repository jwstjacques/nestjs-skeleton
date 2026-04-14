import { z } from "zod";

/**
 * Security Configuration Schema
 *
 * Defines and validates security-related settings including:
 * - JWT authentication
 * - CORS (Cross-Origin Resource Sharing)
 * - Helmet security headers
 */
export const SecurityConfigSchema = z.object({
  /**
   * JWT (JSON Web Token) configuration
   */
  jwt: z.object({
    /**
     * Secret for signing access tokens (REQUIRED, min 32 characters)
     */
    secret: z.string().min(32, "JWT secret must be at least 32 characters"),

    /**
     * Access token expiration time
     * @default '15m'
     * @example '15m', '1h', '7d'
     */
    expiresIn: z.string().default("15m"),

    /**
     * Secret for signing refresh tokens (REQUIRED, min 32 characters)
     */
    refreshSecret: z.string().min(32, "JWT refresh secret must be at least 32 characters"),

    /**
     * Refresh token expiration time
     * @default '7d'
     * @example '7d', '30d', '90d'
     */
    refreshExpiresIn: z.string().default("7d"),
  }),

  /**
   * Bcrypt cost factor (salt rounds) for password hashing
   * OWASP 2024 recommendation: 12
   * @default 12
   */
  bcryptRounds: z.coerce.number().int().min(10).max(20).default(12),

  /**
   * CORS (Cross-Origin Resource Sharing) configuration
   */
  cors: z.object({
    /**
     * Allowed origins
     * @default '*' (allow all in development)
     * @example 'https://example.com', ['https://app.example.com', 'https://admin.example.com']
     */
    origin: z.union([z.string(), z.array(z.string()), z.boolean()]).default("*"),

    /**
     * Allow credentials (cookies, authorization headers)
     * @default true
     */
    credentials: z.coerce.boolean().default(true),
  }),

  /**
   * Helmet security headers configuration
   */
  helmet: z.object({
    /**
     * Content Security Policy directives
     */
    contentSecurityPolicy: z
      .object({
        directives: z.record(z.string(), z.array(z.string())).optional(),
      })
      .optional(),

    /**
     * Cross-Origin-Embedder-Policy header
     * @default true
     */
    crossOriginEmbedderPolicy: z.coerce.boolean().default(true),

    /**
     * Cross-Origin-Opener-Policy header
     * @default true
     */
    crossOriginOpenerPolicy: z.coerce.boolean().default(true),

    /**
     * Cross-Origin-Resource-Policy header
     * @default true
     */
    crossOriginResourcePolicy: z.coerce.boolean().default(true),
  }),
});

/**
 * Type-safe Security Configuration
 * Inferred from SecurityConfigSchema
 */
export type SecurityConfig = z.infer<typeof SecurityConfigSchema>;
