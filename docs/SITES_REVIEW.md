# Vigor — review Sites

## 16 October 2026: workflow navigation and period reliability

The dashboard, expenses and device inspectors now share calendar logic. The default is the current Jakarta month, historical months come from existing records, and the trailing three-month view crosses year boundaries correctly. Custom start/end dates survive device → expense → device links and CSV exports. Invalid ranges have an explicit correction state instead of misleading zero totals. Expense dates reject impossible calendar dates. Budget, usage-allocation and evaluation forms no longer default to fixed September/October dates.

The expense overview uses devices from the selected greenhouse, ordered by linked costs, instead of four hardcoded device IDs. Dashboard totals distinguish no recorded expenses from zero. Sensor and connection labels refer to their recorded timestamps. Empty activity and observation lists explain what is missing. Chart legend controls recover from hiding every zone; isolated sparkline points and invalid numeric readings no longer produce invalid geometry.

Case links no longer silently show another case. The list, inspector and header inspection action share selection rules. Missing and filtered records have recovery actions. Care, harvest and sales links open the relevant tab and focus the requested record after navigation. Zone changes clear stale selections; workflow links retain zone context. The current workflow stage is marked correctly. Receipts and losses are filtered through their related sale and harvest lot, so zone-specific lists exclude unrelated records. Cycle-wide financial totals remain explicitly labeled as greenhouse-wide.

Verification: TypeScript passes. All 482 Vitest tests pass across 35 files with one worker, including 22 added regression checks. Source-level navigation tests cover 390, 768, 1280 and 1440 px; the existing guide and workflow suites also pass. The compiled GCP application passes route, asset, same-origin SQLite Worker/WASM, server-import and provider-isolation checks. The private Sites publication builds the actual Vinext application through the source workflow helper; the portable preview is not used as build verification.

No new dependency, schema migration, demo-data replacement or additional dashboard panel is introduced. Browser SQLite and relational records are preserved. Gemini and GCP activation remain deferred until billing is available. No live model calls, physical actuation, payment processing or background scheduling are added.

Remaining validation: the managed control-browser capability is unavailable in this session, so rendered layout/overflow, native date-picker behavior, tour placement in the real browser and GPU/WebGL rendering have not been visually verified. DOM viewport tests are not screenshot or WebGL tests. The existing 2D fallback remains available. Before recording the final video, review the private Site at the four target widths, complete the three-minute tour and check the cost-period and linked-record flows above. Hackathon readiness still requires actual Google-model inference, GCP deployment and final video/PDF submission review.

## 16 Oktober 2026: aset gambar dan kelengkapan data awal

Kelima WebP asli tersedia pada URL produksi dan cocok byte-for-byte, tetapi respons memakai `application/octet-stream`. Referensi UI juga masih relatif. Logo, kamera, bukti inspeksi dan foto greenhouse sekarang diimpor dengan `?inline`: MIME `image/webp` ikut dalam bundle, tanpa bergantung pada request gambar atau path preview. Favicon memakai aset yang sama. `verify-image-assets.mjs` memeriksa kelima byte gambar asli dalam JavaScript produksi; desain/aset tidak diganti.

Modul kosong pada dua greenhouse starter dilengkapi secara berelasi: masing-masing 5 barang, 10 pergerakan persediaan, 5 pembelian terkait, satu reminder stok rendah, 4 tugas perawatan, 3 lot panen, 3 penjualan, 2 penerimaan, susut, perhitungan biaya/laba dan estimasi pemakaian Oktober. Lot zona B tetap ditahan selama kasus hama terbuka. Stok, piutang, laba dan penghematan dihitung dari catatan sumber. Baseline penghematan adalah asumsi presentasi, bukan bukti dampak terukur; catatan menyebut asal sintetis tanpa mengembalikan toolbar demo.

Pengisian baru ikut transaksi inisialisasi. SQLite yang sudah tersimpan mendapat satu pembaruan `starter_records_v1` saat dibuka, dengan journal revision dan compare-and-swap IndexedDB. Modul yang sudah berisi catatan, greenhouse buatan pengguna dan siklus tertutup tidak ditimpa. Marker tetap ada setelah edit/hapus sehingga reload tidak menambahkan ulang contoh. Restore backup lama juga melewati pembaruan yang sama. Tidak ada perubahan skema, sensor baru, pembayaran nyata atau eksekusi perangkat.

399 tes Vitest lulus, termasuk backfill, preservasi, restore, konflik dua tab, kegagalan write, saldo grade, piutang dan FK. Build Vinext aktual serta bundle worker/WASM diperiksa; initializer yang dibundel berisi data lengkap. Regresi DOM mencakup 390/768/1280/1440 px, bukan layout visual browser. Control-browser tidak tersedia: tampilan browser langsung, GPU dan IndexedDB pada browser pengguna belum dapat diperiksa.

## 16 Oktober 2026: URL pemanggil SQLite worker

Error produksi `Failed to construct Worker` berasal dari constructor pada bundle klien: basis `import.meta.url` berubah menjadi `file:///ROOT/src/storage/client.ts` pada build multi-stage. Worker dan WASM tersedia lewat HTTPS, tetapi constructor mencoba `file:///_next/static/...`. Pemanggilan sekarang memakai URL aset dari `?worker&url` dengan `window.location.origin`, tanpa mengubah database atau backup.

`verify-worker-urls.mjs` membaca constructor pada bundle produksi dan memeriksa protokol/origin serta keberadaan file. Pemeriksaan ini terbukti gagal pada bundle lama dan lulus pada bundle perbaikan untuk origin Site dan path preview. Ini melengkapi pengujian isi worker sebelumnya yang tidak menangkap kesalahan caller. 12 tes terarah lulus: bootstrap/retry/RPC dan SQLite persistence/restore. Build aktual serta uji worker/WASM lulus. Browser langsung tetap belum tersedia.

## 16 Oktober 2026: perbaikan startup dan SQLite browser

Log live memastikan 503 berasal dari batas compound SELECT pada D1. Revisi ini melepas ketergantungan database cloud: sql.js berjalan di Web Worker dan SQLite disimpan atomik di IndexedDB. Data localStorage lama dimigrasikan tanpa dihapus. Konflik antar tab, rollback kegagalan penyimpanan, backup/pemulihan dan validasi relasi dipertahankan. Settings memiliki Data & backup. Site tetap privat.

392 tes Vitest lulus, termasuk 9 skenario SQLite WebAssembly/IndexedDB dan 13 skenario relasi SQL. Build menghasilkan bundle worker dan WASM pada origin yang sama. Bundle produksi diuji langsung di Node untuk startup/CRUD/reopen/backup tanpa API; ini bukan pengganti browser QA. Browser visual, storage origin live dan GPU belum diuji karena control-browser tidak tersedia. Detail di [SQLITE_STORAGE.md](SQLITE_STORAGE.md).

Bagian selanjutnya adalah riwayat implementasi yang telah digantikan oleh SQLite browser.

## 16 Oktober 2026: SQLite server

Runtime statis dipindahkan ke Vinext/Worker dengan binding D1 `DB`. UI React yang sama dipertahankan. Validasi server, FK, transaksi revision, idempotency, direktori akses dan preferensi per akun diterapkan; toolbar simulasi dan label Data demo dihapus.

Rincian skema, migrasi browser, data historis tak lengkap, sumber sensor dan batas sistem: [SQLITE_STORAGE.md](SQLITE_STORAGE.md). Build server aktual dan TypeScript lulus. 383 tes Vitest mencakup 370 regresi sebelumnya serta 13 skenario SQLite/API. Pengujian SQLite nyata dan regresi DOM dilakukan terpisah; hasil portable tidak digunakan sebagai bukti deployment ini. Verifikasi visual/browser/GPU tetap belum tersedia karena control-browser tidak ada.

Bagian di bawah merupakan catatan implementasi terdahulu; klaim frontend-only, localStorage dan login contoh telah digantikan oleh migrasi di atas.

# Vigor — review migrasi Sites

15 Oktober 2026. Source diteruskan dari Vigor-Prototype-Frontend.zip.

## Perbaikan tour: tooltip, spotlight dan blur

Coach inline sebelumnya belum menyediakan spotlight/blur dan membutuhkan klik tambahan untuk membawa target ke layar. Revisi ini memakai portal dengan tooltip mengambang, cutout pada komponen asli, backdrop redup dengan blur dan auto-scroll setelah navigasi selesai. Semua 22 langkah memiliki target eksplisit. Posisi dihitung ulang saat target atau viewport berubah; perubahan tinggi tooltip ditangani sebelum paint. Langkah denah memakai tab Monitoring secara eksplisit.

Tour membatasi fokus keyboard dan interaksi latar saat spotlight tampil. Coba di halaman melepas overlay untuk menggunakan form; Lanjutkan tour kembali ke langkah yang sama. Dialog dan popup tidak ditimpa panduan. Escape, pause/resume, restart, scope akun/greenhouse dan role baca tetap didukung. Target hilang menampilkan penjelasan, bukan layar tour kosong. Tidak ada dependency baru, perubahan data bisnis otomatis, atau perubahan izin akses Site.

370 Vitest pada 22 berkas serta TypeScript lulus. Tes DOM melewati 22 langkah pada innerWidth 390/768/1280/1440; fixture geometri memeriksa bounds, pemisahan spotlight/tooltip, cakupan blur, viewport pendek dan perubahan ukuran. Regresi mencakup fokus, form, target hilang, pergantian route/tab dan pemulihan interaksi halaman. Build React/Vite asli dipaketkan melalui Sites untuk versi privat.

Control-browser tetap tidak tersedia: screenshot/layout browser, komposisi blur, native dialog/focus, touch, hosted-origin persistence dan WebGL belum diuji. Hasil portable tidak dipakai sebagai bukti build ini. Detail implementasi dan batas pengujian ada di `GUIDED_WORKFLOWS.md`.

## Panduan dan penyederhanaan UX yang dipertahankan

Panduan Vigor menyediakan empat tour: Kenali workspace, Siapkan greenhouse, Rutinitas & perawatan, dan Panen sampai hasil usaha. Progres terpisah per akun demo/greenhouse; selesai tour tidak berarti pekerjaan kebun selesai. Dashboard memakai antrean tindak lanjut dari data aktif dengan tiket perangkat/stok yang dideduplikasi. Tab panjang menjadi selector pada ponsel. Tombol dan filter mengikuti bagian aktif; peta alur siklus memakai disclosure. Kontrol demo tetap berlabel. Modul, tema, izin dan semua tujuan navigasi dipertahankan.

## Empat prioritas monitoring sampai efisiensi panen

Target tanaman berada di detail zona dan mengikuti batch, varietas serta fase, dengan draft, review dan riwayat versi. Operations dan detail run menampilkan bukti sebelum/sesudah yang direkam saat proses mulai/selesai serta penilaian petugas. Pembacaan tidak direkonstruksi untuk run lama; perubahan skenario dan data hilang diberi penjelasan.

Perangkat → Persediaan memuat saldo barang, penerimaan, refill/pemakaian, susut, koreksi dan tugas restock pada Pemeliharaan. Tautan biaya memakai ledger yang sudah ada. Biaya → Efisiensi panen menghitung air, energi dan biaya per kg dari hasil grade A/B yang sudah direview, setelah susut. Cakupan, alokasi run dan pemakaian tambahan dapat direview; solar dan penghematan tidak ditambahkan lagi ke laba. Tidak ada menu sidebar tambahan atau dependency baru.

324 Vitest pada 19 berkas lulus, termasuk 33 tes domain dan 6 tes DOM baru. TypeScript lulus. Empat pengaturan innerWidth (390/768/1280/1440) menguji alur form sampai reload storage. Ini bukan pemeriksaan layout browser; jsdom tidak menghitung geometri dan Scene WebGL di-stub. Regresi navigasi lama diperbarui agar memilih tab sesuai label setelah Target tanaman ditambahkan.

Build produksi React/Vite diproses oleh helper Sites untuk versi privat ini. Semua fitur tetap frontend-only dan data baru terpisah per greenhouse di browser. Screenshot/layout browser, touch, hosted-origin persistence dan rendering WebGL belum diuji karena control-browser tidak tersedia. Detail, batas perhitungan dan panduan presentasi ada di `GROWING_OPERATIONS.md`.

## Operations dan tooltip aset

Revisi sebelumnya: Greenhouse → Operations menghubungkan kondisi, pemicu, guard simulator, eksekusi dan review hasil. Filter zona dan rutinitas memakai data greenhouse aktif. Hasil run tidak dianggap sebagai bukti tanaman pulih; run pembuat tugas tetap menunggu pekerjaan petugas. Handoff sampai panen, penjualan, penerimaan dan laba memakai modul lama tanpa menggandakan ledger atau membuat scheduler baru.

Pin aset 3D menampilkan identitas perangkat atau PLTS, tooltip hover/focus dan popover saat dipilih. Popover memiliki status, pembacaan/proyeksi, cakupan zona, Fokus aset, detail perangkat/energi dan tautan Operations. Label diposisikan menurut proyeksi kamera untuk menghindari label zona, panel dibatasi area view, dan Escape mengembalikan fokus. Memilih zona menutup seleksi aset. Selector aset dan detail 2D tetap tersedia.

285 Vitest pada 17 berkas lulus (26 tes tambahan). TypeScript lulus. Interaksi DOM, permission, fallback serta proyeksi pin/kamera mencakup 390, 768, 1280, 1440 px; proyeksi juga mencakup 1/6/32 zona. DOM tidak menghitung layout. Peringatan ukuran Recharts 0×0 berasal dari jsdom. Screenshot, rendering WebGL/GPU, gesture sentuh dan layout browser nyata belum diuji karena control-browser tidak tersedia. Lihat `OPERATIONS_ASSET_INTERACTION.md`.

## Energi & area servis

Tambahan 15 Oktober: tab Energi & solar tersedia dari Greenhouse dan Biaya. Skenario tersimpan per greenhouse, memakai daya inventaris dan durasi asumsi yang bisa direview. Produksi, pemakaian langsung, sisa produksi, pasokan PLN, perawatan dan investasi dipisahkan; ledger dan laba tidak diubah oleh simulasi. Model 2D/3D menambahkan kanopi panel di samping tanaman, inverter, instalasi air, fertigasi, fan ber-grille dan kabinet controller. Memilih aset membuka hubungan perangkat, automation dan biaya.

259 Vitest lulus; 33 tes energi/aset dijalankan kembali setelah refinement terakhir. TypeScript lulus. Perhitungan kamera dan interaksi DOM mencakup 390, 768, 1280, 1440 px. Control-browser belum tersedia sehingga screenshot, tampilan browser, WebGL/GPU, performa dan touch belum diuji. Build aplikasi dipaketkan melalui helper Sites. Detail asumsi dan sumber ada di `SOLAR_SERVICE_DESIGN.md`.

## Refinement botanis dan arsitektural 2D/3D

Skill CloudAI-X threejs-fundamentals/geometry/materials/lighting/interaction digunakan setelah meninjau referensi greenhouse asli. Denah menjadi footprint tanaman dengan jalur servis dan perangkat; model memakai daun/buah prosedural, bentuk soil/polybag/hidroponik, rangka dengan penutup sebagian, material galvanis dan bayangan matahari. Fokus zona serta visibilitas perangkat terhubung ke kedua view. Detail source, keputusan desain dan batas visual ada di `SPATIAL_ART_DIRECTION.md`.

## Perbaikan dasar denah 2D dan 3D

Denah kini memakai label HTML yang tidak ikut mengecil, ilustrasi bed, layout bersama 1–32 zona dan scroll lokal. Model 3D memakai fit seluruh bangunan, marker tanpa tabrakan, top view, zoom, pilihan rangka dan penanganan context loss dengan fallback 2D. Kedua layer memakai status/pembacaan valid dari sumber yang sama. 219 Vitest pada perbaikan dasar (226 setelah refinement botanis); 55 tes Node domain sebelumnya lulus; rincian serta batas GPU/browser ada di `SPATIAL_VIEW_FIXES.md`.

## Zona, tanaman dan kesinambungan batch

Greenhouse → Zona & tanaman menambahkan CRUD zona, luas/kapasitas/bed/metode, detail komoditas/varietas, populasi bertanggal, penempatan perangkat dan riwayat batch. Form perawatan/panen membawa zona dan ID batch; lot menyimpan identitas tanaman lama saat replanting. Penutupan batch/siklus memeriksa pekerjaan yang belum tuntas. Denah 2D/3D mengikuti jumlah zona dinamis. Scope laba tetap seluruh siklus greenhouse. Lihat `ZONES_AND_PLANTS.md` untuk alur, batas, keputusan UI dan verifikasi terbaru.

## CRUD greenhouse dan popup akun

Owner dapat menambah greenhouse kosong, mengubah profil, mencari/memilih, dan menghapus dengan konfirmasi nama. Manager dapat mengedit lokasi dalam cakupan akses. Data, ID, akses anggota dan pilihan aktif bertahan setelah reload. Penghapusan tidak dapat dilakukan pada greenhouse terakhir atau saat proses masih aktif/tidak pasti. Tampilan kosong diperbaiki pada monitoring, kamera, rutinitas, builder dan nutrisi.

Popup mengikuti referensi pengguna: identitas, My profile, Settings, Light/Dark, Panduan Vigor, Logout. Tombol collapse tetap di header; Settings dan bantuan dipindah dari daftar sidebar ke popup akun. Pemeriksaan interaksi DOM mencakup sidebar ringkas, mobile, Escape, fokus, tema, logout dan CRUD pada 390/768/1280/1440 px. Lint, TypeScript dan seluruh tes lulus. Detail serta batas tambahan ada di `GREENHOUSE_CRUD.md`.

## Polish UI menggunakan taste-skill

Refinement memakai panduan yang relevan untuk dashboard: type tokens, sidebar 224/76 px, scroll menu terpisah dari akun, selected state yang lebih tenang, panel datar, tab mobile yang membungkus, serta form/dialog dengan fokus error dan identitas aksesibel. Styles umum form/dialog dipindahkan ke shared components. Tidak ada perubahan dependency, data bisnis, atau izin Site. Rincian adaptasi skill ada di `TASTE_POLISH.md`.

Perbandingan warna token inti dihitung dari nilai sRGB: teks sekunder light 4,84:1 terhadap background, dark 6,81:1 terhadap surface; label tombol primary light 8,23:1 dan dark 6,09:1. Ini bukan audit kontras seluruh tampilan.

## Perbaikan UI/UX setelah review pengguna

- Router menjadi satu sumber lokasi; state hash manual yang bersaing dengan React Router dihapus.
- Tautan detail perangkat, zona, kasus, event, dan rutinitas tampil melalui drawer pada layar kecil. Perubahan tab detail tetap membuka entitas yang benar; pindah halaman dan back/forward tidak mempertahankan drawer halaman lama.
- Menutup drawer membersihkan seleksi URL; kembali dari detail pengeluaran mengembalikan konteks perangkat.
- Kamera dan sensor lingkungan memakai zona yang sama. Filter zona mengganti kamera yang berada di luar cakupannya.
- Pagination invalid, pecahan, negatif, dan melebihi jumlah hasil ditangani. Tab URL yang tidak dikenali kembali ke tab utama. Riwayat tidak menampilkan event yang tersaring keluar.
- Menu mobile mendukung Escape, fokus awal, pembatasan Tab, background scroll lock, dan inert ketika tertutup. Tab mendukung panah/Home/End dan fokus terlihat.
- Perbaikan hierarki kartu, kontrol sentuh, baris filter, scroll tab/tabel, toolbar simulasi atas, dan inspector pada layar desktop sempit.
- Model 3D baru: enam bed dalam dua kolom mengikuti referensi, rangka melengkung, kulit transparan tipis, jalan paving, tanaman berdaun dan buah paprika (instanced), kamera, tangki serta pipa. Ukuran kamera menyesuaikan container; label zona tetap dapat dipilih. Tampilan 2D memakai urutan zona yang sama.
- Model adalah ilustrasi; 120 rumpun visual tidak dimaksudkan sebagai inventaris 432 tanaman. Pipa dan tangki bukan simulasi hidraulik. Tidak ada klaim model 3D sudah diperiksa GPU/browser.

## Redesign workspace setelah masukan lanjutan

Seluruh delapan menu memakai sistem UI baru: workspace netral, navigasi berkelompok, toolbar demo ringkas di atas, metrik dalam satu strip, status berupa teks, tabel dan inspector konsisten. Ringkasan disusun ulang menjadi tren, antrean tindakan, rutinitas, lingkungan, register zona dan pengeluaran. Tidak ada lagi footer simulator tetap yang menutupi konten. Kamera tetap tersedia pada menu Hama/Perangkat.

Shell kelas besar diganti komposisi komponen dan hook. Panel detail dan presentasi label dipisahkan per fitur. Source TS/TSX/CSS serta tes diformat dengan Prettier. CSS patch lama dihapus; aturan dasar, token, komponen, frame, fitur dan layout dipisahkan. Panduan tersedia di `DESIGN_SYSTEM.md`.

Pada revisi sebelumnya skill khusus belum tersedia. Pada revisi ini pengguna memberikan panduan lengkap **frontend-design** di percakapan; panduan tersebut dipakai untuk menyusun token, komposisi, kritik sebelum implementasi, dan penulisan UI. Tidak ada klaim skill diinstal sebagai plugin.

## Revisi berdasarkan frontend-design yang diberikan

- Dashboard dibuka dengan monitoring enam zona berbentuk lajur bed. Suhu/RH, koneksi kamera, status inspeksi, dan tautan zona berasal dari state demo yang sama.
- Foto pemeriksaan tanaman memberi konteks untuk daftar pekerjaan lapangan. Urutan 01/02/03 yang bukan urutan proses dihapus.
- Aktivitas terbaru menggantikan tabel zona kedua. Jadwal, grafik tangkapan, sensor lingkungan dan pengeluaran tetap tersedia.
- Plus Jakarta Sans Variable dibundel lokal; palet hijau, putih embun dan biru air diterapkan pada delapan halaman. Navigasi memakai Monitoring / Operations / Review, dengan Dashboard, Automation dan Aktivitas & laporan sebagai nama halaman.
- Container register, panel dan bagian tanpa kotak memiliki peran berbeda. Label kapital dekoratif, metadata monospace, pemisah titik berulang dan panah pada hampir setiap CTA dibersihkan.
- Sparkline sensor yang dihitung dari angka pengisi dihapus. Kelembapan tidak lagi ditampilkan sebagai data valid ketika sensor belum dikalibrasi atau skenario data tidak tersedia.
- Legenda grafik memakai tombol native dengan aria-pressed. Data tidak dilengkapi secara rekaan; garis C/D juga memiliki pola dash berbeda.
- Panduan desain dan kepemilikan CSS diperbarui. Aturan dashboard dipindah ke stylesheet khusus dengan aturan lama dihapus dari file bersama.

## Implementasi

- Tetap React 19, TypeScript strict, Vite, React Router HashRouter, Zustand, Recharts, dan lazy React Three Fiber / Drei / Three. Tidak diganti dengan portable Preact atau screenshot halaman.
- Hosting statis `dist`, private owner-only. HashRouter menjaga delapan tujuan awal ditambah Role & permission, Settings dan Siklus tanam tanpa kebutuhan rewrite backend.
- Instalasi npm berhasil tanpa force/legacy-peer-deps. `package-lock.json` dan versi terpasang di `SITES_DEPENDENCIES.json` disimpan bersama source.
- Demo clock, scheduler deterministik, state lintasmenu, aksi inspeksi/pengendalian, dan ledger/alokasi pengeluaran dipertahankan.
- Kontras teks diperbaiki; sidebar, heading, KPI, tabel, dan kontrol diperbesar mengikuti hierarki referensi. Dekorasi sidebar sekunder disembunyikan agar navigasi lebih fokus.
- Detail perangkat membuka biaya terkait secara default. Kondisi dan pemakaian tetap tersedia melalui tab.
- Ringkasan kini menyebut biaya lebih tinggi jika selisih negatif; tidak selalu menyatakan lebih rendah.

## Hasil pemeriksaan aktual

- Instalasi native: berhasil, semua peer dependency diselesaikan tanpa pemaksaan.
- TypeScript dan Vite produksi: berhasil pada source asli. Build final dijalankan lagi oleh workflow packaging setelah perubahan visual.
- Vitest: 226 lulus. Mencakup 26 tes geometri, kamera, botanical buffers, status dan OrbitControls serta 7 tes DOM visualisasi di atas 193 tes fitur lain. Tambahan 7 tes memeriksa fokus kamera pada empat lebar, geometri daun/buah, perubahan metode serta fase tanaman.
- Suite domain tambahan: 55 lulus, dijalankan ulang pada revisi CRUD greenhouse. Mencakup otomatisasi irigasi/fertigasi, resource lock, stop/reconciliation, duplikasi, nominal/alokasi, serta hubungan perangkat dan pengeluaran.
- Render native menguji 8 halaman dalam cabang desktop/mobile, detail pompa dan servis, serta enam zona 2D yang dapat difokuskan dengan keyboard. Ini render komponen ke HTML, bukan pengujian layout/browser.
- RAR referensi input identik byte-for-byte dengan koleksi desain yang dipilih sebelumnya. Tidak ada screenshot halaman yang dipasang sebagai UI.

## Review per halaman

| Halaman | Elemen yang dipertahankan / diperiksa melalui source dan render |
|---|---|
| Dashboard | Monitoring enam zona, grafik native Recharts, pekerjaan lapangan, jadwal/proses aktif, sensor, aktivitas, ringkasan biaya |
| Greenhouse | Daftar lokasi, zona dinamis, batch/varietas/populasi, perangkat, perawatan dan riwayat, selector layer, 3D lazy dan SVG 2D interaktif |
| Hama & inspeksi | Daftar kasus, Detection review enam zona, kualitas pengamatan, alasan alert, bukti pemicu, form inspeksi dan tindak lanjut |
| Pengendalian | Rencana kasus, status persetujuan dan eksekusi simulasi, evaluasi hasil |
| Otomasi & rutinitas | Jadwal, daftar rutinitas, editor, eksekusi, profil nutrisi, kondisi gangguan |
| Perangkat | Inventaris, status, kamera/sensor, pemeliharaan, penggunaan, biaya dan tautan pengeluaran |
| Riwayat & laporan | Timeline, filter, objek terkait, laporan dan ekspor browser |
| Biaya & penghematan | Periode, pengeluaran, baseline, anggaran, alokasi, perencana dan detail servis |
| Role & permission | Anggota lokal, role tetap, cakupan greenhouse, preview permission, kontrol tindakan |
| Settings | Profil anggota, Light/Dark/System, sidebar, kategori notifikasi, logout demo |
| Siklus tanam | Target, perawatan, kasus tertaut, panen bertahap, review lot, stok per grade, susut, penjualan dan penerimaan |

## Verifikasi browser yang belum tersedia

Skill Sites pada managed Linux mensyaratkan control-browser untuk QA dan melarang preview server/browser pengganti jika skill itu tidak tersedia. Capability tersebut tidak tersedia di sesi ini; tidak ada server preview atau browser pengganti yang dijalankan.

| Lebar | Review aturan CSS | Uji visual/interaksi browser |
|---|---|---|
| 390 px | Drawer navigasi, kartu dua kolom/bertumpuk, detail sheet, scroll tabel, toolbar simulasi atas | Belum dijalankan |
| 768 px | Sidebar drawer, ruang konten penuh, detail melalui sheet, grid menyesuaikan | Belum dijalankan |
| 1280 px | Sidebar 240/76 px, konten grid dan inspector, profil dan tabel akses | Belum dijalankan |
| 1440 px | Sidebar 240/76 px, konten fleksibel, inspector dan tabel akses | Belum dijalankan |

WebGL/OrbitControls, hasil visual grafik Recharts, screenshot aktual deployment, klik/form browser nyata, persistensi origin hosted, print, keyboard lengkap, serta performa GPU belum diverifikasi. Scene terkompilasi sebagai chunk terpisah; fallback 2D lolos render komponen, tetapi WebGL-failure runtime belum diuji.

## Keterbatasan produk yang masih dipertahankan

Rincian awal tetap tersedia di `IMPLEMENTATION_STATUS.md`. Belum ada video asli atau model GLB; gambar kamera adalah referensi demo dan 3D berupa model skematik. Editor interval/target volume penuh, editor alokasi/tarif lengkap, TCO penuh dan penyimpanan byte lampiran belum lengkap. Balik modal sederhana khusus skenario PLTS tersedia; ini bukan hasil penghematan terverifikasi. September merupakan fixture biaya yang direkonsiliasi; periode lain tidak diisi dengan penghematan rekaan.

Semua operasi tetap frontend-only. Tidak ada perangkat nyata, inference live, pembayaran, API bisnis, atau scheduler server. Simulasi berhenti ketika browser ditutup dan dijeda saat tab disembunyikan.

## Bukti regresi interaksi

`tests/navigation.vitest.test.ts` menjalankan React DOM dalam jsdom. Empat pengaturan innerWidth (390/768/1280/1440) masing-masing mengunjungi sebelas halaman, termasuk delapan halaman awal. Pengujian mencakup drawer deep-link, tab kondisi/biaya perangkat, tautan ledger, editor rutinitas, hash navigation, browser history API back, pemilihan kamera sesuai zona, Escape menu, penutupan drawer, keyboard tab, pagination invalid, dan rentang biaya.

jsdom tidak menghitung layout. Chart melaporkan container 0×0 dalam harness ini; bukan bukti chart gagal atau berhasil pada browser nyata. Scene WebGL di-stub hanya di tes DOM. Dialog memakai polyfill lifecycle hanya pada tes, sehingga native focus trap dialog belum terbukti oleh tes ini. Screenshot pada empat ukuran, chart sizing, GPU, gesture orbit/zoom, fallback kegagalan WebGL, dan visual fidelity tetap belum diuji browser.


Regresi tambahan revisi frontend-design: monitoring board membuka inspector zona yang benar; shortcut inspeksi membawa filter; legenda grafik memperbarui aria-pressed; kelembapan invalid tidak menampilkan angka yang seolah valid. Ukuran viewport pada jsdom tetap hanya cabang komponen, bukan validasi visual. Perubahan kata pada fixture tidak mengubah ID, nilai atau hubungan data.

## Seleksi greenhouse, akses, dan preferensi

- Dua dataset demo independen: Greenhouse 01/Kebun Bogor dan Greenhouse 02/Kebun Ciawi. Selector dapat dicari dan dibatasi cakupan anggota. Header, zona/sensor, aktivitas, rutinitas, perangkat, grafik, ledger, anggaran dan notifikasi mengikuti greenhouse aktif.
- Penyimpanan baru `vigor-greenhouses-v1` memigrasikan data lama `vigor-demo-v3` ke Greenhouse 01. Perubahan pada satu greenhouse tidak mengubah greenhouse lain. Reset hanya berlaku pada pilihan aktif. Perpindahan menjeda clock; reload merekonsiliasi run yang terputus di kedua dataset.
- Greenhouse 02 memakai 270 m² area, 216 m² area tanam, 324 tanaman, 6 zona tervalidasi, dan seluruh perangkat online. September memiliki biaya operasional Rp864.000, anggaran Rp960.000 dan biaya pompa Rp68.400. Angka ini data sintetis; alokasi tetap bagian dari tagihan yang sama.
- Role demo: Owner, Manager, Operator dan Viewer. Owner mengelola anggota/cakupan; Manager mengelola operations dan biaya; Operator dapat mencatat inspeksi, menjalankan proses, mencatat perawatan tanpa pembayaran, dan ekspor; Viewer memiliki akses baca. Semua role dapat membaca monitoring dan biaya. UI dan action dispatcher memakai matriks yang sama. Ini bukan otorisasi server.
- Preview role bersifat sementara dan tidak mengubah role akun. Anggota demo ditambah/diubah secara lokal, tanpa undangan/email. Logout menjeda simulasi dan membuka pilihan anggota demo; tidak melakukan logout akun ChatGPT dan tidak menghapus dataset.
- Profil, tema, sidebar, kategori notifikasi dan status dibaca disimpan di `vigor-workspace-v1`. Status dibaca terpisah per anggota dan greenhouse. Tema System mengikuti perubahan perangkat. Kategori notifikasi berlaku di browser ini.
- Bell header membuka notifikasi turunan data (inspeksi, perangkat, run, draft/anggaran), dengan mark-read, mark-all, filter unread dan deep-link yang membuka objek. Tidak ada push/email atau event backend.
- Sidebar normal 240 px dan ringkas 76 px. Tombol berada di kiri breadcrumb. Mobile tetap memakai drawer berlabel, walaupun preferensi desktop ringkas tersimpan.

Regresi baru memeriksa pemisahan ledger dan alokasi, migrasi data lama, reset scope, reload run aktif, kegagalan storage, pemulihan preferensi, permission, perpindahan greenhouse, tema OS, profil, sidebar, notifikasi dan deep-link draft, logout/login, preview Viewer, serta anggota dengan akses satu greenhouse. Tidak ada dependency baru pada perluasan ini.

## Detection review dan alur presentasi

Tab baru berada di Hama & inspeksi, dengan shortcut dari Dashboard dan Bantuan demo. Antrean enam zona membuka tiga pengamatan, acuan pembanding, aturan pemicu dan status kualitas sumber. Nilai hilang, negatif, pecahan, tidak finite, terlalu lama, masa depan, interval tidak sebanding atau kamera tidak siap tidak menghasilkan penilaian aman. Ambang 20 tangkapan, kenaikan 50% dan dua kenaikan berurutan merupakan aturan presentasi, bukan ambang pengendalian yang tervalidasi.

Evaluasi berjalan pada kemajuan clock, perubahan skenario, pilihan contoh data, atau tombol evaluasi. Sinyal baru membuat kasus inspeksi atau memakai kasus terbuka di zona yang sama; bukti pemicu disimpan pada kasus. Pengulangan sinyal tidak membuat kasus tambahan. Alert tidak menutup kasus otomatis, menjalankan perangkat, atau mencatat pembayaran. Notifikasi dan aktivitas memakai relasi kasus yang sama.

Tiga contoh presentasi (Normal, Tangkapan meningkat, Data hilang) memakai angka sintetis, menjeda clock dan hanya mengubah observasi zona pada greenhouse aktif. Kamera offline tetap offline. Viewer tidak dapat mengubah contoh atau mengevaluasi data. Foto referensi tidak dianalisis, tidak ada confidence ML atau klasifikasi spesies yang dibuat-buat. Tidak ada dependency tambahan.

Pengujian tambahan mencakup kualitas input, aturan dan idempotensi, snapshot bukti, perpindahan greenhouse, permission, notifikasi serta alur contoh → kasus → inspeksi. Cabang DOM Detection review dijalankan pada 390, 768, 1280 dan 1440 px. Ini tidak menggantikan review screenshot atau layout browser. Panduan presentasi dan tahap ML berikutnya ada di `DETECTION_REVIEW.md`.

## Perawatan sampai laba siklus

Menu Siklus tanam meneruskan data siklus yang sudah ada ke target, tugas perawatan, kasus hama tertaut, panen bertahap per lot, grade A/B, reject, susut, penjualan dan penerimaan parsial. Lot menunggu review; kasus zona terbuka memblokir pelepasan dan penjualan. Stok tidak boleh negatif dan penerimaan tidak boleh melebihi tagihan. Penjualan yang sudah memiliki penerimaan tidak dapat dibatalkan; retur/refund belum tersedia.

Tab Laba siklus berada pada menu Biaya, tanpa filter periode bulanan yang menyesatkan. Biaya dibebankan dengan porsi ledger, termasuk biaya persiapan sebelum tanam; alokasi perangkat tidak ditambahkan lagi. Investasi, penyusutan, beban belum dibayar, tenaga sendiri, piutang dan kas memiliki tempat terpisah. Penghematan adalah perbandingan terhadap asumsi biaya dengan pendapatan sama, tidak ditambahkan ke laba. Perubahan ledger membatalkan review sebelumnya.

Penutupan memerlukan panen, stok dan piutang selesai, tidak ada kasus/tugas terbuka atau run aktif/tidak pasti, serta review biaya. Rutinitas dijeda saat penutupan; aktivasi dan run baru diblokir sampai siklus dibuka ulang. Record dan ledger historis tetap disimpan. State lama mendapatkan modul siklus kosong tanpa membuat hasil/pendapatan rekaan, terpisah per greenhouse.

40 tes domain tambahan dan 8 regresi DOM meliputi hitungan, guard, storage, izin dan alur form. Seluruh 142 Vitest dan 55 tes domain lama lulus. TypeScript dan build final dijalankan pada source ini. Screenshot/visual browser dan GPU tetap belum tersedia. Modul mendukung siklus aktif yang sudah ada; arsip multi-siklus, retur/refund, pajak, integrasi bank dan penilaian persediaan akuntansi belum diimplementasikan. Lihat `CROP_WORKFLOW.md`.
