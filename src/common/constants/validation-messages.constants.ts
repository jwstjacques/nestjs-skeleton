/**
 * Reusable validation error message templates
 * Use these in DTO validation decorators
 *
 * @example
 * ```typescript
 * @IsNotEmpty({ message: ValidationMessages.required("Title") })
 * @MinLength(3, { message: ValidationMessages.minLength("Title", 3) })
 * title: string;
 * ```
 */
export class ValidationMessages {
  /**
   * Field is required
   */
  static required(field: string): string {
    return `${field} is required`;
  }

  /**
   * Field must be a string
   */
  static mustBeString(field: string): string {
    return `${field} must be a string`;
  }

  /**
   * Field must be a number
   */
  static mustBeNumber(field: string): string {
    return `${field} must be a number`;
  }

  /**
   * Field must be a boolean
   */
  static mustBeBoolean(field: string): string {
    return `${field} must be a boolean`;
  }

  /**
   * Field must be one of enum values
   */
  static mustBeEnum(field: string, values: string[]): string {
    return `${field} must be one of: ${values.join(", ")}`;
  }

  /**
   * Field minimum length
   */
  static minLength(field: string, min: number): string {
    return `${field} must be at least ${min} characters long`;
  }

  /**
   * Field maximum length
   */
  static maxLength(field: string, max: number): string {
    return `${field} must be no more than ${max} characters long`;
  }

  /**
   * Field length range
   */
  static lengthRange(field: string, min: number, max: number): string {
    return `${field} must be between ${min} and ${max} characters long`;
  }

  /**
   * Invalid format
   */
  static invalidFormat(field: string): string {
    return `${field} has an invalid format`;
  }

  /**
   * Invalid CUID
   */
  static invalidCuid(field: string = "ID"): string {
    return `${field} must be a valid CUID`;
  }

  /**
   * Invalid email
   */
  static invalidEmail(field: string = "Email"): string {
    return `${field} must be a valid email address`;
  }

  /**
   * Minimum value
   */
  static minValue(field: string, min: number): string {
    return `${field} must be at least ${min}`;
  }

  /**
   * Maximum value
   */
  static maxValue(field: string, max: number): string {
    return `${field} must be no more than ${max}`;
  }

  /**
   * Value range
   */
  static valueRange(field: string, min: number, max: number): string {
    return `${field} must be between ${min} and ${max}`;
  }

  /**
   * Array must not be empty
   */
  static arrayNotEmpty(field: string): string {
    return `${field} must contain at least one item`;
  }

  /**
   * Password strength requirements
   */
  static passwordStrength(): string {
    return "Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character";
  }

  /**
   * Passwords must match
   */
  static passwordsMatch(): string {
    return "Passwords must match";
  }

  /**
   * Date must be in future
   */
  static mustBeFutureDate(field: string): string {
    return `${field} must be a future date`;
  }

  /**
   * Date must be in past
   */
  static mustBePastDate(field: string): string {
    return `${field} must be a past date`;
  }
}

/**
 * Field name constants for consistency
 */
export const FIELD_NAMES = {
  EMAIL: "Email",
  PASSWORD: "Password",
  USERNAME: "Username",
  FIRST_NAME: "First name",
  LAST_NAME: "Last name",
  TITLE: "Title",
  DESCRIPTION: "Description",
  STATUS: "Status",
  PRIORITY: "Priority",
  ID: "ID",
  PAGE: "Page",
  LIMIT: "Limit",
  SORT_BY: "Sort by",
  SORT_ORDER: "Sort order",
} as const;
