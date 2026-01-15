/**
 * Utility for building consistent log context strings
 */
export class LogContextUtil {
  /**
   * Builds a context string from correlation ID and user ID
   * @param correlationId - Optional correlation ID
   * @param userId - Optional user ID (can be string or number)
   * @returns Formatted context string with brackets, e.g. "[abc-123] [user-456]"
   */
  static buildContext(correlationId?: string, userId?: number | string): string {
    const parts: string[] = [];

    if (correlationId) {
      parts.push(`[${correlationId}]`);
    }

    if (userId !== undefined && userId !== null && userId !== "") {
      parts.push(`[user-${userId}]`);
    }

    return parts.join(" ");
  }
}
