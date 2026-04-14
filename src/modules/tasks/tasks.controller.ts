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
import { ApiTags, ApiOperation, ApiOkResponse, ApiQuery, ApiResponse } from "@nestjs/swagger";
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
import {
  ApiCreateOperation,
  ApiReadListOperation,
  ApiReadOneOperation,
  ApiUpdateOperation,
  ApiDeleteOperation,
  ApiAdminDeleteOperation,
  ApiTaskIdParam,
  ApiForbiddenTaskResponse,
} from "../../common/decorators";
import { TASK_API_TAG, TASK_SWAGGER_DOCS } from "./constants";
import { TaskErrorCode } from "./constants";

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
 * Throttle limits for task operations.
 *
 * @nestjs/throttler decorators require compile-time constants -- ConfigService
 * is not available at decoration time. These MUST match the throttler config
 * in app.module.ts ThrottlerModule.forRootAsync(). If you change limits there,
 * update them here too.
 *
 * grep marker: THROTTLE_SYNC
 */
const THROTTLE_LIMITS = {
  /** 10 requests per 1 second (THROTTLE_SYNC: throttle.short in app.module.ts) */
  SHORT: { ttl: 1000, limit: 10 },
  /** 50 requests per 10 seconds (THROTTLE_SYNC: throttle.medium in app.module.ts) */
  MEDIUM: { ttl: 10000, limit: 50 },
} as const;

@ApiTags(TASK_API_TAG)
@Controller("tasks")
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ short: THROTTLE_LIMITS.SHORT })
  @ApiCreateOperation({
    summary: TASK_SWAGGER_DOCS.CREATE_SUMMARY,
    description: TASK_SWAGGER_DOCS.CREATE_DESCRIPTION,
    resourceName: "Task",
    responseType: TaskResponseDto,
    path: "/api/v1/tasks",
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
  @ApiReadListOperation({
    summary: TASK_SWAGGER_DOCS.GET_ALL_SUMMARY,
    description: TASK_SWAGGER_DOCS.GET_ALL_DESCRIPTION,
    resourceName: "Task",
    responseType: PaginatedTasksResponseDto,
    path: "/api/v1/tasks",
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
  @ApiReadOneOperation({
    summary: TASK_SWAGGER_DOCS.GET_BY_ID_SUMMARY,
    description: TASK_SWAGGER_DOCS.GET_BY_ID_DESCRIPTION,
    resourceName: "Task",
    responseType: TaskResponseDto,
    notFoundErrorCode: TaskErrorCode.TASK_NOT_FOUND,
    path: "/api/v1/tasks/:id",
  })
  @ApiTaskIdParam()
  @ApiForbiddenTaskResponse("/api/v1/tasks/:id")
  async findOne(
    @Param("id", ParseCuidPipe) id: string,
    @CurrentUser() user: { id: string; role: UserRole },
  ): Promise<TaskResponseDto> {
    const task = await this.tasksService.findOne(id, user);

    return new TaskResponseDto(task);
  }

  @Patch(":id")
  @Throttle({ short: THROTTLE_LIMITS.SHORT })
  @ApiUpdateOperation({
    summary: TASK_SWAGGER_DOCS.UPDATE_SUMMARY,
    description: TASK_SWAGGER_DOCS.UPDATE_DESCRIPTION,
    resourceName: "Task",
    responseType: TaskResponseDto,
    notFoundErrorCode: TaskErrorCode.TASK_NOT_FOUND,
    path: "/api/v1/tasks/:id",
  })
  @ApiTaskIdParam()
  @ApiForbiddenTaskResponse("/api/v1/tasks/:id")
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
  @ApiDeleteOperation({
    summary: TASK_SWAGGER_DOCS.DELETE_SUMMARY,
    description: TASK_SWAGGER_DOCS.DELETE_DESCRIPTION,
    resourceName: "Task",
    notFoundErrorCode: TaskErrorCode.TASK_NOT_FOUND,
    path: "/api/v1/tasks/:id",
  })
  @ApiTaskIdParam()
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: TASK_SWAGGER_DOCS.DELETE_SUCCESS,
  })
  @ApiForbiddenTaskResponse("/api/v1/tasks/:id")
  async remove(
    @Param("id", ParseCuidPipe) id: string,
    @CurrentUser() user: { id: string; role: UserRole },
  ): Promise<void> {
    await this.tasksService.remove(id, user);
  }

  @Delete(":id/purge")
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Throttle({ short: THROTTLE_LIMITS.SHORT })
  @ApiAdminDeleteOperation({
    summary: TASK_SWAGGER_DOCS.PURGE_SUMMARY,
    description: TASK_SWAGGER_DOCS.PURGE_DESCRIPTION,
    resourceName: "Task",
    notFoundErrorCode: TaskErrorCode.TASK_NOT_FOUND,
    path: "/api/v1/tasks/:id/purge",
  })
  @ApiTaskIdParam()
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: TASK_SWAGGER_DOCS.PURGE_SUCCESS,
  })
  async purge(@Param("id", ParseCuidPipe) id: string): Promise<void> {
    await this.tasksService.purge(id);
  }
}
