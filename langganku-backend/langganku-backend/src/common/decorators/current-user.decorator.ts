import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/** Pengguna yang sedang login (diisi JwtStrategy). */
export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  return ctx.switchToHttp().getRequest().user;
});
