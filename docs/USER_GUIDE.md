# Panduan Pengguna SIDIRA v4

## Daftar Isi
- [Pendahuluan](#pendahuluan)
- [Login dan Logout](#login-dan-logout)
- [Dashboard](#dashboard)
- [Manajemen Inventaris](#manajemen-inventaris)
- [Checklist Harian](#checklist-harian)
- [SBBK (Surat Bukti Barang Keluar)](#sbbk-surat-bukti-barang-keluar)
- [Pakta Integritas](#pakta-integritas)
- [Utilitas](#utilitas)
- [Usulan Pengadaan](#usulan-pengadaan)
- [Laporan dan Riwayat](#laporan-dan-riwayat)
- [FAQ](#faq)

---

## Pendahuluan

SIDIRA (Sistem Digital Inventaris Ruangan) adalah aplikasi web untuk mengelola inventaris aset Puskesmas Baruharjo. Aplikasi ini memungkinkan Anda untuk:

- Mengelola data barang inventaris per ruangan
- Melakukan checklist kondisi barang harian
- Mencatat pengeluaran barang (SBBK)
- Mengelola pakta integritas
- Mengusulkan pengadaan barang baru
- Melihat laporan dan riwayat perubahan

### Role Pengguna

SIDIRA memiliki 3 jenis pengguna:

1. **Admin** - Akses penuh ke semua fitur termasuk manajemen user
2. **Editor** - Bisa menambah, mengubah, dan menghapus data inventaris
3. **Viewer** - Hanya bisa melihat data (read-only)

---

## Login dan Logout

### Cara Login

1. Buka aplikasi SIDIRA di browser
2. Masukkan username dan password
3. Klik tombol "Masuk"

### Default Credentials

- **Admin**: username `sidira`, password `sidira2026`
- **Editor**: username `pengurus`, password `barang2026`
- **Viewer**: username `kapus`, password `kapus2026`

**PENTING**: Segera ganti password setelah login pertama kali!

### Cara Logout

1. Klik avatar/profile di pojok kanan atas
2. Pilih "Logout"

---

## Dashboard

Dashboard menampilkan ringkasan data inventaris:

- **Total Ruangan**: Jumlah ruangan yang terdaftar
- **Total Barang**: Jumlah seluruh barang inventaris
- **Barang Bermasalah**: Barang dengan kondisi rusak (ringan/berat/tidak ada)
- **Usulan Pending**: Jumlah usulan pengadaan yang belum diproses

---

## Manajemen Inventaris

### Melihat Daftar Ruangan

1. Klik menu "Inventaris" di sidebar
2. Anda akan melihat daftar semua ruangan dalam bentuk card

### Menambah Ruangan Baru

1. Klik tombol "Tambah Ruangan" di halaman Inventaris
2. Isi form:
   - **Nama Ruangan** (wajib): Contoh: "Ruang Periksa 1"
   - **Deskripsi** (opsional): Keterangan tambahan
   - **Icon**: Pilih emoji untuk identifikasi visual
3. Klik "Simpan"

### Mengedit Ruangan

1. Buka halaman detail ruangan (klik card ruangan)
2. Klik tombol "Edit Ruangan"
3. Ubah informasi yang diperlukan
4. Klik "Update"

### Menghapus Ruangan

**PERHATIAN**: Menghapus ruangan akan menghapus SEMUA barang di dalamnya!

1. Buka halaman detail ruangan
2. Klik tombol "Hapus Ruangan"
3. Konfirmasi penghapusan

### Melihat Barang per Ruangan

1. Klik card ruangan untuk melihat daftar barang
2. Barang ditampilkan dalam tabel dengan kolom:
   - Nama Barang
   - Kategori (Alkes/Meubelair/Elektronik/Lainnya)
   - Merk/Model
   - Jumlah
   - Kondisi (Baik/Rusak Ringan/Rusak Berat/Tidak Ada)
   - Tanggal Perolehan
   - Harga Perolehan

### Menambah Barang Baru

1. Di halaman detail ruangan, klik "Tambah Barang"
2. Isi form:
   - **Nama Barang** (wajib): Contoh: "Stetoskop Digital"
   - **Kategori** (wajib): Pilih dari dropdown
   - **Merk**: Merk barang (opsional)
   - **Model/Tipe**: Tipe barang (opsional)
   - **Tahun**: Tahun pembuatan (opsional)
   - **Jumlah** (wajib): Minimal 1
   - **Satuan** (wajib): Contoh: "unit", "buah", "set"
   - **Kondisi** (wajib): Baik/Rusak Ringan/Rusak Berat/Tidak Ada
   - **Urutan di Ruangan**: Nomor urut (opsional)
   - **Catatan**: Keterangan tambahan (opsional)
3. Klik "Simpan"

### Mengedit Barang

1. Di tabel barang, klik tombol edit (icon pensil)
2. Ubah informasi yang diperlukan
3. Klik "Update"

### Menghapus Barang

1. Di tabel barang, klik tombol hapus (icon tempat sampah)
2. Konfirmasi penghapusan

---

## Checklist Harian

Checklist harian digunakan untuk memantau kondisi barang setiap hari.

### Membuka Checklist

1. Klik menu "Checklist" di sidebar
2. Pilih ruangan dari dropdown
3. Anda akan melihat kalender bulan berjalan

### Menggunakan Kalender

- **Navigasi bulan**: Gunakan tombol panah untuk berpindah bulan
- **Warna status**:
  - 🟢 Hijau = Baik
  - 🟡 Kuning = Rusak Ringan
  - 🔴 Merah = Rusak Berat
  - ⚫ Abu-abu = Tidak Ada

### Melakukan Checklist

1. Klik pada tanggal di kalender
2. Form checklist akan muncul
3. Pilih kondisi barang dari 4 opsi
4. Tambahkan catatan jika diperlukan
5. Klik "Simpan"

### Mengedit Checklist

1. Klik pada entry yang sudah ada di kalender
2. Ubah kondisi atau catatan
3. Klik "Update"

### Menghapus Checklist

1. Klik pada entry yang ingin dihapus
2. Klik tombol "Hapus"
3. Konfirmasi penghapusan

---

## SBBK (Surat Bukti Barang Keluar)

SBBK digunakan untuk mencatat pengeluaran barang dari inventaris.

### Melihat Daftar SBBK

1. Klik menu "SBBK" di sidebar
2. Anda akan melihat daftar semua SBBK dengan informasi:
   - Nomor SBBK
   - Tanggal
   - Nama Penerima
   - Unit Penerima

### Membuat SBBK Baru

1. Klik tombol "Buat SBBK Baru"
2. Isi informasi SBBK:
   - **Nomor SBBK** (wajib): Format "SBBK/2026/06/0001"
   - **Tanggal** (wajib): Tanggal pengeluaran
   - **Nama Penerima** (wajib): Nama lengkap penerima
   - **Jabatan**: Jabatan penerima (opsional)
   - **Unit**: Unit/instansi penerima (opsional)
   - **Catatan**: Keterangan tambahan (opsional)
3. Tambah barang yang dikeluarkan:
   - Pilih ruangan
   - Pilih barang dari dropdown
   - Isi jumlah dan satuan
   - Tambahkan catatan jika perlu
4. Klik "Simpan"

### Melihat Detail SBBK

1. Klik SBBK dari daftar
2. Anda akan melihat informasi lengkap termasuk daftar barang yang dikeluarkan

### Mengedit SBBK

1. Di halaman detail SBBK, klik "Edit"
2. Ubah informasi yang diperlukan
3. Klik "Update"

### Menghapus SBBK

1. Di halaman detail SBBK, klik "Hapus"
2. Konfirmasi penghapusan

---

## Pakta Integritas

Pakta integritas adalah dokumen tanggung jawab atas aset.

### Melihat Daftar Pakta

1. Klik menu "Pakta" di sidebar
2. Anda akan melihat daftar semua pakta integritas

### Membuat Pakta Baru

1. Klik "Buat Pakta Baru"
2. Isi informasi:
   - **Nama** (wajib): Nama penanggung jawab
   - **NIP**: NIP pegawai (opsional)
   - **Jabatan**: Jabatan (opsional)
   - **Alamat**: Alamat (opsional)
3. Tambah aset yang ditanggung:
   - Aset Kendaraan (jenis, merk, tahun, nomor polisi)
   - Aset Laptop (merk, model, nomor seri)
   - Aset Alat (nama, merk, model, tahun)
4. Klik "Simpan"

---

## Utilitas

Utilitas mencakup aset khusus seperti Ambulance, Genset, dan IPAL.

### Melihat Utilitas

1. Klik menu "Utilitas" di sidebar
2. Anda akan melihat 3 jenis utilitas:
   - Ambulance
   - Genset
   - IPAL

### Checklist Utilitas

Cara kerja mirip dengan checklist inventaris, tapi untuk utilitas khusus.

### Jadwal Maintenance

Anda bisa menjadwalkan maintenance rutin untuk setiap utilitas.

---

## Usulan Pengadaan

Usulan pengadaan untuk mengusulkan pembelian barang baru.

### Membuat Usulan

1. Klik menu "Usulan" di sidebar
2. Klik "Buat Usulan Baru"
3. Pilih ruangan
4. Isi detail usulan:
   - Nama barang yang diusulkan
   - Kategori
   - Prioritas (Wajib/Penting/Pendukung)
   - Estimasi harga
   - Jumlah
   - Justifikasi/alasan
5. Klik "Simpan"

### Status Usulan

- **Pending**: Belum diproses
- **Approved**: Disetujui
- **Rejected**: Ditolak

---

## Laporan dan Riwayat

### Laporan

1. Klik menu "Laporan" di sidebar
2. Pilih periode laporan
3. Klik "Generate Laporan"
4. Anda bisa export ke PDF atau Excel

### Riwayat Perubahan

1. Klik menu "Riwayat" di sidebar
2. Anda akan melihat log semua perubahan:
   - Siapa yang melakukan
   - Kapan dilakukan
   - Apa yang diubah

---

## FAQ

### Q: Apakah data otomatis tersimpan?
A: Ya, semua perubahan otomatis tersimpan ke database saat Anda klik "Simpan" atau "Update".

### Q: Apakah bisa diakses dari HP?
A: Ya, aplikasi responsive dan bisa diakses dari browser HP.

### Q: Bagaimana jika lupa password?
A: Hubungi administrator untuk reset password.

### Q: Apakah data bisa di-export?
A: Ya, beberapa fitur memiliki tombol export ke CSV/Excel.

### Q: Apakah ada backup data?
A: Ya, Supabase melakukan backup otomatis setiap hari.

### Q: Bagaimana jika error?
A: Screenshot error dan laporkan ke administrator.

---

## Bantuan

Jika Anda mengalami kesulitan atau memiliki pertanyaan, hubungi:

**Administrator**: Admin SIDIRA  
**Email**: sidira@puskesmas.id  
**Versi Aplikasi**: 4.0.0  
**Tanggal Update**: 18 Juni 2026
