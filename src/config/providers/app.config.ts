import { registerAs } from "@nestjs/config";
import { AppConfigSchema } from "../schemas/app.schema";

/**
 * Application Configuration Provider
 *
 * Loads and validates core application settings from environment variables.
 * Uses Zod schema for runtime validation and type safety.
 *
 * Environment Variables:
 * - NODE_ENV: Application environment (development|staging|production|test)
 * - PORT: Server port number
 * - HOST: Server host
 * - API_PREFIX: API route prefix
 * - API_VERSION: API version number
 *
 * @returns Validated AppConfig object
 */
export default registerAs("app", () => {
  const config = {
    nodeEnv: process.env.NODE_ENV,
    port: process.env.PORT,
    host: process.env.HOST,
    apiPrefix: process.env.API_PREFIX,
    apiVersion: process.env.API_VERSION,
  };

  // Validate and parse with Zod schema
  // Throws detailed error if validation fails
  return AppConfigSchema.parse(config);
});
