import { UnprocessableEntityException, ValidationError, ValidationPipe } from '@nestjs/common';

/**
 * Validasi DTO. Kegagalan dibalas 422 dengan bentuk sesuai docs/API.md:
 * { message: "<pesan pertama>", errors: { field: "pesan" } }
 */
export const appValidationPipe = new ValidationPipe({
  whitelist: true, // field di luar DTO (mis. user_id dari badan) dibuang
  transform: true,
  exceptionFactory: (errors: ValidationError[]) => {
    const fields: Record<string, string> = {};
    for (const err of errors) {
      const first = Object.values(err.constraints ?? {})[0];
      if (first) fields[err.property] = first;
    }
    const message = Object.values(fields)[0] ?? 'Data tidak valid.';
    return new UnprocessableEntityException({ message, errors: fields });
  },
});
