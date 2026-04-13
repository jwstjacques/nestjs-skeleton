import { Controller, Get, Param } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiOkResponse } from "@nestjs/swagger";
import { plainToInstance } from "class-transformer";
import { TasksService } from "./tasks.service";
import { TaskResponseDto } from "./dto";
import { ParseCuidPipe } from "../../common/pipes";
import { CurrentUser } from "../../auth/decorators";
import { ValidatedUser } from "../../auth/interfaces/validated-user.interface";
import { TASK_SWAGGER_DOCS, TaskErrorCode } from "./constants";
import {
  ApiAuthValidationResponses,
  ApiReadOneOperation,
  ApiTaskIdParam,
  ApiForbiddenTaskResponse,
} from "../../common/decorators";

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
  async getNextDueTask(@CurrentUser() user: ValidatedUser): Promise<TaskResponseDto | null> {
    const task = await this.tasksService.findNextDueTask(user.id);

    if (!task) {
      return null;
    }

    return plainToInstance(TaskResponseDto, task, { excludeExtraneousValues: true });
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
    @CurrentUser() user: ValidatedUser,
  ): Promise<TaskResponseDto> {
    const task = await this.tasksService.findOneWithPermissions(id, user);

    return plainToInstance(TaskResponseDto, task, { excludeExtraneousValues: true });
  }
}
