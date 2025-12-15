import { Controller, Get } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
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
import { Public } from "@app/auth/decorators";

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
    private configService: ConfigService,
  ) {}

  @Public()
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
      // Memory heap check - get threshold from config
      () =>
        this.memory.checkHeap(
          "memory_heap",
          this.configService.get<number>("observability.health.memoryHeapMB", 150) * 1024 * 1024,
        ),
      // Memory RSS check - get threshold from config
      () =>
        this.memory.checkRSS(
          "memory_rss",
          this.configService.get<number>("observability.health.memoryRssMB", 300) * 1024 * 1024,
        ),
      // Disk storage check - get threshold and path from config
      () =>
        this.disk.checkStorage("storage", {
          thresholdPercent:
            this.configService.get<number>("observability.health.diskThreshold", 0.9) * 100,
          path: this.configService.get<string>("observability.health.diskPath", "/"),
        }),
    ]);
  }

  @Public()
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

  @Public()
  @Get("readiness")
  @HealthCheck()
  @ApiOperation({ summary: "Readiness probe (Kubernetes)" })
  @ApiOkResponse({ description: "Service is ready to accept traffic" })
  checkReadiness() {
    return this.health.check([
      // Database must be available
      () => this.prismaHealth.pingCheck("database", this.prisma),
      // Memory within limits - get thresholds from config
      () =>
        this.memory.checkHeap(
          "memory_heap",
          this.configService.get<number>("observability.health.memoryHeapMB", 150) * 1024 * 1024,
        ),
    ]);
  }
}
