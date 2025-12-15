/**
 * Central configuration exports
 * Single import point for all configuration
 *
 * @example
 * ```typescript
 * import { AppConfigModule } from '@/config';
 * import { ConfigService } from '@nestjs/config';
 * ```
 */

// Configuration Module
export { AppConfigModule } from "./config.module";

// Configuration Schemas and Types
export * from "./schemas";

// Configuration Providers
export * from "./providers";

// Configuration Constants
export * from "./constants";

// Environment variable keys (kept for reference)
export * from "./environment.constants";

// Config functions
export { createSwaggerConfig } from "./swagger.config";
export { createHelmetConfig } from "./helmet.config";
