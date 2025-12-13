import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, MinLength, MaxLength, Matches, IsOptional } from "class-validator";

export class RegisterDto {
  @ApiProperty({
    description: "User email address",
    example: "user@example.com",
  })
  @IsEmail({}, { message: "Invalid email format" })
  email!: string;

  @ApiProperty({
    description: "Unique username",
    example: "johndoe",
    minLength: 3,
    maxLength: 30,
  })
  @IsString()
  @MinLength(3, { message: "Username must be at least 3 characters long" })
  @MaxLength(30, { message: "Username must not exceed 30 characters" })
  username!: string;

  @ApiProperty({
    description:
      "User password (min 8 characters, must include uppercase, lowercase, number, and special character)",
    example: "SecureP@ssw0rd",
    minLength: 8,
  })
  @IsString()
  @MinLength(8, { message: "Password must be at least 8 characters long" })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
  })
  password!: string;

  @ApiProperty({
    description: "User's first name (optional)",
    example: "John",
    required: false,
  })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({
    description: "User's last name (optional)",
    example: "Doe",
    required: false,
  })
  @IsString()
  @IsOptional()
  lastName?: string;
}
