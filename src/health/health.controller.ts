import { Controller, Get } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiOkResponse } from "@nestjs/swagger";
import {
  HealthCheckService,
  HttpHealthIndicator,
  PrismaHealthIndicator,
  HealthCheck,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from "@nestjs/terminus";
import { PrismaService } from "../database/prisma.service";

@ApiTags("health")
@Controller("health")
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private prismaHealth: PrismaHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
    private prisma: PrismaService,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: "Comprehensive health check" })
  @ApiOkResponse({
    description: "Health check passed",
    schema: {
      example: {
        status: "ok",
        info: {
          database: { status: "up" },
          memory_heap: { status: "up" },
          memory_rss: { status: "up" },
          storage: { status: "up" },
        },
        error: {},
        details: {
          database: { status: "up" },
          memory_heap: { status: "up" },
          memory_rss: { status: "up" },
          storage: { status: "up" },
        },
      },
    },
  })
  check() {
    return this.health.check([
      // Database health
      () => this.prismaHealth.pingCheck("database", this.prisma),
      // Memory heap check (max 150MB)
      () => this.memory.checkHeap("memory_heap", 150 * 1024 * 1024),
      // Memory RSS check (max 300MB)
      () => this.memory.checkRSS("memory_rss", 300 * 1024 * 1024),
      // Disk storage check (max 90% usage)
      () => this.disk.checkStorage("storage", { thresholdPercent: 0.9, path: "/" }),
    ]);
  }

  @Get("liveness")
  @HealthCheck()
  @ApiOperation({ summary: "Liveness probe (Kubernetes)" })
  @ApiOkResponse({ description: "Service is alive" })
  checkLiveness() {
    return this.health.check([
      // Basic check - is the service responding?
      () => Promise.resolve({ api: { status: "up" } }),
    ]);
  }

  @Get("readiness")
  @HealthCheck()
  @ApiOperation({ summary: "Readiness probe (Kubernetes)" })
  @ApiOkResponse({ description: "Service is ready to accept traffic" })
  checkReadiness() {
    return this.health.check([
      // Database must be available
      () => this.prismaHealth.pingCheck("database", this.prisma),
      // Memory within limits
      () => this.memory.checkHeap("memory_heap", 150 * 1024 * 1024),
    ]);
  }
}
