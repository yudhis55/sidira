# Repository Guidelines

SIDIRA (Sistem Digital Inventaris Ruangan Aset) — asset inventory management for Puskesmas Baruharjo, Trenggalek. All UI text is in Indonesian; code comments may be Indonesian or English.

> The root `CLAUDE.md` is **stale** — it documents the abandoned Google Apps Script v3 app. Ignore it; this file and `web/README.md` are current.

## Project Layout

```
sidira/
├── web/                 # Active app — Next.js 16.2.9 (App Router, Turbopack) + Supabase + TypeScript
│   ├── app/
│   │   ├── (dashboard)/  # Protected route group (layout + sidebar)
│   │   ├── login/, api/
│   │   ├── sbbk/[id]/print/   # Print routes live at app ROOT (not under dashboard)
│   │   └── pakta/[id]/print/  #   so they escape the dashboard layout for clean print pages
│   ├── components/      # Feature folders + ui/ (shadcn). 12 features: admin, checklist,
│   │                    # inventaris, laporan, layout, pakta, rekap, riwayat, sbbk,
│   │                    # shared, usulan, utilitas
│   ├── lib/
│   │   ├── auth/        # 17 server-action modules + utils.ts (see canonical pattern below)
│   │   ├── supabase/    # client.ts (browser), server.ts (cookie-bound, RLS), admin.ts (service role)
│   │   ├── api/         # Edge / route helpers
│   │   ├── business-logic.ts   # PURE functions only — no DB/network, kept testable
│   │   ├── pakta-utils.ts, seed-users.ts, usulan-types.ts, utils.ts
│   ├── types/database.ts       # Shared TS interfaces (NOT lib/types.ts — that file does not exist)
│   ├── supabase/migrations/   # Timestamped SQL: YYYYMMDDHHMMSS_name.sql (10 files)
│   ├── scripts/         # tsx scripts: setup-users, migrate-from-gas, monitoring,
│   │                    # apply-seed, read-excel, seed-data-from-excel
│   ├── __tests__/       # Custom assert runner (NOT jest/vitest)
│   └── middleware.ts    # Auth guard — redirects unauth to /login, except /login and /auth
├── gas-legacy/          # Old Google Apps Script code — backup only, do not modify
├── DESIGN.md            # Achromatic "Clinical Ledger" design system (colors, type, radii)
├── PRODUCT.md           # Product context & users
└── *.csv, KARTU*.xlsx   # One-off migration source data at repo root (not part of app)
```

## Commands (run from `web/`)

```bash
npm install
npm run dev            # Turbopack dev server on http://localhost:3000
npm run build
npm start
npm run lint           # ESLint 9 flat config (eslint.config.mjs) — runs `eslint`, NOT `next lint`
npx tsx __tests__/business-logic.test.ts          # Unit tests — there is NO `npm test` script
npx tsx scripts/setup-users.ts                   # Seed default users
npx tsx scripts/migrate-from-gas.ts              # Migrate from GAS/Sheets
npx tsx scripts/monitoring.ts                    # Health check
npx tsx scripts/seed-data-from-excel.ts          # Seed from XLSX (uses read-excel.ts)
```

There is **no `test` npm script**. Always invoke tests via the `npx tsx` command above. Tests are pure-function only (no DB / no network).

Setup `.env.local` (see `.env.local.example`): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`. Apply migrations **in order** via the Supabase Dashboard SQL Editor (start with `20260618000000_initial_schema.sql`); there is no `supabase migrate` CLI wired up here.

## Coding Conventions

- **TypeScript strict mode** (`strict: true` in `tsconfig.json`). Prefer explicit types; shared interfaces live in `types/database.ts` + `lib/usulan-types.ts` — **not** `lib/types.ts`.
- **Path alias:** `@/*` maps to `web/` root. Import as `@/lib/supabase/server`, `@/types/database`, etc.
- **Server actions** (`lib/auth/*.ts`): each file starts with `"use server"`. Canonical pattern (from `actions.ts`, `items.ts`):
  - Accept `FormData` (or typed args); read with `formData.get("field") as string`.
  - On validation/DB failure: `return { error: "<Indonesian message>" }` — never throw to the client.
  - On success: call `revalidatePath(...)` then `return { success: true }`.
  - **Login is special**: it calls `redirect("/")` instead of returning a shape (a returned `redirect()` throws internally — do not wrap in try/catch).
  - Login uses `createAdminClient()` to look up `profiles` by username (anon RLS can't read `profiles`), then signs in with `${username}@sidira.local`.
- **Supabase clients:**
  - `createClient()` (from `lib/supabase/server`) — cookie-bound, RLS-enforced, for user-scoped work.
  - `createAdminClient()` (from `lib/supabase/admin`) — service role, bypasses RLS. **Server-side only. Never import in a Client Component.** Used for privileged lookups (e.g. login profile lookup, seeding).
- **Auth:** username maps to `{username}@sidira.local` email. Roles: `admin`, `editor`, `viewer`.
- **Components / shadcn:** `components.json` style `radix-lyra`, baseColor `neutral`, **iconLibrary `phosphor`** (`@phosphor-icons/react`) — not lucide. Use `cn()` from `@/lib/utils`.
- **Tailwind v4** via `@import "tailwindcss"` in `app/globals.css` (no `tailwind.config.*`). Also imports `tw-animate-css` and `shadcn/tailwind.css`. Theme tokens are CSS variables (e.g. `--radius`, `--font-sora`, `--font-mono`).
- **Design system** (`DESIGN.md`): achromatic neutrals, monospace headings (`--font-mono`), red reserved for destructive actions only, no shadows. Note `--radius` defaults to `0.625rem` (~10px) in `globals.css` — `DESIGN.md` exposes a `rounded-none: 0` token for components that should be square; the global default is **not** square. Match existing component radius rather than blanket-applying `rounded-none`.

## Testing

No jest/vitest. Tests are pure-function unit tests in `__tests__/business-logic.test.ts` run via `npx tsx`. Helpers defined inline in the test file:

- `assert(condition, message)`
- `assertEqual(actual, expected, message)`
- `assertThrows(fn, message)`

Keep business logic in `lib/business-logic.ts` (no DB/network deps) so it stays testable. Add new tests by extending the same file. The runner prints ✅/❌ and exits non-zero on failure.

## Next.js 16 Note

Next.js **16.2.9** has breaking changes versus earlier majors (React 19.2.4, Turbopack default for `dev`). Before writing App Router code, consult the bundled guides in `web/node_modules/next/dist/docs/` and heed deprecation notices. `web/AGENTS.md` restates this warning. ESLint uses the v9 flat config (`eslint.config.mjs`), not `.eslintrc`.

## Security

- `.env*` files and the Supabase service role key are gitignored — never commit them.
- RLS is enabled on every table. Policies use the SQL helper `public.user_role()` (defined in `20260618000000_initial_schema.sql`); SELECT usually `USING (true)`, writes `USING (public.user_role() IN ('admin','editor'))`. Do not weaken these.
- Never expose `createAdminClient()` (or the service role key) to the browser.
- `middleware.ts` redirects unauthenticated users to `/login` for every path except `/login` and `/auth`; authenticated users hitting `/login` are bounced to `/`.

## Commit & PR Guidelines

Fresh repo (no commits yet on `master`). When committing, use concise Conventional Commits messages (e.g. `feat(sbbk): add print export`, `fix(auth): redirect after login`). PRs should note any migration or env-var additions and confirm `npm run lint` and `npm run build` pass. No pre-commit hooks or CI workflows are configured yet.