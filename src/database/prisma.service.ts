import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaClient, Prisma } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { CorrelationService } from "@app/common/correlation";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private readonly pool: Pool;

  constructor(
    private readonly correlationService: CorrelationService,
    private readonly configService: ConfigService,
  ) {
    // Get DATABASE_URL from config
    const dbUrl = configService.get<string>("database.url");

    if (!dbUrl) {
      throw new Error("DATABASE_URL is not configured");
    }

    // Parse DATABASE_URL to get connection details
    let url: URL;

    try {
      url = new URL(dbUrl);
    } catch {
      throw new Error(`Invalid DATABASE_URL format: ${dbUrl}`);
    }

    // Get environment and SSL settings from config
    const nodeEnv = configService.get<string>("app.nodeEnv", "development");
    const useSsl = nodeEnv === "production";

    // Create PostgreSQL connection pool with explicit configuration
    const pool = new Pool({
      host: url.hostname,
      port: parseInt(url.port || "5432"),
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1), // Remove leading slash
      ssl: useSsl ? { rejectUnauthorized: false } : false,
    });

    // Create Prisma adapter for PostgreSQL
    const adapter = new PrismaPg(pool);

    // Get log level based on environment
    const isDevelopment = nodeEnv === "development";

    // Initialize PrismaClient with adapter via parent constructor
    super({
      adapter,
      log: isDevelopment ? ["query", "info", "warn", "error"] : ["error", "warn"],
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
      const nodeEnv = this.configService.get<string>("app.nodeEnv", "development");

      if (nodeEnv === "development") {
        (this as PrismaClient).$on("query" as never, (e: Prisma.QueryEvent) => {
          const queryContext = this.correlationService.getLogContext();

          this.logger.debug(`${queryContext} Query: ${e.query}`);
          this.logger.debug(`${queryContext} Duration: ${e.duration}ms`);
        });
      }

      // Log errors with correlation ID
      (this as PrismaClient).$on("error" as never, (e: Prisma.LogEvent) => {
        const errorContext = this.correlationService.getLogContext();

        this.logger.error(`${errorContext} Database error: ${e.message}`);
      });

      // Log warnings with correlation ID
      (this as PrismaClient).$on("warn" as never, (e: Prisma.LogEvent) => {
        const warnContext = this.correlationService.getLogContext();

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
