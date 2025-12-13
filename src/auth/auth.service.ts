import { Injectable, ConflictException, UnauthorizedException, Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { User } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../database/prisma.service";
import { CorrelationService } from "../common/correlation";
import { RegisterDto, LoginDto, AuthResponseDto, UserResponseDto } from "./dto";
import { JwtPayload } from "./strategies";
import { plainToInstance } from "class-transformer";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly correlationService: CorrelationService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, username, password, firstName, lastName } = registerDto;
    const context = this.correlationService.getLogContext();

    this.logger.log(`${context} Registration attempt for username: ${username}`);

    // Check if user exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
        deletedAt: null,
      },
    });

    if (existingUser) {
      if (existingUser.email === email) {
        this.logger.warn(`${context} Registration failed: Email ${email} already registered`);
        throw new ConflictException("Email already registered");
      }

      this.logger.warn(`${context} Registration failed: Username ${username} already taken`);
      throw new ConflictException("Username already taken");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        firstName: firstName || null,
        lastName: lastName || null,
      },
    });

    this.logger.log(`${context} User registered successfully: ${username} (ID: ${user.id})`);

    // Set user ID in correlation context for subsequent operations
    this.correlationService.setUserId(user.id);

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      ...tokens,
      user: plainToInstance(UserResponseDto, user),
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const context = this.correlationService.getLogContext();

    this.logger.log(`${context} Login attempt for username: ${loginDto.username}`);

    const user = await this.validateUser(loginDto.username, loginDto.password);

    if (!user) {
      this.logger.warn(`${context} Login failed: Invalid credentials for ${loginDto.username}`);
      throw new UnauthorizedException("Invalid credentials");
    }

    this.logger.log(`${context} User logged in successfully: ${user.username} (ID: ${user.id})`);

    // Set user ID in correlation context
    this.correlationService.setUserId(user.id);

    const tokens = await this.generateTokens(user);

    return {
      ...tokens,
      user: plainToInstance(UserResponseDto, user),
    };
  }

  async validateUser(usernameOrEmail: string, password: string): Promise<User | null> {
    const context = this.correlationService.getLogContext();

    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
        deletedAt: null,
      },
    });

    if (!user) {
      this.logger.debug(`${context} User not found: ${usernameOrEmail}`);

      return null;
    }

    if (!user.isActive) {
      this.logger.warn(`${context} Login attempt for inactive user: ${usernameOrEmail}`);

      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      this.logger.warn(`${context} Invalid password for user: ${usernameOrEmail}`);

      return null;
    }

    return user;
  }

  async refreshTokens(userId: string): Promise<{ accessToken: string; refreshToken: string }> {
    const context = this.correlationService.getLogContext();

    this.logger.log(`${context} Refresh token request for user ID: ${userId}`);

    const user = await this.prisma.user.findUnique({
      where: { id: userId, deletedAt: null },
    });

    if (!user || !user.isActive) {
      this.logger.warn(`${context} Refresh token failed: User ${userId} not found or inactive`);
      throw new UnauthorizedException("User not found or inactive");
    }

    this.logger.log(
      `${context} Tokens refreshed successfully for user: ${user.username} (ID: ${userId})`,
    );

    // Set user ID in correlation context
    this.correlationService.setUserId(user.id);

    return this.generateTokens(user);
  }

  private async generateTokens(user: User): Promise<{ accessToken: string; refreshToken: string }> {
    const context = this.correlationService.getLogContext();

    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    this.logger.debug(`${context} Generating tokens for user: ${user.username}`);

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret:
          this.configService.get<string>("JWT_SECRET") || "your-secret-key-change-in-production",
        expiresIn: "15m",
      }),
      this.jwtService.signAsync(payload, {
        secret:
          this.configService.get<string>("JWT_REFRESH_SECRET") ||
          "your-refresh-secret-change-in-production",
        expiresIn: "7d",
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
