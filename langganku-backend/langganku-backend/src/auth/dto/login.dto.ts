import { IsNotEmpty, IsString } from 'class-validator';
import { TrimLower } from '../../common/transforms';

export class LoginDto {
  @TrimLower()
  @IsString({ message: 'Email wajib diisi.' })
  @IsNotEmpty({ message: 'Email wajib diisi.' })
  email: string;

  @IsString({ message: 'Kata sandi wajib diisi.' })
  @IsNotEmpty({ message: 'Kata sandi wajib diisi.' })
  password: string;
}
