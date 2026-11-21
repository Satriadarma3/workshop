import { ValueTransformer } from 'typeorm';

/** Kolom DECIMAL dibaca pg sebagai string; ubah ke angka agar JSON sesuai kontrak API. */
export const decimalTransformer: ValueTransformer = {
  to: (value?: number | null) => value,
  from: (value?: string | null) => (value === null || value === undefined ? value : parseFloat(value)),
};
