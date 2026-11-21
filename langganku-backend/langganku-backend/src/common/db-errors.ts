import { QueryFailedError } from 'typeorm';

/** Kode 23505 = unique_violation di PostgreSQL. */
export function isUniqueViolation(error: unknown): boolean {
  return error instanceof QueryFailedError && (error as any).driverError?.code === '23505';
}
