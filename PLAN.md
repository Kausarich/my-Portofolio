# Dokumen Desain & Arsitektur: Website Portofolio Personal Interaktif (Next.js)

Dokumen ini memuat rancangan menyeluruh untuk pengembangan website portofolio personal profesional berbasis **Next.js (App Router)**. Fokus utama rancangan ini adalah pengalaman visual yang **seamless** melalui animasi interaktif (hover, scroll, dan micro-interactions), serta pemisahan tegas antara **Public View** (hanya baca, tanpa jejak akses login) dan **User/Owner View** (manajemen profil dan konten melalui akses login tersembunyi).

## 1. Visi Desain & Arah Estetika

Website dirancang dengan pendekatan **Minimalist Interactive Editorial** yang memadukan performa tinggi dan estetika modern:

* **Kesan Pertama yang Kuat**: Tata letak bersih dengan ruang kosong (*whitespace*) terukur, tipografi kontras tinggi, dan transisi antarbagian yang mengalir tanpa jeda (*jank-free*).
* **Interaktivitas Fungsional**: Setiap animasi hover dan scroll berfungsi memandu fokus pengunjung ke karya dan profil utama, bukan sekadar dekorasi yang membebani performa.
* **Arsitektur Stealth Admin**: Pengunjung publik merasakan pengalaman layaknya situs statis berkecepatan tinggi tanpa melihat tombol "Login" atau "Admin", sementara pemilik situs memiliki akses penuh ke sistem manajemen konten (CMS) internal untuk memperbarui profil dan portofolio secara instan.

| Aspek Desain | Spesifikasi | Implementasi Teknis |
| :--- | :--- | :--- |
| **Tema Warna** | Dark Mode Utama (`#09090B`) & Light Mode Adaptif (`#FAFAFA`) | Tailwind CSS Variables + `next-themes` |
| **Warna Aksen** | Electric Indigo (`#6366F1`) & Subtle Emerald (`#10B981`) untuk status aktif | Gradien halus dengan *radial spotlight* `opacity-15` |
| **Tipografi Utama** | `Plus Jakarta Sans` atau `Inter` untuk teks utama & judul | `next/font/google` dengan *variable font weight* |
| **Tipografi Monospace** | `JetBrains Mono` untuk label teknis, tahun, dan *tag* teknologi | `font-mono` pada *badge* dan penomoran indeks |
| **Target Performa** | 60 FPS pada animasi scroll/hover, skor Lighthouse > 95 | GPU-accelerated transforms (`translate3d`, `scale`, `opacity`) |

## 2. Tech Stack & Ekosistem Library

Pemilihan teknologi difokuskan pada integrasi ekosistem Next.js modern agar perubahan data dari sisi User langsung tercermin di sisi Public secara instan.

| Kategori | Teknologi / Library | Peran dalam Sistem |
| :--- | :--- | :--- |
| **Framework Utama** | Next.js 15 (App Router, TypeScript) | Server Components, Server Actions, dan *On-Demand Revalidation* |
| **Styling & UI** | Tailwind CSS + Shadcn UI | Sistem desain konsisten, *accessible dialog/drawer*, dan form editor |
| **Animasi & Transisi** | Framer Motion | Animasi deklaratif, *shared layout transitions* (`layoutId`), micro-interactions |
| **Smooth Scrolling** | Lenis (`@studio-freight/lenis`) | Menghaluskan inersia scroll halaman untuk kesan *seamless* dan premium |
| **Autentikasi** | Auth.js (NextAuth v5) / Supabase Auth | Manajemen sesi terenkripsi (JWT/HttpOnly Cookie) khusus pemilik tunggal |
| **Database & ORM** | PostgreSQL (Neon / Supabase) + Prisma ORM | Penyimpanan terstruktur untuk profil, proyek, pengalaman, dan keahlian |
| **Manajemen Media** | UploadThing / Cloudinary | Unggah foto profil, thumbnail proyek, dan CV dengan optimasi otomatis |
| **Validasi Form** | React Hook Form + Zod | Validasi input saat user menambah atau mengedit profil di *dashboard* |

## 3. Arsitektur Dual-Side View (Public vs User)

Sistem membagi alur aplikasi menjadi dua sisi menggunakan **Next.js Route Groups** sehingga tata letak (*layout*) publik dan dasbor manajemen terpisah secara bersih tanpa saling membebani *bundle* JavaScript.

| Fitur / Karakteristik | Sisi Public View (`/(public)`) | Sisi User / Owner View (`/(user)`) |
| :--- | :--- | :--- |
| **Target Pengguna** | Perekrut, klien potensial, pengunjung umum | Pemilik portofolio (User terautentikasi) |
| **Hak Akses** | Hanya lihat (*Read-Only*) | Tambah, edit, urutkan, dan hapus profil/portofolio (*Full CRUD*) |
| **Visibilitas Login** | **0% Terlihat** (tidak ada tombol/link login di UI maupun DOM publik) | Diakses melalui rute rahasia atau pintasan papan ketik (*keyboard shortcut*) |
| **Strategi Rendering** | *Incremental Static Regeneration (ISR)* (instan dari cache CDN) | *Dynamic Rendering* dengan proteksi `middleware.ts` & sesi server |
| **Pembaruan Data** | Otomatis diperbarui saat User menyimpan perubahan via `revalidatePath('/')` | Pembaruan *real-time* menggunakan Server Actions & `useOptimistic` |

### Struktur Direktori Next.js (App Router)

```text
src/
├── app/
│   ├── (public)/                   # Sisi Public View (Read-Only)
│   │   ├── layout.tsx              # Layout dengan Lenis Smooth Scroll & Stealth Listener
│   │   ├── page.tsx                # Halaman utama portofolio (Hero, About, Projects, dll.)
│   │   └── projects/[slug]/        # Halaman detail studi kasus proyek
│   ├── (user)/                     # Sisi User View (Protected & Stealth)
│   │   ├── [secretAuthSlug]/       # Rute login dinamis yang disamarkan via .env
│   │   │   └── page.tsx            # Halaman Login tersembunyi (noindex)
│   │   └── dashboard/              # Panel Editor Portofolio
│   │       ├── layout.tsx          # Sidebar navigasi editor & indikator sesi
│   │       ├── page.tsx            # Editor Profil Utama (Bio, Avatar, Status, CV)
│   │       ├── projects/page.tsx   # Manajemen Proyek (Tambah/Edit/Reorder)
│   │       └── experience/page.tsx # Manajemen Pengalaman & Skill
│   └── api/
│       └── auth/[...nextauth]/     # Endpoint autentikasi internal
├── actions/
│   ├── profile.actions.ts          # Server Actions untuk tambah/edit profil + revalidatePath
│   └── project.actions.ts          # Server Actions untuk CRUD portofolio
├── components/
│   ├── public/                     # Komponen beranimasi (Hero, BentoGrid, Timeline)
│   ├── animations/                 # Wrapper animasi (MagneticButton, ScrollReveal, CustomCursor)
│   ├── user/                       # Form editor, ImageUploader, LivePreviewModal
│   └── auth/
│       └── StealthAuthTrigger.tsx  # Listener kombinasi tombol rahasia untuk membuka login
├── lib/
│   ├── prisma.ts                   # Koneksi database Prisma
│   └── auth.ts                     # Konfigurasi Auth.js & validasi email pemilik
└── middleware.ts                   # Guard keamanan rute & penyamaran 404
```

## 4. Mekanisme "Stealth Login" (Menyembunyikan Akses Login dari Publik)

Sesuai kebutuhan agar pengunjung publik tidak mengetahui maupun memiliki akses ke halaman login, sistem menerapkan **tiga lapisan penyamaran dan pengamanan**:

### Lapisan 1: Zero UI Footprint di Sisi Publik
* Navbar dan Footer hanya menampilkan navigasi bagian halaman (`About`, `Work`, `Experience`, `Contact`).
* Rute autentikasi dan dasbor dikecualikan dari `sitemap.xml` dan diberi header `X-Robots-Tag: noindex, nofollow`.

### Lapisan 2: Pemicu Akses Rahasia (Secret Trigger)
Pemilik website dapat masuk ke mode login melalui dua cara yang tidak diketahui pengunjung umum:
1. **Pintasan Keyboard Rahasia (`Ctrl + Shift + L` atau `Cmd + Shift + L`)**: Komponen ringan di sisi klien mendengarkan kombinasi tombol ini. Saat ditekan, muncul *command dialog* minimalis yang meminta *Passkey/PIN* awal atau langsung mengarahkan ke rute login rahasia.
2. **Dynamic Secret Route via Environment Variable**: Alih-alih menggunakan `/login` atau `/admin` yang mudah ditebak oleh bot, rute login menggunakan parameter dinamis yang dicocokkan dengan `process.env.SECRET_LOGIN_SLUG` (contoh: `/portal-k9x2m`). Jika seseorang mencoba mengakses `/login` atau `/admin`, sistem langsung menampilkan halaman `404 Not Found` standar.

### Lapisan 3: Single-Owner Whitelist & Stealth Middleware
* Walaupun URL login rahasia tidak sengaja ditemukan, sistem autentikasi hanya mengizinkan satu akun pemilik yang terdaftar di `process.env.OWNER_EMAIL`.
* Pengguna yang belum login dan mencoba mengakses `/dashboard` tidak akan diarahkan (`redirect`) ke halaman login (karena redirect akan membocorkan URL halaman login), melainkan langsung menerima respons **404 Not Found** lewat `rewrite` ke halaman 404.

## 5. Spesifikasi Desain & Animasi Interaktif (Sisi Public View)

Seluruh halaman publik dirancang agar terasa hidup, responsif terhadap kursor, dan mengalir mulus saat digulir.

### A. Global Seamless Experience
* **Smooth Inertial Scroll**: Menggunakan `Lenis` yang disinkronkan dengan `Framer Motion` agar pergerakan halaman saat di-scroll memiliki akselerasi dan deselerasi lembut.
* **Interactive Cursor Spotlight**: Gradien radial lembut (`radial-gradient`) yang mengikuti koordinat `(x, y)` kursor secara halus menggunakan `useMotionValue` dan `useSpring`, memberikan efek pencahayaan dinamis di atas permukaan kartu (*cards*).
* **Floating Glass Navbar**: Bilah navigasi melayang di bagian atas dengan efek `backdrop-blur-md bg-zinc-900/60`, menyusut secara otomatis saat pengguna menggulir ke bawah dan memunculkan indikator *active section* dengan animasi *sliding pill* (`layoutId="activeNav"`).

### B. Detail Seksi & Interaksi

| Seksi Halaman | Konten Utama (Dari Database User) | Animasi Scroll (Scroll-Triggered) | Animasi Hover & Micro-Interactions |
| :--- | :--- | :--- | :--- |
| **1. Hero Section** | Nama, *Headline Role*, Bio singkat, Status ketersediaan kerja, Tombol CTA & Sosial | *Staggered character/word reveal* dari bawah ke atas (`y: 40 -> 0`, `opacity: 0 -> 1`) dengan kurva *spring* | **Magnetic Buttons**: Tombol CTA dan ikon sosial tertarik secara magnetis mengikuti posisi kursor dalam radius 40px |
| **2. Interactive About** | Deskripsi mendalam, Foto profil interaktif, Metrik singkat (tahun pengalaman, jumlah proyek) | **Scroll-Linked Text Opacity**: Paragraf bio berubah dari abu-abu redup menjadi putih terang kata demi kata seiring progres scroll (`useScroll`) | Foto profil memiliki efek *3D Perspective Tilt* halus dan perubahan filter dari *grayscale* ke warna penuh saat di-hover |
| **3. Featured Projects (Bento / Showcase)** | Daftar proyek pilihan, gambar *preview*, *tech stack tags*, tautan *Live Demo* & *Repository* | Kartu proyek muncul secara bertahap dengan efek *scale-up* (`0.95 -> 1`) dan *parallax* ringan pada gambar thumbnail | Saat kartu di-hover: gambar membesar halus (`scale-105`), kartu lain sedikit meredup (*focus spotlight*), dan kursor berubah menjadi badge **"Lihat Detail ↗"** |
| **4. Experience & Timeline** | Riwayat karier, posisi, perusahaan, periode waktu, dan pencapaian utama | Garis vertikal timeline terisi warna aksen secara progresif mengikuti posisi scroll layar (`scaleY` dari `0` ke `1`) | Setiap titik *node* pengalaman menyala (*glow effect*) dan kartu bergeser `4px` ke kanan saat di-hover |
| **5. Skills & Tech Stack** | Kategori keahlian (Frontend, Backend, DevOps, Design) beserta tingkat penguasaan | *Infinite Smooth Marquee* yang kecepatannya bereaksi terhadap arah dan kecepatan scroll pengunjung | Saat *badge* teknologi di-hover, laju *marquee* melambat dan muncul *tooltip* berisi pengalaman penggunaan teknologi tersebut |
| **6. Contact & Footer** | Ajakan kolaborasi, alamat email, tautan sosial media | Efek *curtain reveal* di mana seksi kontak terbuka dari balik konten utama saat mencapai bagian paling bawah | Klik tombol alamat email menyalin teks ke *clipboard* disertai animasi morfologi ikon menjadi tanda centang ("Copied!") |

## 6. Spesifikasi Desain Sisi User View (Dashboard & Profile Editor)

Setelah pemilik berhasil login melalui akses tersembunyi, sistem menyajikan antarmuka manajemen yang bersih, cepat, dan terintegrasi langsung dengan tampilan publik.

### A. Fitur Utama Manajemen Profil & Portofolio
1. **Editor Profil Utama (`Profile Tab`)**:
   * Mengubah Nama Lengkap, *Headline/Title*, Ringkasan Bio, Lokasi, dan Email Kontak.
   * **Toggle Status Ketersediaan**: Mengaktifkan/menonaktifkan lencana *"Available for Freelance / Full-time"* di halaman publik dengan satu klik.
   * **Manajemen Foto & CV**: *Drag-and-drop* foto profil baru (dengan fitur *crop* rasio 1:1 atau 4:5) dan unggah file PDF Resume terbaru.
2. **Manajemen Proyek (`Projects Tab`)**:
   * Menambahkan proyek baru lengkap dengan judul, *slug*, deskripsi singkat, studi kasus Markdown, daftar teknologi (*tags*), URL demo, URL GitHub, dan gambar sampul.
   * **Drag-and-Drop Reordering**: Mengatur urutan tampil proyek di halaman publik menggunakan interaksi geser (*sortable list*).
   * **Toggle Visibility**: Menyembunyikan proyek tertentu sebagai *Draft* tanpa harus menghapusnya dari database.
3. **Manajemen Pengalaman & Keahlian (`Experience & Skills Tab`)**:
   * Menambah atau mengedit riwayat pekerjaan/pendidikan dan daftar *skill* yang ditampilkan pada komponen timeline serta *marquee*.
4. **Floating Edit Bar di Halaman Publik (Ketika Sesi Aktif)**:
   * Jika pemilik yang sudah login membuka halaman utama (`/`), muncul **Floating Admin Pill** transparan di pojok kanan bawah yang hanya terlihat oleh sesi pemilik.
   * Pemilik dapat menekan tombol **"Quick Edit"** pada seksi mana pun untuk membuka *slide-over drawer* dan mengedit teks secara langsung sambil melihat tampilan asli halaman publik.

### B. Alur Pembaruan Data Seamless (Zero-Downtime Sync)
1. User mengubah data profil atau menambahkan proyek di Dashboard lalu menekan **Simpan Perubahan**.
2. Form memicu **Next.js Server Action** (`updateProfileAction`) dengan validasi skema `Zod` dan pemeriksaan sesi autentikasi di sisi server.
3. Database PostgreSQL diperbarui melalui Prisma ORM.
4. Server Action memanggil `revalidatePath('/')` dan `revalidateTag('portfolio-data')`.
5. Saat itu juga, *cache* halaman publik diperbarui di latar belakang—pengunjung publik langsung melihat profil terbaru tanpa perlu proses *rebuild* atau *redeploy*.

## 7. Rancangan Skema Database (Prisma ORM)

Skema berikut mendukung seluruh fitur kustomisasi profil dan portofolio dinamis:

```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Profile {
  id              String       @id @default(cuid())
  fullName        String
  headline        String       // Contoh: "Creative Frontend Engineer & UI Designer"
  shortBio        String       @db.Text
  aboutMarkdown   String       @db.Text
  avatarUrl       String?
  resumeUrl       String?
  location        String?
  email           String
  isAvailable     Boolean      @default(true)
  availabilityTxt String       @default("Available for new opportunities")
  socialLinks     Json         // Array of { platform, url, icon }
  updatedAt       DateTime     @updatedAt
}

model Project {
  id          String   @id @default(cuid())
  title       String
  slug        String   @unique
  summary     String   @db.Text
  content     String?  @db.Text // Studi kasus lengkap dalam Markdown
  thumbnail   String
  techStack   String[] // Contoh: ["Next.js", "TypeScript", "Framer Motion"]
  liveUrl     String?
  repoUrl     String?
  featured    Boolean  @default(false)
  published   Boolean  @default(true)
  sortOrder   Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Experience {
  id          String    @id @default(cuid())
  role        String
  company     String
  companyUrl  String?
  location    String?
  startDate   DateTime
  endDate     DateTime? // Null jika masih bekerja di sini (Present)
  isCurrent   Boolean   @default(false)
  description String    @db.Text
  sortOrder   Int       @default(0)
}

model Skill {
  id       String @id @default(cuid())
  name     String
  category String // "Frontend", "Backend", "Tools", "Design"
  iconName String?
  order    Int    @default(0)
}
```

## 8. Blueprint Implementasi Kode Utama

Berikut adalah implementasi komponen inti untuk mewujudkan akses login tersembunyi, proteksi rute, pembaruan profil seamless, dan animasi interaktif.

### A. Middleware Keamanan & Penyamaran Rute (`src/middleware.ts`)
Menyembunyikan keberadaan `/dashboard` dari pengunjung publik dengan mengembalikan halaman `404` (bukan redirect ke login) apabila tidak memiliki sesi pemilik yang sah.

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Blokir tebakan rute login umum (/login, /admin, /wp-admin) dengan 404
  if (["/login", "/admin", "/signin"].includes(pathname)) {
    return NextResponse.rewrite(new URL("/404", req.url));
  }

  // 2. Proteksi rute /dashboard: hanya bisa diakses jika token pemilik valid
  if (pathname.startsWith("/dashboard")) {
    const token = await getToken({ req, secret: process.env.AUTH_SECRET });
    const isOwner = token?.email && token.email === process.env.OWNER_EMAIL;

    if (!isOwner) {
      // Samarkan dengan 404 agar publik tidak tahu rute /dashboard itu ada
      return NextResponse.rewrite(new URL("/404", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/admin", "/signin"],
};
```

### B. Pemicu Login Rahasia via Keyboard (`src/components/auth/StealthAuthTrigger.tsx`)
Memungkinkan pemilik membuka akses login dari halaman publik hanya dengan menekan `Ctrl + Shift + L` (atau `Cmd + Shift + L` di Mac), tanpa ada elemen tombol apa pun di layar.

```tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function StealthAuthTrigger({ secretSlug }: { secretSlug: string }) {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Kombinasi rahasia: Ctrl/Cmd + Shift + L
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "l") {
        e.preventDefault();
        router.push(`/${secretSlug}`);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router, secretSlug]);

  // Tidak merender elemen DOM apa pun di sisi publik
  return null;
}
```

### C. Server Action untuk Tambah/Edit Profil Seamless (`src/actions/profile.actions.ts`)
Memvalidasi sesi user, menyimpan pembaruan profil ke database, dan langsung memperbarui tampilan publik menggunakan `revalidatePath`.

```typescript
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const ProfileSchema = z.object({
  fullName: z.string().min(2, "Nama wajib diisi"),
  headline: z.string().min(5, "Headline terlalu singkat"),
  shortBio: z.string().min(10, "Bio singkat wajib diisi"),
  aboutMarkdown: z.string().optional(),
  location: z.string().optional(),
  email: z.string().email("Format email tidak valid"),
  isAvailable: z.boolean(),
  availabilityTxt: z.string(),
});

export async function upsertProfileAction(formData: z.infer<typeof ProfileSchema>) {
  const session = await auth();

  if (!session?.user?.email || session.user.email !== process.env.OWNER_EMAIL) {
    throw new Error("Unauthorized access");
  }

  const parsed = ProfileSchema.parse(formData);
  const existing = await prisma.profile.findFirst();

  if (existing) {
    await prisma.profile.update({
      where: { id: existing.id },
      data: parsed,
    });
  } else {
    await prisma.profile.create({
      data: {
        ...parsed,
        aboutMarkdown: parsed.aboutMarkdown ?? "",
        socialLinks: [],
      },
    });
  }

  // Perbarui halaman publik secara instan tanpa rebuild
  revalidatePath("/");
  revalidatePath("/dashboard");

  return { success: true };
}
```

### D. Komponen Animasi Hover Magnetik & Scroll Reveal (`src/components/animations/InteractiveMotion.tsx`)
Memberikan efek tombol magnetik saat di-hover dan transisi masuk yang mulus saat elemen masuk ke area pandang (*viewport*).

```tsx
"use client";

import React, { useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export function MagneticHover({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 15, stiffness: 150, mass: 0.1 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    x.set(middleX * 0.25);
    y.set(middleY * 0.25);
  };

  const resetPosition = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={resetPosition}
      style={{ x: springX, y: springY }}
      className="inline-block"
    >
      {children}
    </motion.div>
  );
}

export function ScrollReveal({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration: 0.7,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
```

## 9. Checklist Tahapan Pengembangan

1. **Inisialisasi Proyek**: Setup `create-next-app` dengan TypeScript, Tailwind CSS, App Router, serta instalasi `framer-motion`, `@studio-freight/lenis`, `prisma`, dan `next-auth`.
2. **Konfigurasi Database & Variabel Lingkungan**: Buat database PostgreSQL, atur `SECRET_LOGIN_SLUG` dan `OWNER_EMAIL` di `.env`, lalu jalankan `npx prisma db push`.
3. **Implementasi Stealth Auth & Middleware**: Bangun halaman login pada rute dinamis `[secretAuthSlug]`, pasang `middleware.ts` untuk penyamaran 404, dan tambahkan `StealthAuthTrigger` di layout publik.
4. **Pembangunan Dashboard User**: Buat form `Profile`, `Projects`, dan `Experience` menggunakan Shadcn UI yang terhubung ke Server Actions dan `revalidatePath('/')`.
5. **Pembangunan Public View & Animasi**: Rangkai seksi Hero, About, Bento Projects, dan Timeline dengan pembungkus `ScrollReveal`, `MagneticHover`, dan *smooth scroll*.
6. **Optimasi & Audit Akhir**: Pastikan gambar menggunakan `next/image`, uji dukungan `prefers-reduced-motion` untuk aksesibilitas, dan verifikasi bahwa halaman publik tidak membocorkan rute login di kode sumber maupun sitemap.
