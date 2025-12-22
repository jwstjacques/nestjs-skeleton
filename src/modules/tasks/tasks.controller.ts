import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  UseInterceptors,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiResponse,
  ApiTooManyRequestsResponse,
  ApiForbiddenResponse,
} from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import { CacheInterceptor, CacheTTL } from "@nestjs/cache-manager";
import { UserRole } from "@prisma/client";
import { TasksService } from "./tasks.service";
import {
  CreateTaskDto,
  UpdateTaskDto,
  QueryTaskDto,
  TaskResponseDto,
  PaginatedTasksResponseDto,
} from "./dto";
import { ParseCuidPipe } from "../../common/pipes";
import { CurrentUser, Roles } from "../../auth/decorators";
import { CacheTTL as CacheTTLEnum } from "../../common/cache/cache-keys.constants";
import { PAGINATION_SWAGGER_QUERIES } from "../../common/constants";
import { TASK_API_TAG, TASK_SWAGGER_EXAMPLES, TASK_SWAGGER_DOCS } from "./constants";

/**
 * Tasks Controller - Example Module
 *
 * ⚠️  NOTE: This Tasks module serves as an example implementation demonstrating
 * best practices for building NestJS modules. It showcases:
 * - CRUD operations with pagination
 * - DTO validation and transformation
 * - Swagger/OpenAPI documentation
 * - Authentication & role-based access control
 * - Redis caching patterns
 * - Rate limiting (throttling)
 * - Comprehensive error handling
 * - Unit and E2E testing patterns
 *
 * When building your own API:
 * - Use this as a reference for module structure and patterns
 * - See docs/CUSTOMIZATION.md for instructions to remove this module
 * - Follow the same patterns when creating your own modules
 *
 * @see docs/CUSTOMIZATION.md - Removal and customization guide
 * @see docs/examples/TASKS_ENDPOINTS.md - Complete API documentation
 */

/**
 * Throttle limits for task operations
 * Note: Decorators require static values at load time, before ConfigService is available.
 * These match the defaults in throttleConfig provider.
 */
const THROTTLE_LIMITS = {
  SHORT: { ttl: 1000, limit: 10 },
  MEDIUM: { ttl: 10000, limit: 50 },
} as const;

@ApiTags(TASK_API_TAG)
@ApiBearerAuth("JWT-auth")
@Controller("tasks")
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ short: THROTTLE_LIMITS.SHORT })
  @ApiOperation({
    summary: TASK_SWAGGER_DOCS.CREATE_SUMMARY,
    description: TASK_SWAGGER_DOCS.CREATE_DESCRIPTION,
  })
  @ApiCreatedResponse({
    description: TASK_SWAGGER_DOCS.CREATE_SUCCESS,
    type: TaskResponseDto,
  })
  @ApiBadRequestResponse({
    description: TASK_SWAGGER_DOCS.INVALID_INPUT,
    schema: {
      example: {
        statusCode: HttpStatus.BAD_REQUEST,
        message: ["title must be longer than or equal to 3 characters"],
        error: "Bad Request",
        errorCode: "VALIDATION_FAILED",
        timestamp: "2025-12-13T10:30:00.000Z",
        path: "/api/v1/tasks",
        correlationId: "550e8400-e29b-41d4-a716-446655440000",
      },
    },
  })
  @ApiTooManyRequestsResponse({
    description: TASK_SWAGGER_DOCS.TOO_MANY_REQUESTS,
  })
  async create(
    @Body() createTaskDto: CreateTaskDto,
    @CurrentUser() user: { id: string; role: UserRole },
  ): Promise<TaskResponseDto> {
    const task = await this.tasksService.create(createTaskDto, user);

    return new TaskResponseDto(task);
  }

  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(CacheTTLEnum.SHORT)
  @Throttle({ medium: THROTTLE_LIMITS.MEDIUM })
  @ApiOperation({
    summary: TASK_SWAGGER_DOCS.GET_ALL_SUMMARY,
    description: TASK_SWAGGER_DOCS.GET_ALL_DESCRIPTION,
  })
  @ApiOkResponse({
    description: TASK_SWAGGER_DOCS.GET_ALL_SUCCESS,
    type: PaginatedTasksResponseDto,
  })
  @ApiQuery(PAGINATION_SWAGGER_QUERIES.page())
  @ApiQuery(PAGINATION_SWAGGER_QUERIES.limit())
  @ApiQuery({
    name: "status",
    required: false,
    enum: ["TODO", "IN_PROGRESS", "COMPLETED", "CANCELLED"],
    description: TASK_SWAGGER_DOCS.QUERY_STATUS,
  })
  @ApiQuery({
    name: "priority",
    required: false,
    enum: ["LOW", "MEDIUM", "HIGH"],
    description: TASK_SWAGGER_DOCS.QUERY_PRIORITY,
  })
  @ApiQuery(
    PAGINATION_SWAGGER_QUERIES.search({
      example: "meeting",
      fields: "title, description",
    }),
  )
  @ApiQuery(
    PAGINATION_SWAGGER_QUERIES.sortBy({
      enum: ["CREATED_AT", "UPDATED_AT", "DUE_DATE", "TITLE", "PRIORITY", "STATUS"],
      default: "CREATED_AT",
    }),
  )
  @ApiQuery(PAGINATION_SWAGGER_QUERIES.sortOrder({ default: "DESC" }))
  async findAll(@Query() query: QueryTaskDto, @CurrentUser() user: { id: string; role: UserRole }) {
    return this.tasksService.findAll(query, user);
  }

  @Get("statistics")
  @Throttle({ medium: THROTTLE_LIMITS.MEDIUM })
  @ApiOperation({
    summary: TASK_SWAGGER_DOCS.GET_STATS_SUMMARY,
    description: TASK_SWAGGER_DOCS.GET_STATS_DESCRIPTION,
  })
  @ApiOkResponse({
    description: TASK_SWAGGER_DOCS.GET_STATS_SUCCESS,
    schema: {
      example: {
        totalTasks: 42,
        byStatus: {
          TODO: 10,
          IN_PROGRESS: 15,
          COMPLETED: 17,
        },
        byPriority: {
          LOW: 8,
          MEDIUM: 20,
          HIGH: 14,
        },
      },
    },
  })
  async getStatistics(@CurrentUser() user: { id: string; role: UserRole }) {
    return this.tasksService.getStatistics(user);
  }

  @Get(":id")
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(CacheTTLEnum.MEDIUM)
  @Throttle({ medium: THROTTLE_LIMITS.MEDIUM })
  @ApiOperation({
    summary: TASK_SWAGGER_DOCS.GET_BY_ID_SUMMARY,
    description: TASK_SWAGGER_DOCS.GET_BY_ID_DESCRIPTION,
  })
  @ApiParam({
    name: "id",
    description: TASK_SWAGGER_DOCS.PARAM_ID,
    example: TASK_SWAGGER_EXAMPLES.TASK_ID,
  })
  @ApiOkResponse({
    description: TASK_SWAGGER_DOCS.GET_BY_ID_SUCCESS,
    type: TaskResponseDto,
  })
  @ApiNotFoundResponse({
    description: TASK_SWAGGER_DOCS.NOT_FOUND,
    schema: {
      example: {
        statusCode: HttpStatus.NOT_FOUND,
        message: "Task with ID 'cmixpvpir0001p9yp5xq8r7ks' not found",
        error: "Not Found",
        errorCode: "TASK_NOT_FOUND",
        timestamp: "2025-12-13T10:30:00.000Z",
        path: "/api/v1/tasks/cmixpvpir0001p9yp5xq8r7ks",
        correlationId: "550e8400-e29b-41d4-a716-446655440000",
      },
    },
  })
  @ApiBadRequestResponse({
    description: "Invalid CUID format",
    schema: {
      example: {
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Invalid CUID format: invalid-id",
        error: "Bad Request",
        errorCode: "VALIDATION_INVALID_CUID",
        timestamp: "2025-12-13T10:30:00.000Z",
        path: "/api/v1/tasks/invalid-id",
        correlationId: "550e8400-e29b-41d4-a716-446655440000",
      },
    },
  })
  @ApiForbiddenResponse({
    description: "Cannot access other user's task",
    schema: {
      example: {
        statusCode: HttpStatus.FORBIDDEN,
        message: "Unauthorized",
        error: "UnauthorizedException",
        timestamp: "2025-12-22T03:13:50.701Z",
        path: "/api/v1/tasks",
        correlationId: "5c460f20-32c7-425d-a45a-62bb5002d5d1",
        errorCode: "AUTH_UNAUTHORIZED",
      },
    },
  })
  async findOne(
    @Param("id", ParseCuidPipe) id: string,
    @CurrentUser() user: { id: string; role: UserRole },
  ): Promise<TaskResponseDto> {
    const task = await this.tasksService.findOne(id, user);

    return new TaskResponseDto(task);
  }

  @Patch(":id")
  @Throttle({ short: THROTTLE_LIMITS.SHORT })
  @ApiOperation({
    summary: TASK_SWAGGER_DOCS.UPDATE_SUMMARY,
    description: TASK_SWAGGER_DOCS.UPDATE_DESCRIPTION,
  })
  @ApiParam({
    name: "id",
    description: TASK_SWAGGER_DOCS.PARAM_ID,
    example: TASK_SWAGGER_EXAMPLES.TASK_ID,
  })
  @ApiOkResponse({
    description: TASK_SWAGGER_DOCS.UPDATE_SUCCESS,
    type: TaskResponseDto,
  })
  @ApiNotFoundResponse({
    description: TASK_SWAGGER_DOCS.NOT_FOUND,
    schema: {
      example: {
        statusCode: HttpStatus.NOT_FOUND,
        message: "Task with ID 'cmixpvpir0001p9yp5xq8r7ks' not found",
        error: "Not Found",
        errorCode: "TASK_NOT_FOUND",
        timestamp: "2025-12-13T10:30:00.000Z",
        path: "/api/v1/tasks/cmixpvpir0001p9yp5xq8r7ks",
        correlationId: "550e8400-e29b-41d4-a716-446655440000",
      },
    },
  })
  @ApiBadRequestResponse({
    description: TASK_SWAGGER_DOCS.INVALID_INPUT,
    schema: {
      example: {
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Invalid CUID format: invalid-id",
        error: "Bad Request",
        errorCode: "VALIDATION_INVALID_CUID",
        timestamp: "2025-12-13T10:30:00.000Z",
        path: "/api/v1/tasks/invalid-id",
        correlationId: "550e8400-e29b-41d4-a716-446655440000",
      },
    },
  })
  @ApiForbiddenResponse({
    description: TASK_SWAGGER_DOCS.FORBIDDEN,
    schema: {
      example: {
        statusCode: HttpStatus.FORBIDDEN,
        message: "You do not have permission to access task: cmixpvpir0001p9yp5xq8r7ks",
        error: "Forbidden",
        errorCode: "TASK_FORBIDDEN",
        timestamp: "2025-12-13T10:30:00.000Z",
        path: "/api/v1/tasks/cmixpvpir0001p9yp5xq8r7ks",
        correlationId: "550e8400-e29b-41d4-a716-446655440000",
      },
    },
  })
  @ApiTooManyRequestsResponse({
    description: TASK_SWAGGER_DOCS.TOO_MANY_REQUESTS,
  })
  async update(
    @Param("id", ParseCuidPipe) id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @CurrentUser() user: { id: string; role: UserRole },
  ): Promise<TaskResponseDto> {
    const task = await this.tasksService.update(id, updateTaskDto, user);

    return new TaskResponseDto(task);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @Throttle({ short: THROTTLE_LIMITS.SHORT })
  @ApiOperation({
    summary: TASK_SWAGGER_DOCS.DELETE_SUMMARY,
    description: TASK_SWAGGER_DOCS.DELETE_DESCRIPTION,
  })
  @ApiParam({
    name: "id",
    description: TASK_SWAGGER_DOCS.PARAM_ID,
    example: TASK_SWAGGER_EXAMPLES.TASK_ID,
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: TASK_SWAGGER_DOCS.DELETE_SUCCESS,
  })
  @ApiNotFoundResponse({
    description: TASK_SWAGGER_DOCS.NOT_FOUND,
    schema: {
      example: {
        statusCode: HttpStatus.NOT_FOUND,
        message: "Task with ID 'cmixpvpir0001p9yp5xq8r7ks' not found",
        error: "Not Found",
        errorCode: "TASK_NOT_FOUND",
        timestamp: "2025-12-13T10:30:00.000Z",
        path: "/api/v1/tasks/cmixpvpir0001p9yp5xq8r7ks",
        correlationId: "550e8400-e29b-41d4-a716-446655440000",
      },
    },
  })
  @ApiForbiddenResponse({
    description: TASK_SWAGGER_DOCS.FORBIDDEN,
    schema: {
      example: {
        statusCode: HttpStatus.FORBIDDEN,
        message: "You do not have permission to access task: cmixpvpir0001p9yp5xq8r7ks",
        error: "Forbidden",
        errorCode: "TASK_FORBIDDEN",
        timestamp: "2025-12-13T10:30:00.000Z",
        path: "/api/v1/tasks/cmixpvpir0001p9yp5xq8r7ks",
        correlationId: "550e8400-e29b-41d4-a716-446655440000",
      },
    },
  })
  @ApiTooManyRequestsResponse({
    description: TASK_SWAGGER_DOCS.TOO_MANY_REQUESTS,
  })
  async remove(
    @Param("id", ParseCuidPipe) id: string,
    @CurrentUser() user: { id: string; role: UserRole },
  ): Promise<void> {
    await this.tasksService.remove(id, user);
  }

  @Delete("admin/purge/:id")
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Throttle({ short: THROTTLE_LIMITS.SHORT })
  @ApiOperation({
    summary: TASK_SWAGGER_DOCS.PURGE_SUMMARY,
    description: TASK_SWAGGER_DOCS.PURGE_DESCRIPTION,
  })
  @ApiParam({
    name: "id",
    description: TASK_SWAGGER_DOCS.PARAM_ID,
    example: TASK_SWAGGER_EXAMPLES.TASK_ID,
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: TASK_SWAGGER_DOCS.PURGE_SUCCESS,
  })
  @ApiForbiddenResponse({
    description: "Admin access required",
    schema: {
      example: {
        statusCode: HttpStatus.FORBIDDEN,
        message: "Forbidden resource",
        error: "Forbidden",
        errorCode: "RESOURCE_FORBIDDEN",
        timestamp: "2025-12-13T10:30:00.000Z",
        path: "/api/v1/tasks/admin/purge/cmixpvpir0001p9yp5xq8r7ks",
        correlationId: "550e8400-e29b-41d4-a716-446655440000",
      },
    },
  })
  @ApiNotFoundResponse({
    description: "Task not found",
    schema: {
      example: {
        statusCode: HttpStatus.NOT_FOUND,
        message: "Task with ID 'cmixpvpir0001p9yp5xq8r7ks' not found",
        error: "Not Found",
        errorCode: "TASK_NOT_FOUND",
        timestamp: "2025-12-13T10:30:00.000Z",
        path: "/api/v1/tasks/admin/purge/cmixpvpir0001p9yp5xq8r7ks",
        correlationId: "550e8400-e29b-41d4-a716-446655440000",
      },
    },
  })
  @ApiTooManyRequestsResponse({
    description: "Too many requests",
  })
  async purge(@Param("id", ParseCuidPipe) id: string): Promise<void> {
    await this.tasksService.purge(id);
  }
}
