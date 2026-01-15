/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { Request, Response } from "express";

@Injectable()
export class LocationHeaderInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LocationHeaderInterceptor.name);

  // Paths that should NOT receive Location headers even on successful POST
  private readonly excludedPaths = [
    "/api/v1/auth/login", // Login returns tokens for existing user
    "/api/v1/auth/refresh", // Refresh returns new tokens, doesn't create a resource
    "/api/v1/auth/register", // Register is an operation, not a resource creation
  ];

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const method = request.method;

    // Only process POST, PUT, and PATCH requests
    if (!["POST", "PUT", "PATCH"].includes(method)) {
      return next.handle();
    }

    // Skip excluded paths (login, refresh, etc.)
    if (this.excludedPaths.includes(request.path)) {
      return next.handle();
    }

    return next.handle().pipe(
      tap((data) => {
        // Only add Location header for successful responses (2xx status codes)
        const statusCode = response.statusCode;

        if (statusCode >= 200 && statusCode < 300) {
          const locationUrl = this.buildLocationUrl(request, data);

          if (locationUrl) {
            response.setHeader("Location", locationUrl);
            this.logger.log(`${method} ${request.url} - Added Location header: ${locationUrl}`);
          }
        }
      }),
    );
  }

  /**
   * Builds the Location URL based on the request and response data
   */
  private buildLocationUrl(request: Request, data: any): string | null {
    try {
      // Extract the resource ID from the response
      const resourceId = this.extractResourceId(data);

      if (!resourceId) {
        return null;
      }

      // Get the base URL
      const protocol = request.protocol;
      const host = request.get("host");
      const baseUrl = `${protocol}://${host}`;

      // For POST requests, append the ID to the current path
      if (request.method === "POST") {
        const path = request.path.endsWith("/") ? request.path.slice(0, -1) : request.path;

        return `${baseUrl}${path}/${resourceId}`;
      }

      // For PUT and PATCH requests, use the current full URL (which already includes the ID)
      return `${baseUrl}${request.path}`;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";

      this.logger.warn(`Failed to build Location URL: ${errorMessage}`);

      return null;
    }
  }

  /**
   * Extracts the resource ID from the response data
   * Handles various response structures (wrapped, unwrapped, nested)
   */
  private extractResourceId(data: any): string | null {
    if (!data || typeof data !== "object") {
      return null;
    }

    // Check if data has an 'id' field directly
    if (data.id) {
      return data.id;
    }

    // Check if data is wrapped in a 'data' field
    if (data.data && typeof data.data === "object") {
      if (data.data.id) {
        return data.data.id;
      }
    }

    return null;
  }
}
