import { Transform } from 'class-transformer';

export const Trim = () => Transform(({ value }) => (typeof value === 'string' ? value.trim() : value));

export const TrimLower = () =>
  Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value));

export const EmptyToNull = () => Transform(({ value }) => (value === '' ? null : value));

export const EmptyToUndefined = () => Transform(({ value }) => (value === '' ? undefined : value));

/** Terima angka atau string angka; bulatkan ke 2 desimal (sesuai DECIMAL(12,2)). Selain itu jadi NaN agar gagal validasi. */
export const ToMoney = () =>
  Transform(({ value }) => {
    if (value === undefined) return undefined;
    if (value === null || value === '' || typeof value === 'boolean') return NaN;
    const n = Number(value);
    return Number.isFinite(n) ? Math.round(n * 100) / 100 : NaN;
  });
