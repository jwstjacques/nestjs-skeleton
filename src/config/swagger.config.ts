import { DocumentBuilder } from "@nestjs/swagger";
import {
  SWAGGER_TITLE,
  SWAGGER_DESCRIPTION,
  SWAGGER_VERSION,
  SWAGGER_CONTACT_NAME,
  SWAGGER_CONTACT_EMAIL,
  DEFAULT_PORT,
} from "./api.constants";

/**
 * Swagger/OpenAPI configuration
 * This configuration is shared between main.ts and export scripts
 */
export function createSwaggerConfig() {
  return new DocumentBuilder()
    .setTitle(SWAGGER_TITLE)
    .setDescription(SWAGGER_DESCRIPTION)
    .setVersion(SWAGGER_VERSION)
    .setContact(SWAGGER_CONTACT_NAME, "https://github.com/jwstjacques", SWAGGER_CONTACT_EMAIL)
    .setLicense("MIT", "https://opensource.org/licenses/MIT")
    .addServer(`http://localhost:${DEFAULT_PORT}`, "Development server")
    .addTag("tasks", "Task management endpoints")
    .addTag("auth", "Authentication endpoints (TBD)")
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        name: "Authorization",
        description: "Enter JWT token",
        in: "header",
      },
      "JWT-auth",
    )
    .build();
}
