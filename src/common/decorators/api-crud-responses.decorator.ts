import { applyDecorators, HttpStatus, Type } from "@nestjs/common";
import {
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
} from "@nestjs/swagger";
import { ApiStandardErrorResponses } from "./api-standard-responses.decorator";
import { ErrorCode } from "../constants/error-codes.constants";
import { createSwaggerErrorExample } from "../constants/swagger-common.constants";

/**
 * Configuration interface for CRUD operation decorators
 */
export interface CrudOperationConfig {
  /** Short summary for the operation (shown in Swagger UI) */
  summary: string;
  /** Detailed description (optional, shown in expanded view) */
  description?: string;
  /** Name of the resource (e.g., "Task", "User") for error messages */
  resourceName: string;
  /** Response DTO type for success responses */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  responseType: Type<any>;
  /** Custom error code for not found responses (optional) - Can be ErrorCode enum or string value */
  notFoundErrorCode?: ErrorCode | string;
  /** API path for error examples (optional, defaults to "/api/v1/resource") */
  path?: string;
}

/**
 * Standard CREATE operation decorators
 * Includes: 201 Created, 400 Bad Request, 401 Unauthorized, 429 Too Many Requests
 *
 * Use this for POST endpoints that create new resources.
 *
 * @example
 * ```typescript
 * @Post()
 * @HttpCode(HttpStatus.CREATED)
 * @ApiCreateOperation({
 *   summary: "Create a new task",
 *   description: "Creates a new task with the provided details",
 *   resourceName: "Task",
 *   responseType: TaskResponseDto,
 *   path: "/api/v1/tasks",
 * })
 * async create(@Body() dto: CreateTaskDto) { ... }
 * ```
 */
export function ApiCreateOperation(config: CrudOperationConfig) {
  return applyDecorators(
    ApiOperation({
      summary: config.summary,
      description: config.description,
    }),
    ApiCreatedResponse({
      description: `${config.resourceName} created successfully`,
      type: config.responseType,
    }),
    ApiStandardErrorResponses(config.path || "/api/v1/resource"),
  );
}

/**
 * Standard READ (list) operation decorators
 * Includes: 200 OK (array), 400 Bad Request, 401 Unauthorized, 429 Too Many Requests
 *
 * Use this for GET endpoints that return a list of resources.
 *
 * @example
 * ```typescript
 * @Get()
 * @ApiReadListOperation({
 *   summary: "List all tasks",
 *   description: "Retrieves a paginated list of tasks",
 *   resourceName: "Task",
 *   responseType: TaskResponseDto,
 *   path: "/api/v1/tasks",
 * })
 * async findAll(@Query() query: QueryTaskDto) { ... }
 * ```
 */
export function ApiReadListOperation(config: CrudOperationConfig) {
  return applyDecorators(
    ApiOperation({
      summary: config.summary,
      description: config.description,
    }),
    ApiOkResponse({
      description: `${config.resourceName} list retrieved successfully`,
      type: config.responseType,
      isArray: true,
    }),
    ApiStandardErrorResponses(config.path || "/api/v1/resource"),
  );
}

/**
 * Standard READ (single) operation decorators
 * Includes: 200 OK, 400 Bad Request, 401 Unauthorized, 404 Not Found, 429 Too Many Requests
 *
 * Use this for GET endpoints that return a single resource by ID.
 *
 * @example
 * ```typescript
 * @Get(':id')
 * @ApiReadOneOperation({
 *   summary: "Get task by ID",
 *   description: "Retrieves a single task by its unique identifier",
 *   resourceName: "Task",
 *   responseType: TaskResponseDto,
 *   notFoundErrorCode: ErrorCode.TASK_NOT_FOUND,
 *   path: "/api/v1/tasks/:id",
 * })
 * async findOne(@Param('id') id: string) { ... }
 * ```
 */
export function ApiReadOneOperation(config: CrudOperationConfig) {
  const path = config.path || "/api/v1/resource/:id";
  const notFoundErrorCode = config.notFoundErrorCode || ErrorCode.RESOURCE_NOT_FOUND;

  return applyDecorators(
    ApiOperation({
      summary: config.summary,
      description: config.description,
    }),
    ApiOkResponse({
      description: `${config.resourceName} retrieved successfully`,
      type: config.responseType,
    }),
    ApiNotFoundResponse({
      description: `${config.resourceName} not found`,
      schema: {
        example: createSwaggerErrorExample(
          HttpStatus.NOT_FOUND,
          `${config.resourceName} not found`,
          notFoundErrorCode,
          path,
        ),
      },
    }),
    ApiStandardErrorResponses(path),
  );
}

/**
 * Standard UPDATE operation decorators
 * Includes: 200 OK, 400 Bad Request, 401 Unauthorized, 404 Not Found, 429 Too Many Requests
 *
 * Use this for PATCH/PUT endpoints that update existing resources.
 *
 * @example
 * ```typescript
 * @Patch(':id')
 * @ApiUpdateOperation({
 *   summary: "Update task",
 *   description: "Updates an existing task with the provided data",
 *   resourceName: "Task",
 *   responseType: TaskResponseDto,
 *   notFoundErrorCode: ErrorCode.TASK_NOT_FOUND,
 *   path: "/api/v1/tasks/:id",
 * })
 * async update(@Param('id') id: string, @Body() dto: UpdateTaskDto) { ... }
 * ```
 */
export function ApiUpdateOperation(config: CrudOperationConfig) {
  const path = config.path || "/api/v1/resource/:id";
  const notFoundErrorCode = config.notFoundErrorCode || ErrorCode.RESOURCE_NOT_FOUND;

  return applyDecorators(
    ApiOperation({
      summary: config.summary,
      description: config.description,
    }),
    ApiOkResponse({
      description: `${config.resourceName} updated successfully`,
      type: config.responseType,
    }),
    ApiNotFoundResponse({
      description: `${config.resourceName} not found`,
      schema: {
        example: createSwaggerErrorExample(
          HttpStatus.NOT_FOUND,
          `${config.resourceName} not found`,
          notFoundErrorCode,
          path,
        ),
      },
    }),
    ApiStandardErrorResponses(path),
  );
}

/**
 * Standard DELETE operation decorators
 * Includes: 200 OK, 400 Bad Request, 401 Unauthorized, 404 Not Found, 429 Too Many Requests
 *
 * Use this for DELETE endpoints that soft-delete or remove resources.
 *
 * @example
 * ```typescript
 * @Delete(':id')
 * @ApiDeleteOperation({
 *   summary: "Delete task",
 *   description: "Soft-deletes a task (marks as deleted)",
 *   resourceName: "Task",
 *   notFoundErrorCode: ErrorCode.TASK_NOT_FOUND,
 *   path: "/api/v1/tasks/:id",
 * })
 * async remove(@Param('id') id: string) { ... }
 * ```
 */
export function ApiDeleteOperation(config: Omit<CrudOperationConfig, "responseType">) {
  const path = config.path || "/api/v1/resource/:id";
  const notFoundErrorCode = config.notFoundErrorCode || ErrorCode.RESOURCE_NOT_FOUND;

  return applyDecorators(
    ApiOperation({
      summary: config.summary,
      description: config.description,
    }),
    ApiOkResponse({
      description: `${config.resourceName} deleted successfully`,
      schema: {
        example: {
          message: `${config.resourceName} deleted successfully`,
        },
      },
    }),
    ApiNotFoundResponse({
      description: `${config.resourceName} not found`,
      schema: {
        example: createSwaggerErrorExample(
          HttpStatus.NOT_FOUND,
          `${config.resourceName} not found`,
          notFoundErrorCode,
          path,
        ),
      },
    }),
    ApiStandardErrorResponses(path),
  );
}

/**
 * ADMIN-only DELETE operation decorators
 * Includes: 200 OK, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 429 Too Many Requests
 *
 * Use this for DELETE endpoints that permanently delete resources and require admin role.
 *
 * @example
 * ```typescript
 * @Delete(':id/purge')
 * @Roles(UserRole.ADMIN)
 * @ApiAdminDeleteOperation({
 *   summary: "Permanently delete task",
 *   description: "Hard-deletes a task from the database (admin only)",
 *   resourceName: "Task",
 *   notFoundErrorCode: ErrorCode.TASK_NOT_FOUND,
 *   path: "/api/v1/tasks/admin/purge/:id",
 * })
 * async hardDelete(@Param('id') id: string) { ... }
 * ```
 */
export function ApiAdminDeleteOperation(config: Omit<CrudOperationConfig, "responseType">) {
  const path = config.path || "/api/v1/resource/:id/purge";
  const notFoundErrorCode = config.notFoundErrorCode || ErrorCode.RESOURCE_NOT_FOUND;

  return applyDecorators(
    ApiOperation({
      summary: config.summary,
      description: config.description,
    }),
    ApiOkResponse({
      description: `${config.resourceName} permanently deleted`,
      schema: {
        example: {
          message: `${config.resourceName} permanently deleted`,
        },
      },
    }),
    ApiNotFoundResponse({
      description: `${config.resourceName} not found`,
      schema: {
        example: createSwaggerErrorExample(
          HttpStatus.NOT_FOUND,
          `${config.resourceName} not found`,
          notFoundErrorCode,
          path,
        ),
      },
    }),
    ApiForbiddenResponse({
      description: "Forbidden - Admin access required",
      schema: {
        example: createSwaggerErrorExample(
          HttpStatus.FORBIDDEN,
          "Forbidden resource",
          ErrorCode.AUTH_FORBIDDEN,
          path,
        ),
      },
    }),
    ApiStandardErrorResponses(path),
  );
}
