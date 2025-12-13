import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiOkResponse } from "@nestjs/swagger";
import { SkipThrottle } from "@nestjs/throttler";
import { AppService } from "./app.service";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get("status")
  @SkipThrottle() // Status checks should not be rate limited (for monitoring tools)
  @ApiOperation({
    summary: "Simple status check",
    description:
      "Returns basic API status for quick monitoring (uptime, environment, database connectivity)",
  })
  @ApiOkResponse({
    description: "API is healthy",
    schema: {
      example: {
        status: "ok",
        timestamp: "2025-11-28T10:30:00.000Z",
        uptime: 12345.67,
        environment: "development",
        database: {
          status: "connected",
          latency: "5ms",
        },
      },
    },
  })
  async getStatus() {
    return this.appService.getHealth();
  }

  @Get("stats")
  @SkipThrottle() // Statistics are read-only and can be called frequently
  @ApiOperation({
    summary: "Get application statistics",
    description: "Returns statistics about users and tasks",
  })
  @ApiOkResponse({
    description: "Statistics retrieved successfully",
    schema: {
      example: {
        users: 10,
        tasks: 42,
        tasksByStatus: {
          TODO: 15,
          IN_PROGRESS: 12,
          COMPLETED: 15,
        },
      },
    },
  })
  async getStats() {
    return this.appService.getStats();
  }
}
