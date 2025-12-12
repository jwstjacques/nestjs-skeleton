import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HttpExceptionFilter } from "./common/filters";
import { TransformInterceptor } from "./common/interceptors/transform.interceptor";
import { SwaggerModule } from "@nestjs/swagger";
import { createSwaggerConfig } from "./config/swagger.config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  // CORS configuration
  const corsOrigin = configService.get<string>("CORS_ORIGIN");

  app.enableCors({
    origin: corsOrigin?.split(",") || "*",
    credentials: true,
  });

  // Global prefix
  const apiPrefix = configService.get<string>("API_PREFIX") || "api/v1";

  app.setGlobalPrefix(apiPrefix);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global response interceptor
  app.useGlobalInterceptors(new TransformInterceptor());

  // Swagger configuration
  const config = createSwaggerConfig();
  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup(`${apiPrefix}/docs`, app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: "alpha",
      operationsSorter: "alpha",
    },
    customSiteTitle: "Task API Docs",
    customfavIcon: "https://nestjs.com/img/logo-small.svg",
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info { margin: 50px 0 }
    `,
  });

  // Port configuration
  const port = configService.get<number>("PORT") || 3000;

  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/${apiPrefix}/docs`);
}

void bootstrap();
