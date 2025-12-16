/**
 * Global setup for E2E tests
 * Runs BEFORE Jest loads any test files or modules
 * Sets required environment variables for test environment
 */

import { execSync } from "child_process";

// Set NODE_ENV to test
process.env.NODE_ENV = "test";

// Set required JWT secrets for testing (must be 32+ characters)
process.env.JWT_SECRET = "test-jwt-secret-key-minimum-32-characters-required-for-testing-purposes";
process.env.JWT_REFRESH_SECRET =
  "test-jwt-refresh-secret-key-minimum-32-characters-required-for-testing-purposes";

// Set JWT expiration times
process.env.JWT_EXPIRES_IN = "7d";
process.env.JWT_REFRESH_EXPIRES_IN = "30d";

// Database configuration
process.env.DATABASE_URL =
  "postgresql://postgres:postgres@localhost:5432/taskdb_test?schema=public";

// Redis configuration
process.env.REDIS_HOST = "localhost";
process.env.REDIS_PORT = "6379";

// High throttle limits to prevent rate limiting during tests
process.env.THROTTLE_SHORT_TTL = "60000";
process.env.THROTTLE_SHORT_LIMIT = "1000";
process.env.THROTTLE_MEDIUM_TTL = "60000";
process.env.THROTTLE_MEDIUM_LIMIT = "1000";
process.env.THROTTLE_LONG_TTL = "60000";
process.env.THROTTLE_LONG_LIMIT = "1000";

// Application configuration
process.env.PORT = "3001";
process.env.HOST = "localhost";
process.env.API_PREFIX = "api/v1";

// Logging
process.env.LOG_LEVEL = "error"; // Reduce noise during tests

// Swagger
process.env.SWAGGER_ENABLED = "false";

// Pagination
process.env.PAGINATION_DEFAULT_LIMIT = "10";
process.env.PAGINATION_MAX_LIMIT = "100";

/**
 * Global setup function that runs before all tests
 * Ensures test database schema is up-to-date
 */
export default () => {
  console.log("\n🔧 Setting up E2E test environment...");

  // Skip database setup if SKIP_DB_SETUP is set (e.g., in CI where schema is already pushed)
  if (process.env.SKIP_DB_SETUP === "true") {
    console.log("   ⏭️  Skipping database setup (SKIP_DB_SETUP=true)");
    console.log("   ✓ E2E test setup complete\n");

    return;
  }

  try {
    // Push Prisma schema to test database (creates/updates tables)
    console.log("   ⏳ Synchronizing database schema...");
    execSync("npx prisma db push --force-reset --accept-data-loss", {
      env: process.env,
      stdio: "pipe", // Suppress Prisma output unless there's an error
    });

    console.log("   ✓ Database schema synchronized");
    console.log("   ✓ E2E test setup complete\n");
  } catch (error) {
    console.error("   ❌ Failed to setup test database:");
    console.error(error instanceof Error ? error.message : String(error));
    throw error;
  }
};
