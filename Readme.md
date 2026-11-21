# AturKost

Catatan inventaris kamar kost. Mahasiswa bisa mencatat barang apa saja yang ada di kamarnya: jumlah, kategori, lokasi, dan kondisinya. Barang yang rusak atau perlu servis langsung terlihat.

Mini project Workshop JavaScript, dikerjakan oleh:

| Nama | NIM |
| --- | --- |
| Satria Adidarma Herrinta | H1D026144 |
| MIFTACHUDDIN ACHMAD  | H1D026104 |

![Halaman daftar Langganan](docs/screenshots/Home.png)

## Fitur

- **Akun:** daftar dan masuk dengan email dan password. Password disimpan sebagai hash bcrypt, dan sesi memakai JWT.
- **Data per user:** setiap user hanya bisa melihat dan mengubah Daftar Langganan sendiri.
- **CRUD barang:** tambah, lihat, ubah, dan hapus. Penghapusan selalu dikonfirmasi dulu.
- **Cari, filter, urutkan:** cari Langganan nama , filter per kategori, dan urutkan menurut terbaru.
- **Responsif:** nyaman dipakai di HP maupun laptop.

<table>
  <tr>
    <td><img src="docs/screenshots/Home.png" alt="Halaman daftar" /></td>
    <td><img src="docs/screenshots/langganan.png" alt="Form ubah barang" /></td>
    <td width="28%"><img src="docs/screenshots/TYPE_h.png" alt="Tampilan HP" /></td>
  </tr>
</table>

## Teknologi

| Bagian | Teknologi |
| --- | --- |
| Frontend | Next.js 16 (Pages Router), React 19, CSS Modules, font Bricolage Grotesque |
| Backend | NestJS 10, class-validator, @nestjs/jwt, bcrypt |
| Database | PostgreSQL dengan Prisma ORM 6 |


## Menjalankan di lokal

Yang perlu disiapkan: **Node.js 20+** dan **PostgreSQL** (dikembangkan dengan versi 19).

### 1. Buat database

```bash
psql -U postgres -c "CREATE DATABASE Langganku;"
```

Cara lain: buat database `Langganku` lewat pgAdmin.

### 2. Backend

# Langganku — backend

REST API untuk pelacak langganan. NestJS 10 + TypeORM + PostgreSQL + JWT. Memenuhi kontrak di `docs/API.md` milik `langganku-frontend`, sehingga frontend bisa langsung dipakai (`VITE_USE_MOCK=false`).

## Menjalankan

Butuh Node.js 18+ dan PostgreSQL 13+.

```bash
# 1. Database (lewati bila sudah punya PostgreSQL sendiri)
docker compose up -d

# 2. Konfigurasi
cp .env.example .env
#   isi JWT_SECRET, contoh membuatnya:
#   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"

# 3. Pasang dan jalankan
npm install
npm run start:dev        # http://localhost:3000/api
```

Saat pertama jalan, dengan `DB_SYNC=true` tabel dibuat otomatis dan 6 kategori awal (Hiburan, Musik, Penyimpanan, Pengembangan, Belajar, Game) diisi bila database masih kosong.

### Menyambungkan frontend

Di folder `langganku-frontend`, ubah `.env`:

```
VITE_USE_MOCK=false
VITE_API_URL=/api
BACKEND_URL=http://localhost:3000
```

lalu `npm run dev` (http://localhost:5173). Proxy Vite meneruskan `/api/*` ke backend, jadi tidak perlu CORS saat pengembangan.

## Endpoint

Semua di bawah prefix `/api`. Semua butuh `Authorization: Bearer <token>` kecuali register dan login.

| Metode | Path | Keterangan | Sukses |
| --- | --- | --- | --- |
| POST | `/auth/register` | `{ name, email, password }` | 201 `{ token, user }` |
| POST | `/auth/login` | `{ email, password }` | 200 `{ token, user }` |
| GET | `/auth/me` | profil pengguna login | 200 `user` |
| GET | `/categories` | semua kategori | 200 array |
| POST | `/categories` | `{ name, icon }` | 201 |
| PUT | `/categories/:id` | `{ name, icon }` | 200 |
| DELETE | `/categories/:id` | langganan terkait jadi tanpa kategori | 204 |
| GET | `/subscriptions` | milik pengguna login; query opsional `status`, `category_id` (atau `none`), `q` | 200 array |
| POST | `/subscriptions` | lihat `docs/API.md` | 201 |
| PUT | `/subscriptions/:id` | ganti seluruh isi (dipakai frontend) | 200 |
| PATCH | `/subscriptions/:id` | ubah sebagian field | 200 |
| DELETE | `/subscriptions/:id` | | 204 |

Error selalu berbentuk `{ "message": "...", "errors": { "field": "..." } }` dengan status 401, 404, 409, atau 422 seperti di kontrak.

Percobaan cepat:

```bash
curl -s -X POST localhost:3000/api/auth/register -H 'Content-Type: application/json' \
  -d '{"name":"Dewi","email":"dewi@contoh.id","password":"rahasia123"}'

TOKEN=<token dari respons di atas>
curl -s localhost:3000/api/subscriptions -H "Authorization: Bearer $TOKEN"
```

## Struktur

```
src/
  main.ts                    prefix /api, CORS, pipe validasi, filter error
  app.module.ts              koneksi PostgreSQL (TypeORM) dan modul
  common/                    konstanta, validator tanggal, filter error { message, errors }, pipe 422
  users/                     entitas users, UsersService
  auth/                      register, login, me, strategi JWT, guard global
  categories/                CRUD kategori (global, tanpa user_id sesuai ERD)
  subscriptions/             CRUD langganan, selalu dibatasi user_id dari token
database/schema.sql          skema SQL setara (untuk DB_SYNC=false)
```

## Keputusan desain

- **Isolasi data.** `user_id` selalu diambil dari token, tidak pernah dari badan permintaan. Langganan milik orang lain dijawab 404, sama seperti data yang tidak ada.
- **Guard global.** Semua endpoint terlindungi secara bawaan; hanya yang bertanda `@Public()` (register, login) yang terbuka. Token milik akun yang sudah dihapus ditolak.
- **Kata sandi.** Hash bcrypt (`bcryptjs`, 10 putaran), kolom `password_hash` tidak pernah ikut terbaca kecuali saat login. Pesan gagal login sama untuk email salah maupun sandi salah.
- **Harga.** Harus lebih dari 0 (mengikuti `docs/API.md` dan `CHECK` di `schema.sql`), dibulatkan ke 2 desimal, dikirim sebagai angka JSON.
- **Kategori global.** Siapa pun yang login bisa menambah, mengubah, dan menghapus kategori, karena ERD tidak memberi `user_id` pada `CATEGORIES`. Jika ingin per pengguna, lihat catatan di `docs/API.md` frontend.

## Produksi

- Isi `JWT_SECRET` dengan string acak panjang; aplikasi menolak start bila kosong.
- Set `DB_SYNC=false` dan buat skema dari `database/schema.sql` (atau migrasi TypeORM). Jangan biarkan `synchronize` aktif pada data penting.
- Set `CORS_ORIGIN` ke alamat frontend asli, atau sajikan frontend dan API dari domain yang sama.
- Pertimbangkan pembatasan laju (`@nestjs/throttler`) pada `/auth/login` dan `/auth/register`.


### 3. Frontend

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
