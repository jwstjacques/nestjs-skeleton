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
import {
  HEALTH_CHECK_MEMORY_HEAP_THRESHOLD,
  HEALTH_CHECK_MEMORY_RSS_THRESHOLD,
  HEALTH_CHECK_DISK_THRESHOLD,
  HEALTH_CHECK_DISK_PATH,
} from "../config/health.constants";

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
      // Memory heap check
      () => this.memory.checkHeap("memory_heap", HEALTH_CHECK_MEMORY_HEAP_THRESHOLD),
      // Memory RSS check
      () => this.memory.checkRSS("memory_rss", HEALTH_CHECK_MEMORY_RSS_THRESHOLD),
      // Disk storage check
      () =>
        this.disk.checkStorage("storage", {
          thresholdPercent: HEALTH_CHECK_DISK_THRESHOLD,
          path: HEALTH_CHECK_DISK_PATH,
        }),
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
      () => this.memory.checkHeap("memory_heap", HEALTH_CHECK_MEMORY_HEAP_THRESHOLD),
    ]);
  }
}
