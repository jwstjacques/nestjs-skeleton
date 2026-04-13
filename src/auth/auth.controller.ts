import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiBearerAuth,
  ApiTooManyRequestsResponse,
} from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import { AuthService } from "./auth.service";
import { RegisterDto, LoginDto, AuthResponseDto, RefreshTokenDto } from "./dto";
import { JwtRefreshGuard } from "./guards";
import { LoginThrottlerGuard } from "./guards/login-throttler.guard";
import { CurrentUser, Public } from "./decorators";
import { AUTH_SWAGGER_EXAMPLES } from "./constants";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post("register")
  @Throttle({ strict: { ttl: 3600000, limit: 5 } })
  @ApiOperation({ summary: "Register a new user" })
  @ApiCreatedResponse({
    description: "User successfully registered",
    type: AuthResponseDto,
  })
  @ApiBadRequestResponse({
    description: "Invalid input data or user already exists",
    content: {
      "application/json": {
        examples: AUTH_SWAGGER_EXAMPLES.register,
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
  @UseGuards(LoginThrottlerGuard)
  @Throttle({ strict: { ttl: 900000, limit: 5 } })
  @ApiOperation({ summary: "Login with username/email and password" })
  @ApiTooManyRequestsResponse({ description: "Too many login attempts for this account" })
  @ApiOkResponse({
    description: "User successfully logged in",
    type: AuthResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: "Invalid credentials",
    schema: {
      example: AUTH_SWAGGER_EXAMPLES.invalidCredentials,
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
  @ApiOkResponse({
    description: "Tokens successfully refreshed",
    schema: {
      example: AUTH_SWAGGER_EXAMPLES.tokensRefreshed,
    },
  })
  @ApiUnauthorizedResponse({
    description: "Invalid refresh token",
    content: {
      "application/json": {
        examples: AUTH_SWAGGER_EXAMPLES.refreshErrors,
      },
    },
  })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto, @CurrentUser("id") userId: string) {
    const tokens = await this.authService.refreshTokens(userId);

    return { data: tokens };
  }
}
