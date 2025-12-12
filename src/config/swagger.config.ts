import { DocumentBuilder } from "@nestjs/swagger";

/**
 * Swagger/OpenAPI configuration
 * This configuration is shared between main.ts and export scripts
 */
export function createSwaggerConfig() {
  return new DocumentBuilder()
    .setTitle("NestJS Task Management API")
    .setDescription(
      "A production-ready REST API for managing tasks with user authentication, built with NestJS, Prisma, and PostgreSQL.",
    )
    .setVersion("1.0")
    .setContact("Jason St. Jacques", "https://github.com/jwstjacques", "jw.stjacques@gmail.com")
    .setLicense("MIT", "https://opensource.org/licenses/MIT")
    .addServer("http://localhost:3000", "Development server")
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
