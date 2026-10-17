# Detection review — panduan presentasi

Fitur ini menyambungkan monitoring demo ke pekerjaan inspeksi yang sudah ada. Semua data tangkapan tetap sintetis. Foto kamera adalah referensi visual, bukan hasil YOLO atau input analisis gambar.

## Demo singkat

1. Masuk sebagai Owner atau Manager demo, pilih Greenhouse 01. Buka **Hama & inspeksi → Detection review → Zona D**. Shortcut juga tersedia pada Dashboard dan Bantuan demo.
2. Buka **Coba skenario presentasi**, pilih **Tangkapan meningkat**. Tiga interval berisi 12, 19 dan 28 tangkapan; aturan memberi alasan review dan membuat kasus jika zona belum memiliki kasus terbuka. Notifikasi serta aktivitas menunjuk kasus yang sama.
3. Pilih **Buka kasus** untuk melihat bukti pemicu, mencatat inspeksi dan melanjutkan alur pengendalian yang sudah ada. Kembali ke Detection review lalu coba **Normal** atau **Data hilang**. Status pengamatan berubah, tetapi kasus tidak otomatis selesai.

Tautan langsung: `/#/hama?tab=detection&reviewZone=D&demo=true`.

Pada data yang sudah pernah dipakai, kasus terbuka digunakan kembali. Tombol reset demo yang sudah ada hanya mereset greenhouse aktif; gunakan jika membutuhkan fixture awal. Data awal Zona D memiliki kasus historis tertutup, sehingga jumlah semua kasus tidak sama dengan jumlah kasus terbuka.

## Aturan yang dapat dijelaskan

Aturan `trap-trend-demo-v1` memerlukan semua pemeriksaan kualitas berikut:

- Kamera aktif, online dan pemasangannya tervalidasi; zona juga tervalidasi.
- Tiga pengamatan dari kamera yang sama, masing-masing untuk interval 24 jam.
- Waktu pengamatan berurutan berjarak 24 jam, dengan toleransi satu menit.
- Jumlah berupa bilangan bulat tidak negatif; nol sah, data hilang tidak diubah menjadi nol.
- Pengamatan terakhir tidak di masa depan dan berumur paling lama 36 jam terhadap clock demo.

Jika kualitas lolos, alert review memerlukan jumlah terakhir minimal 20, kenaikan minimal 50% dari rata-rata dua interval sebelumnya, serta dua kenaikan berturut-turut. Persentase tidak dihitung dari acuan nol. Jumlah tinggi tanpa seluruh syarat tren menjadi kebutuhan observasi tambahan. Data tidak cukup ditampilkan sebagai **Belum dapat dinilai**.

Angka tersebut adalah ambang presentasi, bukan ambang tindakan yang telah divalidasi untuk spesies, tanaman atau kondisi lapangan. Status **Belum memicu alert** tidak membuktikan tanaman bebas hama.

## Hubungan data dan tindakan

Evaluasi otomatis terjadi ketika clock bergerak, skenario berubah atau contoh presentasi dipilih. Tombol evaluasi juga tersedia bagi anggota dengan izin inspeksi. Sinyal yang sama memiliki kunci berdasarkan versi aturan, greenhouse, zona dan tiga pengamatan; evaluasi berulang tidak menambah kasus duplikat. Kasus terbuka pada zona yang sama digunakan kembali. Setelah kasus ditutup, sinyal yang sudah diproses tidak membukanya kembali; pengamatan baru yang memenuhi aturan dapat membuat kasus baru.

Kasus menyimpan salinan angka, acuan, identitas pengamatan dan waktu pemicu. Bukti historis tetap tersedia setelah kondisi pengamatan berubah. Alert terhubung ke notifikasi dan aktivitas. Catatan inspeksi, rencana pengendalian, pelaksanaan simulasi serta evaluasinya menggunakan alur yang sudah ada. Alert sendiri tidak menjalankan aktuator, menutup kasus, atau membuat pembayaran.

Pilihan Normal (4, 5, 5), Tangkapan meningkat (12, 19, 28), dan Data hilang (12, 19, kosong) mengganti tiga pengamatan terbaru pada zona dan greenhouse terpilih. Clock dijeda. Pilihan ini tidak memperbaiki kamera offline atau mengubah greenhouse lain. Owner/Manager dapat memilih contoh; Operator dapat melakukan review/inspeksi; Viewer hanya membaca. Semua izin merupakan perilaku frontend demo, bukan otorisasi server.

## Tahap ML berikutnya

Mulai dari satu kamera tetap pada perangkap dan satu target hama yang jelas. Kumpulkan sampel nyata yang mewakili pencahayaan, sudut, kepadatan tangkapan dan gangguan visual. Pisahkan sampel evaluasi dari sampel pelatihan menurut perangkap atau waktu agar gambar hampir identik tidak muncul pada kedua kelompok.

Pilih atau latih model kecil untuk target tersebut, lalu bandingkan hasil dengan anotasi manual: serangga terlewat, objek salah terdeteksi dan galat jumlah. Bobot YOLO bawaan yang dilatih pada COCO tidak menyediakan kelas hama greenhouse. Model harus diuji pada data yang sesuai sebelum hasilnya dipakai sebagai bukti.

Jumlah objek pada satu foto bukan otomatis jumlah **tangkapan baru per 24 jam**. Serangga yang tetap menempel harus dikenali antar-pengamatan atau dihitung dengan prosedur perangkap yang terdokumentasi agar tidak dihitung ulang. Ketidakpastian gambar, jeda kamera dan pergantian perangkap perlu menjadi status kualitas data.

Setelah data dan hitungan tervalidasi, uji ekspor ONNX dan inference browser pada satu sumber rekaman, dengan WebGPU bila didukung dan WASM sebagai opsi CPU. Ukur latensi, ukuran unduhan model dan konsumsi perangkat target. Tahap kecil ini belum memerlukan Vertex AI, gRPC atau scheduler backend. Belum ada model, video nyata, library inference atau koneksi perangkat dalam versi sekarang.

Referensi teknis resmi:

- https://docs.ultralytics.com/datasets/detect/coco/
- https://docs.ultralytics.com/modes/export/
- https://onnxruntime.ai/docs/tutorials/web/

## Verifikasi

Suite saat ini mencakup 94 tes Vitest (termasuk 25 tes aturan detection dan 35 tes navigasi/DOM) serta 55 tes domain tambahan. Pemeriksaan mencakup input tidak valid, kualitas sumber, aturan, deduplikasi, riwayat bukti, pemisahan greenhouse, permission dan alur notifikasi → kasus. TypeScript dan build produksi dijalankan pada source Sites melalui workflow packaging.

Cabang DOM pada 390, 768, 1280 dan 1440 px diuji, tetapi jsdom tidak menghitung layout. Skill Sites mensyaratkan control-browser yang tidak tersedia di sesi ini; tidak ada browser atau server preview pengganti. Screenshot, ukuran chart nyata, WebGL, performa GPU dan persistensi pada origin hosted belum diverifikasi. Status deploy diperiksa melalui Sites. Seluruh scheduling tetap simulasi browser dan berhenti ketika aplikasi ditutup.
