import "tsconfig-paths/register";
import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "../src/app.module";
import { createSwaggerConfig } from "../src/config/swagger.config";
import * as fs from "fs";
import * as path from "path";

async function exportOpenAPI() {
  const app = await NestFactory.create(AppModule, { logger: false });

  // Get ConfigService from the app
  const configService = app.get(ConfigService);

  // Use the shared Swagger configuration
  const config = createSwaggerConfig(configService);
  const document = SwaggerModule.createDocument(app, config);

  // Ensure docs directory exists
  const swaggerDir = path.resolve(__dirname, "../swagger");

  if (!fs.existsSync(swaggerDir)) {
    fs.mkdirSync(swaggerDir, { recursive: true });
  }

  // Export as JSON
  const jsonPath = path.join(swaggerDir, "openapi.json");

  fs.writeFileSync(jsonPath, JSON.stringify(document, null, 2));

  console.log(`✅ OpenAPI specification exported to ${jsonPath}`);

  await app.close();
  process.exit(0);
}

exportOpenAPI().catch((error) => {
  console.error("❌ Failed to export OpenAPI specification:", error);
  process.exit(1);
});
