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
  const title = configService.get<string>("swagger.title", "NestJS API Skeleton");
  const description = configService.get<string>(
    "swagger.description",
    "Production-ready NestJS REST API skeleton with JWT authentication, Prisma ORM, Redis caching, and comprehensive testing. Includes Tasks module as example implementation.\n\n" +
      "## API Versioning\n\n" +
      "This API supports URI versioning:\n\n" +
      "- **v1 (default)**: `/api/v1/*` - Stable core functionality with full CRUD operations\n" +
      "- **v2 (enhanced)**: `/api/v2/*` - Enhanced endpoints with permission checks and additional features\n\n" +
      "See the endpoint documentation for version-specific differences.",
  );
  const version = configService.get<string>("swagger.version", "1.0");
  const contactName = configService.get<string>("swagger.contactName", "API Support");
  const contactEmail = configService.get<string>("swagger.contactEmail", "support@example.com");
  const contactUrl = configService.get<string>(
    "swagger.contactUrl",
    "https://github.com/yourusername/nestjs-api-skeleton",
  );
  const port = configService.get<number>("app.port", 3000);

  return new DocumentBuilder()
    .setTitle(title)
    .setDescription(description)
    .setVersion(version)
    .setContact(contactName, contactUrl, contactEmail)
    .setLicense("MIT", "https://opensource.org/licenses/MIT")
    .addServer(`http://localhost:${port}`, "Development server")
    .addTag("health", "Health check endpoints")
    .addTag("auth", "Authentication & authorization endpoints")
    .addTag("tasks", "Tasks module v1 (Example implementation - can be removed)")
    .addTag("tasks-v2", "Tasks module v2 - Enhanced with permission checks")
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
