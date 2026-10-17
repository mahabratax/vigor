# Greenhouse CRUD dan popup akun

15 Oktober 2026. Perluasan aplikasi Vigor yang sama, frontend-only.

## Alur review

1. Gunakan akun Owner. Buka Greenhouse → Daftar greenhouse, atau selector di header → Kelola greenhouse.
2. Tambah nama, lokasi, luas total/tanam, komoditas, tanggal awal siklus, dan jumlah tanaman (0 untuk persiapan). Greenhouse baru langsung terpilih.
3. Edit nama/lokasi/luas. Nama berubah di header, selector dan Role & permission. ID dan hubungan perangkat–pengeluaran tetap sama.
4. Buka greenhouse untuk monitoring 2D/3D. Greenhouse baru menampilkan langkah setup; enam zona A–F dimulai tanpa perangkat dan pembacaan.
5. Hapus melalui ikon tempat sampah. Periksa jumlah record dan dampak akses, lalu ketik nama persis. Batal tidak mengubah data. Greenhouse terakhir dan greenhouse dengan clock berjalan/run aktif/rekonsiliasi/lock tidak dapat dihapus.
6. Klik avatar di bawah sidebar untuk My profile, Settings, Light/Dark, Panduan Vigor, atau Logout. Collapse tetap di kiri breadcrumb. Escape menutup popup dahulu, lalu drawer mobile pada tekanan berikutnya.

## Data dan permission

- Owner: tambah, edit, hapus semua greenhouse. Manager: edit greenhouse dalam cakupan akses. Operator/Viewer: lihat dan pilih dalam cakupan akses.
- Owner otomatis mendapat akses greenhouse baru; anggota lain perlu diberi akses. Penghapusan menghapus referensi greenhouse pada anggota dan notifikasinya. Anggota tanpa akses tersisa dinonaktifkan, bukan diberi akses lokasi lain secara diam-diam.
- ID baru meningkat dan tidak dipakai ulang setelah penghapusan. Bank tersimpan dinamis; seed yang dihapus tidak muncul kembali saat reload.
- Metadata, luas zona, permission dan storage dipisahkan dari UI. Jumlah tanaman dan luas awal dibagi ke enam zona dengan sisa pembulatan terjaga. Perubahan profil luas tidak mengubah alokasi zona; luas tanam minimal sebesar total alokasi yang sudah dicatat.
- Penghapusan lokal menghapus semua catatan milik greenhouse itu, termasuk perawatan, panen, penjualan, biaya dan automation. Ledger greenhouse lain dipertahankan.
- Greenhouse baru memiliki satu aktivitas penciptaan profil, tanpa histori sensor, kasus, pembelian, pengeluaran atau hasil panen buatan. Reset fixture hanya untuk dua greenhouse demo awal dan mempertahankan profil yang telah diedit.

## Batas prototype

- Semua data dan permission tetap simulasi browser/localStorage; bukan autentikasi, backend, koneksi perangkat, inference atau scheduler server. Kegagalan storage menampilkan peringatan sesi.
- Enam zona A–F adalah konfigurasi awal. Jumlah dan profil zona kini dapat dikelola melalui Zona & tanaman (1–32 zona); bentuk bangunan tetap skematik. 3D/2D bersifat skematik; jumlah rumpun visual bukan inventaris tanaman.
- Profil nutrisi baru dan konfigurasi hardware aktuator baru belum tersedia. Simulasi irigasi/fertigasi lengkap tetap dapat dicoba pada dua greenhouse demo awal. Greenhouse baru dapat membuat rutinitas tugas pemeriksaan, mencatat perangkat observasi, perawatan, biaya, panen dan penjualan.
- Registrasi/validasi perangkat baru tidak menghasilkan data sensor. Nilai tetap tidak tersedia sampai ada sumber data; prototype belum memiliki feed sensor untuk greenhouse buatan pengguna.
- Edit greenhouse mengubah profil lokasi. Zona dan detail batch kini dikelola melalui Zona & tanaman; lihat ZONES_AND_PLANTS.md. Arsip/ganti siklus keuangan belum tersedia.

## Verifikasi

Hasil tahap profil: 171 Vitest dan 55 tes domain lulus. Hasil perluasan zona terbaru: 193 Vitest dan 55 tes domain; lihat ZONES_AND_PLANTS.md. Cakupan baru: validasi, duplikasi nama, permission/scope, isolasi ledger, ID monotonik, reload, migrasi, konfirmasi/batal/hapus, guard proses aktif dan greenhouse terakhir, akses anggota, popup profil, keyboard, tema, help, logout. Semua area kerja dan tab utama dirender pada greenhouse baru; rutinitas tugas dapat disimpan sebagai draft.

CRUD melalui form aktual diuji pada cabang DOM 390, 768, 1280 dan 1440 px. CSS register menata ulang fakta/tombol pada breakpoint; popup ditempatkan relatif ke avatar dan dibatasi viewport. Ini bukan pengukuran layout atau screenshot browser. Lingkungan Linux ini tidak menyediakan browser control yang diwajibkan workflow Sites: pemeriksaan visual empat lebar, native dialog stacking, dan GPU/WebGL belum dapat diuji. Fallback 2D tetap tersedia. Lint dan TypeScript lulus; build React/Vite produksi dijalankan oleh workflow Sites untuk arsip deployment.
