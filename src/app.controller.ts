import { Controller, Get } from "@nestjs/common";
import { PrismaService } from "./database/prisma.service";

@Controller()
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  @Get("health")
  async getHealth(): Promise<object> {
    let dbStatus = "disconnected";
    let dbLatency = 0;

    try {
      const start = Date.now();

      await this.prisma.$queryRaw`SELECT 1`;
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

  @Get("stats")
  async getStats(): Promise<object> {
    const userCount = await this.prisma.user.count();
    const taskCount = await this.prisma.task.count();
    const tasksByStatus = await this.prisma.task.groupBy({
      by: ["status"],
      _count: true,
    });

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
