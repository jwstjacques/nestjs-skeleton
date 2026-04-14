import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus, Headers } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiUnauthorizedResponse,
  ApiBearerAuth,
  ApiTooManyRequestsResponse,
} from "@nestjs/swagger";
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
  @ApiOperation({ summary: "Register a new user" })
  @ApiCreatedResponse({
    description: "User successfully registered",
    type: AuthResponseDto,
  })
  @ApiBadRequestResponse({
    description: "Invalid input data",
    content: {
      "application/json": {
        examples: {
          validationError: AUTH_SWAGGER_EXAMPLES.register.validationError,
        },
      },
    },
  })
  @ApiConflictResponse({
    description: "Email or username already registered",
    content: {
      "application/json": {
        examples: {
          registrationConflict: AUTH_SWAGGER_EXAMPLES.register.registrationConflict,
        },
      },
    },
  })
  @ApiTooManyRequestsResponse({ description: "Too many registration attempts" })
  async register(@Body() registerDto: RegisterDto) {
    const result = await this.authService.register(registerDto);

    return { data: result };
  }

  @Public()
  @Post("login")
  @HttpCode(HttpStatus.OK)
  @UseGuards(LoginThrottlerGuard)
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

  @Post("logout")
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Logout and revoke current access token" })
  @ApiOkResponse({ description: "Successfully logged out" })
  @ApiUnauthorizedResponse({ description: "Invalid or expired token" })
  async logout(@Headers("authorization") authHeader: string) {
    // Token is already validated by the global JwtAuthGuard.
    // Decode the payload to get jti and exp for blacklisting.
    const token = authHeader.replace("Bearer ", "");
    const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString()) as {
      jti: string;
      exp: number;
    };

    await this.authService.logout(payload.jti, payload.exp);

    return { data: { message: "Successfully logged out" } };
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
