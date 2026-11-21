# Kontrak API Langganku

Frontend memanggil endpoint di bawah ini lewat `src/api/client.js`. Bangun backend yang memenuhi kontrak ini, lalu set `VITE_USE_MOCK=false`.

- Basis URL: `/api` (ubah lewat `VITE_API_URL`)
- Format: JSON, UTF-8
- Auth: header `Authorization: Bearer <token>` di semua endpoint kecuali `register` dan `login`
- Tanggal: string `YYYY-MM-DD` (tanpa jam). Timestamp: ISO 8601.
- `id`: UUID

## Bentuk error

Semua error memakai status HTTP yang sesuai dan badan:

```json
{ "message": "Nama layanan wajib diisi.", "errors": { "service_name": "Nama layanan wajib diisi." } }
```

`message` selalu ada dan langsung ditampilkan ke pengguna (bahasa Indonesia). `errors` opsional, berisi pesan per field.

| Status | Dipakai untuk |
| --- | --- |
| 401 | Token tidak ada atau kedaluwarsa; kredensial login salah |
| 404 | Data tidak ditemukan atau bukan milik pengguna |
| 409 | Konflik unik: email sudah terdaftar, nama kategori sudah dipakai |
| 422 | Validasi gagal |

Respons 401 pada sesi yang sedang login membuat frontend otomatis keluar.

## Autentikasi

### `POST /auth/register`

```json
{ "name": "Dewi", "email": "dewi@contoh.id", "password": "rahasia123" }
```

Validasi: `name` wajib; `email` format valid dan unik (tanpa membedakan huruf besar-kecil); `password` minimal 6 karakter. Simpan hanya `password_hash` (bcrypt atau argon2).

Respons `201`:

```json
{ "token": "<jwt>", "user": { "id": "…", "name": "Dewi", "email": "dewi@contoh.id", "created_at": "…", "updated_at": "…" } }
```

### `POST /auth/login`

Badan `{ "email", "password" }`. Respons `200` sama seperti register. Salah email atau sandi: `401` dengan `message` "Email atau kata sandi salah." (jangan membedakan keduanya).

### `GET /auth/me`

Respons `200`: objek `user` (tanpa `password_hash`).

## Kategori

Tabel `CATEGORIES` tidak punya `user_id` di ERD, jadi kategori bersifat **global** (dipakai bersama). Jika ingin kategori per pengguna, tambahkan `user_id` ke tabel dan ubah `UNIQUE(name)` menjadi `UNIQUE(user_id, name)`; kontrak endpoint tidak berubah.

Objek: `{ "id", "name", "icon" }`. Nilai `icon` salah satu dari: `film`, `music`, `cloud`, `code`, `book`, `gamepad`, `bag`, `bolt`, `tag`.

| Metode dan path | Badan | Respons |
| --- | --- | --- |
| `GET /categories` | – | `200` array kategori |
| `POST /categories` | `{ name, icon }` | `201` kategori baru |
| `PUT /categories/:id` | `{ name, icon }` | `200` kategori terbarui |
| `DELETE /categories/:id` | – | `204` |

- `name` wajib dan unik tanpa membedakan huruf besar-kecil (`409` jika bentrok).
- **Hapus kategori:** jangan hapus langganannya. Set `subscriptions.category_id = NULL` untuk semua langganan yang memakainya (di database: `ON DELETE SET NULL`).

## Langganan

Objek:

```json
{
  "id": "…",
  "user_id": "…",
  "category_id": "… atau null",
  "service_name": "Netflix",
  "price": 186000,
  "billing_cycle": "MONTHLY",
  "next_billing_date": "2026-11-18",
  "status": "ACTIVE",
  "notes": "Paket premium",
  "created_at": "…",
  "updated_at": "…"
}
```

- `billing_cycle`: `MONTHLY` atau `YEARLY`
- `status`: `ACTIVE`, `PAUSED`, atau `CANCELLED`
- `price`: kirim sebagai angka JSON; jika kolom `DECIMAL` Anda mengembalikan string, frontend tetap mengubahnya ke angka.

| Metode dan path | Badan | Respons |
| --- | --- | --- |
| `GET /subscriptions` | – | `200` array langganan **milik pengguna yang login** |
| `POST /subscriptions` | lihat bawah | `201` langganan baru |
| `PUT /subscriptions/:id` | lihat bawah | `200` langganan terbarui |
| `DELETE /subscriptions/:id` | – | `204` |

Badan `POST` dan `PUT` (kirim semua field):

```json
{
  "service_name": "Netflix",
  "price": 186000,
  "billing_cycle": "MONTHLY",
  "next_billing_date": "2026-11-18",
  "status": "ACTIVE",
  "category_id": null,
  "notes": ""
}
```

Validasi (`422`): `service_name` wajib; `price` lebih dari 0; `billing_cycle` dan `status` salah satu nilai di atas; `next_billing_date` format `YYYY-MM-DD`; `category_id` kosong atau id kategori yang ada. `user_id` diambil dari token, jangan dari badan.

Pastikan pengguna hanya bisa membaca, mengubah, dan menghapus langganannya sendiri (`404` jika bukan miliknya).

### Parameter query opsional untuk `GET /subscriptions`

Frontend saat ini memfilter di sisi klien, tetapi `client.js` sudah meneruskan parameter ini jika Anda ingin filter di server:

- `status` = `ACTIVE | PAUSED | CANCELLED`
- `category_id` = id kategori, atau `none` untuk langganan tanpa kategori
- `q` = kata kunci pada `service_name` dan `notes`

## Aturan bisnis yang dihitung frontend

Tidak perlu dihitung backend, tetapi sebaiknya konsisten bila nanti ditambah laporan:

- Pengeluaran per bulan = jumlah `price` langganan `ACTIVE`, dengan `YEARLY` dibagi 12.
- Urutan daftar: `ACTIVE`, `PAUSED`, `CANCELLED`; di dalam kelompok menurut `next_billing_date` naik.
