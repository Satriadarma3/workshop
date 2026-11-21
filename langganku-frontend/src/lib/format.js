export const CYCLE_LABEL = { MONTHLY: 'Bulanan', YEARLY: 'Tahunan' };

export const STATUS_META = {
  ACTIVE: { label: 'Aktif', className: 'chip-active' },
  PAUSED: { label: 'Dijeda', className: 'chip-paused' },
  CANCELLED: { label: 'Dibatalkan', className: 'chip-cancelled' },
};

const STATUS_RANK = { ACTIVE: 0, PAUSED: 1, CANCELLED: 2 };

export const rupiah = (n) => 'Rp ' + Math.round(Number(n) || 0).toLocaleString('id-ID');

const pad = (n) => String(n).padStart(2, '0');

/** 'YYYY-MM-DD' -> Date lokal (tanpa pergeseran zona waktu) */
export function parseDate(s) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export const toISODate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

export const formatDate = (s) =>
  parseDate(s).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

export function daysUntil(s) {
  const t = new Date();
  const today = new Date(t.getFullYear(), t.getMonth(), t.getDate());
  return Math.round((parseDate(s) - today) / 86400000);
}

export function relativeText(n) {
  if (n === 0) return 'Hari ini';
  if (n === 1) return 'Besok';
  if (n > 1) return `${n} hari lagi`;
  return `${Math.abs(n)} hari lalu`;
}

/** Biaya per bulan satu langganan (tahunan dibagi 12). */
export const monthlyCost = (sub) => (sub.billing_cycle === 'YEARLY' ? sub.price / 12 : sub.price);

/** Total per bulan hanya dari langganan ACTIVE. */
export const monthlyTotal = (subs) =>
  subs.filter((s) => s.status === 'ACTIVE').reduce((sum, s) => sum + monthlyCost(s), 0);

/** Urut: ACTIVE, PAUSED, CANCELLED; di dalam kelompok menurut tanggal tagihan. */
export const sortSubscriptions = (subs) =>
  [...subs].sort(
    (a, b) =>
      STATUS_RANK[a.status] - STATUS_RANK[b.status] ||
      a.next_billing_date.localeCompare(b.next_billing_date),
  );

export function greeting(date = new Date()) {
  const h = date.getHours();
  if (h < 11) return 'Selamat pagi';
  if (h < 15) return 'Selamat siang';
  if (h < 18) return 'Selamat sore';
  return 'Selamat malam';
}

export const firstName = (name = '') =>
  (name.trim().split(/\s+/)[0] || 'Kamu').replace(/^./, (c) => c.toUpperCase());
