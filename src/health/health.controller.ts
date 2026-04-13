import { Controller, Get, Inject } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ApiTags, ApiOperation, ApiOkResponse } from "@nestjs/swagger";
import {
  HealthCheckService,
  PrismaHealthIndicator,
  HealthCheck,
  MemoryHealthIndicator,
  DiskHealthIndicator,
  type HealthIndicatorResult,
} from "@nestjs/terminus";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { PrismaService } from "../database/prisma.service";
import { Public } from "@app/auth/decorators";

@ApiTags("health")
@Controller("health")
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prismaHealth: PrismaHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
    private prisma: PrismaService,
    private configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
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
      // Redis health
      () => this.checkRedis(),
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
      // Redis health
      () => this.checkRedis(),
      // Memory within limits - get thresholds from config
      () =>
        this.memory.checkHeap(
          "memory_heap",
          this.configService.get<number>("observability.health.memoryHeapMB", 150) * 1024 * 1024,
        ),
    ]);
  }

  private async checkRedis(): Promise<HealthIndicatorResult> {
    try {
      const testKey = "health:ping";
      const testValue = Date.now().toString();

      await this.cacheManager.set(testKey, testValue, 10);
      const result = await this.cacheManager.get<string>(testKey);

      if (result === testValue) {
        return { redis: { status: "up" } };
      }

      return { redis: { status: "down", message: "Read-back mismatch" } };
    } catch (error) {
      return { redis: { status: "down", message: (error as Error).message } };
    }
  }
}
