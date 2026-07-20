# Sistem Persuratan DISKOMINFO

Sistem Informasi Manajemen Persuratan Elektronik yang dirancang khusus untuk memenuhi standar Tata Naskah Dinas dan Klasifikasi Arsip Nasional (ANRI). Sistem ini dikembangkan dengan arsitektur modern menggunakan **Next.js** (Frontend) dan **NestJS** (Backend) untuk menjamin kecepatan, keamanan, dan skalabilitas data instansi.

## Fitur Utama
* **Penomoran Otomatis**: Integrasi format baku Surat Edaran Sekretaris Daerah Kota Makassar dengan sistem blok kuota per bidang.
* **Klasifikasi Arsip Resmi**: Dilengkapi database otomatis >2.900+ kode klasifikasi berdasarkan standar baku instansi.
* **Sinkronisasi Hari Libur**: Kalender cerdas yang otomatis melompati hari libur nasional saat mengalokasikan nomor surat (tersinkronisasi secara mandiri via `date-holidays`).
* **Arsip Digital & Ekspor**: Manajemen arsip terpusat dengan kemampuan ekspor rekapitulasi data ke format Excel (XLSX).
* **Multi-Role Access**: Pemisahan antarmuka dan hak akses antara Administrator (Sekretariat) dan User (Bidang/Seksi).

## Arsitektur Teknologi
Sistem ini menggunakan arsitektur *Monorepo* yang terbagi menjadi dua bagian utama:
1. **Frontend**: Next.js 14, React, Tailwind CSS, Zustand, React Query, Axios.
2. **Backend**: NestJS, Prisma ORM, MySQL, JWT Authentication.

---

## 🚀 Panduan Instalasi (Development Setup)

Bagi Anda yang baru pertama kali mengunduh (*clone*) kode ini, ikuti langkah-langkah berikut untuk menjalankan aplikasi di komputer lokal Anda.

### Prasyarat (Prerequisites)
Pastikan komputer Anda sudah terinstal perangkat lunak berikut:
* **Node.js** (Versi 18.x atau lebih baru)
* **MySQL Server** (XAMPP, MAMP, atau MySQL Workspace)
* **Git**

### Langkah 1: Clone Repositori
```bash
git clone https://github.com/username-anda/persuratan-diskominfo.git
cd persuratan-diskominfo
```

### Langkah 2: Setup Database & Backend
1. Pastikan server **MySQL** Anda sudah menyala (contoh: nyalakan module MySQL di XAMPP).
2. Buat database kosong bernama `persuratan_db` di MySQL Anda (bisa melalui phpMyAdmin).
3. Buka terminal dan masuk ke folder backend:
   ```bash
   cd backend-persuratan
   ```
4. Instal semua dependensi:
   ```bash
   npm install
   ```
5. Buat file bernama `.env` di dalam folder `backend-persuratan` dan isi dengan konfigurasi database berikut (sesuaikan *password* jika MySQL Anda diproteksi):
   ```env
   DATABASE_URL="mysql://root:@localhost:3306/persuratan_db"
   JWT_SECRET="rahasia_super_aman_sekali_123"
   ```
6. Sinkronisasi skema database ke MySQL:
   ```bash
   npx prisma db push
   ```
7. Masukkan data awal (Akun Admin, Akun Bidang, dsb):
   ```bash
   npx prisma db seed
   ```
8. Nyalakan server backend:
   ```bash
   npm run start:dev
   ```
   *Backend kini berjalan di `http://localhost:4000`.*

### Langkah 3: Setup Frontend
1. Buka tab terminal baru dan masuk ke folder frontend dari *root* direktori:
   ```bash
   cd frontend-persuratan
   ```
2. Instal semua dependensi:
   ```bash
   npm install
   ```
3. Buat file bernama `.env.local` di dalam folder `frontend-persuratan` (opsional, jika Anda ingin menggunakan IP lokal atau custom URL):
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:4000
   ```
4. Nyalakan server frontend:
   ```bash
   npm run dev
   ```
5. Buka browser Anda dan akses `http://localhost:3000`.

---

## 🔐 Data Login Default (Dari Seeder)
Saat Anda menjalankan `npx prisma db seed`, sistem otomatis membuat beberapa akun siap pakai:

| Peran (Role) | Email Login | Password |
| :--- | :--- | :--- |
| **Admin Sekretariat** | `admin@diskominfo.go.id` | `admin` |
| **Bidang APTIKA** | `aptika@diskominfo.go.id` | `aptika` |
| **Bidang PERSANDIAN** | `persandian@diskominfo.go.id` | `persandian` |
| **Bidang PDE** | `pde@diskominfo.go.id` | `pde` |
| **Bidang HUMAS** | `humas@diskominfo.go.id` | `humas` |

---
*Dibuat khusus untuk tata kelola administrasi modern.*
