import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Category } from '../categories/category.entity';
import { BillingCycle, SubscriptionStatus } from '../common/constants';
import { decimalTransformer } from '../common/decimal.transformer';
import { User } from '../users/user.entity';

@Entity('subscriptions')
@Check(`"price" > 0`)
@Check(`"billing_cycle" IN ('MONTHLY', 'YEARLY')`)
@Check(`"status" IN ('ACTIVE', 'PAUSED', 'CANCELLED')`)
@Index(['user_id', 'status', 'next_billing_date'])
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  // Hapus pengguna -> langganannya ikut terhapus
  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @Column({ type: 'uuid', nullable: true })
  category_id: string | null;

  // Hapus kategori -> category_id langganan menjadi NULL (langganan tetap ada)
  @ManyToOne(() => Category, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'category_id' })
  category?: Category | null;

  @Column({ type: 'varchar', length: 150 })
  service_name: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, transformer: decimalTransformer })
  price: number;

  @Column({ type: 'varchar', length: 10 })
  billing_cycle: BillingCycle;

  // Tipe DATE: dibaca sebagai string 'YYYY-MM-DD' (tanpa jam dan zona waktu)
  @Column({ type: 'date' })
  next_billing_date: string;

  @Column({ type: 'varchar', length: 10, default: 'ACTIVE' })
  status: SubscriptionStatus;

  @Column({ type: 'text', default: '' })
  notes: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
