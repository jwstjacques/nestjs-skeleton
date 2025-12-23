import { Controller, Get, Param } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiOkResponse } from "@nestjs/swagger";
import { TasksService } from "./tasks.service";
import { TaskResponseDto } from "./dto";
import { ParseCuidPipe } from "../../common/pipes";
import { CurrentUser } from "../../auth/decorators";
import { TASK_SWAGGER_DOCS, TaskErrorCode } from "./constants";
import {
  ApiAuthValidationResponses,
  ApiReadOneOperation,
  ApiTaskIdParam,
  ApiForbiddenTaskResponse,
} from "../../common/decorators";

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
@Controller({ path: "tasks", version: "2" })
export class TasksV2Controller {
  constructor(private readonly tasksService: TasksService) {}

  /**
   * Get task with nearest upcoming due date
   * Returns only active tasks (TODO or IN_PROGRESS status)
   */
  @Get("next-due-date")
  @ApiAuthValidationResponses("/api/v2/tasks/next-due-date")
  @ApiOperation({
    summary: TASK_SWAGGER_DOCS.GET_NEXT_DUE_SUMMARY,
    description: TASK_SWAGGER_DOCS.GET_NEXT_DUE_DESCRIPTION,
  })
  @ApiOkResponse({
    description: TASK_SWAGGER_DOCS.GET_NEXT_DUE_SUCCESS,
    type: TaskResponseDto,
  })
  async getNextDueTask(@CurrentUser() user: UserPayload): Promise<TaskResponseDto | null> {
    return this.tasksService.findNextDueTask(user.id);
  }

  /**
   * Get task by ID with permission checks
   * User must be the task owner or an admin
   */
  @Get(":id")
  @ApiReadOneOperation({
    summary: TASK_SWAGGER_DOCS.GET_BY_ID_SUMMARY,
    description: TASK_SWAGGER_DOCS.GET_BY_ID_DESCRIPTION,
    resourceName: "Task",
    responseType: TaskResponseDto,
    notFoundErrorCode: TaskErrorCode.TASK_NOT_FOUND,
    path: "/api/v2/tasks/:id",
  })
  @ApiTaskIdParam()
  @ApiForbiddenTaskResponse("/api/v2/tasks/:id")
  async findOne(
    @Param("id", ParseCuidPipe) id: string,
    @CurrentUser() user: UserPayload,
  ): Promise<TaskResponseDto> {
    return this.tasksService.findOneWithPermissions(id, user);
  }
}
