<p align="center">
  <img src="https://assets.vercel.com/image/upload/v1662130559/nextjs/Icon_light_background.png" width="120" alt="Next.js Logo" />
</p>

# 🚀 Frontend Sistem Persuratan Diskominfo

Tujuan utama dari _boilerplate_ ini adalah memberikan contoh struktur antarmuka (_User Interface_) skala _Production_ yang kokoh, sehingga Anda memiliki referensi mutlak tentang bagaimana membangun frontend yang cepat, aman, dan mudah dipelihara.

---

## 🏗️ Cara Menggunakan Template Ini (Untuk Project Baru)

Jika Anda ditugaskan untuk membuat proyek baru berdasarkan kerangka ini, **JANGAN melakukan _clone_ biasa**. Gunakan fitur Template GitHub agar riwayat _commit_ lama tidak ikut terbawa:

1. Di halaman utama repositori GitHub ini, klik tombol hijau bertuliskan **"Use this template"** (di pojok kanan atas).
2. Pilih **"Create a new repository"**.
3. Beri nama repositori baru Anda (contoh: `frontend-kasir-app`), lalu klik **Create repository**.
4. Setelah repositori baru Anda terbuat, silakan di-_clone_ ke komputer lokal Anda:
   ```bash
   git clone https://github.com/diskominfo-intern/frontend-kasir-app.git
   ```
5. Ubah judul di baris pertama `README.md` ini dengan nama proyek baru Anda, lalu jalankan `npm install`.

---

## 📂 1. Panduan Navigasi Direktori

Seluruh kode Anda akan hidup di dalam folder `src/`. Kami menggunakan pola **Feature-Sliced Design (FSD)**, yang artinya kode dikelompokkan berdasarkan **Nama Fitur Bisnis**, BUKAN berdasarkan peran (Admin/User).

```text
src/
├── app/                    # 🧭 ROUTING LAYER (Navigasi URL Next.js)
│   ├── (auth)/             # Halaman tanpa layout khusus (/login, /register)
│   ├── admin/              # Halaman khusus Admin (Mewajibkan Role ADMIN)
│   └── user/               # Halaman khusus User biasa
│
├── components/             # 🧩 SHARED UI LAYER
│   ├── layout/             # Komponen tata letak global (Header, Footer, Sidebar)
│   └── ui/                 # Komponen primitive bawaan shadcn (Button, Input, Form)
│
├── features/               # 💼 FEATURE LAYER (Inti Pekerjaan Anda!)
│   ├── auth/               # Folder khusus Modul Auth (Login, Register)
│   └── product/            # Folder khusus Modul Produk
│       ├── api/            # ➡️ Tempat hook React Query (useGetProducts)
│       ├── components/     # ➡️ Tempat UI khusus produk (ProductCard)
│       └── types/          # ➡️ Interface TypeScript dari backend
│
├── lib/                    # 🔧 UTILITY LAYER
│   ├── axios.ts            # Interseptor otomatis (Penempel Token JWT)
│   └── utils.ts            # Fungsi helper bawaan (Tailwind Merge, dll)
│
├── providers/              # 🔌 PROVIDER LAYER (Koneksi Global)
│   └── QueryProvider.tsx   # Pembungkus React Query
│
└── store/                  # 💾 GLOBAL STATE LAYER
    └── useAuthStore.ts     # Penyimpanan sesi login di Local Storage (Zustand)
```

---

## 🏗️ 2. Arsitektur Lanjutan (Advanced Architecture)

Jika Anda mendapatkan tugas _advanced_, baca panduan peletakannya di sini agar kerangka proyek tidak hancur:

### A. Validasi Input Form (Zod + React Hook Form)

Anda **DILARANG KERAS** membuat validasi form manual menggunakan fungsi `if (email === '')`. Kita menggunakan ekosistem `shadcn/ui` form yang bertenaga `zod`.
**Cara Kerja:**

1. Definisikan skema Zod di komponen Anda atau di dalam `features/.../types/`.
   ```tsx
   import * as z from 'zod';
   const formSchema = z.object({
     email: z.string().email('Format email salah!'),
     password: z.string().min(8, 'Password minimal 8 karakter!'),
   });
   ```
2. Gunakan komponen `<Form>`, `<FormField>`, `<FormItem>`, dan `<FormMessage>` dari shadcn untuk merender _error_ secara otomatis di bawah input pengguna.

### B. Background Jobs (Cron) & Polling di Frontend

Berbeda dengan _Backend_ yang bisa menjalankan tugas di latar belakang, _Frontend_ hidup di browser pengguna.

- **Auto-Refresh Data (Polling):** Jika Anda disuruh membuat Dasbor Admin yang harus _update_ jumlah transaksi setiap 5 detik (mirip Cron), **JANGAN pakai `setInterval` manual!**. Gunakan fitur _polling_ bawaan React Query:
  ```tsx
  const { data } = useQuery({
    queryKey: ['transactions'],
    queryFn: fetchTransactions,
    refetchInterval: 5000, // Otomatis me-refresh data setiap 5 detik (Cron-like)
  });
  ```
- **Server Cron Jobs (Next.js API):** Jika Anda benar-benar butuh Cron Server-Side (misal Next.js mengirim notifikasi harian), letakkan di **`src/app/api/cron/route.ts`** dan picu (_trigger_) route tersebut menggunakan layanan eksternal seperti Vercel Cron.

### C. WebSockets & Realtime (Socket.io)

Jika Anda ditugaskan membuat fitur _Chat_ atau Notifikasi Realtime:

- **Lokasi File:** Buat `SocketProvider.tsx` di folder **`src/providers/`**.
- **Cara Kerja:** Lakukan koneksi socket _hanya sekali_ di dalam Provider, lalu bungkus aplikasi (`layout.tsx`) dengan Provider tersebut. Gunakan _custom hook_ (misal `useSocket()`) untuk diakses dari berbagai halaman.

---

## 🔐 3. Role-Based Access Control (Hak Akses)

Kita menggunakan **Pemisahan URL** agar arsitektur jelas dan aman:

1. **Dasbor Admin (`/admin/...`)**: Dijaga oleh `src/app/admin/layout.tsx`. Jika pengguna tidak login atau `role !== 'ADMIN'`, akses otomatis ditolak dan dialihkan.
2. **Dasbor User (`/user/...`)**: Dijaga oleh `src/app/user/layout.tsx`.

> **PENTING:** Validasi hak akses di Frontend _hanyalah untuk navigasi UI_. Validasi keamanan mutlak (_Golden Truth_) TETAP berada di **Backend**.

---

## 🛠️ 4. Panduan Pengambilan Data (API & State)

### A. React Query adalah Raja

**JANGAN PERNAH MEMANGGIL `axios.get` atau `fetch` di dalam tombol (`onClick`) atau `useEffect`!**
Semua panggilan API wajib dibungkus sebagai fungsi `useQuery` (untuk GET data) atau `useMutation` (untuk POST, PUT, DELETE) di dalam folder `features/nama_fitur/api/`.

### B. State Global (Zustand)

Hanya gunakan Zustand (`src/store/`) untuk menyimpan data yang berumur panjang dan diakses ribuan komponen (misal: Sesi Login, Tema Gelap/Terang, Bahasa). Jangan menaruh data _List Product_ di dalam Zustand, biarkan React Query yang mengurus _cache_ data API.

---

## 🛡️ 5. Standar Kode Enterprise (Wajib Dibaca!)

Proyek ini telah dibekali dengan penjaga otomatis agar kualitas kode Anda setara dengan _engineer_ profesional:

1. **Auto-Formatting (Husky + Prettier)**
   Setiap kali Anda mengetik `git commit`, robot bernama **Husky** akan mencegatnya dan menjalankan **Prettier**. Ia akan otomatis memperbaiki spasi, _indentation_, dan titik koma (_semicolon_) di seluruh kode Anda. Jika kode Anda _error_, _commit_ akan digagalkan! Tulis kode serapi mungkin.
2. **Middleware Security**
   Pelindung halaman diletakkan di `src/middleware.ts`. File ini mencegat pengguna di level server sebelum layar sempat dimuat. Jangan letakkan keamanan navigasi (`router.push`) yang sensitif di dalam `useEffect`.
3. **Graceful Error Handling**
   Jangan takut aplikasi _crash_! Jika komponen meledak, halaman **`src/app/error.tsx`** akan mengambil alih dan menampilkan pesan _error_ elegan tanpa membuat aplikasi mati total.
4. **Git Commit Convention (Aturan Wajib)**
   Anda DILARANG keras menulis pesan commit sembarangan (contoh: "update", "fix bug", "bismillah"). Gunakan format **Conventional Commits**:
   - `feat: [pesan]` ➡️ Untuk menambah fitur baru (contoh: `feat: buat halaman login`).
   - `fix: [pesan]` ➡️ Untuk memperbaiki _bug_ (contoh: `fix: perbaiki tombol register yang mati`).
   - `chore: [pesan]` ➡️ Untuk perubahan konfigurasi/alat (contoh: `chore: update versi nextjs`).
   - `refactor: [pesan]` ➡️ Untuk merapikan kode tanpa mengubah fitur.

---

## 🚀 6. Persiapan Proyek (Getting Started)

1. **Salin Environment Variables**:
   Buat file `.env` dari `.env.example` yang sudah disediakan:

   ```bash
   cp .env.example .env
   ```

   _Buka file `.env` dan pastikan `NEXT_PUBLIC_API_URL` mengarah ke Backend NestJS lokal Anda (biasanya port 4000)._

2. **Instal Dependencies**:

   ```bash
   npm install
   ```

3. **Jalankan Aplikasi (Server Lokal)**:
   ```bash
   npm run dev
   ```
   Web menyala di **[http://localhost:3000](http://localhost:3000)**.

---

## 💡 7. Aturan Emas Frontend (Golden Rules)

Sebelum melakukan _Pull Request_ atau menyerahkan pekerjaan, periksa 4 aturan mutlak ini:

1. **Tidak Ada State Terbengkalai**: Jika data itu cuma dipakai di 1 halaman, gunakan `useState`. JANGAN racuni Zustand dengan data lokal.
2. **Komponen Jangan Menganggur di Root**: Jika Anda membuat komponen spesifik untuk fitur "Pembayaran", taruh di `features/payment/components`. Folder `src/components/` hanya untuk benda yang dipakai secara universal (seperti Tombol standar, Navbar).
3. **Keringkan Komponen Halaman (Thin Pages)**: File `page.tsx` tugasnya hanyalah merakit "Lego". Blok-blok legonya (Kalkulator, Tabel, Form) harus berada di folder `features`.
4. **Taati UI Library**: Jika butuh komponen baru (misal Kalender), cek dokumentasi `shadcn/ui` terlebih dahulu (`npx shadcn@latest add calendar`). Jangan membangun dari awal jika yang standar industri sudah tersedia!
