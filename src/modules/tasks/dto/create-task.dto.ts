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

export class CreateTaskDto {
  @IsString({ message: "Title must be a string" })
  @IsNotEmpty({ message: "Title is required" })
  @MinLength(3, { message: "Title must be at least 3 characters long" })
  @MaxLength(200, { message: "Title must not exceed 200 characters" })
  title!: string;

  @IsString({ message: "Description must be a string" })
  @IsOptional()
  @MaxLength(2000, { message: "Description must not exceed 2000 characters" })
  description?: string;

  @IsEnum(TaskStatus, {
    message: "Status must be one of: TODO, IN_PROGRESS, COMPLETED, CANCELLED",
  })
  @IsOptional()
  status?: TaskStatus;

  @IsEnum(TaskPriority, {
    message: "Priority must be one of: LOW, MEDIUM, HIGH, URGENT",
  })
  @IsOptional()
  priority?: TaskPriority;

  @IsDateString({}, { message: "Due date must be a valid ISO 8601 date string" })
  @IsOptional()
  dueDate?: string;
}
