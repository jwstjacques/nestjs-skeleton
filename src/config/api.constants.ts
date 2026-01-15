/**
 * API-wide constants and configuration values
 * Central location for all reusable string literals
 */

// API Versioning
export const API_VERSION = "1";
export const API_PREFIX = "api";
export const API_PATH = `${API_PREFIX}/v${API_VERSION}`;

/**
 * Server environment types
 */
export enum ServerEnvironment {
  DEVELOPMENT = "development",
  STAGING = "staging",
  PRODUCTION = "production",
  TEST = "test",
}

// Server Configuration
export const DEFAULT_PORT = 3000;
export const DEFAULT_HOST = "localhost";

// Swagger/Documentation
export const SWAGGER_PATH = "docs";
export const SWAGGER_TITLE = "NestJS API";
export const SWAGGER_DESCRIPTION =
  "A production-ready REST API built with NestJS, Prisma, and PostgreSQL";
export const SWAGGER_VERSION = "1.0";
export const SWAGGER_CONTACT_NAME = "API Support";
export const SWAGGER_CONTACT_EMAIL = "support@example.com";

// Default Values
export const DEFAULT_REDIS_HOST = "localhost";
export const DEFAULT_REDIS_PORT = 6379;
export const DEFAULT_CACHE_TTL = 30000; // 30 seconds

// CORS Configuration
export const CORS_ORIGINS = {
  DEVELOPMENT: ["http://localhost:3000", "http://localhost:3001"],
  PRODUCTION: [], // To be configured per deployment
} as const;

// API Response Headers
export const CUSTOM_HEADERS = {
  CORRELATION_ID: "X-Correlation-ID",
  REQUEST_ID: "X-Request-ID",
  API_VERSION: "X-API-Version",
} as const;
