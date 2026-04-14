import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { Request, Response } from "express";

/** Paths that should NOT receive Location headers even on successful POST. */
const EXCLUDED_AUTH_PATHS = [
  "/api/v1/auth/login",
  "/api/v1/auth/refresh",
  "/api/v1/auth/register",
] as const;

/** HTTP methods that create or modify resources and may need Location headers. */
const MUTATION_METHODS = ["POST", "PUT", "PATCH"] as const;

/** Response data shape with optional nested resource. */
interface ResponseData {
  id?: string;
  data?: { id?: string };
}

@Injectable()
export class LocationHeaderInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LocationHeaderInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const method = request.method;

    if (!(MUTATION_METHODS as readonly string[]).includes(method)) {
      return next.handle();
    }

    if ((EXCLUDED_AUTH_PATHS as readonly string[]).includes(request.path)) {
      return next.handle();
    }

    return next.handle().pipe(
      tap((data: unknown) => {
        const statusCode = response.statusCode;

        if (statusCode >= 200 && statusCode < 300) {
          const locationUrl = this.buildLocationUrl(request, data as ResponseData);

          if (locationUrl) {
            response.setHeader("Location", locationUrl);
            this.logger.log(`${method} ${request.url} - Added Location header: ${locationUrl}`);
          }
        }
      }),
    );
  }

  private buildLocationUrl(request: Request, data: ResponseData): string | null {
    try {
      const resourceId = this.extractResourceId(data);

      if (!resourceId) {
        return null;
      }

      const protocol = request.protocol;
      const host = request.get("host");

      if (!host) {
        return null;
      }

      const baseUrl = `${protocol}://${host}`;

      if (request.method === "POST") {
        const path = request.path.endsWith("/") ? request.path.slice(0, -1) : request.path;

        return `${baseUrl}${path}/${resourceId}`;
      }

      return `${baseUrl}${request.path}`;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";

      this.logger.warn(`Failed to build Location URL: ${errorMessage}`);

      return null;
    }
  }

  private extractResourceId(data: ResponseData): string | null {
    if (!data || typeof data !== "object") {
      return null;
    }

    if (data.id) {
      return data.id;
    }

    if (data.data && typeof data.data === "object" && data.data.id) {
      return data.data.id;
    }

    return null;
  }
}
