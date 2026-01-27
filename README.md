# Wallev - Shared Ledger Invite

Fitur ini menambahkan shared ledger dengan flow undangan berbasis token dan Supabase RLS.

## Setup env

Pastikan env berikut tersedia:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

> Tidak ada service role key di client. RPC `accept_invitation` dan `revoke_invitation` berjalan dengan `SECURITY DEFINER` di database.

## Jalankan migration

Jalankan SQL migration berikut di Supabase SQL editor atau dengan CLI migrasi Supabase:

```
./supabase/migrations/001_invite_shared_ledger.sql
```

## Manual test flow

1. Login sebagai User A.
2. Buka `/ledgers`, buat shared ledger baru.
3. Buka `/ledgers/[id]`, gunakan form **Invite by email** untuk mengundang email User B.
4. Salin link `/invite/[token]` yang muncul.
5. Buka link tersebut sebagai User B (login Google dengan email yang diundang).
6. Pastikan User B menerima pesan sukses dan bisa membuka ledger.
7. Pastikan user lain yang berbeda email tidak bisa menerima undangan.

## Catatan keamanan

- Token disimpan di database dan hanya ditampilkan untuk owner/inviter melalui view `invitations_safe`.
- RLS mencegah akses ledger dan transaksi bagi user non-member.
