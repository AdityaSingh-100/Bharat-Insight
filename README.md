# Bharat-Insight

**AI-Driven Data Intelligence Platform for Government Analytics**

A fully data-agnostic, multi-tenant analytics platform built with Next.js 16, Tailwind CSS v4, and Google Gemini AI. Drop any CSV into `/dataset` and the platform auto-detects schema, builds interactive tables, generates charts, and provides AI-powered insights — all in real time.

---

## Features

- **Data-Agnostic Engine** — drop any CSV, get auto-detected schema, types, filters, and charts
- **100K+ Row Virtualization** — TanStack Virtual renders only visible rows (~40 DOM nodes max)
- **Gemini AI Insights** — streaming AI analysis with dynamic prompts built from real data statistics
- **Multi-Tenant Theming** — instant CSS variable swap between organizations (zero JS re-render)
- **RBAC** — role-based access control via Supabase `profiles` table (admin/viewer)
- **Dual Auth** — Google OAuth + email/password with Supabase
- **Command Palette** — `Ctrl+K` / `⌘K` for quick actions (switch org, dataset, role, filters)
- **Responsive** — desktop sidebar collapses to icon-strip, mobile gets a slide-out drawer
- **Dark Mode** — forced dark theme with custom scrollbars and smooth transitions

---

## Tech Stack

| Layer       | Technology                                |
| ----------- | ----------------------------------------- |
| Framework   | Next.js 16 (App Router, Turbopack)        |
| UI          | React 19, Tailwind CSS 4, Motion (Framer) |
| State       | Zustand 5 (persisted)                     |
| Data Table  | TanStack Table + Virtual                  |
| Charts      | Recharts                                  |
| CSV Parsing | PapaParse                                 |
| Auth        | Supabase (Google OAuth + Email)           |
| AI          | Google Gemini (`@google/generative-ai`)   |
| Icons       | Lucide React                              |
| Deploy      | Vercel                                    |

---

## Quick Start

```bash
git clone https://github.com/your-username/bharat-insight.git
cd bharat-insight
npm install

# Configure environment
cp .env.example .env.local
# Fill in: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_GEMINI_API_KEY

npm run dev
# → http://localhost:3000
```

## Project Structure

```
bharat-insight/
├── app/
│   ├── globals.css                 # Tailwind v4 @theme, org themes, custom CSS
│   ├── layout.tsx                  # Root layout (fonts, metadata, providers)
│   ├── page.tsx                    # Landing page
│   ├── login/page.tsx              # Auth page (Google + Email)
│   ├── auth/callback/route.ts      # Server-side OAuth callback
│   ├── dashboard/
│   │   ├── page.tsx                # Main dashboard
│   │   └── settings/page.tsx       # Settings (account, org, role, dataset)
│   └── api/dataset/route.ts        # CSV file server
├── components/
│   ├── landing/                    # Hero, Features (bento), CTA, Navbar
│   ├── dashboard/                  # Sidebar, Header, DataGrid, Charts, AI, CommandPalette
│   └── ui/                         # Shared primitives (dialog, tooltip, button)
├── lib/
│   ├── csv-engine.tsx              # PapaParse + type inference + schema builder
│   ├── gemini.ts                   # Dynamic prompt builder + Gemini streaming
│   ├── supabase.ts                 # Auth helpers + profile fetcher
│   └── utils.ts                    # cn() utility
├── store/
│   ├── useOrgStore.ts              # Org, RBAC, filters, UI state
│   └── useDatasetStore.ts          # CSV loading, parsing, derived state
├── dataset/                        # CSV files (drop your data here)
│   ├── health_data.csv
│   ├── agriculture_data.csv
│   ├── telecom.csv
│   └── digital_india.csv
└── docs/                           # Documentation
    ├── SETUP.md                    # Full setup & deployment guide
    ├── ARCHITECTURE.md             # System architecture & data flows
    ├── AUTHENTICATION.md           # Auth & RBAC guide
    └── API_REFERENCE.md            # API routes, stores, CSV engine
```

---

## How It Works

### CSV → Dashboard Pipeline

```
Drop CSV into /dataset
        ↓
GET /api/dataset?file=name.csv  →  raw text
        ↓
PapaParse  →  rows[]
        ↓
Type inference (year, %, currency, number, boolean, string)
        ↓
Auto-generate: table columns, filter dropdowns, charts, AI context
        ↓
Render with TanStack Virtual (100K+ rows, ~40 DOM nodes)
```

### AI Insights

The Gemini prompt is built dynamically from your actual data:

- Dataset filename & column types
- Numeric statistics (min/max/mean/sum) for up to 8 columns
- Categorical breakdowns (top values for up to 5 columns)
- Currently active filters and search query
- Filtered row count vs. total

Model fallback: `gemini-2.5-flash-lite` → `gemini-2.5-flash` → `gemini-2.5-pro` (auto-advances on rate limits).

### Multi-Tenant Theming

Switch organizations instantly — pure CSS variable swap:

```css
/* Default: Health (blue) */
--color-org-primary: hsl(217 91% 60%);

/* Agriculture (olive green) */
.org-agriculture {
  --color-org-primary: hsl(88 60% 42%);
}
```

### RBAC

| Role       | Permissions                                                   |
| ---------- | ------------------------------------------------------------- |
| **Admin**  | View, edit, delete rows, export CSV, AI insights, toggle role |
| **Viewer** | View, search, export CSV, AI insights (no edit/delete)        |

## Roles are stored in a Supabase `profiles` table. New signups get `viewer` by default. Admins are promoted via the Supabase Dashboard.

## Environment Variables

```dotenv
# Required
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY


NEXT_PUBLIC_GEMINI_API_KEY=YOUR_GEMINI_KEY

# Optional — prevents OAuth port mismatch
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Adding Your Own Data

1. Place any `.csv` file in the `dataset/` folder
2. First row = column headers, any number of rows
3. Restart the dev server (or refresh the dashboard)
4. Select your file from the dataset picker in the sidebar

The engine handles everything else — type inference, filters, charts, and AI context.

---

## Deployment

### Vercel (recommended)

1. Push to GitHub
2. Import at [vercel.com/new](https://vercel.com/new)
3. Add environment variables
4. Deploy

## Scripts

```bash
npm run dev      # Start dev server (Turbopack)
npm run build    # Production build
npm start        # Start production server
npm run lint     # ESLint
```

---

## Technical Design Notes

### Data Handling

All CSV processing happens on the client. The file is fetched from `/api/dataset`, parsed with **PapaParse**, and each column's type (`number`, `year`, `percentage`, `currency`, `boolean`, `string`) is inferred automatically from its header name and values. Basic statistics (min, max, mean) are computed once and stored in Zustand — the table, charts, and AI all read from the same parsed result.

### Design Standards

- **Tailwind CSS v4** with a single `@theme {}` block in `globals.css` for all design tokens.
- **Org colour** is a set of CSS variables (`--color-org-primary`, etc.) redefined per org class — switching orgs swaps one class on `<html>`, no JS re-render needed.
- **Dark mode only** — no light theme variants.
- **Framer Motion** for animations, **Lucide React** for all icons, `cn()` (clsx + tailwind-merge) for all class merging.

### Virtualization

The DataGrid uses **client-side pagination** — the full sorted/filtered array is sliced into pages of 25, 50, 100, or 200 rows. TanStack Table only receives the current page slice, keeping DOM nodes minimal regardless of total dataset size. Page resets to 1 whenever filters or sort order change.

### Multi-Tenancy Logic

Tenancy is client-side only — no per-org database or server routing.

- Each org has a config entry (`name`, `themeClass`, `defaultDataset`) in `ORG_CONFIGS`.
- Switching org applies the org's CSS class, clears active filters, and loads the org's default dataset.
- Role (`admin` / `viewer`) is read from Supabase on login and stored in Zustand. Only admins can edit or delete rows.
- Adding a new org requires one config entry, one CSS class, and a CSV file — nothing else.

### AI Prompt Design

The Gemini prompt is built dynamically at query time from the **current filtered view** — it includes the dataset name, column list, numeric stats (min/max/mean), categorical breakdowns, and any active filters. This means the AI's answer always reflects exactly what the user is looking at. Responses stream token-by-token to the UI. If the primary model hits a rate limit, it automatically falls back through `gemini-2.5-flash-lite` → `gemini-2.5-flash` → `gemini-2.5-pro`.

---

## License

Private project.
