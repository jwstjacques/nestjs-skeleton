import { IsString, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class LoginDto {
  @ApiProperty({
    description: "Username or email",
    example: "johndoe",
  })
  @IsString()
  @IsNotEmpty()
  username!: string;

  @ApiProperty({
    description: "User password",
    example: "SecurePass123!",
  })
  @IsString()
  @IsNotEmpty()
  password!: string;
}
