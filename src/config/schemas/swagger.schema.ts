import { z } from "zod";

/**
 * Swagger (OpenAPI) Configuration Schema
 *
 * Defines and validates API documentation settings.
 */
export const SwaggerConfigSchema = z.object({
  /**
   * Enable Swagger UI
   * @default true
   */
  enabled: z.coerce.boolean().default(true),

  /**
   * Swagger UI path (relative to API prefix)
   * @default 'docs'
   */
  path: z.string().default("docs"),

  /**
   * API title
   * @default 'NestJS API'
   */
  title: z.string().default("NestJS API"),

  /**
   * API description
   * @default 'A production-ready REST API built with NestJS'
   */
  description: z.string().default("A production-ready REST API built with NestJS"),

  /**
   * API version
   * @default '1.0'
   */
  version: z.string().default("1.0"),

  /**
   * Contact name
   * @default 'API Support'
   */
  contactName: z.string().default("API Support"),

  /**
   * Contact email
   */
  contactEmail: z.string().email().optional(),

  /**
   * Contact URL
   */
  contactUrl: z.string().url().optional(),
});

/**
 * Type-safe Swagger Configuration
 * Inferred from SwaggerConfigSchema
 */
export type SwaggerConfig = z.infer<typeof SwaggerConfigSchema>;
