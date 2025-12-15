/**
 * Cache key patterns and generators
 * Centralized cache key management for consistency
 *
 * @example
 * ```typescript
 * const key = CacheKeys.list("tasks");
 * const ttl = CacheTTL.SHORT;
 * await cacheManager.set(key, data, ttl);
 * ```
 */
export class CacheKeys {
  /**
   * Generate cache key for a list of items
   */
  static list(module: string, filters?: Record<string, unknown>): string {
    if (!filters || Object.keys(filters).length === 0) {
      return `${module}:list`;
    }
    const filterStr = Object.entries(filters)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${String(value)}`)
      .join("&");

    return `${module}:list:${filterStr}`;
  }

  /**
   * Generate cache key for a single item
   */
  static item(module: string, id: string): string {
    return `${module}:${id}`;
  }

  /**
   * Generate cache key for statistics
   */
  static stats(module: string): string {
    return `${module}:stats`;
  }

  /**
   * Generate cache key for user-specific data
   */
  static user(userId: string): string {
    return `user:${userId}`;
  }

  /**
   * Generate cache key for user's items in a module
   */
  static userItems(userId: string, module: string): string {
    return `user:${userId}:${module}`;
  }

  /**
   * Generate cache key for search results
   */
  static search(module: string, query: string): string {
    return `${module}:search:${query}`;
  }

  /**
   * Generate pattern for module invalidation
   */
  static modulePattern(module: string): string {
    return `${module}:*`;
  }

  /**
   * Generate pattern for user invalidation
   */
  static userPattern(userId: string): string {
    return `user:${userId}:*`;
  }

  /**
   * Generate pattern for all lists
   */
  static allListsPattern(module: string): string {
    return `${module}:list*`;
  }
}

/**
 * Cache TTL (Time To Live) configurations in milliseconds
 * @deprecated Import from '../../config/constants' instead
 * This re-export will be removed in a future version
 */
import { CacheTTL } from "../../config/constants/cache-ttl.constants";
export { CacheTTL };

/**
 * Cache operation constants
 */
export const CACHE_CONFIG = {
  /** Default TTL if not specified */
  DEFAULT_TTL: CacheTTL.MEDIUM,

  /** Maximum number of items in a cached list */
  MAX_LIST_SIZE: 1000,

  /** Redis key prefix separator */
  KEY_SEPARATOR: ":",

  /** Wildcard for pattern matching */
  WILDCARD: "*",
} as const;
