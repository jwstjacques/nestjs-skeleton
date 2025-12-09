import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { instanceToPlain } from "class-transformer";
import { Request } from "express";

export interface Response<T> {
  data: T;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  private readonly logger = new Logger(TransformInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    const request = context.switchToHttp().getRequest<Request>();
    const method: string = request.method;
    const url: string = request.url;

    this.logger.log(`${method} ${url} - Processing response`);

    return next.handle().pipe(
      map((data: T | Response<T>) => {
        // If data is already transformed or is a pagination response, return as is
        if (data && typeof data === "object" && ("data" in data || "meta" in data)) {
          return instanceToPlain(data) as Response<T>;
        }

        // Wrap single responses
        const wrappedData: Response<T> = {
          data: data,
        };

        return instanceToPlain(wrappedData) as Response<T>;
      }),
    );
  }
}
