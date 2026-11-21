import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { Trim, TrimLower } from '../../common/transforms';

export class RegisterDto {
  @Trim()
  @IsString({ message: 'Nama wajib diisi.' })
  @IsNotEmpty({ message: 'Nama wajib diisi.' })
  @MaxLength(100, { message: 'Nama maksimal 100 karakter.' })
  name: string;

  @TrimLower()
  @IsEmail({}, { message: 'Format email belum valid.' })
  @MaxLength(255, { message: 'Format email belum valid.' })
  email: string;

  // bcrypt hanya memakai 72 byte pertama, jadi batasi di sini
  @IsString({ message: 'Kata sandi minimal 6 karakter.' })
  @MinLength(6, { message: 'Kata sandi minimal 6 karakter.' })
  @MaxLength(72, { message: 'Kata sandi maksimal 72 karakter.' })
  password: string;
}
