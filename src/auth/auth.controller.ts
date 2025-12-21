import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { RegisterDto, LoginDto, AuthResponseDto, RefreshTokenDto } from "./dto";
import { JwtRefreshGuard } from "./guards";
import { CurrentUser, Public } from "./decorators";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post("register")
  @ApiOperation({ summary: "Register a new user" })
  @ApiCreatedResponse({
    description: "User successfully registered",
    type: AuthResponseDto,
  })
  @ApiBadRequestResponse({
    description: "Invalid input data or user already exists",
    schema: {
      examples: {
        validationError: {
          value: {
            statusCode: HttpStatus.BAD_REQUEST,
            message: ["email must be an email"],
            error: "Bad Request",
            errorCode: "VALIDATION_FAILED",
            timestamp: "2025-12-13T10:30:00.000Z",
            path: "/api/v1/auth/register",
            correlationId: "550e8400-e29b-41d4-a716-446655440000",
          },
        },
        emailExists: {
          value: {
            statusCode: HttpStatus.CONFLICT,
            message: "Email already registered: test@example.com",
            error: "Conflict",
            errorCode: "AUTH_EMAIL_EXISTS",
            timestamp: "2025-12-13T10:30:00.000Z",
            path: "/api/v1/auth/register",
            correlationId: "550e8400-e29b-41d4-a716-446655440000",
          },
        },
        usernameExists: {
          value: {
            statusCode: HttpStatus.CONFLICT,
            message: "Username already taken: johndoe",
            error: "Conflict",
            errorCode: "AUTH_USERNAME_EXISTS",
            timestamp: "2025-12-13T10:30:00.000Z",
            path: "/api/v1/auth/register",
            correlationId: "550e8400-e29b-41d4-a716-446655440000",
          },
        },
      },
    },
  })
  async register(@Body() registerDto: RegisterDto) {
    const result = await this.authService.register(registerDto);

    return { data: result };
  }

  @Public()
  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Login with username/email and password" })
  @ApiCreatedResponse({
    description: "User successfully logged in",
    type: AuthResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: "Invalid credentials",
    schema: {
      example: {
        statusCode: HttpStatus.UNAUTHORIZED,
        message: "Invalid email or password",
        error: "Unauthorized",
        errorCode: "AUTH_INVALID_CREDENTIALS",
        timestamp: "2025-12-13T10:30:00.000Z",
        path: "/api/v1/auth/login",
        correlationId: "550e8400-e29b-41d4-a716-446655440000",
      },
    },
  })
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(loginDto);

    return { data: result };
  }

  @Public()
  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshGuard)
  @ApiOperation({ summary: "Refresh access token using refresh token" })
  @ApiBearerAuth("JWT-auth")
  @ApiCreatedResponse({
    description: "Tokens successfully refreshed",
    schema: {
      example: {
        data: {
          accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
          refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: "Invalid refresh token",
    schema: {
      examples: {
        tokenExpired: {
          value: {
            statusCode: HttpStatus.UNAUTHORIZED,
            message: "Authentication token has expired",
            error: "Unauthorized",
            errorCode: "AUTH_TOKEN_EXPIRED",
            timestamp: "2025-12-13T10:30:00.000Z",
            path: "/api/v1/auth/refresh",
            correlationId: "550e8400-e29b-41d4-a716-446655440000",
          },
        },
        tokenInvalid: {
          value: {
            statusCode: HttpStatus.UNAUTHORIZED,
            message: "Invalid authentication token",
            error: "Unauthorized",
            errorCode: "AUTH_TOKEN_INVALID",
            timestamp: "2025-12-13T10:30:00.000Z",
            path: "/api/v1/auth/refresh",
            correlationId: "550e8400-e29b-41d4-a716-446655440000",
          },
        },
      },
    },
  })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto, @CurrentUser("userId") userId: string) {
    const tokens = await this.authService.refreshTokens(userId);

    return { data: tokens };
  }
}
