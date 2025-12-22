import { Controller, Get, Param, HttpStatus } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiBearerAuth,
  ApiParam,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { TasksService } from "./tasks.service";
import { TaskResponseDto } from "./dto";
import { ParseCuidPipe } from "../../common/pipes";
import { CurrentUser } from "../../auth/decorators";
import { TASK_SWAGGER_DOCS } from "./constants";

interface UserPayload {
  id: string;
  username: string;
  email: string;
  role: string;
}

/**
 * Tasks v2 Controller - API Versioning
 *
 * This controller handles v2 endpoints for the Tasks module with enhanced features:
 * - Permission checks (owner or admin access)
 * - Next due date endpoint
 * - Status filtering for active tasks only
 *
 * All endpoints are available at /api/v2/tasks
 */
@ApiTags("tasks-v2")
@ApiBearerAuth("JWT-auth")
@Controller({ path: "tasks", version: "2" })
export class TasksV2Controller {
  constructor(private readonly tasksService: TasksService) {}

  /**
   * Get task with nearest upcoming due date
   * Returns only active tasks (TODO or IN_PROGRESS status)
   */
  @Get("next-due-date")
  @ApiOperation({
    summary: TASK_SWAGGER_DOCS.GET_NEXT_DUE_SUMMARY,
    description: TASK_SWAGGER_DOCS.GET_NEXT_DUE_DESCRIPTION,
  })
  @ApiOkResponse({
    description: TASK_SWAGGER_DOCS.GET_NEXT_DUE_SUCCESS,
    type: TaskResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: TASK_SWAGGER_DOCS.UNAUTHORIZED,
  })
  async getNextDueTask(@CurrentUser() user: UserPayload): Promise<TaskResponseDto | null> {
    return this.tasksService.findNextDueTask(user.id);
  }

  /**
   * Get task by ID with permission checks
   * User must be the task owner or an admin
   */
  @Get(":id")
  @ApiOperation({
    summary: TASK_SWAGGER_DOCS.GET_BY_ID_SUMMARY,
    description: TASK_SWAGGER_DOCS.GET_BY_ID_DESCRIPTION,
  })
  @ApiParam({
    name: "id",
    description: TASK_SWAGGER_DOCS.PARAM_ID,
    example: "cm4abc123xyz456def789ghi",
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
        message: "Task not found: cmiympu7x00002tsaknh5dqql",
        error: "TASK_NOT_FOUND",
        timestamp: "2025-12-22T03:22:11.586Z",
        path: "/api/v1/tasks/cmiympu7x00002tsaknh5dqql",
        correlationId: "8ceb6b29-7027-4844-b63f-0e443bedc890",
        errorCode: "TASK_NOT_FOUND",
      },
    },
  })
  @ApiForbiddenResponse({
    description: TASK_SWAGGER_DOCS.FORBIDDEN,
    schema: {
      example: {
        statusCode: HttpStatus.FORBIDDEN,
        message: "You do not have permission to access this task",
        error: "Forbidden",
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: TASK_SWAGGER_DOCS.UNAUTHORIZED,
  })
  async findOne(
    @Param("id", ParseCuidPipe) id: string,
    @CurrentUser() user: UserPayload,
  ): Promise<TaskResponseDto> {
    return this.tasksService.findOneWithPermissions(id, user);
  }
}
