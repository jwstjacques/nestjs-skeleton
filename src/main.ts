import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe, LoggerService, VersioningType } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HttpExceptionFilter } from "./common/filters";
import { CorrelationService } from "./common/correlation";
import { TransformInterceptor } from "./common/interceptors/transform.interceptor";
import { SwaggerModule } from "@nestjs/swagger";
import { createSwaggerConfig, createHelmetConfig } from "./config";
import compression from "compression";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import helmet from "helmet";
import { spawn, ChildProcess } from "child_process";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Get ConfigService for all configuration needs
  const configService = app.get(ConfigService);

  // Logging
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  // Security headers - pass configService
  app.use(helmet(createHelmetConfig(configService)));

  // Compression
  app.use(compression());

  // CORS configuration - get from config
  const corsOrigin = configService.get<string | string[]>("security.cors.origin", "*");
  const corsCredentials = configService.get<boolean>("security.cors.credentials", true);

  app.enableCors({
    origin:
      typeof corsOrigin === "string" && corsOrigin.includes(",")
        ? corsOrigin.split(",").map((s) => s.trim())
        : corsOrigin,
    credentials: corsCredentials,
  });

  // Enable URI versioning (routes: /api/v1/tasks, /api/v2/tasks)
  app.enableVersioning({
    type: VersioningType.URI,
    prefix: "api/v",
    defaultVersion: "1",
  });

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

  // Swagger configuration - pass configService
  const swaggerPath = configService.get<string>("swagger.path", "docs");
  const config = createSwaggerConfig(configService);
  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup(swaggerPath, app, document, {
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

  // Port configuration - get from config
  const port = configService.get<number>("app.port", 3000);
  const host = configService.get<string>("app.host", "localhost");

  await app.listen(port);

  const logger = app.get<LoggerService>(WINSTON_MODULE_NEST_PROVIDER);

  logger.log(`🚀 Application is running on: http://${host}:${port}`, "Bootstrap");
  logger.log(`📚 API Documentation: http://${host}:${port}/${swaggerPath}`, "Bootstrap");
  logger.log(`❤️  Health check: http://${host}:${port}/api/v1/health`, "Bootstrap");
  logger.log(`🔄 API v1: http://${host}:${port}/api/v1/*`, "Bootstrap");
  logger.log(`🆕 API v2: http://${host}:${port}/api/v2/*`, "Bootstrap");

  // Prisma Studio (non-production only)
  const nodeEnv = configService.get<string>("app.env", "development");
  let studioProcess: ChildProcess | null = null;
  const studioPort = 5555;

  if (nodeEnv !== "production") {
    studioProcess = spawn(
      "npx",
      ["prisma", "studio", "--port", String(studioPort), "--browser", "none"],
      {
        stdio: "ignore",
        detached: false,
      },
    );

    studioProcess.on("error", (err) => {
      logger.warn(`Prisma Studio failed to start: ${err.message}`, "Bootstrap");
    });

    logger.log(`🔍 Prisma Studio: http://${host}:${studioPort}`, "Bootstrap");
  }

  // Enable graceful shutdown
  app.enableShutdownHooks();

  // Handle shutdown signals
  const signals = ["SIGTERM", "SIGINT"] as const;

  signals.forEach((signal) => {
    process.on(signal, () => {
      void (async () => {
        logger.log(`Received ${signal}, starting graceful shutdown...`, "Bootstrap");

        // Kill Prisma Studio if running
        if (studioProcess) {
          studioProcess.kill();
        }

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
