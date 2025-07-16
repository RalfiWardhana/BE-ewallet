# NestJS Backend Project

## Setup Database

1. Buat database baru dengan nama bebas (contoh: `ewallet_db`)
2. Tabel-tabel akan otomatis dibuat melalui migrasi dari kode backend

## Environment Configuration

Buat file `.env` di root project dengan konfigurasi berikut:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD="Secure789#"
DB_DATABASE=ewallet_db
PORT=3001
```

## Menjalankan Backend

```bash
# Install dependencies
npm install

# Jalankan aplikasi
npm run start
```

Backend akan berjalan di port 3001 atau sesuai dengan konfigurasi PORT di file `.env`.

## Setelah Backend Berhasil Jalan

Jika muncul log seperti ini, artinya backend sudah berhasil running:

```
[Nest] 34063  - 07/16/2025, 1:40:15 PM     LOG [NestApplication] Nest application successfully started +2ms
Application is running on: http://localhost:3001
API Documentation available at: http://localhost:3001/api
```

**Penjelasan:**
- Log `TypeOrmCoreModule`, `UsersModule`, `TransactionsModule` = Module-module aplikasi berhasil dimuat
- Log `RouterExplorer` = API endpoints berhasil terdaftar 
- `Application is running on: http://localhost:3001` = Backend siap digunakan
- `API Documentation available at: http://localhost:3001/api` = Dokumentasi API bisa diakses di URL tersebut

## API Endpoints yang Tersedia

Berdasarkan log, tersedia endpoints:

**Users:**
- `POST /users` - Buat user baru
- `GET /users` - Ambil semua user
- `GET /users/:id` - Ambil user berdasarkan ID
- `GET /users/rekening/:rekening` - Cari user berdasarkan nomor rekening
- `POST /users/:id/topup` - Top up saldo
- `POST /users/:id/transfer` - Transfer ke user lain
- `DELETE /users/:id` - Hapus user

**Transactions:**
- `GET /transactions/balance-history` - Riwayat saldo
- `GET /transactions/transfers` - Riwayat transfer
- `GET /transactions/topups` - Riwayat top up
- `GET /transactions/by-date-range` - Transaksi berdasarkan rentang tanggal