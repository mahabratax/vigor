# Penyimpanan Vigor — SQLite di browser

Vigor memakai sql.js 1.15 (SQLite WebAssembly) di Web Worker. File SQLite disimpan sebagai bytes di IndexedDB pada origin Site yang sama. Browser tidak memanggil `/api/workspace` dan tidak membutuhkan D1 atau identitas server untuk membaca/menulis data. Hosting Site tetap privat. Data berbeda per browser, profil browser, dan perangkat.

## Struktur dan sumber kebenaran

86 tabel bertipe eksplisit menggunakan kontrak `db/model.ts`, schema Drizzle, dan empat migrasi SQL yang sama. Mesin domain pada `server/service.ts` dan adapter repository digunakan kembali di worker browser; folder ini tidak lagi menjadi endpoint server.

| Relasi | Aturan |
| --- | --- |
| Greenhouse → zona → batch → pergerakan tanaman | ID lokal dibatasi greenhouse; satu batch aktif per zona. Jumlah tanaman dihitung dari populasi awal dan pergerakan. |
| Perangkat ↔ zona, kemampuan, versi rutinitas | Junction tables mencegah daftar ID tersembunyi dan relasi lintas greenhouse. |
| Kasus → inspeksi → rencana → tugas | Zona rencana harus sama dengan kasus. Referensi batch harus sesuai zona. |
| Rutinitas → versi → langkah; run → langkah → perintah | Definisi saat run dan bukti sensor merupakan snapshot immutable. |
| Perangkat → tiket perawatan → pengeluaran | Perangkat konsisten. Satu tagihan kanonik per tiket. |
| Pengeluaran → alokasi, periode pemakaian, porsi siklus | Satu ledger untuk biaya bulanan, investasi, dan laba. |
| Batch → lot panen → penjualan → penerimaan | Stok dan piutang dihitung; penjualan dan penerimaan dibatasi saldo. |
| Barang → pergerakan stok → expense/run/tiket | Perangkat opsional memakai FK NULL. Reversal merujuk pergerakan asal. |
| Anggota → akses greenhouse → preferensi, notifikasi, tour | Relasi lokal dan progres dipertahankan. Role lokal bukan batas keamanan antar pengguna. |

FK, unique constraints dan indeks tetap aktif. Saldo tanaman, persediaan, total biaya, pendapatan, laba dan penghematan tidak diduplikasi sebagai saldo mutable. JSON hanya untuk snapshot definisi eksekusi/bukti historis, bukan seluruh workspace.

## Transaksi dan persistence

1. Worker membuka salinan file SQLite terbaru dari IndexedDB.
2. Repository membaca tabel dalam satu transaksi, dengan SELECT per tabel. Tidak ada UNION besar yang melewati batas runtime.
3. Command divalidasi; perubahan baris dan journal revision ditulis dalam transaksi SQLite dengan FK.
4. File hasil diekspor dan disimpan dalam transaksi readwrite IndexedDB. Nomor generation dibandingkan secara atomik agar dua tab tidak menimpa satu sama lain.
5. UI menerima sukses hanya setelah transaksi IndexedDB selesai. Jika penyimpanan gagal, connection baru dibuang dan file sebelumnya tetap utuh.

Request UUID dan hash payload mencegah pencatatan ulang request yang sama. Revision menolak perubahan dari snapshot lama. BroadcastChannel memberi tahu tab lain; focus juga memuat ulang snapshot. Restore memakai generation hasil review sehingga perubahan sesudah review tidak tertimpa.

`src/storage/` memisahkan adapter SQLite, penyimpanan file, engine, RPC worker, dan client. `src/store/persistence.ts` menghubungkan UI yang sudah ada ke worker tanpa network API. Worker dibundel bersama file WASM pada origin Site; tidak memuat library dari CDN. URL worker diimpor melalui `?worker&url` dan diselesaikan memakai `window.location.origin`; jangan menggunakan `import.meta.url` sebagai basis karena build server-reference dapat mengubahnya menjadi file URL.

## Migrasi awal dan asal data

Jika IndexedDB belum memiliki workspace, aplikasi membaca `vigor-greenhouses-v1` dan `vigor-workspace-v1`. Data divalidasi dan dimigrasikan; salinan localStorage tidak dihapus. Bila tidak ada data lama, fixtures menjadi data awal. Bila data lama rusak, aplikasi menampilkan pemulihan/ekspor dan tidak diam-diam menggantinya dengan data awal.

Counter ID, anggota, progres panduan, preferensi dan read-state dipertahankan. File SQLite yang sudah ada selalu diutamakan dibanding salinan localStorage lama. Migrasi schema menggunakan application_id VIGR dan user_version; backup dari versi schema lebih baru ditolak.

`starter_records_v1` melengkapi modul kosong pada siklus awal GH-01/GH-02: persediaan dan pembeliannya, perawatan, lot/sortasi, stok hasil, penjualan, penerimaan, susut, biaya siklus dan estimasi sumber daya. Pengisian memakai validator/transisi domain yang sama. Barang masuk menaut ke satu expense; stok dan piutang tetap hasil perhitungan. Lot dengan kasus hama terbuka tidak dirilis. Penghematan contoh memakai baseline asumsi yang dijelaskan pada catatan biaya, bukan hasil pengukuran. Tidak ada perubahan perangkat atau run.

Inisialisasi menandai versi data pada operation journal; database lama memakai `src/storage/starterMigration.ts` saat pembacaan pertama. Pembaruan dan marker disimpan atomik sebagai satu file SQLite. Dua tab yang memperbarui bersamaan membaca ulang hasil pemenang; kegagalan penyimpanan tidak mengubah file lama. Modul berisi catatan, siklus tertutup dan greenhouse di luar starter dilewati. Satu marker workspace mencegah pengisian ulang setelah pengguna menghapus/mengoreksi contoh. Backup lama ditingkatkan saat dipulihkan; inspect tetap read-only.

60 catatan pemakaian September merujuk run historis yang tidak ada di source. Kuantitas dan ID asal dipertahankan dengan resolved FK NULL, tanpa membuat run sukses palsu. Run aktif lama menjadi Needs reconciliation, lock unknown dan delivery belum terkonfirmasi. Tidak ada auto-resume. Sensor awal menyimpan waktu asal dan provenance initial_import; CRUD tidak membuat pembacaan sensor baru.

## Backup, pemulihan dan batas lokal

Settings → Data & backup menyediakan unduh file `.sqlite`, inspeksi file, konfirmasi pemulihan, dan unduh salinan sebelum pemulihan. File diperiksa dengan integrity_check, foreign_key_check dan validasi domain sebelum penggantian atomik. Backup sebelumnya disimpan dalam transaksi yang sama. Batas impor 50 MB.

Permintaan penyimpanan persisten menggunakan izin browser. Keputusan tetap pada browser; tidak dijanjikan selalu tersedia. Menghapus data situs, profil browser atau sesi incognito dapat menghapus data. Ekspor backup diperlukan sebelum pindah perangkat. Tidak ada sinkronisasi cloud atau akses bersama. Role dan permission lokal membantu alur kerja tetapi bukan autentikasi yang aman terhadap pengguna perangkat itu sendiri.

Logout tetap menggunakan sign-out Sites/ChatGPT melalui navigasi top-level. File SQLite browser tidak dihapus saat logout. Batas akses Site tetap ditangani hosting privat; role dalam database lokal bukan pengganti autentikasi multi-user.

Kamera, gateway, inferensi, scheduler, pembayaran nyata dan notifikasi eksternal belum terhubung. Konfigurasi dan pencatatan dapat dikelola; eksekusi perangkat tidak dipalsukan. Label Data demo serta toolbar Jalankan/Kontrol demo tetap dihapus.

## Diagnosis dan verifikasi

Log Site sebelumnya menunjukkan `/api/workspace` mengembalikan 503: `D1_ERROR: too many terms in compound SELECT`. Database D1 diperiksa dan belum berisi greenhouse sebelum perpindahan. Binding D1 dan route API dilepas; repository juga diperbaiki agar tidak memakai query gabungan besar.

- TypeScript dan build Vinext aktual, termasuk worker/WASM, diperiksa.
- Tes SQLite Node memeriksa relasi, rollback, izin, idempotency, impor dan care-to-sale.
- Tes sql.js nyata dengan fake-indexeddb memeriksa persistence/reopen, konflik tab, kegagalan write, backup/restore dan care-to-sale. Fake IndexedDB menguji semantik transaksi, bukan kebijakan storage browser.
- `node scripts/verify-worker-urls.mjs` memeriksa URL constructor pada bundle klien produksi; protokol harus HTTPS dan origin harus sama dengan halaman.
- `node scripts/check-browser-worker.mjs` menjalankan pemeriksaan URL tersebut lalu bundle worker produksi beserta WASM di Node, memeriksa startup, CRUD, reopen, backup dan nol permintaan API. Ini bukan browser rendering.
- Control-browser tidak tersedia: visual browser, storage pada origin live, kebijakan quota/private mode, touch dan WebGL belum diuji secara langsung. 2D fallback dipertahankan.

Mesin membaca workspace penuh dan menulis file SQLite utuh setiap commit. Ini sesuai ukuran prototype saat ini; volume telemetry besar memerlukan strategi storage berbeda. Tidak ada klaim service worker/PWA atau halaman dapat dibuka tanpa jaringan pada kunjungan pertama.
