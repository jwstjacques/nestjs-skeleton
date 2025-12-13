/**
 * HTTP Header Constants
 *
 * Centralized location for all custom HTTP header names used throughout the application.
 * This ensures consistency and makes it easier to update header names if needed.
 */

/**
 * Correlation ID Header
 *
 * Used to track requests across the entire application lifecycle.
 * This header is set by the CorrelationIdMiddleware and included in:
 * - Response headers (for client tracking)
 * - Log entries (for debugging)
 * - Error responses (for support tickets)
 *
 * @example
 * ```typescript
 * // Client sends request with correlation ID
 * headers: {
 *   'x-correlation-id': '123e4567-e89b-12d3-a456-426614174000'
 * }
 *
 * // Server includes it in response
 * response.setHeader(CORRELATION_ID_HEADER, correlationId);
 * ```
 */
export const CORRELATION_ID_HEADER = "x-correlation-id";

/**
 * User ID Header
 *
 * Optional header that can be used during development/testing
 * to simulate different users before authentication is fully implemented.
 *
 * @deprecated This will be removed once JWT authentication is implemented.
 * User ID should come from the authenticated token, not headers.
 */
export const USER_ID_HEADER = "x-user-id";
