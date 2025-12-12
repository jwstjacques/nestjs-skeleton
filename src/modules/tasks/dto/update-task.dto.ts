import { ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { CreateTaskDto } from "./create-task.dto";
import { IsEnum, IsOptional, IsDateString } from "class-validator";
import { TaskStatus } from "@prisma/client";

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  @ApiPropertyOptional({
    description: "Status of the task",
    enum: TaskStatus,
    example: TaskStatus.IN_PROGRESS,
  })
  @IsEnum(TaskStatus, {
    message: "Status must be one of: TODO, IN_PROGRESS, COMPLETED, CANCELLED",
  })
  @IsOptional()
  status?: TaskStatus;

  @ApiPropertyOptional({
    description: "Timestamp when the task was completed in ISO 8601 format",
    example: "2025-12-10T15:30:00.000Z",
    type: String,
    format: "date-time",
  })
  @IsDateString({}, { message: "Completed at must be a valid ISO 8601 date string" })
  @IsOptional()
  completedAt?: string;
}
