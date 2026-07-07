# Roadmap: Refactor Total Frontend SIDIRA Next.js → Identik GAS (Visual + Alur)

## Target (disepakati user)
**Identik visual + alur dengan GAS, arsitektur Next.js dipertahankan.**
- Tampilan (warna, font, layout, spacing): identik 100%
- Peletakan & daftar fitur per modul: identik 100%
- Alur kerja user: identik
- Dokumen print (SBBK/Pakta/Lampiran): identik 100%
- Interaktivitas mikro (toggle, centang, inline-edit): identik secara **feel** via optimistic update
- Persistensi data: tetap Supabase (RLS, Auth) — JANGAN balik ke localStorage-first
- SSR + server actions dipertahankan untuk data-load & aksi berat

## Status saat ini (FASE 1–5 sudah jalan)
- ✅ Tema teal-based GAS + font Sora/JetBrains Mono (globals.css, layout.tsx)
- ✅ Komponen reusable: PageHeader, StatChip, LegendBar, Toolbar, FilterChips, CategoryBadge, PriorityBadge, KondisiBadge (components/shared/page-elements.tsx)
- ✅ Listing inventaris: global stats bar + legend + toolbar (Export CSV, Rekap Usulan, Cetak) + card di-enrich
- ✅ Listing utilitas: card dengan item count + done bulan ini + progress bar
- ✅ Global search Ctrl+K (ruangan/item/usulan)
- ✅ Pakta: tombol Lampiran + toggle mode print (Pakta/Lampiran/both)
- ✅ Build production sukses tanpa error

## Temuan audit gap (modul yang SUDAH setara fungsional GAS — tinggal visual)
Modul-modul berikut di Next.js **sudah fungsional setara GAS**, hanya belum memakai komponen reusable (inkonsistensi visual):
- SBBK: header stats + filter chips + search + tabel + CSV export + print ✅
- Rekap Pemegang: header stats + filter chips (PNS/PPPK/Sudah/Belum Pakta) + search + "Buat Pakta Semua Belum" + tabel ✅
- Riwayat/Movement log: tabel dari→ke + export CSV ✅
- Laporan: filter bulan/tahun/ruangan/kategori + summary + export ✅
- Detail inventaris: room-header inline-edit (nama+PJ) + item-table inline-edit + set-all-baik + move + delete ✅
- Detail utilitas: UtilHeader + Checklist calendar + ItemsForm ✅

## Detail struktur GAS yang jadi acuan identitas (sudah dikonfirmasi dari source)

### Item table GAS (per kategori, di panel ruangan) — 13 kolom:
1. No | 2. Nama + spec (td-spec) | 3. Satuan | 4. Merek (input) | 5. No.Reg (input) |
6. Tahun (input) | 7. Std | 8. Jml (input) | 9. Kondisi (select baik/rr/rb/ta) |
10. Catatan (input) | 11-13. Aksi: 📋 Ceklist harian / ➡ Pindah / ✕ Hapus
- cat-header per kategori: nama kategori + jumlah + tombol "Semua Baik" + tombol tambah item + chevron collapse
- room-header: icon, nama (editable inline), desc, stats (Jenis Item, Total Unit), PJ (editable inline), tombol "✅ Semua Kondisi Baik" seluruh ruangan, "✏️ Edit Nama", "➡ Pindah Semua", hapus ruangan
- Usulan section inline per ruangan: collapsible, filter, tabel usulan, export CSV per ruangan, tombol "Tambah Usulan"

### Movement log GAS: modal list riwayat (timestamp, ikon kategori, nama, path dari→ke)
- Move 1 item: modal pilih ruangan tujuan + jumlah + catatan
- Move all: modal checklist multiple item + pilih ruangan tujuan

### Rekap Pemegang GAS: tabel (Nama/NIP, Jabatan, Status, Inventaris Dipegang badge 💻🚗🔧🏠, Pakta ada/belum, Aksi Detail+Pakta) + filter chips + search + "Buat Pakta Semua Belum"

---

## ROADMAP EKSEKUSI (fase lanjutan, murni frontend)

### FASE 6 — Konsistensi header semua modul (prioritas tinggi)
Target: SEMUA halaman pakai `<PageHeader>` reusable agar visual identik.
- `pakta/page.tsx`: ganti header hardcoded → PageHeader (icon 📜, stats Total Pakta)
- `sbbk/page.tsx`: ganti header → PageHeader (icon 📋, stats Total SBBK/Item/Nilai)
- `rekap/page.tsx`: ganti header → PageHeader (icon 📊, stats Pemegang/Item/Pakta Ada/Belum) — sudah mirip, tinggal samakan ke komponen
- `laporan/page.tsx`: ganti header → PageHeader (icon 📈)
- `usulan/page.tsx`: ganti header → PageHeader
- `riwayat/page.tsx`: ganti header → PageHeader
- Pastikan semua filter chips pakai `<FilterChips>` reusable (saat ini inline per halaman)
- Estimasi: ~1-2 jam, risiko rendah

### FASE 7 — Detail inventaris: samakan item table persis dengan GAS
Target: halaman `/inventaris/[id]` identik struktur GAS.
Komponen `item-table.tsx` & `room-header.tsx` SUDAH ada & fungsional. Yang perlu disamakan:
- Verifikasi 13 kolom item table GAS semua terwakili (konfirmasi: No, Nama+spec, Satuan, Merek, No.Reg, Tahun, Std, Jml, Kondisi, Catatan, Aksi Ceklist/Pindah/Hapus)
- cat-header: pastikan ada nama kategori + jumlah + tombol "Semua Baik" per kategori + tambah item + collapse (sudah ada di item-table.tsx — konfirmasi render)
- room-header: pastikan tombol "Semua Kondisi Baik" seluruh ruangan, "Pindah Semua", hapus (sudah ada — konfirmasi)
- Usulan section inline per ruangan: `room-usulan-section.tsx` sudah ada — konfirmasi ter-render di detail page dengan filter + export CSV per ruangan
- Optimistic update untuk inline-edit (tahun/merek/noreg/jml/kondisi/catatan) supaya instan seperti GAS (saat ini pakai server action + revalidate, ada jeda)
- Estimasi: ~2-3 jam, risiko sedang (optimistic update)

### FASE 8 — Detail utilitas: samakan checklist calendar dengan GAS
Target: halaman `/utilitas/[utilId]` identik GAS.
Komponen `Checklist` & `UtilHeader` SUDAH ada. Yang perlu disamakan:
- Verifikasi struktur: tabel item × tanggal(1..akhir bulan) + kolom Keterangan (konfirmasi sudah ada)
- Cell state: Baik/belum/belum diperiksa, warna, klik cell (konfirmasi interaksi)
- "Centang semua Baik": untuk tanggal/rentang/seluruh bulan (konfirmasi 3 opsi ada)
- Header bulan/tahun switcher (konfirmasi)
- Optimistic update untuk toggle cell checklist (instan)
- Estimasi: ~2 jam, risiko sedang

### FASE 9 — Movement log & move dialog: samakan dengan GAS
Target: move dialog + riwayat identik GAS.
- `move-item-dialog.tsx` & `move-all-dialog.tsx` SUDAH ada — konfirmasi field (ruangan tujuan, jumlah, catatan untuk single; checklist multi-item untuk all)
- Riwayat page SUDAH ada & setara — tinggal samakan header ke PageHeader
- Opsi: GAS punya movement log sebagai modal global; Next.js punya sebagai halaman `/riwayat`. **Pertahankan halaman terpisah** (lebih baik untuk SSR) — cukup tambah link cepat dari header/sidebar.
- Estimasi: ~1 jam, risiko rendah

### FASE 10 — Print pages: samakan format dokumen dengan GAS
Target: dokumen cetak identik (formal, baku).
- `sbbk/[id]/print`: konfirmasi format (kop, tabel items, tanda tangan) = GAS
- `pakta/[id]/print`: SUDAH punya Lembar 1 (Pakta) + Lembar 2 (Lampiran BMD) + toggle mode ✅
- Verifikasi CSS @media print bersih di kedua print page
- Estimasi: ~1-2 jam, risiko rendah

### FASE 11 — Polish & bug fixes
- Jalankan dev server, buka tiap halaman, catat & fix error konsol/hydration
- Tes responsif (mobile drawer sidebar)
- Konsistensi spacing, border, radius (semua square 10px/6px sesuai GAS)
- Verifikasi semua tombol aksi berfungsi (role-based: admin/editor/viewer)
- Estimasi: ~2-3 jam

---

## Prinsip eksekusi
1. **Tahap per tahap** — selesai satu fase, berhenti, user evaluasi, baru lanjut
2. **Jangan rombak yang sudah berfungsi** — Rekap/SBBK/Laporan/Riwayat/detail sudah setara, cukup samakan ke komponen reusable (kosmetik)
3. **Optimistic update selektif** — hanya mikro-interaksi (toggle/inline-edit/centang), bukan aksi berat
4. **Pertahankan SSR + server actions + Supabase** — tidak balik ke localStorage-first
5. **Typecheck + build setelah setiap fase**
6. **Bug fixes runtime** (login Supabase pause, dll) ditangani terpisah dari refactor visual

## Catatan penting
- Login `fetch failed` = project Supabase di-pause (bukan bug refactor) — user perlu restore project di dashboard Supabase
- Hydration warning `data-gr-ext-installed` = Grammarly extension (abaikan, bukan bug)
