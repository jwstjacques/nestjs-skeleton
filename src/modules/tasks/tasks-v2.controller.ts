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
    summary: "Get task with nearest upcoming due date",
    description:
      "Returns the task with the soonest due date that has not passed yet. " +
      "Only includes tasks with status TODO or IN_PROGRESS (excludes COMPLETED and CANCELLED). " +
      "Returns null if no upcoming active tasks exist.",
  })
  @ApiOkResponse({
    description: "Next due task found (or null if none)",
    type: TaskResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: "Unauthorized - JWT token missing or invalid",
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
    summary: "Get task by ID (v2 - with permission checks)",
    description: "Returns task only if user is the owner or an admin",
  })
  @ApiParam({
    name: "id",
    description: "Task ID (CUID format)",
    example: "cm4abc123xyz456def789ghi",
  })
  @ApiOkResponse({
    description: "Task found and user has permission to access it",
    type: TaskResponseDto,
  })
  @ApiNotFoundResponse({
    description: "Task not found",
    schema: {
      example: {
        statusCode: HttpStatus.NOT_FOUND,
        message: "Task with ID cm4abc123xyz456def789ghi not found",
        error: "Not Found",
      },
    },
  })
  @ApiForbiddenResponse({
    description: "Access denied - user is not the task owner or admin",
    schema: {
      example: {
        statusCode: HttpStatus.FORBIDDEN,
        message: "You do not have permission to access this task",
        error: "Forbidden",
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: "Unauthorized - JWT token missing or invalid",
  })
  async findOne(
    @Param("id", ParseCuidPipe) id: string,
    @CurrentUser() user: UserPayload,
  ): Promise<TaskResponseDto> {
    return this.tasksService.findOneWithPermissions(id, user);
  }
}
