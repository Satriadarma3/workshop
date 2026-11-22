# Langganku — frontend

Pelacak langganan berbayar. React 18 + Vite + React Router, satu kode untuk web dan mobile (responsif, titik pisah 720px). Tanpa pustaka UI atau CSS tambahan.

## Menjalankan

```bash
npm install
cp .env.example .env
npm run dev          # http://localhost:5173
```

Secara bawaan (`VITE_USE_MOCK=true`) aplikasi memakai API tiruan di browser, jadi bisa dicoba sekarang tanpa backend. Daftar dengan email apa saja dan kata sandi minimal 6 karakter; akun baru langsung berisi data contoh.

## Menghubungkan backend Anda

1. Bangun backend sesuai [docs/API.md](docs/API.md). Skema database ada di [docs/schema.sql](docs/schema.sql).
2. Di `.env`, set `VITE_USE_MOCK=false`.
3. Jalankan backend (bawaan: `http://localhost:3000`). Ubah `BACKEND_URL` di `.env` jika berbeda; `npm run dev` meneruskan `/api/*` ke sana lewat proxy Vite, jadi tidak perlu CORS saat pengembangan.
4. Untuk produksi, sajikan frontend dan API dari domain yang sama, atau set `VITE_API_URL` ke alamat API penuh dan aktifkan CORS di backend.

Seluruh akses data lewat satu objek `api` (`src/api/index.js`). `src/api/mock.js` meniru perilaku backend, termasuk validasi dan kode status, jadi bisa dibaca sebagai contoh aturan yang diharapkan.

## Struktur

```
src/
  api/          client.js (backend nyata) · mock.js (tiruan) · index.js (pemilih)
  context/      AuthContext · DataContext (langganan + kategori) · UIContext (form, konfirmasi)
  components/   Shell · TopNav (web) · BottomNav (mobile) · SubscriptionRow · SubscriptionForm · ConfirmDialog
  pages/        AuthPage · HomePage · SubscriptionsPage · CategoriesPage · AccountPage
  lib/          format.js (Rupiah, tanggal, total bulanan) · icons.jsx
  styles.css    token warna + semua gaya, termasuk breakpoint mobile
```

## Rute

| Path | Halaman |
| --- | --- |
| `/masuk` | Masuk dan daftar |
| `/` | Beranda: sapaan, ringkasan, tagihan terdekat |
| `/langganan` | Daftar, pencarian, filter, tambah/ubah/hapus |
| `/kategori` | Kelola kategori |
| `/akun` | Profil dan keluar (terutama untuk mobile) |

## Catatan

- Token disimpan di `localStorage` (`langganku.token`). Bila backend Anda memakai cookie httpOnly, ubah `request()` di `src/api/client.js` (tambahkan `credentials: 'include'`, hapus header Authorization).
- Bila API mengembalikan `401` pada sesi yang aktif, pengguna otomatis dikeluarkan.
- Frontend memfilter langganan di sisi klien. Parameter `status`, `category_id`, dan `q` di `GET /subscriptions` opsional untuk nanti.
- Kategori mengikuti ERD: global, tanpa `user_id`.
