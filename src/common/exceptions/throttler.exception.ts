import { HttpException, HttpStatus } from "@nestjs/common";

export class ThrottlerException extends HttpException {
  constructor(message?: string) {
    super(
      {
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        message: message || "Too many requests, please try again later",
        error: "Too Many Requests",
      },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}
