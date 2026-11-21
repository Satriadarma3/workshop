import { ConflictException, Injectable, NotFoundException, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DEFAULT_CATEGORIES } from '../common/constants';
import { isUniqueViolation } from '../common/db-errors';
import { User } from '../users/user.entity';
import { Category } from './category.entity';
import { CategoryDto } from './dto/category.dto';

const NAME_TAKEN = {
  message: 'Nama kategori sudah dipakai.',
  errors: { name: 'Nama kategori sudah dipakai.' },
};

@Injectable()
export class CategoriesService implements OnApplicationBootstrap {
  constructor(@InjectRepository(Category) private readonly repo: Repository<Category>) {}

  /** Database yang benar-benar baru (tanpa kategori dan tanpa pengguna) diisi kategori awal. */
  async onApplicationBootstrap() {
    const [categories, users] = await Promise.all([this.repo.count(), this.repo.manager.count(User)]);
    if (categories === 0 && users === 0) {
      await this.repo.insert(DEFAULT_CATEGORIES.map(([name, icon]) => ({ name, icon })));
    }
  }

  list() {
    return this.repo.find({ order: { name: 'ASC' } });
  }

  async create(dto: CategoryDto) {
    await this.assertNameFree(dto.name);
    try {
      return await this.repo.save(this.repo.create({ name: dto.name, icon: dto.icon ?? 'tag' }));
    } catch (error) {
      if (isUniqueViolation(error)) throw new ConflictException(NAME_TAKEN);
      throw error;
    }
  }

  async update(id: string, dto: CategoryDto) {
    const category = await this.repo.findOneBy({ id });
    if (!category) throw new NotFoundException('Kategori tidak ditemukan.');
    await this.assertNameFree(dto.name, id);
    category.name = dto.name;
    category.icon = dto.icon ?? 'tag';
    try {
      return await this.repo.save(category);
    } catch (error) {
      if (isUniqueViolation(error)) throw new ConflictException(NAME_TAKEN);
      throw error;
    }
  }

  /** Langganan yang memakai kategori ini tidak dihapus: FK ON DELETE SET NULL mengosongkan category_id-nya. */
  async remove(id: string) {
    const result = await this.repo.delete({ id });
    if (!result.affected) throw new NotFoundException('Kategori tidak ditemukan.');
  }

  private async assertNameFree(name: string, selfId?: string) {
    const qb = this.repo.createQueryBuilder('c').where('LOWER(c.name) = LOWER(:name)', { name });
    if (selfId) qb.andWhere('c.id != :selfId', { selfId });
    if ((await qb.getCount()) > 0) throw new ConflictException(NAME_TAKEN);
  }
}
