import { registerAs } from "@nestjs/config";
import { SwaggerConfigSchema } from "../schemas/swagger.schema";

/**
 * Swagger (OpenAPI) Configuration Provider
 *
 * Loads and validates API documentation settings from environment variables.
 * Uses Zod schema for runtime validation and type safety.
 *
 * Environment Variables:
 * - SWAGGER_ENABLED: Enable Swagger UI (true/false)
 * - SWAGGER_PATH: Swagger UI path (relative to API prefix)
 * - SWAGGER_TITLE: API title
 * - SWAGGER_DESCRIPTION: API description
 * - SWAGGER_VERSION: API version
 * - SWAGGER_CONTACT_NAME: Contact name
 * - SWAGGER_CONTACT_EMAIL: Contact email
 * - SWAGGER_CONTACT_URL: Contact URL
 *
 * @returns Validated SwaggerConfig object
 */
export default registerAs("swagger", () => {
  const config = {
    enabled: process.env.SWAGGER_ENABLED,
    path: process.env.SWAGGER_PATH,
    title: process.env.SWAGGER_TITLE,
    description: process.env.SWAGGER_DESCRIPTION,
    version: process.env.SWAGGER_VERSION,
    contactName: process.env.SWAGGER_CONTACT_NAME,
    contactEmail: process.env.SWAGGER_CONTACT_EMAIL,
    contactUrl: process.env.SWAGGER_CONTACT_URL,
  };

  // Validate and parse with Zod schema
  // Throws detailed error if validation fails
  return SwaggerConfigSchema.parse(config);
});
