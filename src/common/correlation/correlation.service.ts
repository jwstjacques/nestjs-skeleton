import { Injectable } from "@nestjs/common";
import { AsyncLocalStorage } from "async_hooks";

export interface CorrelationContext {
  correlationId: string;
  userId?: number;
}

@Injectable()
export class CorrelationService {
  private readonly asyncLocalStorage = new AsyncLocalStorage<CorrelationContext>();

  constructor() {
    // Expose AsyncLocalStorage globally for Winston access

    (global as Record<string, unknown>).correlationStorage = this.asyncLocalStorage;
  }

  /**
   * Run a function with correlation context
   */
  run<T>(context: CorrelationContext, callback: () => T): T {
    return this.asyncLocalStorage.run(context, callback);
  }

  /**
   * Get current correlation ID
   */
  getCorrelationId(): string | undefined {
    return this.asyncLocalStorage.getStore()?.correlationId;
  }

  /**
   * Get current user ID
   */
  getUserId(): number | undefined {
    return this.asyncLocalStorage.getStore()?.userId;
  }

  /**
   * Set user ID in current context
   */
  setUserId(userId: number): void {
    const store = this.asyncLocalStorage.getStore();

    if (store) {
      store.userId = userId;
    }
  }

  /**
   * Get full context
   */
  getContext(): CorrelationContext | undefined {
    return this.asyncLocalStorage.getStore();
  }

  /**
   * Get formatted context string for logging
   */
  getLogContext(): string {
    const context = this.getContext();

    if (!context) {
      return "";
    }

    const parts: string[] = [];

    if (context.correlationId) {
      parts.push(`[${context.correlationId}]`);
    }

    if (context.userId) {
      parts.push(`[user-${context.userId}]`);
    }

    return parts.join(" ");
  }
}
