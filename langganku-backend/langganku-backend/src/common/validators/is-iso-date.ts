import { registerDecorator, ValidationOptions } from 'class-validator';

/** Tanggal kalender valid berformat YYYY-MM-DD (menolak 2026-02-31). */
export function IsISODate(options?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'isISODate',
      target: object.constructor,
      propertyName,
      options,
      validator: {
        validate(value: unknown) {
          if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
          const d = new Date(`${value}T00:00:00Z`);
          return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
        },
      },
    });
  };
}
