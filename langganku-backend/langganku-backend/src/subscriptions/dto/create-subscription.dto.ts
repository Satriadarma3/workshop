import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, IsUUID, Max, MaxLength } from 'class-validator';
import { BILLING_CYCLES, BillingCycle, SUBSCRIPTION_STATUSES, SubscriptionStatus } from '../../common/constants';
import { EmptyToNull, ToMoney, Trim } from '../../common/transforms';
import { IsISODate } from '../../common/validators/is-iso-date';

/**
 * Badan POST dan PUT. user_id sengaja tidak ada di sini: selalu diambil dari token JWT.
 * Satu constraint per field memakai pesan yang sama bila bisa gagal bersamaan,
 * supaya pesan yang tampil di frontend tidak bergantung pada urutan evaluasi.
 */
export class CreateSubscriptionDto {
  @Trim()
  @IsString({ message: 'Nama layanan wajib diisi.' })
  @IsNotEmpty({ message: 'Nama layanan wajib diisi.' })
  @MaxLength(150, { message: 'Nama layanan maksimal 150 karakter.' })
  service_name: string;

  @ToMoney()
  @IsNumber({}, { message: 'Harga harus lebih dari 0.' })
  @IsPositive({ message: 'Harga harus lebih dari 0.' })
  @Max(9999999999.99, { message: 'Harga terlalu besar.' })
  price: number;

  @IsIn(BILLING_CYCLES, { message: 'Siklus tagihan tidak valid.' })
  billing_cycle: BillingCycle;

  @IsISODate({ message: 'Tanggal tagihan berikutnya wajib diisi.' })
  next_billing_date: string;

  @IsIn(SUBSCRIPTION_STATUSES, { message: 'Status tidak valid.' })
  status: SubscriptionStatus;

  @EmptyToNull()
  @IsOptional()
  @IsUUID('all', { message: 'Kategori tidak ditemukan.' })
  category_id?: string | null;

  @Trim()
  @IsOptional()
  @IsString({ message: 'Catatan tidak valid.' })
  @MaxLength(2000, { message: 'Catatan maksimal 2000 karakter.' })
  notes?: string | null;
}
