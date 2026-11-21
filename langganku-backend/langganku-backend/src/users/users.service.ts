import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PublicUser, User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly repo: Repository<User>) {}

  findById(id: string) {
    return this.repo.findOneBy({ id });
  }

  findByEmail(email: string) {
    return this.repo.findOneBy({ email });
  }

  /** Sama seperti findByEmail tetapi menyertakan password_hash (hanya untuk login). */
  findForLogin(email: string) {
    return this.repo
      .createQueryBuilder('u')
      .addSelect('u.password_hash')
      .where('u.email = :email', { email })
      .getOne();
  }

  async create(data: { name: string; email: string; password_hash: string }): Promise<PublicUser> {
    const saved = await this.repo.save(this.repo.create(data));
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...user } = saved;
    return user;
  }
}
