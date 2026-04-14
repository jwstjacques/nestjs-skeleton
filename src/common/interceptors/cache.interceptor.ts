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
            /* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
            void this.cacheManager
              .set(cacheKey, response)
              .then(() => {
                this.logger.debug(`Cached successful response for key: ${cacheKey}`);
              })
              .catch((err: Error) => {
                this.logger.error(`Cache set error for key ${cacheKey}: ${err.message}`);
              });
            /* eslint-enable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
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

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const url = httpAdapter.getRequestUrl(request);

    // Use the verified user object from the auth guard (populated by Passport
    // after JWT signature verification). Never decode the JWT manually --
    // an unverified token is attacker-controlled input.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const userId: string | undefined = request.user?.id;

    if (userId) {
      const cacheKey = `${String(url)}:user:${userId}`;

      this.logger.debug(`Cache key with user: ${cacheKey}`);

      return cacheKey;
    }

    this.logger.debug(`Cache key without user: ${String(url)}`);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return url;
  }
}
