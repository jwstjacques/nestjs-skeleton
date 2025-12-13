/**
 * Regular expression constants for validation
 */

/**
 * UUID v4 format validation regex
 * Matches: 8-4-4-4-12 hex pattern with version 4 and variant bits
 * Example: 550e8400-e29b-41d4-a716-446655440000
 * @see https://www.rfc-editor.org/rfc/rfc4122
 */
export const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
