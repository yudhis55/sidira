# HANDOFF DOKUMEN - SIDIRA v3 Refactor

**Tanggal:** 2026-06-17
**Status:** Task #1 (Backend) SELESAI, Task #2 (Frontend) BELUM DIMULAI

---

## RINGKASAN PROYEK

Aplikasi SIDIRA v3 (Sistem Digital Inventaris Ruangan Aset) untuk Puskesmas Baruharjo, Trenggalek. Ada laporan bahwa **data checklist gagal disimpan** dan beberapa bug kritikal lainnya.

**User Request:**
- Analisa semua fitur dan fungsi
- Refactor kode dan struktur database spreadsheet
- Perbaiki tanpa mengubah tampilan UI
- Testing dan verifikasi semua fitur

---

## STATUS PEKERJAAN

### ✅ Task #1: Refactor Code.gs (Backend) — SELESAI

**Semua perbaikan backend sudah selesai:**

1. ✅ **Sheet Checklist ditambahkan** (line 35, 279-290)
   - Header: `roomId | kat | itemIndex | dateKey | payload_json | updatedAt`
   - Fungsi `loadChecklist()` (line 1132-1157)
   - Fungsi `saveChecklist()` (line 1159-1191)
   - Fungsi `patchChecklist()` (line 1193-1273)
   - Action dispatcher ditambahkan (line 86-87)

2. ✅ **Sheet Usulan migrasi dari PropertiesService** (line 34, 273-277)
   - Header: `payload_json | updatedAt | updatedBy`
   - Fungsi `loadUsulan()` dengan fallback migrasi (line 1077-1103)
   - Fungsi `saveUsulan()` simpan ke sheet (line 1105-1114)

3. ✅ **Field name mismatch di saveMvLog diperbaiki** (line 226-235, 749-773)
   - Header sekarang: `ts | nama | kat | dari | ke | dariName | keName | user`
   - Save function menggunakan field yang konsisten dengan frontend

4. ✅ **Batch write untuk semua save functions**
   - `saveSbbk()` (line 481-508)
   - `savePakta()` (line 543-570)
   - `saveRooms()` (line 639-700)
   - `savePj()` (line 719-735)
   - `saveMvLog()` (line 749-773)
   - `saveUtilItems()` (line 799-819)
   - `saveUtilMeta()` (line 846-874)
   - `saveUtilState()` (line 902-942)

5. ✅ **getSpreadsheet() lazy init** (line 1371-1388)
   - Hanya panggil `initSheets()` jika ada sheet yang kurang

6. ✅ **Session cleanup ditambahkan** (line 423-438)
   - `cleanExpiredSessions()` dipanggil saat login (line 370)

7. ✅ **loadAll() include checklist** (line 443-458)
   - Response sekarang include `checklist: loadChecklist(ss)`

---

### ❌ Task #2: Fix Frontend Bugs di index.html — BELUM DIMULAI

**Bug yang HARUS diperbaiki (sesuai plan di `.claude/plan.md`):**

#### Bug 2.1: clData (Checklist) tidak pernah disimpan — **PALING KRITIS**

**Lokasi:** Line 20482
```javascript
const clData = {};  // ← hanya di memori, hilang saat refresh
```

**Yang harus dilakukan:**

a) **Buat fungsi save/load:**
```javascript
var CL_DATA_KEY = "sidira_cl_data";

function clSaveToStorage() {
  try {
    localStorage.setItem(CL_DATA_KEY, JSON.stringify(clData));
  } catch (e) {}
  try {
    if (typeof gasSyncKey === "function") gasSyncKey(CL_DATA_KEY);
  } catch (e) {}
}

function clLoadFromStorage() {
  try {
    var raw = localStorage.getItem(CL_DATA_KEY);
    if (raw) {
      var parsed = JSON.parse(raw);
      for (var roomId in parsed) {
        clData[roomId] = parsed[roomId];
      }
    }
  } catch (e) {}
}
```

b) **Panggil `clLoadFromStorage()` saat init** — cari IIFE di line ~24488-24493

c) **Panggil `clSaveToStorage()` setelah setiap modifikasi clData:**
- `clToggleCell()` — line ~20370-20430
- `detSaveEntry()` — line ~20533-20600
- `detClearEntry()` — line ~20610-20650
- `clApplyBaikToDate()` — line ~21350-21370
- `clSetAllDate()`, `clSetAllRange()`, `clSetAllMonth()` — cari fungsi ini

d) **Fix `clSaveAll()`** di line 21340:
```javascript
function clSaveAll() {
  clSaveToStorage();  // ← TAMBAHKAN INI
  var t = document.getElementById("toast");
  t.innerHTML = "💾 Data ceklist berhasil disimpan!";
  t.classList.add("show");
  setTimeout(function () { t.classList.remove("show"); }, 3000);
}
```

e) **Tambahkan ke `GAS_SYNC_KEYS`** di line 29643-29653:
```javascript
sidira_cl_data: "saveChecklist",  // ← TAMBAHKAN INI
```

f) **Handle `res.checklist` di `gasLoadAll()`** — line ~29699:
```javascript
if (res.checklist && typeof res.checklist === "object") {
  for (var rid in res.checklist) {
    clData[rid] = res.checklist[rid];
  }
  clSaveToStorage();
}
```

#### Bug 2.2: showToast() mengabaikan parameter

**Lokasi:** Line 20017
```javascript
function showToast() {  // ← tidak ada parameter
  const t = document.getElementById("toast");
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 3000);
}
```

**Fix:**
```javascript
function showToast(msg, color) {
  var t = document.getElementById("toast");
  if (msg) t.innerHTML = msg;
  if (color) t.style.background = color;
  t.classList.add("show");
  setTimeout(function() { t.classList.remove("show"); }, 3000);
}
```

#### Bug 2.3: utilNotes tidak tersimpan saat diketik

**Lokasi:** Ada di DUA tempat (duplikat), cari `ta.oninput = function` — line ~19293 dan ~22053

**Fix (hanya edit yang di blok kedua, line ~22053):**
```javascript
var utilNotesTimer;
ta.oninput = function () {
  utilNotes[key] = ta.value;
  clearTimeout(utilNotesTimer);
  utilNotesTimer = setTimeout(function() {
    utilSaveStateToStorage();
  }, 1500);
};
```

#### Bug 2.4: Hapus kode duplikat masif

**Lokasi blok duplikat pertama (HAPUS):** Lines ~18851-19450
- `UTILITAS_DATA` pertama (line 18851)
- `utilState`, `utilData`, `utilNotes` pertama (lines 18943-18951)
- `utilEnsureData()` (line 18953)
- `utilBuildPanel()` (line 18995)
- `utilRender()` (line 19087)
- `utilToggleCell()` — **versi tanpa save** (line 19302)
- `utilSetAllDate()`, `utilSetAllRange()`, `utilSetAllMonth()` (line 19343-19450)

**Blok yang DIPERTAHANKAN:** Mulai dari line ~21636
- `UTILITAS_DATA` kedua (line 21636) — versi benar
- `utilToggleCell` kedua (line 22062) — versi dengan `utilSaveStateToStorage()`

**Cara hapus:**
1. Cari awal blok duplikat — `var UTILITAS_DATA = [` yang pertama (line 18851)
2. Cari akhir blok duplikat — kemungkinan di akhir `utilCountDone` atau sebelum section berikutnya
3. Hapus seluruh blok pertama tersebut

**PERINGATAN:** File ini 29,800+ baris. Hati-hati jangan sampai menghapus kode yang bukan duplikat.

#### Bug 2.5: lpState (Laporan) menggunakan sessionStorage

**Lokasi:** Line 23487 dan 23508
```javascript
const saved = sessionStorage.getItem("sidira_lp_state");  // ← GANTI KE localStorage
sessionStorage.setItem("sidira_lp_state", JSON.stringify(lpState));  // ← GANTI KE localStorage
```

---

### ⏸️ Task #3: Pengujian dan Verifikasi — BLOCKED

Diblokir oleh Task #2. Setelah semua fix diterapkan, verifikasi:

1. **Checklist**: Buka ruangan → klik "📅 Ceklist" → toggle beberapa sel → refresh → data harus tetap ada
2. **Utilitas**: Buka tab Utilitas → toggle cell → refresh → data harus tetap ada
3. **Utilitas Notes**: Ketik catatan di textarea → refresh → catatan harus tetap ada
4. **SBBK/Pakta/Ruangan/Usulan**: Tambah/edit → refresh → data harus tetap ada
5. **Toast**: Cek apakah toast menampilkan pesan dan warna yang benar
6. **GAS Sync**: Deploy ke GAS → login → buat perubahan → cek spreadsheet → data harus tersinkron

---

## FILE-FILE PENTING

| File | Status | Baris | Deskripsi |
|------|--------|-------|-----------|
| `Code.gs` | ✅ Selesai | 1,444 | Backend GAS — semua fix sudah diterapkan |
| `index.html` | ❌ Belum dimulai | ~29,803 | Frontend SPA — masih ada 5 bug kritikal |
| `appscript.json` | Tidak perlu diubah | 11 | GAS manifest |
| `CLAUDE.md` | ✅ Sudah dibuat | ~70 | Dokumentasi untuk AI |
| `.claude/plan.md` | ✅ Rencana lengkap | ~160 | Plan detail untuk semua perbaikan |
| `HANDOFF.md` | ✅ Dokumen ini | - | Handoff untuk AI baru |

---

## URUTAN PENGERJAAN YANG DISARANKAN

**Mulai dari Task #2 (Frontend):**

1. **Fix clData persistence (Bug 2.1)** — ~30 menit
   - Paling kritis karena ini bug utama yang dilaporkan user
   - Tambah fungsi save/load, panggil di semua tempat yang modifikasi clData
   - Tambah ke GAS_SYNC_KEYS dan handle di gasLoadAll()

2. **Fix showToast() (Bug 2.2)** — ~5 menit
   - Tambah parameter msg dan color

3. **Fix utilNotes save (Bug 2.3)** — ~10 menit
   - Tambah debounce di oninput handler

4. **Hapus kode duplikat (Bug 2.4)** — ~20 menit
   - Hati-hati, file sangat besar
   - Hapus blok pertama (line ~18851-19450), pertahankan blok kedua

5. **Fix lpState storage (Bug 2.5)** — ~5 menit
   - Ganti sessionStorage → localStorage

6. **Testing & verifikasi (Task #3)** — ~30 menit
   - Test semua fitur di browser lokal (localStorage mode)
   - Deploy ke GAS dan test sync ke spreadsheet

---

## CATATAN PENTING

- **JANGAN ubah tampilan UI** — user secara eksplisit minta UI tidak berubah
- Frontend menggunakan `var` (legacy style), bukan `let/const` (kecuali beberapa bagian baru)
- `clData` adalah `const` — tidak bisa di-reassign, harus merge property
- File `index.html` sangat besar (29,803 baris) — gunakan search (Grep/Glob) untuk navigasi
- Section comment markers: `// ══════` atau `// ──` untuk menandai bagian besar
- GAS mode terdeteksi via `IS_GAS = typeof google !== "undefined" && google.script`
- `google.script.run` punya batas payload 256KB — ini sebabnya ada `patchUtilState` dan `patchChecklist` untuk incremental sync

---

## CARA DEPLOY KE GAS

1. Buka https://script.google.com
2. Buat project baru atau buka project existing
3. Copy isi `Code.gs` ke file Code.gs di GAS editor
4. Copy isi `index.html` ke file index.html di GAS editor
5. Copy isi `appscript.json` ke file appscript.json di GAS editor
6. Jalankan fungsi `setup()` (jika pertama kali) — akan membuat spreadsheet
7. Deploy sebagai Web App (Deploy → New deployment → Web app)
8. Test di browser

---

## KONTAK & PERTANYAAN

Jika ada pertanyaan tentang proyek ini, hubungi:
- **User:** (tidak disebutkan dalam percakapan)
- **AI sebelumnya:** Claude Opus 4.8 (session ini)

---

**Good luck dengan melanjutkan pekerjaan ini! 🚀**
