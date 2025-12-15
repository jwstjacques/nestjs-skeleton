import { ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { CreateTaskDto } from "./create-task.dto";
import { IsEnum, IsOptional, IsDateString } from "class-validator";
import { TaskStatus } from "@prisma/client";
import { TASK_VALIDATION_MESSAGES } from "../constants";
import { ValidationMessages } from "../../../common/constants";

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  @ApiPropertyOptional({
    description: "Status of the task",
    enum: TaskStatus,
    example: TaskStatus.IN_PROGRESS,
  })
  @IsEnum(TaskStatus, {
    message: TASK_VALIDATION_MESSAGES.STATUS_INVALID,
  })
  @IsOptional()
  status?: TaskStatus;

  @ApiPropertyOptional({
    description: "Timestamp when the task was completed in ISO 8601 format",
    example: "2025-12-10T15:30:00.000Z",
    type: String,
    format: "date-time",
  })
  @IsDateString({}, { message: ValidationMessages.invalidFormat("Completed at") })
  @IsOptional()
  completedAt?: string;
}
