# SPK SNBP
Prototipe UTS penentuan siswa eligible SNBP menggunakan Next.js. Halaman memakai data simulasi SMA Negeri Semarang.

## Menjalankan
Gunakan Node.js 22 LTS atau lebih baru. Dari folder yang berisi package.json, jalankan `npm ci` lalu `npm run dev`. Buka http://localhost:3000 dan masuk dengan username `admin` dan kata sandi `snbp2026`.

## Skenario demo
1. Periksa dashboard. Ada 12 siswa, 10 nilai lengkap, dan 4 siswa masuk kuota.
2. Buka Proses Seleksi lalu klik Hitung SAW. Lihat Detail untuk meninjau normalisasi dan bobot.
3. Masuk sebagai Guru BK, buka Hasil Seleksi, verifikasi satu siswa, lalu buka Laporan dan ekspor hasil.
4. Ubah nilai di Data Siswa atau ubah bobot di pengaturan. Hasil lama dibersihkan sampai perhitungan dijalankan kembali.
5. Untuk impor, gunakan header dari ekspor Data Siswa, isi baris siswa baru, dan simpan NISN sebagai teks 10 digit.

## Asumsi simulasi
Semua kriteria bertipe benefit dengan bobot awal rapor 50%, mapel pendukung 30%, dan skor peringkat kelas 20%. Skor peringkat kelas masuk sebagai skor 0–100 (semakin tinggi semakin baik). SAW membagi nilai dengan maksimum tiap kriteria dari siswa lengkap. Jika maksimum nol, kontribusi kriteria nol. Skor akhir merupakan jumlah nilai ternormalisasi dikalikan bobot persentase. Kuota dibulatkan ke bawah dari jumlah siswa dengan nilai lengkap. Jika skor sama, NISN lebih kecil didahulukan. Setiap periode menyimpan simulasi tersendiri.

Data tersimpan pada peramban setempat. Akun dan verifikasi hanya untuk demonstrasi. Gunakan data fiktif. Untuk membangun versi statis, jalankan `npm run build`; hasil ada di folder out.

## Modul revisi UTS
Akun contoh menggunakan kata sandi awal yang sama. Admin (admin) mengelola siswa, nilai, periode, kriteria, rentang parameter, bobot dan kuota, kemudian menghitung SAW. Guru BK (gurubk) melihat hasil di sekolahnya, memverifikasi per siswa, lalu menetapkan status akhir sesuai rekomendasi kuota. Super Admin (superadmin) membuat sekolah, memperbarui logo dan status sekolah, serta mendaftarkan Admin dan Guru BK untuk sekolah tertentu.

Setiap sekolah mempunyai satu periode aktif. Periode yang baru dibuat mempunyai daftar siswa kosong. Mengaktifkan kembali periode sebelumnya memulihkan nilai, konfigurasi, hasil, dan status verifikasinya. Perubahan data seleksi membatalkan hasil periode terkait sampai Admin menghitung ulang. NISN ditampilkan sebelum nama dan disimpan sebagai teks agar nol di depan tetap utuh.

Konversi bersifat opsional dan menggunakan rentang inklusif. Nilai yang tidak cocok dengan parameter dikeluarkan dari perhitungan. Kriteria benefit menggunakan nilai dibagi maksimum. Kriteria cost menggunakan minimum dibagi nilai. Jika minimum cost nol, nilai nol mendapat normalisasi 1 dan nilai positif mendapat 0. Pada layar kecil, tabel hasil berubah menjadi kartu berlabel.

Penyimpanan dan akun merupakan simulasi lokal pada satu peramban. Gunakan peramban yang sama dan keluar sebelum berganti peran.

## Identitas sekolah saat login
Halaman masuk menyediakan satu formulir kosong untuk semua peran. Setelah masuk, nama sekolah di navigasi mengikuti sekolah yang ditetapkan pada akun. Super Admin dapat mengunggah logo PNG, JPEG, atau WebP berukuran hingga 10 MB melalui menu Sekolah. Logo disimpan dalam ukuran tampilan hingga 256 piksel. Logo tampil di samping nama dan foto tampil di bagian bawah navigasi. Jika hanya foto yang tersedia, foto juga digunakan sebagai identitas di samping nama. Sekolah yang belum mengunggah gambar memakai inisial. Akun Super Admin menampilkan identitas pengelolaan lintas sekolah.
