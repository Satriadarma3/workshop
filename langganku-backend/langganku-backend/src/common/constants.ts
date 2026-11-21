export const BILLING_CYCLES = ['MONTHLY', 'YEARLY'] as const;
export type BillingCycle = (typeof BILLING_CYCLES)[number];

export const SUBSCRIPTION_STATUSES = ['ACTIVE', 'PAUSED', 'CANCELLED'] as const;
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];

// Harus sama dengan ikon yang dikenal frontend (src/lib/icons.jsx)
export const CATEGORY_ICONS = ['film', 'music', 'cloud', 'code', 'book', 'gamepad', 'bag', 'bolt', 'tag'] as const;

export const DEFAULT_CATEGORIES: ReadonlyArray<readonly [string, string]> = [
  ['Hiburan', 'film'],
  ['Musik', 'music'],
  ['Penyimpanan', 'cloud'],
  ['Pengembangan', 'code'],
  ['Belajar', 'book'],
  ['Game', 'gamepad'],
];

export const SESSION_EXPIRED_MESSAGE = 'Sesi berakhir. Silakan masuk lagi.';
