import { registerAs } from "@nestjs/config";
import { DatabaseConfigSchema } from "../schemas/database.schema";

/**
 * Database Configuration Provider
 *
 * Loads and validates PostgreSQL connection settings from environment variables.
 * Uses Zod schema for runtime validation and type safety.
 *
 * Environment Variables:
 * - DATABASE_URL: Full PostgreSQL connection string (REQUIRED)
 * - POSTGRES_HOST: Database host (optional if URL provided)
 * - POSTGRES_PORT: Database port (optional if URL provided)
 * - POSTGRES_USER: Database username (optional if URL provided)
 * - POSTGRES_PASSWORD: Database password (optional if URL provided)
 * - POSTGRES_DB: Database name (optional if URL provided)
 * - DATABASE_SSL: Enable SSL connection (true/false)
 *
 * @returns Validated DatabaseConfig object
 */
export default registerAs("database", () => {
  const config = {
    url: process.env.DATABASE_URL,
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    ssl: process.env.DATABASE_SSL,
  };

  // Validate and parse with Zod schema
  // Throws detailed error if validation fails
  return DatabaseConfigSchema.parse(config);
});
