/**
 * API Constants
 *
 * Static API-wide constants that don't change based on environment.
 * For environment-dependent values, use ConfigService.
 *
 * @module config/constants
 */

/**
 * API Versioning
 */
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

/**
 * Swagger/Documentation constants
 */
export const SWAGGER_PATH = "docs";
export const SWAGGER_TITLE = "NestJS API";
export const SWAGGER_DESCRIPTION =
  "A production-ready REST API built with NestJS, Prisma, and PostgreSQL";
export const SWAGGER_VERSION = "1.0";
export const SWAGGER_CONTACT_NAME = "API Support";
export const SWAGGER_CONTACT_EMAIL = "support@example.com";

/**
 * API Response Headers
 */
export const CUSTOM_HEADERS = {
  CORRELATION_ID: "X-Correlation-ID",
  REQUEST_ID: "X-Request-ID",
  API_VERSION: "X-API-Version",
} as const;
