import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { SESSION_EXPIRED_MESSAGE } from '../common/constants';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly users: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  /** Hasil return menjadi req.user. Akun yang sudah dihapus otomatis ditolak. */
  async validate(payload: { sub: string }) {
    const user = await this.users.findById(payload.sub);
    if (!user) throw new UnauthorizedException(SESSION_EXPIRED_MESSAGE);
    return user;
  }
}
