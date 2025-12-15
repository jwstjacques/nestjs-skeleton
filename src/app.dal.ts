import { Injectable } from "@nestjs/common";
import { PrismaService } from "./database/prisma.service";

/**
 * Data Access Layer for application-level database operations
 */
@Injectable()
export class AppDal {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Execute a simple query to check database connectivity
   * @returns Promise that resolves when query completes
   */
  async checkDatabaseConnection(): Promise<void> {
    await this.prisma.$queryRaw`SELECT 1`;
  }

  /**
   * Get total count of users
   * @returns Promise with user count
   */
  async getUserCount(): Promise<number> {
    return this.prisma.user.count();
  }
}
