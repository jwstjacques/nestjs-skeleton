/**
 * ConfigService Mock Utility
 *
 * Provides a mock implementation of NestJS ConfigService for testing.
 * Includes default values for all configuration namespaces.
 *
 * @example
 * ```typescript
 * import { createMockConfigService } from '@test/utils/config.mock';
 *
 * const mockConfig = createMockConfigService();
 * // Or with overrides
 * const mockConfig = createMockConfigService({
 *   'app.port': 4000,
 *   'database.url': 'postgresql://test',
 * });
 * ```
 */

/**
 * Default configuration values for testing
 * Mirrors the structure from config providers
 */
export const DEFAULT_TEST_CONFIG = {
  // App Configuration
  "app.nodeEnv": "test",
  "app.port": 3000,
  "app.host": "localhost",
  "app.apiPrefix": "api",

  // Database Configuration - use real DATABASE_URL from env for integration tests
  "database.url": process.env.DATABASE_URL || "postgresql://test:test@localhost:5432/test",
  "database.host": "localhost",
  "database.port": 5432,
  "database.user": "test",
  "database.password": "test",
  "database.database": "test",
  "database.ssl": false,

  // Cache Configuration
  "cache.redis.host": "localhost",
  "cache.redis.port": 6379,
  "cache.redis.password": undefined,
  "cache.redis.db": 0,
  "cache.ttl.veryShort": 30_000,
  "cache.ttl.short": 60_000,
  "cache.ttl.medium": 300_000,
  "cache.ttl.long": 900_000,
  "cache.ttl.veryLong": 1_800_000,
  "cache.ttl.hour": 3_600_000,
  "cache.ttl.day": 86_400_000,

  // Security Configuration - JWT
  "security.jwt.secret": "test-secret-key-minimum-32-characters",
  "security.jwt.expiresIn": "15m",
  "security.jwt.refreshSecret": "test-refresh-secret-key-minimum-32-characters",
  "security.jwt.refreshExpiresIn": "7d",

  // Security Configuration - CORS
  "security.cors.origin": "*",
  "security.cors.credentials": true,

  // Security Configuration - Helmet
  "security.helmet.contentSecurityPolicy": undefined,
  "security.helmet.crossOriginEmbedderPolicy": true,
  "security.helmet.crossOriginOpenerPolicy": true,
  "security.helmet.crossOriginResourcePolicy": true,

  // Observability Configuration - Logging
  "observability.logging.level": "info",
  "observability.logging.dir": "logs",
  "observability.logging.fileMaxSize": 10_485_760,
  "observability.logging.fileMaxFiles": 5,
  "observability.logging.timestampFormat": "YYYY-MM-DD HH:mm:ss",
  "observability.logging.appLogFilename": "application.log",
  "observability.logging.errorLogFilename": "error.log",

  // Observability Configuration - Health
  "observability.health.memoryHeapMB": 150,
  "observability.health.memoryRssMB": 300,
  "observability.health.diskThreshold": 0.9,
  "observability.health.diskPath": "/",

  // Throttle Configuration
  "throttle.short.ttl": 1000,
  "throttle.short.limit": 10,
  "throttle.medium.ttl": 10_000,
  "throttle.medium.limit": 20,
  "throttle.long.ttl": 60_000,
  "throttle.long.limit": 100,
  "throttle.strict.ttl": 900_000,
  "throttle.strict.limit": 5,

  // Pagination Configuration
  "pagination.defaultLimit": 10,
  "pagination.maxLimit": 100,
  "pagination.defaultPage": 1,

  // Swagger Configuration
  "swagger.enabled": true,
  "swagger.path": "docs",
  "swagger.title": "NestJS API",
  "swagger.description": "A production-ready REST API built with NestJS",
  "swagger.version": "1.0",
  "swagger.contactName": "API Support",
  "swagger.contactEmail": undefined,
  "swagger.contactUrl": undefined,

  // Legacy direct env vars (for backward compatibility during migration)
  NODE_ENV: "test",
  PORT: "3000",
  DATABASE_URL: "postgresql://test:test@localhost:5432/test",
} as const;

/**
 * Type for configuration overrides
 */
export type ConfigOverrides = Partial<typeof DEFAULT_TEST_CONFIG> & Record<string, unknown>;

/**
 * Create a mock ConfigService for testing
 *
 * @param overrides - Optional configuration overrides
 * @returns Mock ConfigService with get() and getOrThrow() methods
 *
 * @example
 * ```typescript
 * const mockConfig = createMockConfigService({
 *   'app.port': 4000,
 *   'database.url': 'postgresql://custom',
 * });
 *
 * expect(mockConfig.get('app.port')).toBe(4000);
 * ```
 */
export function createMockConfigService(overrides: ConfigOverrides = {}) {
  const config = { ...DEFAULT_TEST_CONFIG, ...overrides };

  return {
    /**
     * Get configuration value by key
     * @param key - Configuration key (e.g., 'app.port')
     * @param defaultValue - Default value if key not found
     */
    get: jest.fn(<T = unknown>(key: string, defaultValue?: T): T => {
      const value = config[key as keyof typeof config];

      return (value !== undefined ? value : defaultValue) as T;
    }),

    /**
     * Get configuration value or throw if not found
     * @param key - Configuration key (e.g., 'app.port')
     */
    getOrThrow: jest.fn(<T = unknown>(key: string): T => {
      const value = config[key as keyof typeof config];

      if (value === undefined) {
        throw new Error(`Configuration key "${key}" not found`);
      }

      return value as T;
    }),
  };
}

/**
 * Create a minimal mock ConfigService (for simple tests)
 * Only includes get() method with basic functionality
 */
export function createMinimalMockConfigService(overrides: ConfigOverrides = {}) {
  const config = { ...DEFAULT_TEST_CONFIG, ...overrides };

  return {
    get: jest.fn((key: string, defaultValue?: unknown) => {
      const value = config[key as keyof typeof config];

      return value !== undefined ? value : defaultValue;
    }),
  };
}
