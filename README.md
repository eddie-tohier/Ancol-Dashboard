# Ancol Dashboard

Dashboard management untuk ekosistem Ancol — monitoring pesanan, rekoniliasi transaksi, dan manajemen pengguna.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Bahasa:** TypeScript
- **Styling:** Tailwind CSS v4 + CSS Modules
- **Auth:** NextAuth v5 (Credentials — static login)
- **State & Data Fetching:** TanStack React Query
- **Charts:** Recharts, ApexCharts (react-apexcharts)
- **Icons:** Lucide React
- **UI Components:** Radix UI (Dialog, Tabs, Select, Dropdown Menu, Avatar, Separator, Label, Slot)
- **Date Utilities:** date-fns
- **Class Utils:** clsx, tailwind-merge, class-variance-authority

## Fitur

| Halaman | Deskripsi |
|---------|-----------|
| **Dashboard** | Total Revenue, 4 stat widgets, Match Rate per Wahana (30 hari), trend chart 30 hari |
| **Orders** | 25 data pesanan dengan pagination (10/page), filter unit, summary cards, popup detail |
| **Reconciliation** | 58 sesi rekoniliasi (FAILED ~4%), date filter dengan calendar + prev/next day |
| **Customers** | Data pelanggan compact table |
| **Wahana** | 6 unit wahana dengan status sync |
| **Settings** | Profile & RBAC settings |
| **Admin Users** | CRUD pengguna, status toggle, role badges |

## Login

Static credentials (no backend required):

| Email | Password |
|-------|----------|
| `admin@ancol.com` | `admin123` |

Role: `super_admin` — akses penuh ke semua halaman termasuk Admin.

## Environment Variables

Buat file `.env.local` (sudah disediakan):

```env
AUTH_SECRET=your-nextauth-secret
```

> **Untuk Vercel:** Set `AUTH_SECRET` di Environment Variables dashboard Vercel.

## Development

```bash
npm install
npm run dev      # → http://localhost:3000
npm run build    # Production build
npm run lint     # ESLint
```

## Struktur Proyek

```
src/
├── app/
│   ├── admin/users/        # Manajemen pengguna
│   ├── api/auth/           # API routes auth (nextauth + reset-password)
│   ├── customers/          # Data pelanggan
│   ├── dashboard/          # Dashboard utama
│   ├── login/              # Halaman login
│   ├── orders/             # Pesanan
│   ├── reconciliation/     # Rekoniliasi
│   ├── settings/           # Settings + RBAC
│   ├── wahana/             # Wahana sync status
│   ├── globals.css         # Global styles, theme vars
│   ├── layout.tsx          # Root layout
│   └── page.tsx            → redirect ke /dashboard
├── components/
│   └── layout/             # Sidebar, Header, DefaultLayout, CardDataStats
├── lib/
│   ├── auth.ts             # NextAuth config
│   └── units.ts            # Data unit wahana
└── types/
    └── next-auth.d.ts      # Type augmentation
```

## Deployment (Vercel)

```bash
vercel --prod
```

Set environment variable `AUTH_SECRET` di Vercel dashboard.
