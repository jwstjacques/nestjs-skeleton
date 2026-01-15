import { Injectable, ExecutionContext, Logger, CallHandler } from "@nestjs/common";
import { CacheInterceptor as NestCacheInterceptor } from "@nestjs/cache-manager";
import { Observable, of } from "rxjs";

@Injectable()
export class HttpCacheInterceptor extends NestCacheInterceptor {
  private readonly logger = new Logger(HttpCacheInterceptor.name);

  /**
   * Override intercept to prevent caching of error responses (4xx, 5xx)
   */
  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<unknown>> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const request = context.switchToHttp().getRequest();
    const { httpAdapter } = this.httpAdapterHost;

    // Only cache GET requests
    if (httpAdapter.getRequestMethod(request) !== "GET") {
      return next.handle();
    }

    const cacheKey = this.trackBy(context);

    if (!cacheKey) {
      return next.handle();
    }

    // Try to get from cache first
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const cachedResponse = await this.cacheManager.get(cacheKey);

      if (cachedResponse) {
        this.logger.debug(`Cache hit for key: ${cacheKey}`);

        return of(cachedResponse);
      }
    } catch (err) {
      this.logger.error(`Cache get error: ${(err as Error).message}`);
    }

    // Cache miss - execute request and cache only successful responses
    const response$ = next.handle();

    // We need to intercept the response stream
    return new Observable((observer) => {
      response$.subscribe({
        next: (response: unknown) => {
          // Check if response indicates an error (statusCode >= 400)
          let hasErrorStatus = false;
          let responseStatusCode: number | undefined;

          if (response && typeof response === "object" && "statusCode" in response) {
            responseStatusCode = response.statusCode as number;

            if (typeof responseStatusCode === "number" && responseStatusCode >= 400) {
              hasErrorStatus = true;
            }
          }

          if (hasErrorStatus) {
            this.logger.debug(
              `Not caching error response with status ${responseStatusCode ?? "unknown"} for key: ${cacheKey}`,
            );
          } else {
            // Cache successful response (fire and forget)
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
            void this.cacheManager.set(cacheKey, response).then(() => {
              this.logger.debug(`Cached successful response for key: ${cacheKey}`);
            });
          }

          observer.next(response);
        },
        error: (err: Error) => observer.error(err),
        complete: () => observer.complete(),
      });
    });
  }

  trackBy(context: ExecutionContext): string | undefined {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const request = context.switchToHttp().getRequest();
    const { httpAdapter } = this.httpAdapterHost;

    // Only cache GET requests
    if (httpAdapter.getRequestMethod(request) !== "GET") {
      return undefined;
    }

    // Build cache key from URL and query parameters
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const url = httpAdapter.getRequestUrl(request);

    // Extract user ID from JWT token (since interceptors run before guards)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const authHeader = request.headers?.authorization as string | undefined;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);

      try {
        // Decode JWT (without verification - just to get the payload for cache key)
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        const userId = payload.sub || payload.id;

        if (userId) {
          const cacheKey = `${url}:user:${userId}`;

          this.logger.debug(`Cache key with user: ${cacheKey}`);

          return cacheKey;
        }
      } catch (error) {
        // If JWT decode fails, fall back to URL-only cache key
        this.logger.warn("Failed to decode JWT for cache key: " + (error as Error).message);
      }
    }

    this.logger.debug(`Cache key without user: ${String(url)}`);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return url;
  }
}
