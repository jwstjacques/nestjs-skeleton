import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient | null = null;

/**
 * Get or create a Prisma instance for testing
 * @returns PrismaClient instance
 */
function getPrisma() {
  if (!prisma) {
    // Ensure we're in test environment
    if (process.env.NODE_ENV !== "test") {
      throw new Error(
        "getPrisma() should only be used in test environment. Current NODE_ENV: " +
          process.env.NODE_ENV,
      );
    }

    // Ensure we're connecting to a test database
    const dbUrl = process.env.DATABASE_URL || "";

    if (!dbUrl.includes("test") && !dbUrl.includes("_test")) {
      throw new Error(
        "Database URL must contain 'test' or '_test' to prevent accidental data loss. Current DATABASE_URL: " +
          dbUrl,
      );
    }

    prisma = new PrismaClient();
  }

  return prisma;
}

/**
 * Disconnect from the database
 * Should be called in afterAll() hooks
 */
export async function disconnectDatabase() {
  if (prisma) {
    await prisma.$disconnect();
    prisma = null;
  }
}

export { getPrisma as prisma };
