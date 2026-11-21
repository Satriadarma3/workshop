/**
 * API tiruan yang berjalan di browser (data di localStorage).
 * Antarmukanya sama persis dengan createRealApi() di client.js, dan meniru aturan
 * yang sebaiknya juga dipakai backend: validasi, kode status, dan efek samping hapus kategori.
 * Hanya untuk pengembangan: kata sandi di sini TIDAK aman.
 */
import { ApiError, tokenStore } from './client';
import { addDays, toISODate } from '../lib/format';

const KEY = 'langganku.mock-db';
const wait = (ms = 140) => new Promise((r) => setTimeout(r, ms));
const uid = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : 'id-' + Math.random().toString(36).slice(2) + Date.now().toString(36);

const DEFAULT_CATEGORIES = [
  ['Hiburan', 'film'],
  ['Musik', 'music'],
  ['Penyimpanan', 'cloud'],
  ['Pengembangan', 'code'],
  ['Belajar', 'book'],
  ['Game', 'gamepad'],
];

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const db = JSON.parse(raw);
      // Auto-purge setiap kali data dibuka
      if (purgeExpiredCancellations(db)) save(db);
      return db;
    }
  } catch {
    /* mulai dari awal */
  }
  const db = {
    users: [],
    categories: DEFAULT_CATEGORIES.map(([name, icon]) => ({ id: uid(), name, icon })),
    subscriptions: [],
  };
  save(db);
  return db;
}

function save(db) {
  try {
    localStorage.setItem(KEY, JSON.stringify(db));
  } catch {
    /* abaikan */
  }
}

const publicUser = ({ password_hash, ...user }) => user; // eslint-disable-line no-unused-vars

function currentUser(db) {
  const token = tokenStore.get();
  const id = token && token.startsWith('mock.') ? token.slice(5) : null;
  const user = db.users.find((u) => u.id === id);
  if (!user) throw new ApiError('Sesi berakhir. Silakan masuk lagi.', 401);
  return user;
}

function seedSubscriptions(db, userId) {
  const cat = (name) => db.categories.find((c) => c.name === name)?.id ?? null;
  const day = (n) => toISODate(addDays(new Date(), n));
  const now = new Date().toISOString();
  const rows = [
    ['Netflix', 'Hiburan', 186000, 'MONTHLY', 3, 'ACTIVE', 'Paket premium'],
    ['Notion', null, 80000, 'MONTHLY', 5, 'ACTIVE', ''],
    ['Spotify', 'Musik', 59000, 'MONTHLY', 9, 'ACTIVE', 'Paket keluarga'],
    ['Google One', 'Penyimpanan', 29000, 'MONTHLY', 12, 'ACTIVE', '200 GB'],
    ['Domain dan hosting', 'Pengembangan', 285000, 'YEARLY', 96, 'ACTIVE', 'Perpanjang otomatis'],
    ['Duolingo', 'Belajar', 899000, 'YEARLY', 140, 'PAUSED', ''],
    ['Xbox Game Pass', 'Game', 79000, 'MONTHLY', -20, 'CANCELLED', 'Berhenti sejak bulan lalu'],
  ];
  rows.forEach(([service_name, category, price, billing_cycle, offset, status, notes]) => {
    // cancelled_at = sekarang - 5 hari (untuk data contoh CANCELLED)
    const cancelledAt = status === 'CANCELLED' ? new Date(Date.now() - 5 * 86400000).toISOString() : null;
    db.subscriptions.push({
      id: uid(),
      user_id: userId,
      category_id: category ? cat(category) : null,
      service_name,
      price,
      billing_cycle,
      next_billing_date: day(offset),
      status,
      notes,
      cancelled_at: cancelledAt,
      created_at: now,
      updated_at: now,
    });
  });
}

/* ---------- validasi (cerminan aturan backend) ---------- */
function validateSubscription(input, db) {
  const errors = {};
  const name = String(input.service_name ?? '').trim();
  const price = Number(input.price);
  if (!name) errors.service_name = 'Nama layanan wajib diisi.';
  if (input.price === '' || input.price == null || Number.isNaN(price) || price <= 0)
    errors.price = 'Harga harus lebih dari 0.';
  if (!['MONTHLY', 'YEARLY'].includes(input.billing_cycle)) errors.billing_cycle = 'Siklus tagihan tidak valid.';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(input.next_billing_date ?? '')))
    errors.next_billing_date = 'Tanggal tagihan berikutnya wajib diisi.';
  if (!['ACTIVE', 'PAUSED', 'CANCELLED'].includes(input.status)) errors.status = 'Status tidak valid.';
  if (input.category_id && !db.categories.some((c) => c.id === input.category_id))
    errors.category_id = 'Kategori tidak ditemukan.';
  if (Object.keys(errors).length) throw new ApiError(Object.values(errors)[0], 422, errors);
  return {
    service_name: name,
    price,
    billing_cycle: input.billing_cycle,
    next_billing_date: input.next_billing_date,
    status: input.status,
    category_id: input.category_id || null,
    notes: String(input.notes ?? '').trim(),
  };
}

function validateCategory(input, db, selfId = null) {
  const name = String(input.name ?? '').trim();
  if (!name) throw new ApiError('Nama kategori wajib diisi.', 422, { name: 'Nama kategori wajib diisi.' });
  if (db.categories.some((c) => c.id !== selfId && c.name.toLowerCase() === name.toLowerCase()))
    throw new ApiError('Nama kategori sudah dipakai.', 409, { name: 'Nama kategori sudah dipakai.' });
  return { name, icon: input.icon || 'tag' };
}

/** Hapus langganan CANCELLED yang sudah > 30 hari sejak dibatalkan. */
function purgeExpiredCancellations(db) {
  const LIMIT_MS = 30 * 24 * 60 * 60 * 1000;
  const now = Date.now();
  const before = db.subscriptions.length;
  db.subscriptions = db.subscriptions.filter((s) => {
    if (s.status !== 'CANCELLED') return true;
    if (!s.cancelled_at) return true; // data lama tanpa cancelled_at: biarkan
    return now - new Date(s.cancelled_at).getTime() < LIMIT_MS;
  });
  return db.subscriptions.length < before; // true kalau ada yang terpangkas
}

export function createMockApi() {
  return {
    auth: {
      async register({ name, email, password }) {
        await wait();
        const db = load();
        const mail = String(email ?? '').trim().toLowerCase();
        if (!String(name ?? '').trim()) throw new ApiError('Nama wajib diisi.', 422);
        if (!/^\S+@\S+\.\S+$/.test(mail)) throw new ApiError('Format email belum valid.', 422);
        if (String(password ?? '').length < 6) throw new ApiError('Kata sandi minimal 6 karakter.', 422);
        if (db.users.some((u) => u.email === mail)) throw new ApiError('Email sudah terdaftar.', 409);
        const now = new Date().toISOString();
        const user = {
          id: uid(),
          name: name.trim(),
          email: mail,
          password_hash: btoa(password), // hanya tiruan, bukan hash sungguhan
          created_at: now,
          updated_at: now,
        };
        db.users.push(user);
        seedSubscriptions(db, user.id);
        save(db);
        return { token: `mock.${user.id}`, user: publicUser(user) };
      },
      async login({ email, password }) {
        await wait();
        const db = load();
        const mail = String(email ?? '').trim().toLowerCase();
        const user = db.users.find((u) => u.email === mail);
        if (!user || user.password_hash !== btoa(String(password ?? '')))
          throw new ApiError('Email atau kata sandi salah.', 401);
        return { token: `mock.${user.id}`, user: publicUser(user) };
      },
      async me() {
        await wait(60);
        return publicUser(currentUser(load()));
      },
    },

    categories: {
      async list() {
        await wait(60);
        const db = load();
        currentUser(db);
        return [...db.categories];
      },
      async create(input) {
        await wait();
        const db = load();
        currentUser(db);
        const cat = { id: uid(), ...validateCategory(input, db) };
        db.categories.push(cat);
        save(db);
        return cat;
      },
      async update(id, input) {
        await wait();
        const db = load();
        currentUser(db);
        const cat = db.categories.find((c) => c.id === id);
        if (!cat) throw new ApiError('Kategori tidak ditemukan.', 404);
        Object.assign(cat, validateCategory(input, db, id));
        save(db);
        return cat;
      },
      async remove(id) {
        await wait();
        const db = load();
        currentUser(db);
        if (!db.categories.some((c) => c.id === id)) throw new ApiError('Kategori tidak ditemukan.', 404);
        db.categories = db.categories.filter((c) => c.id !== id);
        // FK opsional: langganan yang memakai kategori ini menjadi tanpa kategori
        db.subscriptions.forEach((s) => {
          if (s.category_id === id) s.category_id = null;
        });
        save(db);
        return null;
      },
    },

    subscriptions: {
      async list(query = {}) {
        await wait(60);
        const db = load();
        const user = currentUser(db);
        let rows = db.subscriptions.filter((s) => s.user_id === user.id);
        if (query.status) rows = rows.filter((s) => s.status === query.status);
        if (query.category_id)
          rows = rows.filter((s) => (query.category_id === 'none' ? !s.category_id : s.category_id === query.category_id));
        if (query.q) {
          const q = String(query.q).toLowerCase();
          rows = rows.filter((s) => `${s.service_name} ${s.notes}`.toLowerCase().includes(q));
        }
        return rows;
      },
      async create(input) {
        await wait();
        const db = load();
        const user = currentUser(db);
        const now = new Date().toISOString();
        const validated = validateSubscription(input, db);
        const sub = {
          id: uid(),
          user_id: user.id,
          ...validated,
          cancelled_at: validated.status === 'CANCELLED' ? now : null,
          created_at: now,
          updated_at: now,
        };
        db.subscriptions.push(sub);
        save(db);
        return sub;
      },
      async update(id, input) {
        await wait();
        const db = load();
        const user = currentUser(db);
        const sub = db.subscriptions.find((s) => s.id === id && s.user_id === user.id);
        if (!sub) throw new ApiError('Langganan tidak ditemukan.', 404);
        const validated = validateSubscription(input, db);
        // Set cancelled_at hanya saat pertama kali status berubah ke CANCELLED
        const cancelledAt =
          validated.status === 'CANCELLED'
            ? (sub.cancelled_at || new Date().toISOString()) // jaga jika sudah ada
            : null; // reset jika diaktifkan kembali
        Object.assign(sub, validated, {
          cancelled_at: cancelledAt,
          updated_at: new Date().toISOString(),
        });
        save(db);
        return sub;
      },
      async remove(id) {
        await wait();
        const db = load();
        const user = currentUser(db);
        if (!db.subscriptions.some((s) => s.id === id && s.user_id === user.id))
          throw new ApiError('Langganan tidak ditemukan.', 404);
        db.subscriptions = db.subscriptions.filter((s) => s.id !== id);
        save(db);
        return null;
      },
    },
  };
}
