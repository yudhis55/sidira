# CLAUDE.md

This file provides guidance to the assistant (claude.ai/code) when working with code in this repository.

## Project Overview

**SIDIRA v3** (Sistem Digital Inventaris Ruangan Aset) — a Google Apps Script web application for managing healthcare facility asset inventory at Puskesmas Baruharjo, Trenggalek. All UI text and code comments are in Indonesian.

## File Structure

This is a 3-file Google Apps Script project with no build process, no npm, and no external dependencies:

| File | Purpose |
|------|---------|
| `Code.gs` | Backend — GAS server-side logic (~1,033 lines) |
| `index.html` | Frontend — complete SPA with inline CSS + JS (~28,800 lines) |
| `appscript.json` | GAS manifest (timezone, runtime, webapp config) |

## Development & Deployment

- **No build step.** Files are deployed directly to Google Apps Script.
- **No tests.** There is no test framework or test files.
- **No linter configured.** Code uses `var` in frontend (legacy style) and `const/let` in backend.
- **First-time setup:** Run the `setup()` function in Code.gs from the Apps Script editor. It creates the backing Spreadsheet and seeds default users.
- **Deployment:** Deploy as a web app from the Apps Script editor (Deploy → New deployment → Web app).
- **Local development:** The frontend works offline with localStorage only; GAS mode is auto-detected via `IS_GAS = typeof google !== "undefined" && google.script`.

## Architecture

### Backend (Code.gs)

Action-based routing through a single dispatcher:

```
doGet(e)  →  serves index.html
doPost(e) →  JSON body → executeAction(body) → JSON response
doPost_wrapper(payload)  →  bridge for google.script.run calls from frontend
```

`executeAction()` dispatches on `body.action`:
- **Public:** `login`, `setup`, `getInfo`
- **Authenticated:** `loadAll`, `save*` (Sbbk, Pakta, Rooms, Pj, MvLog, UtilItems, UtilMeta, UtilState, Usulan), `loadUsulan`, `logout`
- **Admin-only:** `getUsers`, `saveUser`, `deleteUser`

Authentication is token-based (8-hour expiry). Tokens are stored in the Sessions sheet and verified via `verifyToken(token)`.

### Data Storage (Google Sheets)

Sheet names are defined in the `SH` constant. Key sheets:
- **Users / Sessions** — auth
- **InventarisRuangan** — room inventory (each row = one item snapshot with roomId + itemJson)
- **SBBK** — asset transfer documents (items stored as `items_json`)
- **Pakta** — integrity pacts (assets stored as `aset*_json`)
- **UtilItems / UtilMeta / UtilState** — utility maintenance tracking (ambulance, genset, IPAL)
- **PenanggungJawab** — room responsible persons
- **RiwayatPindah** — asset movement history
- **Log** — audit trail

### Frontend (index.html)

A monolithic SPA — all HTML, CSS, and JavaScript in one file. Key architecture:

**Data layer:** Global variables (`sbbkData`, `paktaData`, `rooms`, `utilState`, etc.) backed by localStorage keys prefixed `sidira_*`. Changes write to localStorage immediately and trigger a debounced (2s) sync to Sheets via `gasSyncKey(key)`.

**Sync mapping** (`GAS_SYNC_KEYS`): maps localStorage keys to backend save actions (e.g., `sidira_sbbk` → `saveSbbk`). Sync only runs when `IS_GAS` is true and a valid `GAS_TOKEN` exists.

**UI sections:**
- Login screen → main content with nav tabs
- Room inventory panels (expandable cards with item tables)
- Utility maintenance panel (daily checklist calendar)
- SBBK and Pakta document management
- Rekap (inventory recap) and Laporan (maintenance reports)
- Global search modal

**Roles:** `admin` (full access + user management), `editor` (can modify data), `viewer` (read-only). Frontend also has a hardcoded `SIDIRA_ACCOUNTS` array for offline/fallback login.

## Key Conventions

- **Item categories:** `alkes` (medical equipment), `meubelair` (furniture), `elektronik` (electronics), `lainnya` (other)
- **Priority levels:** `wajib`, `penting`, `pendukung`
- **Condition statuses:** Baik, Rusak Ringan, Rusak Berat, Tidak Ada
- **Emoji-based UI:** Rooms, utilities, and navigation use emoji icons extensively
- **CSS variables:** Color system defined in `:root` — primary is `--teal`/`--teal2`, danger is `--red`, etc.
- **Fonts:** Sora (UI) + JetBrains Mono (monospace)

## Working with the Large index.html

The frontend file is ~28,800 lines. Key regions by approximate line ranges:
- **CSS styles:** Lines 1–5,000+
- **HTML structure:** Lines 5,000–18,000+
- **JavaScript logic:** Lines 18,000–28,800+

When editing, use search for function names or section comment headers (marked with `// ══════` or `// ──`) to navigate. Major JS sections include room management, utility panel, SBBK, Pakta, reports, authentication, and GAS sync (near the end of the file).
