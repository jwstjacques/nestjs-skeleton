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
  Headers,
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
} from "@nestjs/swagger";
import { TasksService } from "./tasks.service";
import {
  CreateTaskDto,
  UpdateTaskDto,
  QueryTaskDto,
  TaskResponseDto,
  PaginatedTasksResponseDto,
} from "./dto";
import { ParseCuidPipe } from "../../common/pipes";

@ApiTags("tasks")
@ApiBearerAuth("JWT-auth")
@Controller({ path: "tasks", version: "1" })
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
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
        statusCode: 400,
        message: ["title must be longer than or equal to 3 characters"],
        error: "Bad Request",
      },
    },
  })
  async create(
    @Body() createTaskDto: CreateTaskDto,
    @Headers("x-user-id") userId?: string,
  ): Promise<TaskResponseDto> {
    // TODO: Get userId from authenticated user (after auth is implemented)
    // For now, accept from header for testing or use default
    const effectiveUserId = userId || "cmixpvpir0000p9ypdk6za4qc"; // Default admin user

    const task = await this.tasksService.create(createTaskDto, effectiveUserId);

    return new TaskResponseDto(task);
  }

  @Get()
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
    enum: ["TODO", "IN_PROGRESS", "DONE"],
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
  async findAll(@Query() query: QueryTaskDto) {
    return this.tasksService.findAll(query);
  }

  @Get("statistics")
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
          DONE: 17,
        },
        byPriority: {
          LOW: 8,
          MEDIUM: 20,
          HIGH: 14,
        },
      },
    },
  })
  async getStatistics(@Query("userId") userId?: string) {
    return this.tasksService.getStatistics(userId);
  }

  @Get(":id")
  @ApiOperation({
    summary: "Get a task by ID",
    description: "Retrieves a single task by its UUID",
  })
  @ApiParam({
    name: "id",
    description: "Task CUID",
    example: "cmixpvpir0001p9yp5xq8r7ks",
  })
  @ApiOkResponse({
    description: "Successfully retrieved task",
    type: TaskResponseDto,
  })
  @ApiNotFoundResponse({
    description: "Task not found",
    schema: {
      example: {
        statusCode: 404,
        message: "Task with ID 'cmixpvpir0001p9yp5xq8r7ks' not found",
        error: "Not Found",
      },
    },
  })
  @ApiBadRequestResponse({
    description: "Invalid CUID format",
    schema: {
      example: {
        statusCode: 400,
        message: "Validation failed",
        error: "Bad Request",
      },
    },
  })
  async findOne(@Param("id", ParseCuidPipe) id: string): Promise<TaskResponseDto> {
    const task = await this.tasksService.findOne(id);

    return new TaskResponseDto(task);
  }

  @Patch(":id")
  @ApiOperation({
    summary: "Update a task",
    description: "Updates an existing task. Only the task owner can update their tasks.",
  })
  @ApiParam({
    name: "id",
    description: "Task CUID",
    example: "cmixpvpir0001p9yp5xq8r7ks",
  })
  @ApiOkResponse({
    description: "Successfully updated task",
    type: TaskResponseDto,
  })
  @ApiNotFoundResponse({
    description: "Task not found",
  })
  @ApiBadRequestResponse({
    description: "Invalid input data",
  })
  async update(
    @Param("id", ParseCuidPipe) id: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ): Promise<TaskResponseDto> {
    const task = await this.tasksService.update(id, updateTaskDto);

    return new TaskResponseDto(task);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: "Delete a task",
    description:
      "Soft deletes a task. The task will be marked as deleted but retained in the database.",
  })
  @ApiParam({
    name: "id",
    description: "Task CUID",
    example: "cmixpvpir0001p9yp5xq8r7ks",
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: "Task successfully deleted",
  })
  @ApiNotFoundResponse({
    description: "Task not found",
  })
  async remove(@Param("id", ParseCuidPipe) id: string): Promise<void> {
    await this.tasksService.remove(id);
  }
}
