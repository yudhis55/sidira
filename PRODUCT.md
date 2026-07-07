# Product

## Register

product

## Users

Staf medis dan administrasi Puskesmas Baruharjo, Trenggalek:
- **Perawat & bidan** yang mengisi checklist harian kondisi barang
- **Pengurus barang** yang mengelola inventaris, membuat SBBK, dan pakta integritas
- **Kepala puskesmas** yang membaca laporan dan memantau kondisi aset
- **Admin IT** yang mengelola user dan konfigurasi sistem

Konteks penggunaan: di tempat kerja (kantor, ruang periksa, ruang rawat inap), menggunakan komputer atau tablet, di bawah pencahayaan fluorescent ruangan klinik. Beberapa staf berusia lanjut dan kurang familiar dengan teknologi. Aplikasi harus intuitif — tidak boleh ada "learning curve" yang terasa berat.

## Product Purpose

SIDIRA (Sistem Digital Inventaris Ruangan Aset) menggantikan pencatatan inventaris manual berbasis spreadsheet untuk Puskesmas Baruharjo.

Job to be done:
- Mencatat kondisi barang di setiap ruangan setiap hari
- Melacak perpindahan aset antar ruangan
- Menghasilkan laporan bulanan untuk kepala puskesmas
- Mengelola dokumen resmi (SBBK, Pakta Integritas)
- Mengajukan pengadaan barang baru (Usulan)

Success = staf bisa cek kondisi barang dalam <30 detik, dan laporan bulanan bisa di-generate tanpa membuka spreadsheet.

## Brand Personality

**Terpercaya, bersih, efisien.**

- **Terpercaya**: Data akurat, tidak pernah hilang, selalu tersinkron. UI tidak "bermain-main" — ini alat kerja serius untuk institusi kesehatan.
- **Bersih**: Informasi yang dibutuhkan langsung terlihat, tanpa noise. Setiap pixel punya alasan.
- **Efisien**: Tugas sehari-hari (cek kondisi, isi checklist) harus bisa diselesaikan dengan minimal klik.

Emotional goal: Staf merasa "pekerjaan jadi lebih mudah" — bukan "aplikasi ini keren".

## Anti-references

- **Terlalu playful**: Tidak boleh warna-warni berlebihan, animasi berlebihan, atau elemen dekoratif yang tidak fungsional. Ini bukan app startup — ini alat kerja institusi kesehatan.
- **Terlalu "startup SaaS"**: Hindari template admin generik, hero metrics yang mencolok, atau layout yang terasa seperti demo.
- **Emoji-only branding**: Emoji digunakan fungsional (sebagai ikon ruangan), bukan sebagai identitas brand.

## Design Principles

1. **Clarity over decoration** — Setiap elemen UI harus menjawab "apa ini?" dalam <2 detik. Tidak ada decorative gradients, ornamental borders, atau animasi yang tidak memberikan informasi.

2. **Speed of common tasks** — Tugas yang dilakukan 10x sehari (cek kondisi, toggle status) harus 1-klik. Tugas yang dilakukan 1x sehari (edit ruangan) bisa 3-klik. Hierarki klik berdasarkan frekuensi.

3. **Data density with breathing room** — Tabel inventaris harus padat informasi (nama, kondisi, harga, tahun) tapi tetap readable. Gunakan visual hierarchy (warna kondisi, spacing, typography weight) untuk membedakan importance.

4. **Forgiving for non-tech users** — Large touch targets, clear labels (bukan hanya ikon), confirmation dialogs untuk destructive actions, error messages yang menjelaskan "apa yang salah" bukan "kode error 404".

5. **Consistent mental model** — Satu ruangan = satu konteks. Saat user masuk ke ruangan tertentu, semua yang terlihat adalah tentang ruangan itu (inventaris, checklist, usulan). Hindari "page yang melakukan terlalu banyak hal".

## Accessibility & Inclusion

- **WCAG AA minimum**: Contrast ratio ≥4.5:1 untuk body text, ≥3:1 untuk large text (≥18px atau bold ≥14px)
- **Keyboard navigation**: Semua fungsi utama harus accessible via keyboard (Tab, Enter, Escape)
- **Reduced motion**: Animasi harus respect `prefers-reduced-motion: reduce`
- **Text sizing**: Support browser zoom hingga 200% tanpa breaking layout
- **Color blindness**: Jangan andalkan warna saja untuk convey status — gunakan icon + label + warna

## Language

Semua UI text dalam **Bahasa Indonesia**. Code comments boleh dalam bahasa Indonesia atau Inggris.
