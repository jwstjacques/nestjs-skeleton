/**
 * HTTP Status Code Category
 *
 * Categorizes HTTP status codes into meaningful groups
 * for logging and error handling purposes.
 */
export enum HttpStatusCategory {
  /** Success responses (200-299) */
  SUCCESS = "SUCCESS",
  /** Client error responses (400-499) */
  CLIENT_ERROR = "CLIENT_ERROR",
  /** Server error responses (500-599) */
  SERVER_ERROR = "SERVER_ERROR",
}

/**
 * Utility class for HTTP status code operations
 *
 * Provides helper methods to categorize status codes and
 * determine appropriate log levels.
 */
export class HttpStatusUtil {
  /**
   * Categorizes an HTTP status code
   *
   * @param statusCode - The HTTP status code to categorize
   * @returns The category of the status code
   *
   * @example
   * ```typescript
   * HttpStatusUtil.getCategory(200); // HttpStatusCategory.SUCCESS
   * HttpStatusUtil.getCategory(404); // HttpStatusCategory.CLIENT_ERROR
   * HttpStatusUtil.getCategory(500); // HttpStatusCategory.SERVER_ERROR
   * ```
   */
  static getCategory(statusCode: number): HttpStatusCategory {
    if (statusCode >= 500) {
      return HttpStatusCategory.SERVER_ERROR;
    }

    if (statusCode >= 400) {
      return HttpStatusCategory.CLIENT_ERROR;
    }

    return HttpStatusCategory.SUCCESS;
  }

  /**
   * Determines the appropriate log level for a status code
   *
   * @param statusCode - The HTTP status code
   * @returns The log level to use ('error', 'warn', or 'log')
   *
   * @example
   * ```typescript
   * HttpStatusUtil.getLogLevel(200); // 'log'
   * HttpStatusUtil.getLogLevel(404); // 'warn'
   * HttpStatusUtil.getLogLevel(500); // 'error'
   * ```
   */
  static getLogLevel(statusCode: number): "error" | "warn" | "log" {
    const category = this.getCategory(statusCode);

    switch (category) {
      case HttpStatusCategory.SERVER_ERROR:
        return "error";

      case HttpStatusCategory.CLIENT_ERROR:
        return "warn";

      default:
        return "log";
    }
  }

  /**
   * Checks if a status code represents a server error
   *
   * @param statusCode - The HTTP status code
   * @returns True if status code is 500 or greater
   */
  static isServerError(statusCode: number): boolean {
    return statusCode >= 500;
  }

  /**
   * Checks if a status code represents a client error
   *
   * @param statusCode - The HTTP status code
   * @returns True if status code is between 400-499
   */
  static isClientError(statusCode: number): boolean {
    return statusCode >= 400 && statusCode < 500;
  }

  /**
   * Checks if a status code represents a success
   *
   * @param statusCode - The HTTP status code
   * @returns True if status code is between 200-399
   */
  static isSuccess(statusCode: number): boolean {
    return statusCode >= 200 && statusCode < 400;
  }
}
