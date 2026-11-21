import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isUUID } from 'class-validator';
import { Repository } from 'typeorm';
import { Category } from '../categories/category.entity';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { ListSubscriptionsQuery } from './dto/list-subscriptions.query';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { Subscription } from './subscription.entity';

const escapeLike = (text: string) => text.replace(/[\\%_]/g, (ch) => `\\${ch}`);

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription) private readonly repo: Repository<Subscription>,
    @InjectRepository(Category) private readonly categories: Repository<Category>,
  ) {}

  /** Selalu dibatasi pada pemilik: pengguna tidak pernah melihat langganan orang lain. */
  async list(userId: string, query: ListSubscriptionsQuery) {
    const qb = this.repo.createQueryBuilder('s').where('s.user_id = :userId', { userId });

    if (query.status) qb.andWhere('s.status = :status', { status: query.status });

    if (query.category_id === 'none') {
      qb.andWhere('s.category_id IS NULL');
    } else if (query.category_id) {
      if (!isUUID(query.category_id)) return [];
      qb.andWhere('s.category_id = :categoryId', { categoryId: query.category_id });
    }

    if (query.q) {
      qb.andWhere('(s.service_name ILIKE :like OR s.notes ILIKE :like)', { like: `%${escapeLike(query.q)}%` });
    }

    return qb.orderBy('s.next_billing_date', 'ASC').addOrderBy('s.created_at', 'ASC').getMany();
  }

  async create(userId: string, dto: CreateSubscriptionDto) {
    await this.assertCategoryExists(dto.category_id);
    const subscription = this.repo.create({
      user_id: userId,
      category_id: dto.category_id ?? null,
      service_name: dto.service_name,
      price: dto.price,
      billing_cycle: dto.billing_cycle,
      next_billing_date: dto.next_billing_date,
      status: dto.status,
      notes: dto.notes ?? '',
    });
    return this.repo.save(subscription);
  }

  /** PUT: ganti seluruh isi (field opsional yang tidak dikirim kembali ke nilai kosong). */
  async replace(userId: string, id: string, dto: CreateSubscriptionDto) {
    const subscription = await this.findOwned(userId, id);
    await this.assertCategoryExists(dto.category_id);
    Object.assign(subscription, {
      service_name: dto.service_name,
      price: dto.price,
      billing_cycle: dto.billing_cycle,
      next_billing_date: dto.next_billing_date,
      status: dto.status,
      category_id: dto.category_id ?? null,
      notes: dto.notes ?? '',
    });
    return this.repo.save(subscription);
  }

  /** PATCH: ubah hanya field yang dikirim. category_id: null mengosongkan kategori. */
  async patch(userId: string, id: string, dto: UpdateSubscriptionDto) {
    const subscription = await this.findOwned(userId, id);
    await this.assertCategoryExists(dto.category_id);

    const { category_id, notes, ...rest } = dto;
    for (const [key, value] of Object.entries(rest)) {
      if (value !== undefined) (subscription as any)[key] = value;
    }
    if (category_id !== undefined) subscription.category_id = category_id;
    if (notes !== undefined) subscription.notes = notes ?? '';

    return this.repo.save(subscription);
  }

  async remove(userId: string, id: string) {
    const result = await this.repo.delete({ id, user_id: userId });
    if (!result.affected) throw new NotFoundException('Langganan tidak ditemukan.');
  }

  /** 404 juga untuk langganan milik orang lain, supaya keberadaannya tidak terbongkar. */
  private async findOwned(userId: string, id: string) {
    const subscription = await this.repo.findOneBy({ id, user_id: userId });
    if (!subscription) throw new NotFoundException('Langganan tidak ditemukan.');
    return subscription;
  }

  private async assertCategoryExists(categoryId?: string | null) {
    if (!categoryId) return;
    if ((await this.categories.count({ where: { id: categoryId } })) === 0) {
      throw new UnprocessableEntityException({
        message: 'Kategori tidak ditemukan.',
        errors: { category_id: 'Kategori tidak ditemukan.' },
      });
    }
  }
}
