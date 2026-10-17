# Pengelolaan zona dan tanaman Vigor

15 Oktober 2026. Perluasan frontend yang sama; data tetap lokal di browser.

## Alur presentasi

1. Pilih greenhouse, lalu buka **Greenhouse → Zona & tanaman**. Pilih zona pada register. Dari denah, **Kelola zona & tanaman** membuka detail yang sama.
2. **Edit zona** menyimpan nama, luas, kapasitas tanaman, jumlah bed/meja, metode tanam, dan catatan. Total alokasi tidak boleh melebihi luas tanam greenhouse; kapasitas tidak boleh di bawah populasi aktif. Untuk menambah zona pada lokasi yang seluruh luasnya sudah dialokasikan, kurangi alokasi zona lain atau tambah luas tanam pada profil greenhouse.
3. **Catat batch tanam** untuk zona kosong, atau **Edit tanaman** untuk batch aktif: komoditas, varietas, tanggal tanam, target panen, fase, asal benih, catatan. Tanggal mengikuti clock demo. Satu batch aktif per zona; beberapa komoditas dapat aktif pada zona berbeda.
4. **Catat perubahan populasi** mencatat tambah/sulam, tanaman mati/gagal, atau pencabutan beserta alasan dan petugas. Jumlah akhir dibatasi kapasitas dan tidak dapat negatif. Panen tidak otomatis mengurangi tanaman hidup; populasi tanaman dan kilogram stok hasil adalah dua catatan berbeda.
5. Tab **Perangkat** mengatur inventaris yang ditempatkan, menambahkan perangkat dengan zona terisi, dan membuka validasi/detail aset. Kamera/sensor satu zona; aktuator dapat melayani beberapa zona. Pemindahan membatalkan validasi pemasangan. Perangkat yang terikat rutinitas atau proses aktif/rekonsiliasi harus dilepas dari konfigurasi terkait dahulu.
6. **Jadwalkan perawatan** dan **Catat panen** membuka form dengan zona dan batch yang benar. **Pekerjaan & riwayat** memberi akses ke pekerjaan, review hama, rutinitas zona, populasi dan riwayat batch. **Buat rutinitas zona** memulai draft pemeriksaan preventif pada zona terpilih; tidak menyalin aktuator zona lain diam-diam.
7. Panen menyimpan ID batch, komoditas dan varietas. Lanjutkan review lot, selesaikan kasus hama bila ada, jual sesuai stok, catat penerimaan, lalu review biaya/laba. Catatan perawatan, lot dan penjualan sebelumnya tetap terhubung ketika zona ditanami ulang.
8. Akhiri batch setelah populasi 0, pekerjaan/kasus selesai, rutinitas dijeda dan proses tuntas. Simpan alasan penutupan. Zona dapat ditanami batch baru atau dinonaktifkan. Hanya zona kosong tanpa referensi dapat dihapus; minimal satu zona tetap ada. Batch aktif juga memblokir penutupan siklus keuangan.

## Integritas dan akses

- Data lama mendapat batch awal dari jumlah tanaman dan komoditas yang sudah tersimpan. Varietas, asal benih, target panen dan hasil panen tidak dibuat-buat. Migrasi dilakukan saat mutasi pertama; melihat halaman tidak menambahkan aktivitas.
- Zona mendukung 1–32 entri dengan ID monotonik. Denah 2D dan geometri 3D mengikuti jumlah zona; bentuk bangunan tetap skematik. Profil luas greenhouse tidak membagi ulang zona secara otomatis.
- Owner/Manager mengatur zona dan detail batch. Operator mencatat populasi, perawatan dan panen. Viewer hanya melihat. Ini role demo, bukan otorisasi server.
- Populasi baru tersimpan pada batch, zona dan ringkasan greenhouse dalam satu transisi. Mutasi gagal tidak menyimpan sebagian perubahan; submit berulang memakai kunci idempoten.
- Ledger dan alokasi historis tidak berubah saat perangkat pindah. Catatan pengeluaran lama dengan pasangan perangkat/zona asal masih dapat dikoreksi; pengeluaran baru harus sesuai penempatan saat ini.
- Komoditas/varietas terkunci setelah batch memiliki lot panen. Tanggal tanam tidak boleh melewati catatan populasi, perawatan atau panen terkait. Penutupan batch mempertahankan seluruh stok, transaksi dan biaya.
- UI, form, tipe data dan aturan mutasi dipisahkan ke modul tersendiri. Tidak ada dependency atau backend baru.

## Batas yang tetap berlaku

- Satu siklus keuangan per greenhouse; arsip/membuat siklus keuangan berikutnya belum tersedia. Batch berurutan dapat dicatat dalam siklus aktif yang sama. Laba dan rekonsiliasi biaya dihitung untuk seluruh siklus greenhouse, bukan otomatis per batch/komoditas. Filter zona hanya memfilter catatan, bukan membagi biaya bersama secara asumsi.
- Target dan fase adalah input pengguna, bukan rekomendasi agronomi atau prediksi model. Gambar tanaman 2D/3D adalah ilustrasi, bukan pemodelan varietas, jumlah rumpun, ukuran bed atau geometri bangunan yang presisi.
- Penambahan kamera/sensor tidak menghasilkan telemetry. Greenhouse buatan pengguna tetap tanpa feed sensor; seluruh monitoring, jadwal dan kontrol adalah demo browser. Simulasi irigasi/fertigasi dengan hardware lengkap tetap tersedia pada dua lokasi demo awal. Editor hardware aktuator/profil nutrisi baru belum ditambahkan.
- Tidak ada koneksi perangkat, inference YOLO, scheduler server, pembayaran, maupun tindakan fisik otomatis.

## Verifikasi

193 Vitest lulus, termasuk 15 tes aturan zona/batch dan 7 regresi DOM tambahan. Alur form baru diuji pada cabang 390, 768, 1280 dan 1440 px: pengaturan zona, tambah zona G, batch varietas, kehilangan populasi, perawatan, panen, penempatan perangkat, riwayat, biaya dan tujuh zona pada denah. Tes lain memeriksa replanting, identitas lot, idempotensi, migrasi/reload, area/kapasitas, role, penutupan batch/siklus, relokasi perangkat dan ledger. 55 tes Node domain tetap lulus.

DOM/jsdom tidak mengukur posisi, overflow atau gambar sebenarnya. Lingkungan Sites ini tidak menyediakan browser control yang disyaratkan; review visual/screenshot empat lebar dan GPU/WebGL belum dilakukan. CSS memakai register dua kolom pada desktop, register bergulir lokal pada tablet/mobile, serta tombol/form yang membungkus. Fallback 2D tetap dapat digunakan. TypeScript, lint, format dan build produksi diverifikasi pada source aplikasi, bukan portable preview lama.
