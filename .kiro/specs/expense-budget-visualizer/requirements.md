# Requirements Document

## Introduction

Expense & Budget Visualizer adalah aplikasi web *mobile-friendly* untuk mencatat pengeluaran harian secara cepat dan mudah. Pengguna dapat melihat total pengeluaran, riwayat transaksi, dan grafik distribusi pengeluaran per kategori secara langsung. Aplikasi dibangun dengan HTML, CSS, dan JavaScript murni (tanpa framework), menyimpan seluruh data di Local Storage browser, dan dipublikasikan melalui GitHub Pages.

**Sasaran pengguna:** Mahasiswa atau pekerja muda yang mencatat pengeluaran harian lewat perangkat mobile.

**Ukuran keberhasilan:** Pengguna dapat menjawab "berapa total pengeluaranku dan kategori mana yang terbesar?" hanya dengan membuka halaman aplikasi, tanpa perlu login, instalasi, atau kalkulasi manual.

---

## Glossary

- **Aplikasi**: Aplikasi web Expense & Budget Visualizer yang dijalankan di browser.
- **Form**: Komponen antarmuka berisi field Item Name, Amount, dan Category untuk menambah transaksi.
- **Transaksi**: Satu catatan pengeluaran yang terdiri dari nama item, jumlah (amount) dalam Rupiah, dan kategori.
- **Daftar Transaksi**: Komponen antarmuka yang menampilkan seluruh transaksi yang telah dicatat.
- **Total Balance**: Jumlah keseluruhan amount dari semua transaksi yang tercatat, ditampilkan dalam format Rupiah.
- **Chart**: Grafik pie (kue) yang menampilkan distribusi pengeluaran per kategori menggunakan Chart.js.
- **Kategori**: Pengelompokan transaksi berdasarkan jenis pengeluaran (misal: Food, Transport, Fun).
- **Kategori Bawaan**: Tiga kategori tetap yang selalu tersedia: Food, Transport, dan Fun; tidak dapat dihapus.
- **Kategori Kustom**: Kategori tambahan yang dibuat sendiri oleh pengguna.
- **Local Storage**: Web Storage API bawaan browser yang menyimpan data di sisi klien tanpa backend.
- **Limit**: Batas jumlah pengeluaran (bilangan bulat > 0) yang dapat ditetapkan pengguna untuk setiap kategori.
- **Over Limit**: Kondisi ketika total amount sebuah kategori **lebih besar dari** nilai limit yang ditetapkan (tepat sama dengan limit belum dianggap melebihi).
- **Format Rupiah**: Format angka menggunakan locale `id-ID`, contoh: Rp 15.000.
- **Sort**: Pengurutan tampilan Daftar Transaksi berdasarkan kriteria tertentu tanpa mengubah data tersimpan.

---

## Requirements

### Persyaratan 1: Input Form

**User Story:** Sebagai pengguna, saya ingin mengisi form untuk menambahkan pengeluaran baru, agar pengeluaran saya tercatat dengan cepat tanpa harus menavigasi ke halaman lain.

#### Kriteria Penerimaan

1. WHEN halaman dimuat, THE Aplikasi SHALL menampilkan Form dengan tiga field: Item Name (teks), Amount (angka), dan Category (dropdown), di mana dropdown Category berisi pilihan Food, Transport, Fun, dan semua Kategori Kustom yang tersimpan di Local Storage.

2. WHEN pengguna menekan tombol "Add" dengan kondisi Item Name terisi (bukan hanya spasi) dengan panjang maksimal 100 karakter, Amount merupakan bilangan bulat antara 1 sampai 999.999.999, dan Category telah dipilih, THE Aplikasi SHALL menambahkan Transaksi baru ke Daftar Transaksi, mengosongkan semua field Form, menyimpan Transaksi tersebut ke Local Storage, serta memperbarui Total Balance dan Chart dalam waktu kurang dari 1 detik tanpa memuat ulang halaman.

3. IF pengguna menekan tombol "Add" dan satu atau lebih field tidak valid (Item Name kosong, hanya spasi, atau melebihi 100 karakter; Amount bukan bilangan bulat antara 1 sampai 999.999.999; atau Category belum dipilih), THEN THE Aplikasi SHALL membatalkan penambahan Transaksi, menampilkan pesan error di bawah setiap field yang tidak valid yang mengindikasikan alasan kegagalan validasi field tersebut, dan tidak mengubah Daftar Transaksi, Total Balance, maupun data di Local Storage.

---

### Persyaratan 2: Daftar Transaksi

**User Story:** Sebagai pengguna, saya ingin melihat seluruh riwayat transaksi dalam satu daftar, agar saya dapat memantau pengeluaran saya dan menghapus catatan yang salah.

#### Kriteria Penerimaan

1. WHEN Daftar Transaksi berisi satu atau lebih Transaksi, THE Aplikasi SHALL menampilkan setiap Transaksi dengan nama item, amount dalam format "Rp" diikuti angka dengan titik sebagai pemisah ribuan (contoh: Rp 15.000), dan nama kategori; serta menyediakan tombol "Delete" pada setiap baris Transaksi; dalam kontainer dengan tinggi maksimum tetap yang dapat di-scroll secara vertikal apabila jumlah baris melebihi tinggi kontainer tersebut.

2. WHEN pengguna menekan tombol "Delete" pada sebuah Transaksi, THE Aplikasi SHALL menghapus hanya Transaksi tersebut dari Daftar Transaksi dan dari Local Storage, serta memperbarui Total Balance dan Chart dalam waktu kurang dari 300ms tanpa memuat ulang halaman.

3. WHEN Daftar Transaksi tidak berisi Transaksi (belum ada yang ditambahkan atau semua telah dihapus), THE Aplikasi SHALL menampilkan pesan teks statis yang menyatakan bahwa belum ada transaksi yang dicatat, di dalam area Daftar Transaksi, tanpa menampilkan error di console browser.

4. WHEN Transaksi baru berhasil ditambahkan, THE Aplikasi SHALL menampilkan Transaksi tersebut pada posisi teratas Daftar Transaksi (urutan terbaru di atas) apabila tidak ada opsi Sort yang sedang aktif.

---

### Persyaratan 3: Total Balance

**User Story:** Sebagai pengguna, saya ingin melihat total keseluruhan pengeluaran saya di bagian paling atas halaman, agar saya langsung mengetahui berapa yang telah saya keluarkan.

#### Kriteria Penerimaan

1. WHEN halaman dimuat, THE Aplikasi SHALL menampilkan Total Balance dalam format "Rp" diikuti angka dengan titik sebagai pemisah ribuan (contoh: Rp 150.000) di bagian paling atas halaman, dihitung dari penjumlahan seluruh nilai amount Transaksi yang tersimpan di Local Storage.

2. WHEN Transaksi ditambahkan atau dihapus, THE Aplikasi SHALL memperbarui nilai Total Balance dalam waktu kurang dari 500ms tanpa memuat ulang halaman.

3. WHEN tidak ada Transaksi yang tersimpan di Local Storage, THE Aplikasi SHALL menampilkan Total Balance sebagai "Rp 0" dan tidak menampilkan nilai kosong, NaN, atau undefined.

4. IF data Transaksi di Local Storage tidak dapat di-parse (rusak atau format tidak dikenali), THEN THE Aplikasi SHALL mengabaikan data yang rusak tersebut dan menampilkan Total Balance sebagai "Rp 0" tanpa menampilkan pesan error kepada pengguna dan tanpa crash.

---

### Persyaratan 4: Visual Chart

**User Story:** Sebagai pengguna, saya ingin melihat grafik distribusi pengeluaran per kategori, agar saya dapat mengetahui kategori mana yang paling banyak menghabiskan uang saya secara visual.

#### Kriteria Penerimaan

1. WHEN Daftar Transaksi berisi satu atau lebih Transaksi, THE Aplikasi SHALL menampilkan Chart berupa pie chart di mana setiap slice merepresentasikan satu kategori yang memiliki minimal satu Transaksi, ukuran setiap slice proporsional terhadap total amount Transaksi dalam kategori tersebut dibandingkan total amount seluruh Transaksi, dan setiap slice memiliki warna yang berbeda dengan label kategori yang ditampilkan pada legend.

2. WHEN Transaksi ditambahkan atau dihapus, THE Aplikasi SHALL menghancurkan instance Chart yang ada, kemudian merender ulang Chart baru berdasarkan data terkini dalam waktu kurang dari 1 detik tanpa memuat ulang halaman, sehingga tidak ada instance Chart lama yang menumpuk di DOM.

3. WHEN tidak ada Transaksi yang tersimpan, THE Aplikasi SHALL menyembunyikan atau tidak merender elemen canvas Chart dan menampilkan pesan teks informatif di area Chart (misalnya "Belum ada data untuk ditampilkan"), tanpa menampilkan error di console browser.

4. THE Aplikasi SHALL menggunakan Chart.js yang dimuat melalui CDN untuk merender Chart, tanpa library grafik lain.

---

### Persyaratan 5: Persistensi dan Kompatibilitas

**User Story:** Sebagai pengguna, saya ingin data pengeluaran saya tetap tersimpan setelah menutup atau me-refresh browser, agar saya tidak kehilangan catatan yang sudah dibuat.

#### Kriteria Penerimaan

1. WHEN halaman di-refresh atau dibuka kembali oleh pengguna, THE Aplikasi SHALL membaca data Transaksi dan data Kategori dari Local Storage dan merender Daftar Transaksi, Total Balance, dan Chart sesuai data tersebut tanpa meminta pengguna memasukkan data ulang.

2. IF data di Local Storage kosong atau tidak dapat di-parse (rusak atau format tidak dikenali), THEN THE Aplikasi SHALL menampilkan antarmuka dalam kondisi awal yang bersih — yaitu Daftar Transaksi kosong, Total Balance "Rp 0", dropdown Category berisi hanya Food, Transport, dan Fun, dan area Chart menampilkan pesan kosong — tanpa melempar JavaScript exception yang tidak tertangani dan tanpa komponen yang gagal merender.

3. WHEN halaman dibuka pada lebar layar 360px, THE Aplikasi SHALL menampilkan semua komponen (Form, Daftar Transaksi, Total Balance, Chart) dalam tata letak vertikal yang dapat di-scroll secara vertikal, tanpa menghasilkan scroll horizontal pada halaman.

4. WHEN pengguna menambahkan Transaksi baru, THE Aplikasi SHALL menyimpan seluruh daftar Transaksi sebagai satu entri JSON di Local Storage dengan kunci tetap, dan daftar Kategori (termasuk Kategori Kustom) sebagai entri JSON terpisah di Local Storage dengan kunci tetap yang berbeda, di mana setiap objek Transaksi menyimpan nama kategorinya sebagai nilai string.

5. THE Aplikasi SHALL berjalan tanpa JavaScript exception yang tidak tertangani dan tanpa komponen yang gagal merender pada browser Chrome, Firefox, Edge, dan Safari yang versinya dirilis dalam 12 bulan terakhir pada saat pengujian.

---

### Persyaratan 6: Kategori Kustom

**User Story:** Sebagai pengguna, saya ingin menambahkan kategori pengeluaran sendiri selain yang sudah tersedia, agar pencatatan saya lebih sesuai dengan kebiasaan belanja saya.

#### Kriteria Penerimaan

1. WHEN pengguna mengirimkan nama Kategori Kustom yang valid — yaitu string yang setelah spasi di awal dan akhir dibuang (trim) menghasilkan panjang antara 1 sampai 50 karakter, dan string tersebut tidak identik secara case-sensitive dengan nama kategori mana pun yang sudah ada dalam daftar Kategori — THE Aplikasi SHALL menambahkan kategori baru ke daftar Kategori di Local Storage, menambahkan opsi baru ke dropdown Category pada Form, dan menetapkan satu warna unik pada kategori baru tersebut yang berbeda dari warna semua kategori yang sudah ada.

2. IF pengguna mengirimkan nama Kategori Kustom yang tidak valid — yaitu string yang setelah trim menghasilkan panjang nol, atau string tersebut identik secara case-sensitive dengan nama kategori yang sudah ada — THEN THE Aplikasi SHALL menolak penambahan, menampilkan pesan error yang menyebutkan alasan penolakan (kosong atau sudah ada), dan tidak mengubah daftar Kategori di Local Storage maupun opsi pada dropdown Category.

3. WHEN Transaksi menggunakan Kategori Kustom, THE Aplikasi SHALL menampilkan Transaksi tersebut di Chart dengan label yang sesuai nama Kategori Kustom dan warna slice yang sama dengan warna yang ditetapkan pada Kategori Kustom tersebut.

4. WHEN halaman di-refresh setelah Kategori Kustom ditambahkan, THE Aplikasi SHALL memuat kembali Kategori Kustom tersebut beserta warnanya dari Local Storage sehingga Kategori Kustom tetap tersedia di dropdown Category dan warnanya konsisten.

5. THE Aplikasi SHALL selalu menyediakan Kategori Bawaan Food, Transport, dan Fun dalam dropdown Category, dan tidak menyediakan tombol, menu, atau mekanisme lain untuk menghapus ketiga kategori tersebut.

6. WHEN Kategori Kustom ditambahkan, THE Aplikasi SHALL menetapkan warna menggunakan palet warna berurutan yang telah didefinisikan terlebih dahulu; apabila palet habis, THE Aplikasi SHALL menggunakan rumus hue dengan langkah sebesar 137,5 derajat dikalikan indeks Kategori Kustom ke-N yang melebihi panjang palet, dan menyimpan nilai warna tersebut bersama data kategori di Local Storage pada saat penambahan.

---

### Persyaratan 7: Highlight Over Limit

**User Story:** Sebagai pengguna, saya ingin menetapkan batas pengeluaran per kategori dan mendapatkan peringatan visual saat batas tersebut terlampaui, agar saya bisa mengendalikan pengeluaran di kategori tertentu.

#### Kriteria Penerimaan

1. WHEN pengguna menyimpan nilai Limit berupa bilangan bulat antara 1 sampai 999.999.999 untuk sebuah kategori, THE Aplikasi SHALL menyimpan nilai Limit tersebut bersama data kategori di Local Storage dan menerapkannya segera pada kondisi Over Limit kategori tersebut tanpa memuat ulang halaman.

2. WHEN pengguna mengosongkan nilai Limit pada sebuah kategori (menghapus input atau menggantinya dengan string kosong), THE Aplikasi SHALL menghapus nilai Limit kategori tersebut dari Local Storage sehingga kategori dianggap tidak memiliki batas dan penanda peringatan dihapus segera tanpa memuat ulang halaman.

3. IF pengguna memasukkan nilai Limit yang tidak valid (nol, bilangan negatif, bilangan desimal, atau bukan angka), THEN THE Aplikasi SHALL menolak penyimpanan, menampilkan pesan error yang menjelaskan bahwa Limit harus berupa bilangan bulat antara 1 sampai 999.999.999, dan tidak mengubah nilai Limit yang tersimpan di Local Storage.

4. WHEN total amount Transaksi pada sebuah kategori lebih besar dari Limit kategori tersebut (strictly greater than, bukan sama dengan), THE Aplikasi SHALL menampilkan ikon peringatan, warna peringatan, dan teks "Melebihi limit" pada baris kategori tersebut serta pada setiap baris Transaksi yang termasuk kategori tersebut, tampil langsung tanpa memuat ulang halaman.

5. WHEN Transaksi ditambahkan pada sebuah kategori sehingga total amount kategori tersebut menjadi lebih besar dari Limit-nya, THE Aplikasi SHALL menampilkan penanda peringatan (ikon, warna, teks "Melebihi limit") pada kategori dan seluruh Transaksi dalam kategori tersebut dalam waktu kurang dari 500ms tanpa memuat ulang halaman.

6. WHEN Transaksi dihapus dari sebuah kategori sehingga total amount kategori tersebut menjadi kurang dari atau sama dengan Limit-nya, THE Aplikasi SHALL menghapus penanda peringatan dari kategori dan seluruh Transaksi dalam kategori tersebut dalam waktu kurang dari 500ms tanpa memuat ulang halaman.

7. WHEN nilai Limit sebuah kategori diubah sehingga total amount kategori tersebut tidak lagi melebihi Limit baru, THE Aplikasi SHALL menghapus penanda peringatan dari kategori dan seluruh Transaksi dalam kategori tersebut dalam waktu kurang dari 500ms tanpa memuat ulang halaman.

8. WHEN dua Transaksi berbeda berada dalam kategori yang sama dan kategori tersebut berstatus Over Limit, THE Aplikasi SHALL menampilkan penanda peringatan pada kedua baris Transaksi tersebut.

---

### Persyaratan 8: Sort Daftar Transaksi

**User Story:** Sebagai pengguna, saya ingin mengurutkan daftar transaksi berdasarkan jumlah atau kategori, agar saya dapat menganalisis pola pengeluaran dengan lebih mudah.

#### Kriteria Penerimaan

1. WHEN pengguna memilih opsi urutan "Amount: Kecil ke Besar", THE Aplikasi SHALL menampilkan Daftar Transaksi diurutkan dari nilai amount terkecil ke terbesar tanpa mengubah urutan array Transaksi yang tersimpan di Local Storage.

2. WHEN pengguna memilih opsi urutan "Amount: Besar ke Kecil", THE Aplikasi SHALL menampilkan Daftar Transaksi diurutkan dari nilai amount terbesar ke terkecil tanpa mengubah urutan array Transaksi yang tersimpan di Local Storage.

3. WHEN pengguna memilih opsi urutan "Category: A sampai Z", THE Aplikasi SHALL menampilkan Daftar Transaksi diurutkan berdasarkan nama kategori secara alfabetis dari A ke Z (menggunakan perbandingan string standar JavaScript) tanpa mengubah urutan array Transaksi yang tersimpan di Local Storage.

4. WHEN Transaksi baru berhasil ditambahkan dan salah satu opsi Sort sedang aktif, THE Aplikasi SHALL memperbarui tampilan Daftar Transaksi dengan menyisipkan Transaksi baru tersebut pada posisi yang sesuai dengan opsi Sort yang aktif.

5. WHEN Transaksi dihapus dan salah satu opsi Sort sedang aktif, THE Aplikasi SHALL memperbarui tampilan Daftar Transaksi dengan menghapus baris Transaksi tersebut sambil mempertahankan urutan Sort yang aktif pada Transaksi yang tersisa.

6. WHEN dua Transaksi memiliki nilai yang sama pada kriteria Sort yang aktif (nilai amount identik untuk sort Amount, atau nama kategori identik untuk sort Category), THE Aplikasi SHALL menampilkan kedua Transaksi tersebut dalam urutan sesuai indeks mereka dalam array Local Storage (Transaksi yang tersimpan lebih awal di indeks lebih kecil tampil lebih dulu).

7. WHEN Daftar Transaksi kosong dan salah satu opsi Sort aktif, THE Aplikasi SHALL menampilkan pesan kosong yang sama seperti kondisi tanpa Sort (tidak ada error dan tidak ada baris Transaksi).

---

## Batasan Teknis

| Kode | Deskripsi |
|------|-----------|
| TC-1 | Aplikasi dibangun menggunakan HTML untuk struktur, CSS untuk styling, dan JavaScript murni tanpa framework (tanpa React, Vue, Angular, atau sejenisnya). |
| TC-2 | Seluruh penyimpanan data menggunakan Local Storage API; tidak ada backend, database eksternal, atau request ke server. |
| TC-3 | Aplikasi harus berjalan di browser modern: Chrome, Firefox, Edge, dan Safari versi terkini. |
| TC-4 | Struktur folder mengikuti satu file CSS di `css/` dan satu file JavaScript di `js/`. |
| TC-5 | Chart.js dimuat melalui CDN; tidak ada library grafik lain yang diizinkan. |
| TC-6 | Aplikasi dipublikasikan melalui GitHub Pages; folder `.kiro` wajib ada di repositori yang disubmit. |

## Persyaratan Non-Fungsional

| Kode | Deskripsi |
|------|-----------|
| NFR-1 | Antarmuka bersih dan minimal; dapat digunakan tanpa panduan, tanpa konfigurasi awal, dan tanpa akun. |
| NFR-2 | Setiap pembaruan Total Balance, Daftar Transaksi, dan Chart terjadi secara langsung tanpa lag yang terasa setelah aksi pengguna. |
| NFR-3 | Antarmuka memiliki hierarki visual yang jelas dengan tipografi yang terbaca pada layar mobile. |

## Di Luar Ruang Lingkup

Fitur-fitur berikut secara eksplisit **tidak** dikerjakan dalam versi ini:
- Ringkasan bulanan (monthly summary)
- Toggling tema gelap/terang
- Backend, database, atau autentikasi
- Test framework atau automated testing
- Edit atau hapus Kategori Kustom
