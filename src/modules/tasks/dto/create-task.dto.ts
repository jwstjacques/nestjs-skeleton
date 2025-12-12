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

export class CreateTaskDto {
  @ApiProperty({
    description: "Title of the task",
    example: "Complete project documentation",
    minLength: 3,
    maxLength: 200,
  })
  @IsString({ message: "Title must be a string" })
  @IsNotEmpty({ message: "Title is required" })
  @MinLength(3, { message: "Title must be at least 3 characters long" })
  @MaxLength(200, { message: "Title must not exceed 200 characters" })
  title!: string;

  @ApiPropertyOptional({
    description: "Detailed description of the task",
    example:
      "Write comprehensive documentation for all API endpoints including examples and error codes",
    maxLength: 2000,
  })
  @IsString({ message: "Description must be a string" })
  @IsOptional()
  @MaxLength(2000, { message: "Description must not exceed 2000 characters" })
  description?: string;

  @ApiPropertyOptional({
    description: "Status of the task",
    enum: TaskStatus,
    example: TaskStatus.TODO,
    default: TaskStatus.TODO,
  })
  @IsEnum(TaskStatus, {
    message: "Status must be one of: TODO, IN_PROGRESS, COMPLETED, CANCELLED",
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
    message: "Priority must be one of: LOW, MEDIUM, HIGH, URGENT",
  })
  @IsOptional()
  priority?: TaskPriority;

  @ApiPropertyOptional({
    description: "Due date for the task in ISO 8601 date string format",
    example: "2025-12-31T23:59:59.000Z",
    type: String,
    format: "date-time",
  })
  @IsDateString({}, { message: "Due date must be a valid ISO 8601 date string" })
  @IsFutureDate({ message: "Due date must be today or in the future" })
  @IsOptional()
  dueDate?: string;
}
