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
  private readonly heapThresholdBytes: number;
  private readonly rssThresholdBytes: number;
  private readonly diskThresholdPercent: number;
  private readonly diskPath: string;

  constructor(
    private health: HealthCheckService,
    private prismaHealth: PrismaHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
    private prisma: PrismaService,
    configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.heapThresholdBytes =
      configService.get<number>("observability.health.memoryHeapMB", 150) * 1024 * 1024;
    this.rssThresholdBytes =
      configService.get<number>("observability.health.memoryRssMB", 300) * 1024 * 1024;
    this.diskThresholdPercent =
      configService.get<number>("observability.health.diskThreshold", 0.9) * 100;
    this.diskPath = configService.get<string>("observability.health.diskPath", "/");
  }

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
          redis: { status: "up" },
          memory_heap: { status: "up" },
          memory_rss: { status: "up" },
          storage: { status: "up" },
        },
        error: {},
        details: {
          database: { status: "up" },
          redis: { status: "up" },
          memory_heap: { status: "up" },
          memory_rss: { status: "up" },
          storage: { status: "up" },
        },
      },
    },
  })
  check() {
    return this.health.check([
      () => this.prismaHealth.pingCheck("database", this.prisma),
      () => this.checkRedis(),
      () => this.memory.checkHeap("memory_heap", this.heapThresholdBytes),
      () => this.memory.checkRSS("memory_rss", this.rssThresholdBytes),
      () =>
        this.disk.checkStorage("storage", {
          thresholdPercent: this.diskThresholdPercent,
          path: this.diskPath,
        }),
    ]);
  }

  @Public()
  @Get("liveness")
  @HealthCheck()
  @ApiOperation({ summary: "Liveness probe (Kubernetes)" })
  @ApiOkResponse({ description: "Service is alive" })
  checkLiveness() {
    return this.health.check([() => Promise.resolve({ api: { status: "up" } })]);
  }

  @Public()
  @Get("readiness")
  @HealthCheck()
  @ApiOperation({ summary: "Readiness probe (Kubernetes)" })
  @ApiOkResponse({ description: "Service is ready to accept traffic" })
  checkReadiness() {
    return this.health.check([
      () => this.prismaHealth.pingCheck("database", this.prisma),
      () => this.checkRedis(),
      () => this.memory.checkHeap("memory_heap", this.heapThresholdBytes),
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
