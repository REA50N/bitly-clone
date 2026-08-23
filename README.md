# Shorten.it — URL Shortener
https://shorten-it-nine.vercel.app

A full-stack URL shortener built with **Next.js 16 App Router**, **PostgreSQL + Prisma**, and **Google OAuth**. Paste a long URL, get a short link, track clicks, and manage everything from a dashboard.

---

## Features

- **Shorten any URL** with a `nanoid`-generated 10-character code
- **Custom slugs** — choose your own short code (validated, unique-checked)
- **Deduplication** — shortening the same URL twice returns the existing link
- **Click tracking** — every redirect increments the click counter atomically
- **QR code generation** for every shortened link
- **Copy to clipboard** one-click copy of the short URL
- **Dashboard** — view, manage, and delete all your links
- **Analytics page** — aggregate stats across all links
- **Google OAuth** via NextAuth v5 — auth-gated shortening
- **Dark mode** via `next-themes`
- **Public metrics endpoint** — total links and total clicks site-wide

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| UI Primitives | shadcn-style (CVA + Radix Slot) |
| Icons | MUI Icons Material, Phosphor Icons |
| Database | PostgreSQL |
| ORM | Prisma 7 |
| Auth | NextAuth v5 (Google provider) |
| Server State | TanStack Query v5 |
| Validation | Zod v4 |
| Notifications | Sonner |
| Short Code | nanoid |
| QR Codes | react-qr-code |
| Animations | Motion (Framer Motion) |

---

## Project Structure

```
bit-ly/
├── app/
│   ├── (site)/
│   │   └── page.tsx                  # Landing page — URL input, shorten form, result card
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts          # NextAuth GET/POST handler
│   │   ├── short/
│   │   │   └── route.ts              # POST · GET · DELETE · PATCH /api/short
│   │   └── metrics/
│   │       └── route.ts              # GET /api/metrics — public site-wide stats
│   ├── dashboard/
│   │   ├── layout.tsx                # Dashboard shell — mounts DashboardSidebar
│   │   ├── page.tsx                  # Link management — sidebar list + detail panel
│   │   └── analytics/
│   │       └── page.tsx              # Analytics — aggregated stats across all links
│   ├── u/
│   │   └── [short-url]/
│   │       └── page.tsx              # Redirect route — increments click count, then redirects
│   ├── globals.css
│   └── layout.tsx                    # Root layout — providers, header, footer, toaster
│
├── components/
│   ├── landing/
│   │   ├── header.tsx                # Site-wide top navigation
│   │   └── footer.tsx                # Site-wide footer
│   ├── ui/                           # shadcn-style design system primitives
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   ├── sonner.tsx
│   │   ├── spinner.tsx
│   │   └── ...
│   ├── AppProvider.tsx               # TanStack Query QueryClient provider (client)
│   ├── DashboardSidebar.tsx          # Collapsible sidebar — nav, user info, logout
│   ├── QRCodeDialog.tsx              # QR code modal for a shortened URL
│   ├── SessionProvider.tsx           # NextAuth SessionProvider wrapper
│   ├── sonner-toaster.tsx            # Centralised Sonner <Toaster /> mount
│   └── theme-provider.tsx            # next-themes ThemeProvider wrapper
│
├── hooks/
│   ├── useShortUrl.tsx               # POST /api/short — shorten a URL
│   ├── useAllLink.tsx                # GET /api/short — fetch user's links
│   ├── useHeroStats.tsx              # GET /api/metrics — landing page stats
│   └── use-mobile.ts                 # Breakpoint hook for responsive logic
│
├── lib/
│   ├── generated/prisma/             # Auto-generated Prisma client (do not edit)
│   ├── utils/
│   │   └── getAllLink.ts             # Server-side helper — fetch links for session user
│   ├── auth.ts                       # NextAuth config (Google provider + PrismaAdapter)
│   ├── prisma.ts                     # Prisma client singleton
│   └── utils.ts                      # Shared helpers (cn, etc.)
│
├── prisma/
│   └── schema.prisma                 # DB schema — User, Account, Session, Link
│
├── public/                           # Static assets
├── .env                              # Environment variables (not committed)
├── next.config.ts
├── prisma.config.ts
├── tsconfig.json
└── package.json
```

---

## Database Schema

```prisma
model User {
  id    String  @id @default(cuid())
  name  String?
  email String  @unique
  links Link[]
  // + NextAuth fields (accounts, sessions, etc.)
}

model Link {
  id        String   @id @default(cuid())
  longUrl   String
  shortUrl  String   @unique @db.VarChar(10)  // nanoid-generated
  slugUrl   String?  @unique                  // optional custom slug
  clicks    Int      @default(0)
  createdAt DateTime @default(now())
  userId    String
  owner     User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

---

## API Reference

### `POST /api/short` — Create short link

**Auth required.** Body: `{ long_url: string, slug?: string }`

| Case | Response |
|---|---|
| URL already shortened | `200` — returns existing short URL |
| Custom slug taken | `409 Conflict` |
| New link created | `201` — `{ short_url }` |
| Not authenticated | `401 Unauthorized` |

### `GET /api/short` — List user's links

**Auth required.** Returns `{ allLinks: Link[] }` for the session user.

### `DELETE /api/short` — Delete a link

**Auth required.** Body: `{ short_url: string }`

### `PATCH /api/short` — Rename a slug

**Auth required.** Body: `{ oldSlug: string, newSlug: string }`

### `GET /api/metrics` — Public site stats

No auth required. Returns `{ totalLinks: number, totalClicks: number }`.

### `GET /u/[short-url]` — Redirect

Not an API route — a Next.js server page. Looks up the short code, atomically increments `clicks`, then calls `redirect(longUrl)`. Returns 404 if the code is not found.

---

## Getting Started

### 1. Clone & install

```bash
git clone https://github.com/your-username/shorten-it.git
cd shorten-it
npm install
```

### 2. Set up environment variables

Create a `.env` file in the project root:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/dbname"

# NextAuth
AUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

> **Google OAuth setup:** Go to [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials → Create OAuth 2.0 Client ID. Add `http://localhost:3000/api/auth/callback/google` as an authorised redirect URI.

### 3. Set up the database

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Scripts

```bash
npm run dev      # Start development server (Turbopack)
npm run build    # Production build
npm run start    # Run production server
npm run lint     # ESLint
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `AUTH_SECRET` | ✅ | NextAuth secret — generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | ✅ | Full public URL of your app |
| `GOOGLE_CLIENT_ID` | ✅ | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | ✅ | Google OAuth client secret |
| `NEXT_PUBLIC_APP_URL` | ✅ | Base URL used to build short URLs |

---

## How It Works

```
User pastes URL → POST /api/short
  → Zod validates URL + optional custom slug
  → Auth check (401 if no session)
  → Slug conflict check (409 if taken)
  → Dedup: if longUrl already exists, return existing short code
  → nanoid(10) generates a unique short code
  → Prisma creates Link row owned by session user
  → Returns { short_url }

User visits /u/[short-url]
  → Prisma looks up shortUrl
  → 404 if not found
  → Atomically increments clicks counter
  → Next.js redirect() sends user to longUrl
```
