import { applyDecorators } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiTooManyRequestsResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiParam,
} from "@nestjs/swagger";
import { HttpStatus } from "@nestjs/common";
import {
  SWAGGER_CUID_EXAMPLE,
  SwaggerErrorCode,
  SwaggerErrorMessage,
  createSwaggerErrorExample,
} from "../constants/swagger-common.constants";
import { ErrorCode } from "../constants/error-codes.constants";

/**
 * Standard error responses that apply to all authenticated endpoints
 * Combines: Bearer Auth + 400 (Validation) + 401 (Unauthorized) + 429 (Rate Limit)
 *
 * Use this for most protected CRUD endpoints that require authentication,
 * validation, and rate limiting.
 *
 * @param path - Optional path for error examples (defaults to "/api/v1/resource")
 *
 * @example
 * ```typescript
 * @Post()
 * @ApiStandardErrorResponses("/api/v1/<resources>")
 * async create(@Body() dto: CreateDto) { ... }
 * ```
 *
 * @example Without path (uses default)
 * ```typescript
 * @Get()
 * @ApiStandardErrorResponses()
 * async findAll() { ... }
 * ```
 */
export function ApiStandardErrorResponses(path = "/api/v1/resource") {
  return applyDecorators(
    ApiBearerAuth("JWT-auth"),
    ApiBadRequestResponse({
      description: "Validation failed or invalid input",
      schema: {
        example: createSwaggerErrorExample(
          HttpStatus.BAD_REQUEST,
          [SwaggerErrorMessage.VALIDATION_FAILED],
          ErrorCode.VALIDATION_FAILED,
          path,
        ),
      },
    }),
    ApiUnauthorizedResponse({
      description: "Unauthorized - Invalid or missing JWT token",
      schema: {
        example: createSwaggerErrorExample(
          HttpStatus.UNAUTHORIZED,
          SwaggerErrorMessage.UNAUTHORIZED,
          ErrorCode.AUTH_UNAUTHORIZED,
          path,
        ),
      },
    }),
    ApiTooManyRequestsResponse({
      description: "Too many requests - Rate limit exceeded",
      schema: {
        example: createSwaggerErrorExample(
          HttpStatus.TOO_MANY_REQUESTS,
          SwaggerErrorMessage.RATE_LIMIT,
          ErrorCode.SYSTEM_RATE_LIMIT_EXCEEDED,
          path,
        ),
      },
    }),
  );
}

/**
 * Auth + validation errors (no rate limit response)
 * Use for endpoints with custom rate limiting or no throttling.
 *
 * @param path - Optional path for error examples (defaults to "/api/v1/resource")
 *
 * @example
 * ```typescript
 * @Get(':id')
 * @ApiAuthValidationResponses("/api/v1/<resources>/:id")
 * async findOne(@Param('id') id: string) { ... }
 * ```
 */
export function ApiAuthValidationResponses(path = "/api/v1/resource") {
  return applyDecorators(
    ApiBearerAuth("JWT-auth"),
    ApiBadRequestResponse({
      description: "Validation failed or invalid input",
      schema: {
        example: createSwaggerErrorExample(
          HttpStatus.BAD_REQUEST,
          [SwaggerErrorMessage.VALIDATION_FAILED],
          ErrorCode.VALIDATION_FAILED,
          path,
        ),
      },
    }),
    ApiUnauthorizedResponse({
      description: "Unauthorized - Invalid or missing JWT token",
      schema: {
        example: createSwaggerErrorExample(
          HttpStatus.UNAUTHORIZED,
          SwaggerErrorMessage.UNAUTHORIZED,
          ErrorCode.AUTH_UNAUTHORIZED,
          path,
        ),
      },
    }),
  );
}

/**
 * Only Bearer Auth requirement (for simple authenticated endpoints)
 * Use for endpoints that only need authentication without other standard errors.
 *
 * @example
 * ```typescript
 * @Get('profile')
 * @ApiAuthOnly()
 * async getProfile(@CurrentUser() user: User) { ... }
 * ```
 */
export function ApiAuthOnly() {
  return ApiBearerAuth("JWT-auth");
}

/**
 * Standard CUID ID parameter decorator for resource endpoints
 * Provides consistent parameter documentation across all endpoints that accept a CUID ID.
 *
 * @param resourceName - Name of the resource (e.g., "Task", "User", "Project")
 * @param example - Optional custom example CUID (defaults to standard example)
 *
 * @example
 * ```typescript
 * @Get(':id')
 * @ApiResourceIdParam("Task")
 * async findOne(@Param('id', ParseCuidPipe) id: string) { ... }
 * ```
 *
 * @example With custom example
 * ```typescript
 * @Get(':id')
 * @ApiResourceIdParam("User", "cm4xyz789abc123")
 * async findOne(@Param('id') id: string) { ... }
 * ```
 */
export function ApiResourceIdParam(resourceName: string, example = SWAGGER_CUID_EXAMPLE) {
  return ApiParam({
    name: "id",
    description: `Unique CUID identifier for the ${resourceName.toLowerCase()}`,
    example,
  });
}

/**
 * Standard Forbidden (403) response for resource endpoints
 * Used when a user tries to access a resource they don't have permission for.
 *
 * @param path - The endpoint path for the error example
 * @param resourceName - Name of the resource (e.g., "task", "user", "project")
 * @param errorCode - Optional custom error code (defaults to RESOURCE_FORBIDDEN)
 * @param message - Optional custom error message (defaults to generic forbidden message)
 *
 * @example
 * ```typescript
 * @Get(':id')
 * @ApiForbiddenResourceResponse('/api/v1/<resources>/:id', '<resource>')
 * async findOne(@Param('id') id: string) { ... }
 * ```
 *
 * @example With custom error code
 * ```typescript
 * @Get(':id')
 * @ApiForbiddenResourceResponse('/api/v1/tasks/:id', 'task', 'TASK_FORBIDDEN')
 * async findOne(@Param('id') id: string) { ... }
 * ```
 */
export function ApiForbiddenResourceResponse(
  path: string,
  resourceName: string,
  errorCode: string = SwaggerErrorCode.RESOURCE_FORBIDDEN,
  message?: string,
) {
  const defaultMessage = `You do not have permission to access this ${resourceName.toLowerCase()}`;

  return ApiForbiddenResponse({
    description: `Insufficient permissions to access this ${resourceName.toLowerCase()}`,
    schema: {
      example: createSwaggerErrorExample(
        HttpStatus.FORBIDDEN,
        message || defaultMessage,
        errorCode,
        path,
      ),
    },
  });
}

/**
 * @deprecated Use ApiResourceIdParam("Task") instead
 * Kept for backward compatibility with existing code
 */
export function ApiTaskIdParam(
  description = "Unique CUID identifier for the task",
  example = SWAGGER_CUID_EXAMPLE,
) {
  return ApiParam({
    name: "id",
    description,
    example,
  });
}

/**
 * @deprecated Use ApiForbiddenResourceResponse(path, "task", "TASK_FORBIDDEN") instead
 * Kept for backward compatibility with existing code
 */
export function ApiForbiddenTaskResponse(path: string) {
  return ApiForbiddenResourceResponse(path, "task", "TASK_FORBIDDEN");
}
