# Perbaikan denah 2D dan model 3D

15 Oktober 2026. Catatan perbaikan dasar sebelum refinement botanis. Arah visual terbaru, penerapan skill dan hasil pemeriksaan tercatat di SPATIAL_ART_DIRECTION.md. Source aplikasi yang sama, tanpa dependency baru atau perubahan data pengguna.

## Masalah yang diperbaiki

- Denah SVG sebelumnya mengecilkan seluruh teks bersama gambar. Label suhu panjang dan nama zona tidak memiliki ruang sendiri. Denah baru memakai tombol HTML dan ilustrasi bed SVG; font tetap terbaca, nama panjang memakai ellipsis dengan nama lengkap pada selector/title/aria-label. Scroll dibatasi di dalam denah dan zona terpilih diusahakan tetap terlihat saat resize.
- Posisi bed didefinisikan terpisah pada 2D dan 3D. Keduanya sekarang memakai urutan baris, kolom, dan orientasi utara dari `spatialModel.ts`. Bangunan menggunakan 1–4 kolom sesuai jumlah zona, termasuk satu zona yang diletakkan di tengah.
- Ukuran kamera sebelumnya berdasarkan konstanta lebar. Fit baru menghitung proyeksi seluruh batas bangunan, lantai, rangka dan ruang label. Resize, pergantian sudut, dan Sesuaikan view memakai perhitungan yang sama. Near/far juga menyesuaikan ukuran model.
- Label 3D sebelumnya menampilkan nama dan status penuh pada setiap bed. Marker kini berupa kode zona, sementara detail terbaca di atas kanvas. Marker yang saling menutupi disembunyikan dengan prioritas zona terpilih; kode akan muncul lagi ketika ruang cukup/zoom berubah. Semua zona tetap dapat dipilih melalui selector, bed dan denah 2D.
- Angka suhu sebelumnya dibaca langsung dari fixture meski sensor offline atau tidak terkalibrasi. Kedua view kini memakai sensor dan pembacaan simulator yang sama; data tidak tersedia ditandai abu-abu. Legenda mengikuti layer, termasuk monitoring lanjutan berwarna biru dan zona nonaktif.
- Kegagalan inisialisasi renderer dan kehilangan context grafis mengembalikan view ke denah 2D tanpa kehilangan layer/pilihan zona. Tombol Coba 3D lagi membuat upaya baru; indikator 2D/3D mengikuti view yang benar-benar ditampilkan.
- Buffer tanaman menggunakan kapasitas tetap dengan jumlah instance aktif yang diperbarui; zona kosong/nonaktif tidak menyisakan tanaman. Tanaman generik dan komoditas berbuah dibedakan secara ilustratif, tanpa klaim pemodelan varietas fisik.

## Arah visual dan interaksi

Pertahankan Plus Jakarta Sans dan identitas Vigor. Area model mempertahankan pencahayaan siang pada tema gelap, sementara toolbar, pilihan zona dan detail mengikuti tema aplikasi. Palet ilustrasi: lantai `#E9EFE8`, bed `#F9FBF7`, teks `#20352B`, pilihan `#28543A`, perhatian `#B87829`, air/monitoring `#488393`.

Hierarki: layer + 2D/3D → pilihan zona dan status → model/denah → legenda dan petunjuk. Tidak ada label panjang yang mengambang di atas tanaman. Rangka dapat disembunyikan; sudut isometrik dan dari atas tersedia. Tombol zoom serta Sesuaikan view dapat digunakan tanpa roda mouse. Top view memakai drag untuk pan; isometrik memakai drag untuk putar. Tidak ada rotasi otomatis atau animasi dekoratif.

CSS visualisasi yang tersebar pada features/layouts/responsive/theme dipindah ke satu pemilik: `styles/spatial.css`. Komponen dipisah antara detail greenhouse, denah, kontrol/fallback, model 3D dan kalkulasi geometri.

## Verifikasi

- 219 Vitest: 193 regresi lama ditambah 19 pengujian layout/proyeksi/status/buffer/OrbitControls dan 7 pengujian DOM kontrol/fallback.
- Kamera dan marker diuji secara matematis dengan Three.js asli pada lebar 320, 390, 768, 1280 dan 1440 px, untuk 1–32 zona, dua sudut, resize dan kontrol OrbitControls asli. Seluruh sudut bounding box masuk frustum pada posisi fit; marker yang ditampilkan tidak bertabrakan. Ini bukan pengujian GPU.
- Form pemilihan zona, layer, perpindahan 2D/3D, zoom, rangka dan fit diuji pada cabang DOM 390, 768, 1280 dan 1440 px. Kegagalan renderer serta callback kehilangan context diuji dengan renderer pengganti; halaman dan pilihan zona tetap bisa dipakai.
- 55 tes Node domain tetap lulus. TypeScript dan format diperiksa; build produksi dilakukan dengan helper Sites dari source yang sama.
- Lingkungan managed Sites tidak menyediakan control-browser yang diwajibkan. Tidak ada server preview/browser alternatif yang dijalankan. Screenshot, ukuran layout aktual, hit testing/pointer pada GPU, kualitas material, native WebGL context loss, kinerja perangkat HP dan error persis pada browser pengguna belum dapat diverifikasi.

Referensi API untuk implementasi: [React Three Fiber Canvas v9](https://r3f.docs.pmnd.rs/api/canvas), [Three.js OrthographicCamera](https://threejs.org/docs/pages/OrthographicCamera.html), serta source versi lokal Fiber 9.8.1, Drei 10.7.9 dan Three.js 0.180.0. Tidak mengubah versi library ke rilis eksperimental.
