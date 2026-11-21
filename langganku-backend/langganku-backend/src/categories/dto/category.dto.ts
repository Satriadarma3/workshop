import { IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { CATEGORY_ICONS } from '../../common/constants';
import { EmptyToUndefined, Trim } from '../../common/transforms';

export class CategoryDto {
  @Trim()
  @IsString({ message: 'Nama kategori wajib diisi.' })
  @IsNotEmpty({ message: 'Nama kategori wajib diisi.' })
  @MaxLength(100, { message: 'Nama kategori maksimal 100 karakter.' })
  name: string;

  @EmptyToUndefined()
  @IsOptional()
  @IsIn(CATEGORY_ICONS, { message: 'Ikon tidak valid.' })
  icon?: string;
}
