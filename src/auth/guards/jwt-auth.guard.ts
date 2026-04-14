import { Injectable, ExecutionContext } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Reflector } from "@nestjs/core";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";
import { CorrelationService } from "../../common/correlation";
import { RequestWithUser } from "../interfaces/validated-user.interface";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  constructor(
    private reflector: Reflector,
    private correlationService: CorrelationService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // Call parent to validate JWT
    const canActivate = await super.canActivate(context);

    if (canActivate) {
      // Extract user from request after successful authentication
      const request = context.switchToHttp().getRequest<RequestWithUser>();
      const user = request.user;

      if (user?.id) {
        // Set user ID in correlation context for logging
        this.correlationService.setUserId(user.id);
      }
    }

    return canActivate as boolean;
  }
}
