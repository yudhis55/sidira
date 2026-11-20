# AUDIT GAP — GAS Legacy vs Next.js Rewrite

**Tanggal:** 2026-07-27
**Metode:** perbandingan source-to-source, `gas-legacy/index.html` (29.260 baris) vs `web/`
**Cakupan:** seluruh modul yang ada di sidebar + modal/panel global

Legenda prioritas:
🔴 **Tinggi** — fungsi hilang atau tidak bekerja
🟡 **Sedang** — fungsi ada tapi pola interaksi/bentuk berbeda dari GAS
🔵 **Rendah** — kosmetik, label, ikon, teks

---

## 1. Ringkasan Eksekutif

Struktur besar sudah mirip: sidebar 5 seksi, header hijau bergelombang, tabel per kategori, dan sebagian besar modal utilitas/checklist sudah diporting dengan rapi. Yang belum sama persis terbagi menjadi **tiga pola sistemik**:

### Pola A — Modal berubah jadi halaman (keluhan utama Anda)

Di GAS semua entri data terjadi **di atas konteks yang sedang dilihat** (modal), sehingga pengguna tidak pernah kehilangan tempat. Di Next.js sebagian besar berubah jadi rute terpisah.

| Aksi | GAS | Next.js |
|---|---|---|
| Tambah Ruangan | Modal `#modalOverlay` + emoji picker | Halaman `/inventaris/new` |
| Tambah Utilitas | Modal `#utilModalOverlay` + emoji picker | Halaman `/utilitas/new` |
| Entri/Edit SBBK | Modal `#sbbkModal` | Halaman `/sbbk/new`, `/sbbk/[id]/edit` |
| Entri/Edit Pakta | Modal `#paktaModal` | Halaman `/pakta/new`, `/pakta/[id]/edit` |
| Cetak SBBK | Modal preview `#sbbkPrintModal` | Rute `/sbbk/[id]/print` |
| Cetak Pakta | Modal preview 2 lembar `#paktaPrintModal` | Rute `/pakta/[id]/print` |
| Tambah/Edit Item | Baris tabel inline (`addRow`) | Halaman `/inventaris/[id]/items/new` + `/edit` + `/delete` |
| Tambah/Edit Usulan | Baris tabel inline (`addUsulan`) | Halaman `/usulan/new`, `/usulan/[id]/edit` |

Sudah benar memakai modal di Next.js: Ceklist Harian, Detail Ceklist, Pindah Item, Pindah Semua, Laporan, Riwayat, Edit Jadwal Utilitas, Rekap Kondisi.

### Pola B — Tabel yang di GAS bisa diedit langsung, di Next.js jadi read-only

GAS memakai `<input>`/`<select>` **di dalam sel tabel** sehingga petugas mengisi data seperti di spreadsheet. Next.js merender teks statis. Ini terjadi di tabel inventaris ruangan dan tabel usulan.

### Pola C — Elemen global hilang di halaman selain dashboard

Di GAS, `legend-bar` + 6 `gstats` + `page-actions` menempel pada tampilan ruangan (GAS tidak punya halaman dashboard terpisah — app langsung membuka ruangan pertama). Di Next.js elemen ini hanya ada di `/`, sedangkan `/inventaris/[id]` hanya menampilkan `PageActions` tanpa legend & gstats.

---

## 2. Layout, Header, Sidebar & Global Search

| # | Temuan | Prioritas | Lokasi |
|---|---|---|---|
| 1.1 | **Blok statistik header hilang total.** GAS punya `header-stats`: "51 Ruangan" + "767 Total Item" + chip "📅 KIR 2026 — Aktif". Next.js tidak punya sama sekali. | 🔴 | `components/gas/site-header.tsx` |
| 1.2 | **Search bar inline di header hilang.** GAS menampilkan input pencarian permanen di header setelah login (`#globalSearchBar`), lengkap dengan `kbd` Ctrl+K dan tombol clear. Next.js hanya punya palette Ctrl+K yang tak terlihat sampai ditekan. | 🔴 | `site-header.tsx` |
| 1.3 | **Filter kategori pada hasil pencarian hilang.** GAS `gsSetFilter` menyaring hasil per kategori (all/alkes/meubelair/elektronik). | 🟡 | `shared/global-search.tsx` |
| 1.4 | **Highlight kata kunci hilang.** GAS `gsHighlight()` membungkus kecocokan dengan `<mark>`. | 🟡 | `shared/global-search.tsx` |
| 1.5 | **Hasil pencarian tidak dikelompokkan per ruangan** dan tidak menampilkan kondisi item live (`gsGetCond`). GAS mengelompokkan per ruangan dengan ikon ruangan. | 🟡 | `shared/global-search.tsx` |
| 1.6 | **Navigasi hasil tidak menyorot baris.** GAS `gsNavigateTo()` scroll ke baris + kelas `gs-highlighted` selama 2,2 detik. Next.js hanya `router.push`. | 🟡 | `shared/global-search.tsx` |
| 1.7 | **Chip akronim salah.** GAS: `SIstem`, `DIgital`, `Ruangan`, `Aset`, `🏥 Puskesmas Baruharjo`, `📍 Trenggalek`. Next.js: `ACRONYM_CHIPS` berisi S/I/D/I/R/A dengan 3 `word` **kosong**, sehingga muncul chip "I", "R", "A" tanpa teks; chip Puskesmas & Trenggalek hilang. | 🔴 | `site-header.tsx:6-13` |
| 1.8 | **Teks tagline berbeda.** GAS: satu kalimat "Sistem Digital Inventaris Ruangan Puskesmas Baruharjo". Next.js: kata terpisah bertitik "Sistem · Digital · Inventaris · Ruangan · Aset". | 🔵 | `site-header.tsx` |
| 1.9 | **User bar hardcode.** Nama "sidira" / role "admin" ditulis mati; tombol Keluar hanya `router.push("/login")` tanpa menghapus sesi. GAS mengambil dari akun aktif dan menampilkan **jabatan** (mis. "Kepala UPTD Puskesmas Baruharjo"). | 🔴 | `site-header.tsx` |
| 1.10 | **Legend/gstats/page-actions tidak muncul di halaman ruangan** (lihat Pola C). | 🔴 | `app/(dashboard)/inventaris/[id]/page.tsx` |
| 1.11 | **Warna legenda Alkes tidak konsisten.** `page-elements.tsx` `LegendBar` & `CategoryBadge` memakai `--red` untuk alkes, padahal GAS memakai `--teal` (dan `app/(dashboard)/page.tsx` sudah benar teal). Dua sumber kebenaran yang berbeda. | 🟡 | `shared/page-elements.tsx:187,278` |
| 1.12 | **Label sidebar berbeda.** GAS: "Pemegang Inventaris" (📊), "Pakta BMD" (📜), seksi "📜 Pakta Integritas", SBBK ikon 📋. Next.js: "Rekap", "Pakta" (📝), seksi "📝 Pakta Integritas", SBBK ikon 📤. | 🔵 | `components/gas/room-nav.tsx` |

---

## 3. Inventaris Ruangan

| # | Temuan | Prioritas | Lokasi |
|---|---|---|---|
| 2.1 | **Kolom "Tahun" (Tahun Pengadaan) hilang.** GAS punya kolom input `number` (1990–2099) di setiap baris. Next.js tidak punya kolom ini. | 🔴 | `inventaris/room-detail-interactive.tsx` |
| 2.2 | **Seluruh sel tabel read-only.** Di GAS, Tahun, Merek/Tipe, No. Register, Jml Ada, dan Keterangan adalah `<input>` yang bisa langsung diketik; Prioritas & Kondisi adalah `<select>`. Next.js menampilkan teks statis saja. | 🔴 | `room-detail-interactive.tsx:495-580` |
| 2.3 | **"＋ Tambah {kategori}" berubah perilaku.** GAS `addRow()` menyisipkan **baris kosong yang langsung bisa diisi** (10 field). Next.js membuka modal kecil yang hanya menanyakan **Nama Barang**, sisanya diisi default (qty 1, unit "unit", prio "pendukung"). | 🔴 | `room-detail-interactive.tsx:263-304` |
| 2.4 | **Kolom Nama & Spesifikasi dipisah.** GAS menggabungkan dalam satu sel (`td-nama` tebal + `td-spec` kecil di bawahnya). Next.js memecah jadi dua kolom terpisah. | 🟡 | `room-detail-interactive.tsx:448-453` |
| 2.5 | **Interaksi Kondisi berbeda.** GAS memakai `<select>` 4 opsi (bisa langsung pilih). Next.js memakai badge yang **berputar** tiap klik (baik→rr→rb→ta) — butuh 3 klik untuk memilih "ta". | 🟡 | `room-detail-interactive.tsx:530-541` |
| 2.6 | **Kategori kosong tetap dirender.** GAS melewati kategori yang tidak punya item (`if (!groups[kat] ...) return`). Next.js selalu merender 4 seksi, yang kosong berisi "Tidak ada data". | 🟡 | `room-detail-interactive.tsx:405` |
| 2.7 | **Tombol Edit Nama, Hapus Ruangan, dan PJ hanya menampilkan toast mock.** `handleEditMock`, `handleHapusMock`, dan tombol PJ tidak melakukan apa pun. Padahal implementasi asli sudah ada di `room-header.tsx` (inline edit + dialog konfirmasi) tapi komponen itu **tidak dipakai** oleh halaman. | 🔴 | `room-detail-interactive.tsx:197-203,351` |
| 2.8 | **Edit nama ruangan di GAS memakai `prompt()`**, hapus ruangan memakai `confirm()`. Kalau ingin sama persis, pola inline-edit Next.js justru lebih baik — perlu keputusan Anda apakah meniru persis atau memperbaiki. | 🔵 | — |
| 2.9 | **Label kolom berbeda:** GAS "Standar" & "Jml Ada" → Next.js "Std" & "Jml". | 🔵 | `room-detail-interactive.tsx` |
| 2.10 | **Ikon tombol berbeda:** GAS hapus = `✕`, ceklist = `📅 Ceklist`. Next.js hapus = `🗑`, ceklist = `📋` tanpa teks. | 🔵 | `room-detail-interactive.tsx` |
| 2.11 | **Statistik global tidak ikut ter-update** saat jumlah/kondisi berubah. GAS `updateGStats()` menghitung ulang 5 kartu statistik setiap perubahan. | 🟡 | — |
| 2.12 | **Ada dua implementasi header ruangan** (`room-header.tsx` bergaya shadcn dan blok inline di `room-detail-interactive.tsx` bergaya GAS). Yang shadcn tidak terpakai — sumber "kotak kaku" yang Anda rasakan berasal dari komponen shadcn seperti ini. | 🟡 | `inventaris/room-header.tsx` |

---

## 4. Checklist Harian

Modul ini **paling mendekati** GAS: kalender matriks, navigasi tahun, tab bulan, filter kategori, pencarian, bar "Centang Semua Baik" (tanggal / rentang / seluruh bulan), ringkasan, export CSV, klik-kiri untuk ganti status, klik-kanan untuk detail — semuanya sudah ada.

| # | Temuan | Prioritas | Lokasi |
|---|---|---|---|
| 3.1 | **"Jenis Kerusakan" jadi input bebas.** GAS memakai `<select>` dengan 3 optgroup dan 18 opsi baku (Kerusakan Fisik / Fungsi / Lainnya). Next.js hanya `<Input>` teks bebas → data tidak terstandar, laporan sulit direkap. | 🔴 | `checklist/checklist-form-dialog.tsx:248` |
| 3.2 | **"Tindakan Perbaikan" jadi input bebas.** GAS `<select>` dengan 3 optgroup dan 14 opsi (Pemeliharaan Rutin / Perbaikan / Tindak Lanjut). | 🔴 | `checklist-form-dialog.tsx:256` |
| 3.3 | **Blok Tindakan hanya muncul saat status rr/rb.** Di GAS, grup Tindakan Perbaikan **selalu tampil** (yang disembunyikan saat baik/ta hanyalah grup Kerusakan). | 🟡 | `checklist-form-dialog.tsx:243` |
| 3.4 | **"📜 Riwayat Pemeriksaan" (history log) hilang.** GAS punya `#detLogWrap` / `#detLogList`. | 🟡 | `checklist-form-dialog.tsx` |
| 3.5 | **Footer modal ceklist ruangan kurang tombol.** GAS: `📥 Export CSV` + `Tutup` + `💾 Simpan`. Next.js `ChecklistRoomModal` hanya `Tutup` (export ada di dalam kalender, Simpan tidak ada). | 🟡 | `inventaris/checklist-room-modal.tsx:104` |
| 3.6 | Judul modal berbeda: GAS "Ceklist Harian" + sub "Kondisi barang per hari dalam satu bulan". | 🔵 | `checklist-room-modal.tsx` |

---

## 5. Usulan Sarana Prasarana & Alkes

| # | Temuan | Prioritas | Lokasi |
|---|---|---|---|
| 4.1 | **Tombol "＋ Tambah Usulan Baru" hilang** dari seksi usulan di halaman ruangan. GAS `addUsulan()` menambah baris kosong + fokus otomatis ke input nama. | 🔴 | `inventaris/room-usulan-section.tsx` |
| 4.2 | **Tombol hapus tidak berfungsi** — tombol `✕` dirender tanpa `onClick`. | 🔴 | `room-usulan-section.tsx:649` |
| 4.3 | **Seluruh baris read-only.** GAS bisa mengedit langsung: Nama (input), Kategori (select), Jumlah (number), Satuan (input), Prioritas (select), Status (select), Alasan (textarea), Keterangan (input) — semuanya auto-save via `updateUsulanField`. | 🔴 | `room-usulan-section.tsx:508-670` |
| 4.4 | **Kartu ringkasan 5 angka hilang.** GAS menampilkan strip `usum-card`: Total Usulan / Mendesak / Penting / Rencana / Disetujui di dalam body usulan. | 🟡 | `room-usulan-section.tsx` |
| 4.5 | **Status usulan tidak lengkap.** GAS punya 5 status: diajukan, disetujui, ditolak, proses (🔄 Diproses), selesai (🎉 Selesai). Perlu dicek apakah Next.js menyediakan semuanya di UI. | 🟡 | `lib/usulan-types.ts` |
| 4.6 | Empty-state berbeda: GAS "Belum ada usulan untuk ruangan ini." + petunjuk; Next.js "Tidak ada usulan dengan filter ini." | 🔵 | `room-usulan-section.tsx:684` |
| 4.7 | **Statistik global "Usulan Aktif"** di GAS menghitung usulan yang statusnya **bukan** selesai/ditolak (`updateGlobalUsulanStat`). Next.js memakai `usulan.length` mentah. | 🟡 | `app/(dashboard)/page.tsx:30` |

---

## 6. Utilitas (Ambulance, Genset, IPAL)

Modul ini juga sudah **sangat mendekati** GAS: header, unit-bar, kartu Ceklist Pemeliharaan Bulanan (navigasi tahun, tab bulan, bar centang semua, ringkasan, catatan bulanan), dan kartu Jadwal Pemeliharaan Tahunan + modal Edit Jadwal.

| # | Temuan | Prioritas | Lokasi |
|---|---|---|---|
| 5.1 | **Tombol "✏️ Edit Nama" hilang** dari header utilitas. Di GAS tombol ini menempel di samping judul "Pemeliharaan {label}" dan memanggil `utilRenameCurrent()`. | 🟡 | `app/(dashboard)/utilitas/[utilId]/page.tsx:59-61` |
| 5.2 | **Form "Tambah Utilitas" jauh berbeda.** GAS: modal dengan **grid emoji picker** + preview langsung + satu field Nama. Next.js: halaman penuh dengan field teknis `util_id`, `label`, `icon`, `warna` (hex), `bg` (hex). | 🔴 | `app/(dashboard)/utilitas/new/page.tsx`, `utilitas/utilitas-form.tsx` |
| 5.3 | Label statistik berbeda: GAS "Sudah Dikerjakan **Bulan Ini**" → Next.js "Sudah Dikerjakan". | 🔵 | `utilitas/[utilId]/page.tsx:80` |
| 5.4 | GAS juga mendukung **penanggung jawab untuk utilitas** (`pjStartEdit(id,'util')`). Perlu dicek apakah dipakai di panel utilitas GAS versi terpasang. | 🔵 | — |

---

## 7. SBBK (Surat Bukti Barang Keluar)

Halaman daftar sudah baik: 3 statistik, chip filter (Semua/Puskesmas/Posyandu/BLUD/APBD), pencarian, export CSV, dan kartu Rekap.

| # | Temuan | Prioritas | Lokasi |
|---|---|---|---|
| 6.1 | **Entri SBBK jadi halaman, bukan modal** (Pola A). | 🟡 | `app/(dashboard)/sbbk/new/page.tsx` |
| 6.2 | **Kolom "Keterangan" per barang hilang.** GAS `sbbkAddItemRow` punya input `Ket.` di tiap baris barang. | 🔴 | `sbbk/sbbk-form.tsx` |
| 6.3 | **Layout daftar barang berbeda total.** GAS memakai **tabel padat 9 kolom** (No, Nama, Merk/Tipe, Banyaknya, Satuan, Harga Satuan, Jumlah, Keterangan, hapus). Next.js memakai kartu bertumpuk dengan `<Label>` di atas tiap field — memakan ruang jauh lebih besar dan terasa "kaku". | 🟡 | `sbbk/sbbk-form.tsx:240-315` |
| 6.4 | **Total nilai tidak di footer modal.** GAS menampilkan "Total Nilai: Rp X" di footer modal yang selalu terlihat saat mengisi. Next.js menaruh "Grand Total" di akhir kartu. | 🔵 | `sbbk-form.tsx:320` |
| 6.5 | **Preview cetak jadi rute terpisah.** GAS membuka modal preview dokumen dengan tombol "🖨️ Cetak Sekarang" + "✕ Tutup". | 🟡 | `app/sbbk/[id]/print/page.tsx` |
| 6.6 | Opsi Sumber Anggaran GAS: BLUD TH 2025 / APBD 2025 / DAK 2025 / Lainnya — perlu dipastikan sama (dan tahunnya kini 2026). | 🔵 | `sbbk-form.tsx:183` |

---

## 8. Pakta Integritas

| # | Temuan | Prioritas | Lokasi |
|---|---|---|---|
| 7.1 | **Entri Pakta jadi halaman, bukan modal** (Pola A). | 🟡 | `app/(dashboard)/pakta/new/page.tsx` |
| 7.2 | **Lampiran aset digabung ke dalam form utama.** Di GAS, Pakta (Hari, Tanggal, Jabatan, Nama, NIP, Alamat) diisi lewat modal; **Lampiran Aset** adalah panel terpisah (`openLampiranPanel`) yang muncul di bawah daftar pakta, punya tombol "💾 Simpan Lampiran" dan "✕ Tutup" sendiri, dengan 3 seksi (🚗 Kendaraan Dinas, 💻 Laptop/PC, 📱 Alat Penunjang) masing-masing dengan "＋ Tambah Baris". | 🟡 | `pakta/pakta-form.tsx` |
| 7.3 | **Modal cetak 3-tombol hilang.** GAS: "🖨️ Cetak Pakta", "📋 Cetak Lampiran", "🖨️ Cetak Semua (2 Lembar)" + preview 2 lembar berlabel "Lembar 1 — Pakta Integritas" dan "Lembar 2 — Lampiran Daftar Aset". Next.js hanya satu rute cetak. | 🔴 | `app/pakta/[id]/print/page.tsx` |
| 7.4 | Field "Hari" di GAS adalah input teks bebas; Next.js memakai `Select`. Perbaikan yang wajar, tapi berbeda. | 🔵 | `pakta-form.tsx:169` |

---

## 9. Rekap Inventaris (Pemegang)

Modul ini sudah **paritas baik**: statistik (Pemegang / Item / Pakta Ada / Belum), pencarian nama & jabatan, chip filter (Semua / PNS / PPPK / ✅ Sudah Pakta / ⚠ Belum Pakta), tombol "📜 Buat Pakta Semua Belum", dan baris yang bisa dibuka detailnya.

| # | Temuan | Prioritas | Lokasi |
|---|---|---|---|
| 8.1 | **Judul & tahun.** GAS: "Rekap Pemegang Inventaris 2025" + sub "Puskesmas Baruharjo · Peralatan Mesin & Rumah Dinas". Perlu disamakan (dan tahunnya perlu jadi 2026). | 🔵 | `app/(dashboard)/rekap/page.tsx` |
| 8.2 | **Kategori aset "🏠 Rumah Dinas".** GAS menghitung 4 kategori: kendaraan, laptop, alat, **rumah**. Pastikan Next.js juga menampilkan badge 🏠. | 🟡 | `rekap/rekap-table.tsx` |
| 8.3 | **`mockHasPakta()` selalu mengembalikan `false`** sehingga filter "Sudah Pakta" tidak pernah menghasilkan baris dan statistik "Pakta Ada" selalu 0. Di GAS, `riHasPakta()` mencocokkan nama dengan `paktaData`. | 🟡 | `app/(dashboard)/rekap/page.tsx:61` |

---

## 10. Laporan Monitoring

Gap terbesar kedua setelah tabel inline.

| # | Temuan | Prioritas | Lokasi |
|---|---|---|---|
| 9.1 | **Dokumen laporan formal belum dibuat.** GAS `buildLaporanDoc()` menghasilkan dokumen siap cetak: kop, tabel 7 kolom (No, Sarana Prasarana, Masalah, Penyebab, Tindak Lanjut, Evaluasi, Keterangan), padding baris kosong minimal 8, dan blok tanda tangan. Next.js hanya menampilkan ringkasan + rekap per ruangan, dan kodenya sendiri mencatat: *"Dokumen formal (kop surat + …)"* belum ada. | 🔴 | `laporan/laporan-modal.tsx:375` |
| 9.2 | **Mode "✏️ Isi Manual" tidak berfungsi.** GAS menyediakan baris yang bisa diketik langsung, tombol "＋ Tambah Baris", auto-save ke `lpState.manualRows` per bulan, dan tombol hapus baris. Next.js hanya punya opsi filter bernama "manual" tanpa kemampuan mengisi. | 🔴 | `laporan-modal.tsx:56` |
| 9.3 | **Agregasi data belum lengkap.** GAS menarik dari 3 sumber: `collectCeklistForMonth()` (uraian kerusakan, jenis kerusakan, tindakan, petugas, no. laporan), `collectInventarisKondisi()` (kondisi rr/rb/ta per ruangan), dan `collectGabungan()`. | 🔴 | `laporan-modal.tsx` |
| 9.4 | **Blok tanda tangan hilang.** GAS punya seksi TTD (Mengetahui: Kepala Puskesmas — Pengurus Barang Pembantu) dengan tanggal terformat dan form isian nama/NIP yang tidak ikut tercetak. | 🔴 | `laporan-modal.tsx` |

---

## 11. Riwayat Pindah & Pemindahan Barang

| # | Temuan | Prioritas | Lokasi |
|---|---|---|---|
| 10.1 | **"Pindah Item" massal kehilangan pemilihan item.** GAS `openMvAllModal` menampilkan **daftar checkbox seluruh item** di ruangan + checkbox "Pilih Semua" + pencarian + filter kategori, jadi bisa memindah **sebagian**. Next.js hanya menyediakan dropdown ruangan tujuan lalu memindahkan **semua** item tanpa pilihan. | 🔴 | `room-detail-interactive.tsx:646-700` |
| 10.2 | **Tombol hapus riwayat.** GAS `mvLogClear()` dengan konfirmasi. Perlu dipastikan ada di modal riwayat Next.js. | 🟡 | `riwayat/riwayat-modal.tsx` |
| 10.3 | Pindah item tunggal sudah paritas baik (pencarian ruangan + filter kategori tujuan sudah ada). | ✅ | `inventaris/move-item-modal.tsx` |

---

## 12. Autentikasi & Admin

| # | Temuan | Prioritas | Lokasi |
|---|---|---|---|
| 11.1 | **Petunjuk akun tidak lengkap.** GAS menampilkan 3 akun: Admin (`sidira`/`sidira2026`), Kepala Puskesmas (`kapus`/`kapus2026`), Pengurus Barang (`pengurus`/`barang2026`). Next.js hanya menyebut akun admin. | 🟡 | `app/login/page.tsx:341` |
| 11.2 | **Tombol lihat password (👁) hilang.** GAS punya `togglePwVis()`. | 🔵 | `app/login/page.tsx` |
| 11.3 | **Peran berbeda.** GAS frontend memakai `admin` / `kapus` / `pengurus` dan menampilkan **jabatan** di user bar. Dokumentasi backend menyebut `admin` / `editor` / `viewer`. Perlu satu keputusan peran untuk Next.js. | 🟡 | — |
| 11.4 | **`/admin/users/*` adalah fitur baru** — GAS tidak punya UI manajemen user sama sekali (hanya endpoint backend). Bukan gap, tapi perlu Anda konfirmasi apakah memang diinginkan. | ℹ️ | `app/(dashboard)/admin/users/` |
| 11.5 | Footer login GAS: "SIDIRA v2.0 · Puskesmas Baruharjo · Trenggalek · 2026". | 🔵 | `app/login/page.tsx` |

---

## 13. Halaman Next.js yang tidak ada di GAS

Bukan gap, tapi perlu keputusan: apakah dipertahankan, atau dihapus supaya alurnya sama persis dengan GAS.

| Rute | Catatan |
|---|---|
| `/` (dashboard) | GAS langsung membuka ruangan pertama, tidak ada dashboard |
| `/inventaris` | GAS tidak punya halaman daftar ruangan (hanya sidebar) |
| `/checklist` | GAS hanya punya ceklist per-ruangan lewat modal |
| `/laporan`, `/riwayat` | Sudah tersedia sebagai modal; halaman ini duplikat & tidak tertaut dari sidebar |
| `/usulan/*` | GAS hanya punya usulan inline per ruangan |
| `/admin/users/*` | Lihat 11.4 |
| `/inventaris/[id]/items/*` | GAS memakai baris inline |

---

## 14. Urutan Perbaikan yang Disarankan

**Tahap 1 — kembalikan fungsi yang hilang (🔴)**
1. Tabel inventaris: kolom Tahun + seluruh sel jadi editable + `addRow` inline (2.1, 2.2, 2.3)
2. Usulan: tombol tambah, tombol hapus berfungsi, baris editable, kartu ringkasan (4.1–4.4)
3. Laporan: dokumen formal + mode manual + agregasi 3 sumber + TTD (9.1–9.4)
4. Pindah massal: pemilihan item dengan checkbox (10.1)
5. Ceklist: `<select>` baku untuk Jenis Kerusakan & Tindakan (3.1, 3.2)
6. Header: blok statistik + search bar inline + perbaikan chip akronim (1.1, 1.2, 1.7)
7. Aksi ruangan yang masih mock: Edit Nama, Hapus, PJ (2.7)

**Tahap 2 — kembalikan pola modal (🟡, Pola A)**
8. Tambah Ruangan & Tambah Utilitas → modal dengan emoji picker + preview
9. Entri SBBK & Pakta → modal
10. Preview cetak SBBK & Pakta → modal (Pakta dengan 3 tombol cetak)

**Tahap 3 — penyelarasan detail (🟡/🔵)**
11. Legend + gstats di halaman ruangan (1.10)
12. Satukan warna/label kategori, buang `page-elements.tsx` yang tidak konsisten (1.11)
13. Label, ikon, dan teks (1.8, 1.12, 2.9, 2.10, 5.3, dst.)
14. Keputusan soal halaman ekstra (bagian 13)

---

## Catatan tentang "komponen terasa mengotak kaku"

Dugaan Anda benar sebagian. Ada **dua sistem komponen** yang hidup berdampingan di `web/components`:

- `components/gas/*` — port setia dari GAS (radius 10–18px, gradien, warna `--teal`)
- `components/ui/*` + `components/shared/page-elements.tsx` — shadcn dengan `rounded-none` dan `ring-1`, yang membuat tampilan bersudut tajam

Halaman yang memakai `components/gas/*` (ruangan, utilitas, ceklist) sudah terasa mirip GAS. Halaman yang memakai shadcn (SBBK form, Pakta form, admin, room-header yang tak terpakai) terasa kaku. Jadi ini bukan soal tema shadcn yang dipilih saat init, melainkan **komponen mana yang dipakai di tiap halaman**. Perbaikan paling efektif: pindahkan form SBBK & Pakta ke `components/gas/*` dan hapus komponen shadcn yang sudah tidak terpakai.
