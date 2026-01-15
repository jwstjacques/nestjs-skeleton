import { z } from "zod";

/**
 * Application Configuration Schema
 *
 * Defines and validates core application settings including:
 * - Environment (development, staging, production, test)
 * - Server configuration (port, host)
 * - API settings (prefix, version, paths)
 */
export const AppConfigSchema = z.object({
  /**
   * Node environment
   * @example 'development', 'production', 'staging', 'test'
   */
  nodeEnv: z.enum(["development", "staging", "production", "test"]).default("development"),

  /**
   * Server port (1-65535)
   * @default 3000
   */
  port: z.coerce.number().int().min(1).max(65535).default(3000),

  /**
   * Server host
   * @default 'localhost'
   */
  host: z.string().default("localhost"),
});

/**
 * Type-safe Application Configuration
 * Inferred from AppConfigSchema
 */
export type AppConfig = z.infer<typeof AppConfigSchema>;
