import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  getHello(): string {
    return "Welcome to NestJS Task Management API! Visit /api/v1/docs for API documentation.";
  }
}
