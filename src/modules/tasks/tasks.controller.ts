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
} from "@nestjs/common";
import { TasksService } from "./tasks.service";
import { CreateTaskDto, UpdateTaskDto, QueryTaskDto, TaskResponseDto } from "./dto";
import { ParseCuidPipe } from "../../common/pipes";

@Controller("tasks")
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  /**
   * Create a new task
   * POST /tasks
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createTaskDto: CreateTaskDto): Promise<TaskResponseDto> {
    // TODO: Get userId from authenticated user (after auth is implemented)
    // Using admin user CUID for testing until authentication is implemented
    const userId = "cmixpvpir0000p9ypdk6za4qc"; // admin@example.com

    const task = await this.tasksService.create(createTaskDto, userId);

    return new TaskResponseDto(task);
  }

  /**
   * Get all tasks with pagination and filters
   * GET /tasks
   */
  @Get()
  async findAll(@Query() query: QueryTaskDto) {
    return this.tasksService.findAll(query);
  }

  /**
   * Get task statistics
   * GET /tasks/statistics
   */
  @Get("statistics")
  async getStatistics(@Query("userId") userId?: string) {
    return this.tasksService.getStatistics(userId);
  }

  /**
   * Get a single task by ID
   * GET /tasks/:id
   */
  @Get(":id")
  async findOne(@Param("id", ParseCuidPipe) id: string): Promise<TaskResponseDto> {
    const task = await this.tasksService.findOne(id);

    return new TaskResponseDto(task);
  }

  /**
   * Update a task
   * PATCH /tasks/:id
   */
  @Patch(":id")
  async update(
    @Param("id", ParseCuidPipe) id: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ): Promise<TaskResponseDto> {
    const task = await this.tasksService.update(id, updateTaskDto);

    return new TaskResponseDto(task);
  }

  /**
   * Soft delete a task
   * DELETE /tasks/:id
   */
  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param("id", ParseCuidPipe) id: string): Promise<void> {
    await this.tasksService.remove(id);
  }
}
