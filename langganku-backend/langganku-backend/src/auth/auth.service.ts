import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash, hashSync } from 'bcryptjs';
import { isUniqueViolation } from '../common/db-errors';
import { PublicUser } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

const BCRYPT_ROUNDS = 10;
// Dipakai agar waktu respons login sama baik email ada maupun tidak
const DUMMY_HASH = hashSync('langganku-dummy-password', BCRYPT_ROUNDS);

const EMAIL_TAKEN = {
  message: 'Email sudah terdaftar.',
  errors: { email: 'Email sudah terdaftar.' },
};

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    if (await this.users.findByEmail(dto.email)) throw new ConflictException(EMAIL_TAKEN);

    const password_hash = await hash(dto.password, BCRYPT_ROUNDS);
    try {
      const user = await this.users.create({ name: dto.name, email: dto.email, password_hash });
      return this.issueToken(user);
    } catch (error) {
      if (isUniqueViolation(error)) throw new ConflictException(EMAIL_TAKEN);
      throw error;
    }
  }

  async login(dto: LoginDto) {
    const user = await this.users.findForLogin(dto.email);
    const valid = await compare(dto.password, user?.password_hash ?? DUMMY_HASH);
    if (!user || !valid) throw new UnauthorizedException('Email atau kata sandi salah.');

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...publicUser } = user;
    return this.issueToken(publicUser);
  }

  private async issueToken(user: PublicUser) {
    const token = await this.jwt.signAsync({ sub: user.id, email: user.email });
    return { token, user };
  }
}
