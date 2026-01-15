import { z } from "zod";

/**
 * Database Configuration Schema
 *
 * Defines and validates PostgreSQL database connection settings.
 * Supports both full connection URL and individual connection parameters.
 */
export const DatabaseConfigSchema = z.object({
  /**
   * Full PostgreSQL connection URL (REQUIRED)
   * @example 'postgresql://user:password@localhost:5432/mydb'
   */
  url: z.string().min(1, "Database URL is required"),

  /**
   * Database host (optional if URL provided)
   * @example 'localhost', 'postgres.example.com'
   */
  host: z.string().optional(),

  /**
   * Database port (1-65535)
   * @default 5432
   */
  port: z.coerce.number().int().min(1).max(65535).optional(),

  /**
   * Database username
   */
  user: z.string().optional(),

  /**
   * Database password
   */
  password: z.string().optional(),

  /**
   * Database name
   */
  database: z.string().optional(),

  /**
   * Enable SSL connection
   * @default false
   */
  ssl: z.coerce.boolean().default(false),
});

/**
 * Type-safe Database Configuration
 * Inferred from DatabaseConfigSchema
 */
export type DatabaseConfig = z.infer<typeof DatabaseConfigSchema>;
