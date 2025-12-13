import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe, LoggerService } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HttpExceptionFilter } from "./common/filters";
import { CorrelationService } from "./common/correlation";
import { TransformInterceptor } from "./common/interceptors/transform.interceptor";
import { SwaggerModule } from "@nestjs/swagger";
import { createSwaggerConfig } from "./config/swagger.config";
import compression from "compression";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import helmet from "helmet";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Logging
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  // Security headers
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
      crossOriginEmbedderPolicy: false,
    }),
  );

  // Compression
  app.use(compression());

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

  // Global exception filter (inject CorrelationService from app context)
  const correlationService = app.get(CorrelationService);

  app.useGlobalFilters(new HttpExceptionFilter(correlationService));

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

  const logger = app.get<LoggerService>(WINSTON_MODULE_NEST_PROVIDER);

  logger.log(`🚀 Application is running on: http://localhost:${port}`, "Bootstrap");
  logger.log(`📚 API Documentation: http://localhost:${port}/${apiPrefix}/docs`, "Bootstrap");
  logger.log(`❤️  Health check: http://localhost:${port}/${apiPrefix}/health`, "Bootstrap");

  // Enable graceful shutdown
  app.enableShutdownHooks();

  // Handle shutdown signals
  const signals = ["SIGTERM", "SIGINT"] as const;

  signals.forEach((signal) => {
    process.on(signal, () => {
      void (async () => {
        logger.log(`Received ${signal}, starting graceful shutdown...`, "Bootstrap");

        try {
          await app.close();
          logger.log("Application closed successfully", "Bootstrap");
          process.exit(0);
        } catch (error) {
          logger.error("Error during shutdown", error as Error, "Bootstrap");
          process.exit(1);
        }
      })();
    });
  });
}

void bootstrap();
