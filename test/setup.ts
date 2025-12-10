import * as dotenv from "dotenv";
import { join } from "path";

// Load environment variables from .env file
dotenv.config({ path: join(__dirname, "../.env") });

// Set NODE_ENV to test if not already set
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = "test";
}

// Global teardown to ensure all async operations complete
afterAll(async () => {
  // Give any remaining async operations time to complete
  await new Promise((resolve) => setTimeout(resolve, 100));
});
