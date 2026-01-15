import { Module, Global } from "@nestjs/common";
import { ConfigModule as NestConfigModule } from "@nestjs/config";
import {
  appConfig,
  databaseConfig,
  cacheConfig,
  securityConfig,
  observabilityConfig,
  throttleConfig,
  paginationConfig,
  swaggerConfig,
} from "./providers";

/**
 * Application Configuration Module
 *
 * Centralized configuration management using NestJS ConfigModule.
 * This module is marked as @Global() to make ConfigService available
 * throughout the application without re-importing.
 *
 * Features:
 * - Loads and validates all environment variables at startup
 * - Provides type-safe configuration access via ConfigService
 * - Validates configuration using Zod schemas
 * - Fails fast on startup if required config is missing or invalid
 *
 * Usage:
 * ```typescript
 * import { ConfigService } from '@nestjs/config';
 *
 * constructor(private config: ConfigService) {}
 *
 * const port = this.config.get<number>('app.port');
 * const dbUrl = this.config.get<string>('database.url');
 * ```
 */
@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      // Make ConfigService globally available
      isGlobal: true,

      // Load all configuration providers
      load: [
        appConfig,
        databaseConfig,
        cacheConfig,
        securityConfig,
        observabilityConfig,
        throttleConfig,
        paginationConfig,
        swaggerConfig,
      ],

      // Cache configuration for better performance
      cache: true,

      // Expand environment variables (e.g., ${VAR_NAME})
      expandVariables: true,

      // Validation happens in each provider via Zod schemas
      // This ensures detailed error messages on startup
    }),
  ],
  exports: [NestConfigModule],
})
export class AppConfigModule {}
