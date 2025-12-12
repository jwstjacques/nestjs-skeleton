import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiOkResponse } from "@nestjs/swagger";
import { AppService } from "./app.service";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get("health")
  @ApiOperation({
    summary: "Health check",
    description: "Returns the health status of the API",
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
  async getHealth() {
    return this.appService.getHealth();
  }

  @Get("stats")
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
          DONE: 15,
        },
      },
    },
  })
  async getStats() {
    return this.appService.getStats();
  }
}
