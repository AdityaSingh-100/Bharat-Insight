# Bharat-Insight v2 — AI-Driven Data Platform

> **Fully data-agnostic** multi-tenant analytics platform. Drop any CSV into `/dataset` and the platform auto-detects schema, builds table columns, infers types, and feeds Gemini AI with real statistics.

---

## 🆕 v2 Changes

| Feature | v1 | v2 |
|---------|----|----|
| Tailwind | v3 (JS config) | **v4 (CSS-first `@theme`)** |
| Data source | Hardcoded telecom schema | **Any CSV from `/dataset`** |
| Table columns | Manual `ColumnDef` per field | **Auto-generated from CSV headers** |
| Type inference | None | **number, year, percentage, currency, string, boolean** |
| Filters | Fixed state/year/category | **Dynamic — any low-cardinality column** |
| Charts | Hardcoded telecom metrics | **Auto-built from numeric columns** |
| AI context | Hardcoded field names | **Dynamic stats from actual CSV data** |
| CSV parsing | None | **PapaParse — handles 100K+ rows** |

---

## ⚡ Quick Start

```bash
git clone https://github.com/you/bharat-insight
cd bharat-insight
npm install

# Drop your CSV files
cp your-data.csv dataset/

# Configure API keys (optional — mock mode works without keys)
cp .env.example .env.local

npm run dev
# → http://localhost:3000
```

---

## 📂 Using the `/dataset` Folder

This is the only thing you need to interact with:

```
dataset/
  telecom.csv          ← included sample
  digital_india.csv    ← included sample
  your-custom-data.csv ← just paste it here!
```

**Rules:**
- Files must end in `.csv`
- First row = column headers
- Any number of rows (100K+ virtualized smoothly)
- Any columns — schema is 100% auto-detected

**The system will automatically:**
1. Read the CSV server-side via `/api/dataset`
2. Parse with PapaParse (handles quotes, escapes, encoding)
3. Infer column types per column
4. Generate TanStack Table column definitions
5. Build filter dropdowns for categorical columns
6. Compute summary statistics for AI context
7. Feed everything into Gemini AI

---

## 🧠 CSV Schema Inference

The `lib/csv-engine.ts` engine runs on every loaded file:

```
Header + sample values
       │
       ▼
inferColumnType(header, values[])
       │
       ├── isYear()        → 1900–2100 integer range
       ├── isPercentage()  → header keywords: "rate", "share", "%", "ratio"
       ├── isCurrency()    → header keywords: "revenue", "budget", "arpu", etc.
       ├── allNumeric?     → number
       ├── booleanSet?     → boolean
       └── default         → string
```

**Low-cardinality strings** (`uniqueCount ≤ 80`) automatically become filter dropdowns.

---

## ⚡ Virtualization Strategy (100K+ rows)

**TanStack Virtual** — only renders rows in the visible viewport:

```
100,000 rows in memory
        │
    Viewport = ~15 visible rows
        │
    Overscan = +25 rows buffer
        │
    DOM nodes = ~40 max (regardless of row count)
```

1. `useVirtualizer({ estimateSize: () => 42 })` — fixed row height for predictability  
2. `paddingTop` / `paddingBottom` div spacers maintain scrollbar proportion  
3. Filtering runs via `match-sorter` on the in-memory array (no server round-trip)  
4. Data is generated/parsed once and cached in Zustand store

---

## 🏢 Multi-Tenant Architecture

```
Zustand useOrgStore
    ├── currentOrg: "communications" | "meity"
    ├── role: "admin" | "viewer"
    ├── activeFilters: Record<columnKey, value>  ← dynamic!
    └── globalSearch: string

CSS Variables (instant theme switch — no JS re-render):
    .org-meity {
      --color-org-primary: hsl(160 84% 39%);  ← emerald
    }
    (default) {
      --color-org-primary: hsl(217 91% 60%);  ← blue
    }
```

Dataset switching is separate from org switching — each org can load different CSVs via the file picker.

---

## 🤖 AI Prompt Design

The prompt is **fully dynamic** — no hardcoded field names:

```
Dataset: "your-file.csv"
Columns: 12 · Numeric: subscribers, market_share, arpu · Categorical: state, operator

Current View:
  Filtered rows: 2,340 (23.4% of total)
  Active filters: state="Maharashtra", year="2024"

Numeric Statistics (filtered):
  subscribers: min=1.2M, max=48.9M, mean=12.4M
  market_share: min=2.1%, max=42.3%, mean=28.7%
  arpu: min=48.20, max=248.90, mean=172.30

Categorical Breakdown:
  operator: 6 unique values, top: Jio, Airtel, Vi
```

This means Gemini always gets **real numbers** from the actual filtered data — not hardcoded estimates.

---

## 🎨 Tailwind v4

No `tailwind.config.ts` — everything in CSS:

```css
/* postcss.config.js → @tailwindcss/postcss */

@import "tailwindcss";

@theme {
  --color-org-primary: hsl(217 91% 60%);
  --color-background: hsl(224 71% 4%);
  /* ... all design tokens */
}

/* Org theme variant — instant CSS variable swap */
.org-meity {
  --color-org-primary: hsl(160 84% 39%);
}
```

---

## 🚀 Deployment

### Vercel (recommended)

```bash
# 1. Push to GitHub
# 2. Import to vercel.com
# 3. Add env vars:
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_GEMINI_API_KEY=...
# 4. Deploy
```

**Important:** The `/dataset` folder is read server-side at runtime. On Vercel, these files are bundled with the deployment. To update datasets without redeploying, connect to an external storage (S3, Supabase Storage) and update `/app/api/dataset/route.ts`.

---

## 📁 Project Structure

```
bharat-insight/
├── dataset/                    ← DROP CSV FILES HERE
│   ├── telecom.csv
│   └── digital_india.csv
├── app/
│   ├── globals.css             ← Tailwind v4 (@import "tailwindcss", @theme)
│   ├── layout.tsx
│   ├── page.tsx                ← Landing page
│   ├── dashboard/page.tsx      ← Main dashboard (data-agnostic)
│   └── api/dataset/route.ts   ← CSV file server (reads /dataset)
├── components/
│   ├── landing/
│   │   ├── HeroSection.tsx
│   │   ├── FeaturesSection.tsx
│   │   └── CTASection.tsx
│   └── dashboard/
│       ├── DataGrid.tsx         ← TanStack Table + Virtual, dynamic columns
│       ├── DashboardCharts.tsx  ← Auto-built from numeric columns
│       ├── AIPanel.tsx          ← Gemini streaming, dynamic context
│       ├── CommandPalette.tsx   ← ⌘K, includes dataset file switching
│       ├── DashboardHeader.tsx  ← Org switcher + DatasetFilePicker
│       ├── DatasetFilePicker.tsx ← CSV file selector
│       └── Sidebar.tsx
├── lib/
│   ├── csv-engine.ts            ← PapaParse + type inference + column builder
│   ├── gemini.ts                ← Dynamic AI prompts
│   ├── supabase.ts
│   └── utils.ts
├── store/
│   ├── useOrgStore.ts           ← Org, role, dynamic filters
│   └── useDatasetStore.ts       ← CSV loading, parsed dataset, filter options
└── postcss.config.js            ← @tailwindcss/postcss (v4)
```

---

*Built for Regrip India Pvt. Ltd. Frontend Engineering Assignment 2024*
