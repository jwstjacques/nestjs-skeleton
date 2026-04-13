import { Injectable, Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { User } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../database/prisma.service";
import { CorrelationService } from "../common/correlation";
import { RegisterDto, LoginDto, AuthResponseDto, UserResponseDto } from "./dto";
import { JwtPayload } from "./strategies";
import { plainToInstance } from "class-transformer";
import type { StringValue } from "ms";
import { Prisma } from "@prisma/client";
import {
  RegistrationConflictException,
  AuthenticationFailedException,
  InvalidCredentialsException,
} from "../common/exceptions";

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
      this.logger.warn(`${context} Registration failed: conflict for ${username}`);
      throw new RegistrationConflictException();
    }

    // Hash password
    const bcryptRounds = this.configService.get<number>("security.bcryptRounds", 12);
    const hashedPassword = await bcrypt.hash(password, bcryptRounds);

    // Create user -- wrap in P2002 catch for race condition between findFirst and create
    let user: User;

    try {
      user = await this.prisma.user.create({
        data: {
          email,
          username,
          password: hashedPassword,
          firstName: firstName || null,
          lastName: lastName || null,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        const target = (error.meta?.target as string[]) ?? [];

        this.logger.warn(
          `${context} Registration conflict on [${target.join(", ")}] for email=${email}`,
        );
        throw new RegistrationConflictException();
      }

      throw error;
    }

    this.logger.log(`${context} User registered successfully: ${username} (ID: ${user.id})`);

    // Set user ID in correlation context for subsequent operations
    this.correlationService.setUserId(user.id);

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      ...tokens,
      user: plainToInstance(UserResponseDto, user, { excludeExtraneousValues: true }),
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const context = this.correlationService.getLogContext();

    this.logger.log(`${context} Login attempt for username: ${loginDto.username}`);

    const user = await this.validateUser(loginDto.username, loginDto.password);

    if (!user) {
      this.logger.warn(`${context} Login failed: Invalid credentials for ${loginDto.username}`);
      throw new InvalidCredentialsException();
    }

    this.logger.log(`${context} User logged in successfully: ${user.username} (ID: ${user.id})`);

    // Set user ID in correlation context
    this.correlationService.setUserId(user.id);

    const tokens = await this.generateTokens(user);

    return {
      ...tokens,
      user: plainToInstance(UserResponseDto, user, { excludeExtraneousValues: true }),
    };
  }

  // Pre-computed dummy hash to ensure constant-time response when user is not found.
  // Prevents timing oracle that distinguishes "user exists" (~250ms bcrypt) from
  // "user not found" (<10ms no bcrypt).
  private static readonly DUMMY_HASH =
    "$2b$12$LJ3m4ys3Lg6Fc3CmH7JFMuZZ0v7gLFGkNOKUhLA5a2dJ7GXKD8W2S";

  async validateUser(usernameOrEmail: string, password: string): Promise<User | null> {
    const context = this.correlationService.getLogContext();

    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
        deletedAt: null,
      },
    });

    if (!user) {
      // Compare against dummy hash to prevent timing oracle
      await bcrypt.compare(password, AuthService.DUMMY_HASH);
      this.logger.warn(`${context} Login failed for: ${usernameOrEmail}`);

      return null;
    }

    if (!user.isActive) {
      // Compare against dummy hash to prevent timing oracle
      await bcrypt.compare(password, AuthService.DUMMY_HASH);
      this.logger.warn(`${context} Login failed for: ${usernameOrEmail}`);

      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      this.logger.warn(`${context} Login failed for: ${usernameOrEmail}`);

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
      throw new AuthenticationFailedException();
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
        secret: this.configService.getOrThrow<string>("security.jwt.secret"),
        expiresIn: this.configService.getOrThrow<string>("security.jwt.expiresIn") as StringValue,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.getOrThrow<string>("security.jwt.refreshSecret"),
        expiresIn: this.configService.getOrThrow<string>(
          "security.jwt.refreshExpiresIn",
        ) as StringValue,
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
