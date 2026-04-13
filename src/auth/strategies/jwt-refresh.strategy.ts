import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../../database/prisma.service";
import { JwtPayload } from "./jwt.strategy";
import { AuthenticationFailedException, UserInactiveException } from "../../common/exceptions";
import { ValidatedUser } from "../interfaces/validated-user.interface";

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, "jwt-refresh") {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField("refreshToken"),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>("security.jwt.refreshSecret"),
    });
  }

  async validate(payload: JwtPayload): Promise<ValidatedUser> {
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
