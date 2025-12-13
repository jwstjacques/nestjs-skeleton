import { Injectable } from "@nestjs/common";
import { AppDal } from "./app.dal";

@Injectable()
export class AppService {
  constructor(private readonly appDal: AppDal) {}

  /**
   * Get status of the API including database connectivity
   * Simple, fast check for basic monitoring
   */
  async getHealth() {
    let dbStatus = "disconnected";
    let dbLatency = 0;

    try {
      const start = Date.now();

      await this.appDal.checkDatabaseConnection();
      dbLatency = Date.now() - start;
      dbStatus = "connected";
    } catch {
      dbStatus = "error";
    }

    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
      database: {
        status: dbStatus,
        latency: `${dbLatency}ms`,
      },
    };
  }

  /**
   * Get application statistics including user and task counts
   */
  async getStats() {
    const userCount = await this.appDal.getUserCount();
    const taskCount = await this.appDal.getTaskCount();
    const tasksByStatus = await this.appDal.getTasksByStatus();

    return {
      users: userCount,
      tasks: taskCount,
      tasksByStatus: tasksByStatus.reduce(
        (acc, curr) => {
          acc[curr.status] = curr._count;

          return acc;
        },
        {} as Record<string, number>,
      ),
    };
  }
}
