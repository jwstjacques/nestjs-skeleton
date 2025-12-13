import { Injectable, ExecutionContext } from "@nestjs/common";
import { CacheInterceptor as NestCacheInterceptor } from "@nestjs/cache-manager";

@Injectable()
export class HttpCacheInterceptor extends NestCacheInterceptor {
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

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return url;
  }
}
