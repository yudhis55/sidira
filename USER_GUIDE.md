# 📖 Panduan Pengguna SIDIRA v3
## Sistem Digital Inventaris Ruangan Aset
### Puskesmas Baruharjo, Trenggalek

---

## 🚀 Cara Memulai

### 1. Login ke Aplikasi

1. Buka URL aplikasi SIDIRA di browser Anda
2. Masukkan **Username** dan **Password**
3. Klik tombol **"Masuk"**
4. Anda akan diarahkan ke dashboard utama

**Akun Default:**
- **Administrator**: `sidira` / `sidira2026`
- **Kepala Puskesmas**: `kapus` / `kapus2026`
- **Pengurus Barang**: `pengurus` / `barang2026`

---

## 📋 Fitur Utama

### 1. 🏥 Inventaris Ruangan

**Cara Menggunakan:**
1. Klik menu **"Ruangan"** di sidebar kiri
2. Pilih ruangan yang ingin dikelola
3. Lihat daftar inventaris dalam 4 kategori:
   - **Alkes** (Alat Kesehatan)
   - **Meubelair** (Furniture)
   - **Elektronik** (Peralatan Elektronik)
   - **Lainnya** (Aset Lainnya)

**Menambah Item Baru:**
- Klik tombol **"+ Tambah Item"** di bawah kategori
- Isi formulir: Nama, Jumlah, Satuan, Kondisi, dll
- Klik **"Simpan"**

**Mengedit Item:**
- Klik item yang ingin diedit
- Ubah informasi yang diperlukan
- Klik **"Update"**

**Menghapus Item:**
- Klik tombol **"🗑️ Hapus"** di samping item
- Konfirmasi penghapusan

---

### 2. 📅 Checklist Harian

**Apa itu Checklist?**
Checklist adalah pencatatan kondisi inventaris secara harian untuk monitoring dan pemeliharaan.

**Cara Menggunakan:**
1. Buka ruangan yang ingin di-checklist
2. Klik tombol **"📅 Ceklist"** pada item
3. Modal checklist akan terbuka
4. Klik pada tanggal untuk mengubah status:
   - **✔ Baik** (Hijau)
   - **⚠ Rusak Ringan** (Kuning)
   - **✖ Rusak Berat** (Merah)
   - **— Tidak Ada** (Abu-abu)

**Menambahkan Detail Keterangan:**
1. Klik kanan atau klik tombol **"Detail"** pada tanggal
2. Isi informasi tambahan:
   - **Jenis Kerusakan**: Kerusakan yang ditemukan
   - **Uraian Kerusakan**: Penjelasan detail
   - **Jenis Tindakan**: Tindakan yang dilakukan
   - **Uraian Tindakan**: Penjelasan tindakan
   - **Petugas**: Nama petugas yang melakukan pengecekan
   - **No. Laporan**: Nomor laporan (jika ada)
3. Klik **"Simpan"**

**Bulk Operations (Operasi Massal):**

**Set Semua Baik untuk Tanggal Tertentu:**
1. Buka checklist ruangan
2. Klik tab **"Set Semua"**
3. Pilih tanggal dari kalender
4. Klik **"✓ Set Semua Baik"**
5. Semua item pada tanggal tersebut akan di-set "Baik"

**Set Semua Baik untuk Rentang Tanggal:**
1. Klik tab **"Set Semua"**
2. Pilih tanggal mulai dan tanggal akhir
3. Klik **"✓ Set Rentang Baik"**

**Set Semua Baik untuk Seluruh Bulan:**
1. Klik tab **"Set Semua"**
2. Klik tombol **"Set Seluruh Bulan Baik"**
3. Semua hari dalam bulan tersebut akan di-set "Baik"

**💾 Menyimpan Data Checklist:**
- Data **TIDAK** otomatis tersimpan
- Anda **HARUS** klik tombol **"💾 Simpan"** setelah selesai
- Atau tutup modal dengan klik tombol **"X"** atau klik di luar modal
- Data akan tersimpan di localStorage browser dan disinkronkan ke Google Sheets

**⚠️ Penting:**
- Jangan refresh halaman sebelum menyimpan
- Data yang tidak disimpan akan **HILANG**
- Pastikan koneksi internet aktif untuk sinkronisasi ke cloud

---

### 3. 🔧 Utilitas

**Fitur Utilitas mencakup:**
- **Ambulance** (APV dan Kijang)
- **Genset**
- **IPAL** (Instalasi Pengolahan Air Limbah)

**Cara Menggunakan:**
1. Klik menu **"Utilitas"** di sidebar
2. Pilih jenis utilitas
3. Lihat checklist pemeliharaan bulanan
4. Klik pada sel untuk menandai sudah/belum dilakukan
5. Tambahkan catatan jika diperlukan

**Catatan:**
- Data utilitas otomatis tersimpan saat Anda mengklik cell
- Sinkronisasi ke Google Sheets terjadi setiap 2 detik
- Data persisten meskipun browser ditutup

---

### 4. 📊 Laporan

**Cara Generate Laporan:**
1. Klik menu **"Laporan"**
2. Pilih bulan dan tahun
3. Laporan akan otomatis generate dari data checklist
4. Klik **"Cetak"** untuk mencetak atau **"Export PDF"** untuk download

**Isi Laporan:**
- Ringkasan kondisi inventaris per ruangan
- Daftar item yang bermasalah
- Statistik per kategori
- Rekomendasi tindak lanjut

---

### 5. 📋 SBBK (Surat Bukti Barang Keluar)

**Cara Membuat SBBK:**
1. Klik menu **"SBBK"**
2. Klik **"+ Tambah SBBK"**
3. Isi informasi:
   - Nomor SBBK
   - Tanggal
   - Penerima
   - Items yang dikeluarkan
4. Klik **"Simpan"**

---

### 6. 📜 Pakta Integritas

**Cara Menggunakan:**
1. Klik menu **"Pakta"**
2. Klik **"+ Tambah Pakta"**
3. Isi informasi pegawai dan aset yang dipegang
4. Upload dokumen jika diperlukan
5. Klik **"Simpan"**

---

### 7. 💡 Usulan

**Cara Mengajukan Usulan:**
1. Buka ruangan yang memerlukan usulan
2. Scroll ke bagian **"Usulan"**
3. Klik **"+ Tambah Usulan"**
4. Isi:
   - Nama barang yang diusulkan
   - Jumlah
   - Alasan pengajuan
   - Prioritas (Tinggi/Sedang/Rendah)
5. Klik **"Kirim"**

---

## 🔍 Pencarian

**Cara Menggunakan Pencarian Global:**
1. Klik ikon **"🔍"** di header atau tekan **Ctrl+F**
2. Ketik kata kunci (nama item, ruangan, dll)
3. Hasil pencarian akan muncul real-time
4. Klik hasil untuk langsung ke lokasi

---

## 👥 Manajemen User (Admin Only)

**Menambah User Baru:**
1. Login sebagai admin (`sidira/sidira2026`)
2. Klik menu **"Pengaturan"** → **"User Management"**
3. Klik **"+ Tambah User"**
4. Isi:
   - Username
   - Password
   - Nama Lengkap
   - Role (Admin/Editor/Viewer)
5. Klik **"Simpan"**

**Role Permissions:**
- **Admin**: Full access, termasuk manajemen user
- **Editor**: Bisa menambah/edit/hapus data
- **Viewer**: Hanya bisa melihat data

---

## 💾 Backup & Restore

**Cara Backup Data:**
1. Login sebagai admin
2. Klik **"Pengaturan"** → **"Backup"**
3. Klik **"Download Backup"**
4. File JSON akan di-download

**Cara Restore Data:**
1. Login sebagai admin
2. Klik **"Pengaturan"** → **"Restore"**
3. Pilih file backup JSON
4. Klik **"Restore"**
5. ⚠️ **PERINGATAN**: Data saat ini akan di-overwrite!

---

## 🔧 Troubleshooting

### Masalah: Data checklist hilang setelah refresh

**Solusi:**
1. Pastikan Anda selalu klik **"💾 Simpan"** sebelum menutup checklist
2. Cek koneksi internet Anda
3. Jika masalah berlanjut, hubungi admin

### Masalah: Aplikasi lambat

**Solusi:**
1. Clear cache browser (Ctrl+Shift+Delete)
2. Gunakan browser modern (Chrome/Firefox/Edge)
3. Pastikan koneksi internet stabil
4. Jika masih lambat, hubungi admin untuk optimasi database

### Masalah: Tidak bisa login

**Solusi:**
1. Pastikan username dan password benar
2. Cek Caps Lock tidak aktif
3. Jika lupa password, hubungi admin untuk reset
4. Pastikan browser mendukung JavaScript

### Masalah: Data tidak tersinkronisasi ke Google Sheets

**Solusi:**
1. Cek koneksi internet
2. Cek apakah Anda masih login (tidak timeout)
3. Coba refresh halaman dan login ulang
4. Cek quota Google Apps Script (admin)
5. Hubungi admin jika masalah berlanjut

---

## 📱 Tips & Best Practices

### Untuk Pengguna Harian:

1. **Selalu Simpan Checklist**
   - Setelah mengisi checklist, JANGAN lupa klik "💾 Simpan"
   - Buat kebiasaan: klik simpan setiap selesai edit

2. **Gunakan Bulk Operations**
   - Jika semua item dalam kondisi baik, gunakan "Set Semua Baik"
   - Lebih cepat daripada klik satu per satu

3. **Isi Detail Keterangan**
   - Untuk item yang rusak, selalu isi detail keterangan
   - Membantu tracking dan laporan

4. **Check Sebelum Tutup**
   - Sebelum menutup aplikasi, pastikan semua perubahan tersimpan
   - Lihat indikator sync di pojok kanan atas

### Untuk Admin:

1. **Monitor Penggunaan**
   - Cek dashboard monitoring setiap minggu
   - Perhatikan error logs

2. **Backup Rutin**
   - Lakukan backup mingguan
   - Simpan backup di lokasi aman

3. **Review User Access**
   - Review role user setiap bulan
   - Nonaktifkan user yang tidak aktif

4. **Optimasi Database**
   - Jalankan cleanExpiredSessions() setiap bulan
   - Monitor ukuran spreadsheet

---

## 📞 Kontak Support

**Untuk bantuan teknis:**
- Email: [admin email]
- Internal: Hubungi bagian IT Puskesmas

**Untuk saran & masukan:**
- Email: [feedback email]
- Form: [link feedback form]

---

## 📝 Changelog

### Versi 3.1 (2026-06-17)
- ✅ Perbaikan bug: Checklist data sekarang persisten
- ✅ Performance: Batch write untuk operasi besar
- ✅ Fitur: Incremental sync untuk checklist
- ✅ Security: Auto-cleanup session expired
- ✅ UI: Toast notification dengan warna

### Versi 3.0 (2026-06-01)
- Initial release

---

**© 2026 Puskesmas Baruharjo. All rights reserved.**
