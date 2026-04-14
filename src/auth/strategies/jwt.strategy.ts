import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { UserRole } from "@prisma/client";
import { PrismaService } from "../../database/prisma.service";
import { AuthenticationFailedException, UserInactiveException } from "../../common/exceptions";
import { ValidatedUser } from "../interfaces/validated-user.interface";
import { TokenBlacklistService } from "../services/token-blacklist.service";

export interface JwtPayload {
  sub: string;
  jti: string;
  username: string;
  email: string;
  role: UserRole;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly tokenBlacklist: TokenBlacklistService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>("security.jwt.secret"),
    });
  }

  async validate(payload: JwtPayload): Promise<ValidatedUser> {
    // Check if token has been revoked (logout)
    if (payload.jti && (await this.tokenBlacklist.isRevoked(payload.jti))) {
      throw new AuthenticationFailedException();
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub, deletedAt: null },
    });

    if (!user) {
      throw new AuthenticationFailedException();
    }

    if (!user.isActive) {
      throw new UserInactiveException();
    }

    return {
      id: payload.sub,
      username: payload.username,
      email: payload.email,
      role: payload.role,
    };
  }
}
