import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsDateString,
  MaxLength,
  MinLength,
} from "class-validator";
import { TaskStatus, TaskPriority } from "@prisma/client";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsFutureDate } from "../../../common/validators";
import { ValidationMessages } from "../../../common/constants";
import { TASK_VALIDATION_MESSAGES, TASK_LIMITS, TASK_SWAGGER_EXAMPLES } from "../constants";

export class CreateTaskDto {
  @ApiProperty({
    description: "Title of the task",
    example: TASK_SWAGGER_EXAMPLES.CREATE_REQUEST.title,
    minLength: TASK_LIMITS.TITLE_MIN_LENGTH,
    maxLength: TASK_LIMITS.TITLE_MAX_LENGTH,
  })
  @IsString({ message: ValidationMessages.mustBeString("Title") })
  @IsNotEmpty({ message: ValidationMessages.required("Title") })
  @MinLength(TASK_LIMITS.TITLE_MIN_LENGTH, {
    message: ValidationMessages.minLength("Title", TASK_LIMITS.TITLE_MIN_LENGTH),
  })
  @MaxLength(TASK_LIMITS.TITLE_MAX_LENGTH, {
    message: ValidationMessages.maxLength("Title", TASK_LIMITS.TITLE_MAX_LENGTH),
  })
  title!: string;

  @ApiPropertyOptional({
    description: "Detailed description of the task",
    example: TASK_SWAGGER_EXAMPLES.CREATE_REQUEST.description,
    maxLength: TASK_LIMITS.DESCRIPTION_MAX_LENGTH,
  })
  @IsString({ message: ValidationMessages.mustBeString("Description") })
  @IsOptional()
  @MaxLength(TASK_LIMITS.DESCRIPTION_MAX_LENGTH, {
    message: ValidationMessages.maxLength("Description", TASK_LIMITS.DESCRIPTION_MAX_LENGTH),
  })
  description?: string;

  @ApiPropertyOptional({
    description: "Status of the task",
    enum: TaskStatus,
    example: TaskStatus.TODO,
    default: TaskStatus.TODO,
  })
  @IsEnum(TaskStatus, {
    message: TASK_VALIDATION_MESSAGES.STATUS_INVALID,
  })
  @IsOptional()
  status?: TaskStatus;

  @ApiPropertyOptional({
    description: "Priority level of the task",
    enum: TaskPriority,
    example: TaskPriority.MEDIUM,
    default: TaskPriority.MEDIUM,
  })
  @IsEnum(TaskPriority, {
    message: TASK_VALIDATION_MESSAGES.PRIORITY_INVALID,
  })
  @IsOptional()
  priority?: TaskPriority;

  @ApiPropertyOptional({
    description: "Due date for the task in ISO 8601 date string format",
    example: "2025-12-31T23:59:59.000Z",
    type: String,
    format: "date-time",
  })
  @IsDateString({}, { message: ValidationMessages.invalidFormat("Due date") })
  @IsFutureDate({ message: "Due date must be today or in the future" })
  @IsOptional()
  dueDate?: string;
}
