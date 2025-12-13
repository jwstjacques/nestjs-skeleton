import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { CorrelationService } from "@app/common/correlation";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private readonly pool: Pool;

  constructor(private readonly correlationService: CorrelationService) {
    // Validate DATABASE_URL exists
    const dbUrl = process.env.DATABASE_URL;

    if (!dbUrl) {
      throw new Error("DATABASE_URL environment variable is not set");
    }

    // Parse DATABASE_URL to get connection details
    let url: URL;

    try {
      url = new URL(dbUrl);
    } catch {
      throw new Error(`Invalid DATABASE_URL format: ${dbUrl}`);
    }

    // Create PostgreSQL connection pool with explicit configuration
    const pool = new Pool({
      host: url.hostname,
      port: parseInt(url.port || "5432"),
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1), // Remove leading slash
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
    });

    // Create Prisma adapter for PostgreSQL
    const adapter = new PrismaPg(pool);

    // Initialize PrismaClient with adapter via parent constructor
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

      const context = this.correlationService.getLogContext();

      this.logger.log(`${context} Successfully connected to database`);

      // Log queries in development with correlation ID for performance debugging
      if (process.env.NODE_ENV === "development") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.$on("query" as never, (e: any) => {
          const queryContext = this.correlationService.getLogContext();

          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          this.logger.debug(`${queryContext} Query: ${e.query}`);
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          this.logger.debug(`${queryContext} Duration: ${e.duration}ms`);
        });
      }

      // Log errors with correlation ID
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.$on("error" as never, (e: any) => {
        const errorContext = this.correlationService.getLogContext();

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        this.logger.error(`${errorContext} Database error: ${e.message}`);
      });

      // Log warnings with correlation ID
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.$on("warn" as never, (e: any) => {
        const warnContext = this.correlationService.getLogContext();

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        this.logger.warn(`${warnContext} Database warning: ${e.message}`);
      });
    } catch (error) {
      const context = this.correlationService.getLogContext();

      this.logger.error(`${context} Failed to connect to database`, error);
      throw error;
    }
  }

  async onModuleDestroy(): Promise<void> {
    try {
      await this.$disconnect();
      await this.pool.end();

      const context = this.correlationService.getLogContext();

      this.logger.log(`${context} Successfully disconnected from database`);
    } catch (error) {
      const context = this.correlationService.getLogContext();

      this.logger.error(`${context} Failed to disconnect from database`, error);
    }
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
