import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";
import { UserRole } from "@prisma/client";

@Exclude()
export class UserResponseDto {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  @Expose()
  id!: string;

  @ApiProperty({ example: "john.doe@example.com" })
  @Expose()
  email!: string;

  @ApiProperty({ example: "johndoe" })
  @Expose()
  username!: string;

  @ApiProperty({ example: "John" })
  @Expose()
  firstName!: string | null;

  @ApiProperty({ example: "Doe" })
  @Expose()
  lastName!: string | null;

  @ApiProperty({ enum: UserRole, example: UserRole.USER })
  @Expose()
  role!: UserRole;

  @ApiProperty({ example: true })
  @Expose()
  isActive!: boolean;

  @ApiProperty({ example: "2025-11-28T10:30:00.000Z" })
  @Expose()
  createdAt!: Date;

  // Exclude sensitive fields
  password!: string;
  deletedAt!: Date | null;
}

export class AuthResponseDto {
  @ApiProperty({
    description: "JWT access token (expires in 15 minutes)",
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  })
  accessToken!: string;

  @ApiProperty({
    description: "Refresh token (expires in 7 days)",
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  })
  refreshToken!: string;

  @ApiProperty({
    description: "User information",
    type: UserResponseDto,
  })
  user!: UserResponseDto;
}
