import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { SESSION_EXPIRED_MESSAGE } from '../common/constants';
import { IS_PUBLIC_KEY } from '../common/decorators/public.decorator';

/** Terpasang global: semua endpoint butuh token kecuali yang ditandai @Public(). */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;
    return super.canActivate(context);
  }

  handleRequest<T>(err: unknown, user: T): T {
    if (err || !user) throw new UnauthorizedException(SESSION_EXPIRED_MESSAGE);
    return user;
  }
}
