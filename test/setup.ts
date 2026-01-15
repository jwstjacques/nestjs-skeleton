import * as dotenv from "dotenv";
import { join } from "path";

// Load environment variables from .env file
dotenv.config({ path: join(__dirname, "../.env") });

// Set NODE_ENV to test if not already set
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = "test";
}

// Set required JWT secrets for testing if not already set
// These are minimum required values for E2E tests to run
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = "test-jwt-secret-key-minimum-32-characters-required-for-testing";
}

if (!process.env.JWT_REFRESH_SECRET) {
  process.env.JWT_REFRESH_SECRET =
    "test-jwt-refresh-secret-key-minimum-32-characters-required-for-testing";
}

// Set default JWT expiration times if not set
if (!process.env.JWT_EXPIRES_IN) {
  process.env.JWT_EXPIRES_IN = "7d";
}

if (!process.env.JWT_REFRESH_EXPIRES_IN) {
  process.env.JWT_REFRESH_EXPIRES_IN = "30d";
}

// Set default database URL for testing if not set
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    "postgresql://postgres:postgres@localhost:5432/taskdb_test?schema=public";
}

// Set default Redis configuration for testing if not set
if (!process.env.REDIS_HOST) {
  process.env.REDIS_HOST = "localhost";
}

if (!process.env.REDIS_PORT) {
  process.env.REDIS_PORT = "6379";
}

// Set high throttle limits for testing to prevent rate limiting during tests
// Short-term throttle (1 second window)
if (!process.env.THROTTLE_SHORT_TTL) {
  process.env.THROTTLE_SHORT_TTL = "1000";
}
if (!process.env.THROTTLE_SHORT_LIMIT) {
  process.env.THROTTLE_SHORT_LIMIT = "1000";
}

// Medium-term throttle (10 second window)
if (!process.env.THROTTLE_MEDIUM_TTL) {
  process.env.THROTTLE_MEDIUM_TTL = "10000";
}
if (!process.env.THROTTLE_MEDIUM_LIMIT) {
  process.env.THROTTLE_MEDIUM_LIMIT = "5000";
}

// Long-term throttle (1 minute window)
if (!process.env.THROTTLE_LONG_TTL) {
  process.env.THROTTLE_LONG_TTL = "60000";
}
if (!process.env.THROTTLE_LONG_LIMIT) {
  process.env.THROTTLE_LONG_LIMIT = "10000";
}

// Strict throttle (15 minute window)
if (!process.env.THROTTLE_STRICT_TTL) {
  process.env.THROTTLE_STRICT_TTL = "900000";
}
if (!process.env.THROTTLE_STRICT_LIMIT) {
  process.env.THROTTLE_STRICT_LIMIT = "1000";
}

// Global teardown to ensure all async operations complete
afterAll(async () => {
  // Give any remaining async operations time to complete
  await new Promise((resolve) => setTimeout(resolve, 100));
});
