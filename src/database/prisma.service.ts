import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private readonly pool: Pool;

  constructor() {
    // Create PostgreSQL connection pool
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    // Create Prisma adapter for PostgreSQL
    const adapter = new PrismaPg(pool);

    // Initialize PrismaClient with adapter
    super({
      adapter,
      log:
        process.env.NODE_ENV === "development"
          ? ["query", "info", "warn", "error"]
          : ["error", "warn"],
      errorFormat: "pretty",
    });

    this.pool = pool;
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
      this.logger.log("Successfully connected to database");
    } catch (error) {
      this.logger.error("Failed to connect to database", error);
      throw error;
    }
  }

  async onModuleDestroy(): Promise<void> {
    try {
      await this.$disconnect();
      await this.pool.end();
      this.logger.log("Successfully disconnected from database");
    } catch (error) {
      this.logger.error("Failed to disconnect from database", error);
    }
  }

  /**
   * Clean up database (useful for testing)
   * WARNING: This will delete all data!
   */
  async cleanDatabase(): Promise<void> {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Cannot clean database in production");
    }

    // Delete in order to respect foreign key constraints
    await this.task.deleteMany();
    await this.user.deleteMany();

    this.logger.warn("Database cleaned");
  }

  /**
   * Get database health status
   */
  async getHealth(): Promise<{ status: string; timestamp: Date }> {
    try {
      await this.$queryRaw`SELECT 1`;

      return {
        status: "healthy",
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error("Database health check failed", error);
      throw error;
    }
  }
}
