import { HttpStatus } from "@nestjs/common";
import { createSwaggerErrorExample } from "../../common/constants";
import { ErrorCode, ErrorMessages } from "../../common/constants/error-codes.constants";

/**
 * Auth endpoint paths
 */
const AUTH_PATHS = {
  REGISTER: "/api/v1/auth/register",
  LOGIN: "/api/v1/auth/login",
  REFRESH: "/api/v1/auth/refresh",
} as const;

/**
 * Swagger example schemas for Auth API error responses
 *
 * These constants provide consistent error documentation across auth endpoints.
 * Used in auth.controller.ts to reduce inline schema duplication.
 */
export const AUTH_SWAGGER_EXAMPLES = {
  /**
   * Register endpoint error examples
   */
  register: {
    validationError: {
      value: createSwaggerErrorExample(
        HttpStatus.BAD_REQUEST,
        ["email must be an email"],
        ErrorCode.VALIDATION_FAILED,
        AUTH_PATHS.REGISTER,
      ),
    },
    registrationConflict: {
      value: createSwaggerErrorExample(
        HttpStatus.CONFLICT,
        "Registration failed",
        ErrorCode.AUTH_REGISTRATION_FAILED,
        AUTH_PATHS.REGISTER,
      ),
    },
  },

  /**
   * Login endpoint error example
   */
  invalidCredentials: createSwaggerErrorExample(
    HttpStatus.UNAUTHORIZED,
    ErrorMessages[ErrorCode.AUTH_INVALID_CREDENTIALS],
    ErrorCode.AUTH_INVALID_CREDENTIALS,
    AUTH_PATHS.LOGIN,
  ),

  /**
   * Refresh endpoint error examples
   */
  refreshErrors: {
    tokenExpired: {
      value: createSwaggerErrorExample(
        HttpStatus.UNAUTHORIZED,
        ErrorMessages[ErrorCode.AUTH_TOKEN_EXPIRED],
        ErrorCode.AUTH_TOKEN_EXPIRED,
        AUTH_PATHS.REFRESH,
      ),
    },
    tokenInvalid: {
      value: createSwaggerErrorExample(
        HttpStatus.UNAUTHORIZED,
        ErrorMessages[ErrorCode.AUTH_TOKEN_INVALID],
        ErrorCode.AUTH_TOKEN_INVALID,
        AUTH_PATHS.REFRESH,
      ),
    },
  },

  /**
   * Success response example for token refresh
   */
  tokensRefreshed: {
    data: {
      accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    },
  },
};
