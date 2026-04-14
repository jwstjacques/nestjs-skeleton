import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Observable } from "rxjs";
import { finalize } from "rxjs/operators";
import { performance } from "node:perf_hooks";

@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  private readonly logger = new Logger(PerformanceInterceptor.name);
  private readonly slowThresholdMs: number;

  constructor(private readonly configService: ConfigService) {
    this.slowThresholdMs = this.configService.get<number>(
      "observability.performance.slowThresholdMs",
      1000,
    );
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const request = context.switchToHttp().getRequest();
    const { method, url } = request as { method: string; url: string };
    const startTime = performance.now();

    return next.handle().pipe(
      finalize(() => {
        const duration = Math.round(performance.now() - startTime);

        if (duration > this.slowThresholdMs) {
          this.logger.warn(`Slow request: ${method} ${url} - ${duration}ms`);
        } else {
          this.logger.log(`${method} ${url} - ${duration}ms`);
        }
      }),
    );
  }
}
