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
import {
  THROTTLE_SHORT_LIMIT,
  THROTTLE_SHORT_TTL,
  THROTTLE_MEDIUM_LIMIT,
  THROTTLE_MEDIUM_TTL,
} from "../../config/throttler.constants";
import { CacheTTL as CacheTTLEnum } from "../../common/cache/cache-keys.constants";
import { TASK_API_TAG, TASK_SWAGGER_EXAMPLES } from "./constants";

@ApiTags(TASK_API_TAG)
@ApiBearerAuth("JWT-auth")
@Controller({ path: "tasks", version: "1" })
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ short: { limit: THROTTLE_SHORT_LIMIT, ttl: THROTTLE_SHORT_TTL } })
  @ApiOperation({
    summary: "Create a new task",
    description: "Creates a new task for the authenticated user",
  })
  @ApiCreatedResponse({
    description: "Task successfully created",
    type: TaskResponseDto,
  })
  @ApiBadRequestResponse({
    description: "Invalid input data",
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
    description: "Too many requests",
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
  @Throttle({ medium: { limit: THROTTLE_MEDIUM_LIMIT, ttl: THROTTLE_MEDIUM_TTL } })
  @ApiOperation({
    summary: "Get all tasks",
    description:
      "Retrieves a paginated list of tasks with optional filtering and sorting. Supports filtering by status, priority, and search term.",
  })
  @ApiOkResponse({
    description: "Successfully retrieved tasks",
    type: PaginatedTasksResponseDto,
  })
  @ApiQuery({
    name: "page",
    required: false,
    type: Number,
    description: "Page number (default: 1)",
    example: 1,
  })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
    description: "Items per page (default: 10, max: 100)",
    example: 10,
  })
  @ApiQuery({
    name: "status",
    required: false,
    enum: ["TODO", "IN_PROGRESS", "COMPLETED", "CANCELLED"],
    description: "Filter by task status",
  })
  @ApiQuery({
    name: "priority",
    required: false,
    enum: ["LOW", "MEDIUM", "HIGH"],
    description: "Filter by task priority",
  })
  @ApiQuery({
    name: "search",
    required: false,
    type: String,
    description: "Search in task title and description",
    example: "meeting",
  })
  @ApiQuery({
    name: "sortBy",
    required: false,
    enum: ["CREATED_AT", "UPDATED_AT", "DUE_DATE", "TITLE", "PRIORITY", "STATUS"],
    description: "Field to sort by (default: CREATED_AT)",
  })
  @ApiQuery({
    name: "sortOrder",
    required: false,
    enum: ["ASC", "DESC"],
    description: "Sort order (default: DESC)",
  })
  async findAll(@Query() query: QueryTaskDto, @CurrentUser() user: { id: string; role: UserRole }) {
    return this.tasksService.findAll(query, user);
  }

  @Get("statistics")
  @Throttle({ medium: { limit: THROTTLE_MEDIUM_LIMIT, ttl: THROTTLE_MEDIUM_TTL } })
  @ApiOperation({
    summary: "Get task statistics",
    description: "Returns statistics about tasks including counts by status and priority",
  })
  @ApiOkResponse({
    description: "Successfully retrieved statistics",
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
  @Throttle({ medium: { limit: THROTTLE_MEDIUM_LIMIT, ttl: THROTTLE_MEDIUM_TTL } })
  @ApiOperation({
    summary: "Get a task by ID",
    description: "Retrieves a single task by its UUID",
  })
  @ApiParam({
    name: "id",
    description: "Task CUID",
    example: TASK_SWAGGER_EXAMPLES.TASK_ID,
  })
  @ApiOkResponse({
    description: "Successfully retrieved task",
    type: TaskResponseDto,
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
        message: "You do not have permission to access task: cmixpvpir0001p9yp5xq8r7ks",
        error: "Forbidden",
        errorCode: "TASK_FORBIDDEN",
        timestamp: "2025-12-13T10:30:00.000Z",
        path: "/api/v1/tasks/cmixpvpir0001p9yp5xq8r7ks",
        correlationId: "550e8400-e29b-41d4-a716-446655440000",
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
  @Throttle({ short: { limit: THROTTLE_SHORT_LIMIT, ttl: THROTTLE_SHORT_TTL } })
  @ApiOperation({
    summary: "Update a task",
    description: "Updates an existing task. Only the task owner can update their tasks.",
  })
  @ApiParam({
    name: "id",
    description: "Task CUID",
    example: TASK_SWAGGER_EXAMPLES.TASK_ID,
  })
  @ApiOkResponse({
    description: "Successfully updated task",
    type: TaskResponseDto,
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
        path: "/api/v1/tasks/cmixpvpir0001p9yp5xq8r7ks",
        correlationId: "550e8400-e29b-41d4-a716-446655440000",
      },
    },
  })
  @ApiBadRequestResponse({
    description: "Invalid input data",
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
    description: "Cannot update other user's task",
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
    description: "Too many requests",
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
  @Throttle({ short: { limit: THROTTLE_SHORT_LIMIT, ttl: THROTTLE_SHORT_TTL } })
  @ApiOperation({
    summary: "Delete a task",
    description:
      "Soft deletes a task. The task will be marked as deleted but retained in the database.",
  })
  @ApiParam({
    name: "id",
    description: "Task CUID",
    example: TASK_SWAGGER_EXAMPLES.TASK_ID,
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: "Task successfully deleted",
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
        path: "/api/v1/tasks/cmixpvpir0001p9yp5xq8r7ks",
        correlationId: "550e8400-e29b-41d4-a716-446655440000",
      },
    },
  })
  @ApiForbiddenResponse({
    description: "Cannot delete other user's task",
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
    description: "Too many requests",
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
  @Throttle({ short: { limit: THROTTLE_SHORT_LIMIT, ttl: THROTTLE_SHORT_TTL } })
  @ApiOperation({
    summary: "Permanently delete a task (admin only)",
    description: "Hard deletes a task from the database. Requires ADMIN role.",
  })
  @ApiParam({
    name: "id",
    description: "Task CUID",
    example: TASK_SWAGGER_EXAMPLES.TASK_ID,
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: "Task permanently deleted",
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
