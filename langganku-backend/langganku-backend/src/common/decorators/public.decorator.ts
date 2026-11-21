import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
/** Tandai endpoint yang tidak butuh token (register, login). */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
