import { IsString, IsNotEmpty, MaxLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class LoginDto {
  @ApiProperty({
    description: "Username or email",
    example: "johndoe",
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255, { message: "Username must not exceed 255 characters" })
  username!: string;

  @ApiProperty({
    description: "User password",
    example: "SecurePass123!",
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(72, { message: "Password must not exceed 72 characters" })
  password!: string;
}
