import { DocumentBuilder } from "@nestjs/swagger";
import { ConfigService } from "@nestjs/config";

/**
 * Swagger/OpenAPI configuration
 * This configuration is shared between main.ts and export scripts
 *
 * @param configService - NestJS ConfigService for accessing configuration
 * @returns Swagger DocumentBuilder configuration
 */
export function createSwaggerConfig(configService: ConfigService) {
  const title = configService.get<string>("swagger.title", "NestJS Skeleton API");
  const description = configService.get<string>(
    "swagger.description",
    "A production-ready NestJS REST API skeleton with best practices",
  );
  const version = configService.get<string>("swagger.version", "1.0");
  const contactName = configService.get<string>("swagger.contactName", "API Support");
  const contactEmail = configService.get<string>("swagger.contactEmail", "support@example.com");
  const contactUrl = configService.get<string>(
    "swagger.contactUrl",
    "https://github.com/jwstjacques",
  );
  const port = configService.get<number>("app.port", 3000);

  return new DocumentBuilder()
    .setTitle(title)
    .setDescription(description)
    .setVersion(version)
    .setContact(contactName, contactUrl, contactEmail)
    .setLicense("MIT", "https://opensource.org/licenses/MIT")
    .addServer(`http://localhost:${port}`, "Development server")
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
