# CodingCamp-21August26-AnandaKennyEsqielBisaratua
Mini Project For Task RevoU Software Engineering
# Expense & Budget Visualizer

Aplikasi web pencatat pengeluaran harian. Pengguna dapat menambah transaksi, melihat total pengeluaran, membagi pengeluaran per kategori lewat pie chart, serta mengatur limit per kategori dengan peringatan otomatis saat terlampaui.

**Live demo:** https://malaukendui-a11y.github.io/CodingCamp-21September26-AnandaKennyEsqielBisaratua/

## Fitur

**Wajib (MVP)**
- Tambah transaksi (nama, jumlah, kategori) dengan validasi input
- Daftar transaksi yang bisa di-scroll, dengan opsi hapus per item
- Total saldo yang diperbarui otomatis
- Pie chart pengeluaran per kategori (Chart.js), diperbarui otomatis
- Data tersimpan di Local Storage (bertahan setelah refresh)

**Optional challenge**
- Urutkan transaksi berdasarkan jumlah atau kategori
- Tambah kategori kustom dengan warna otomatis
- Highlight otomatis (ikon + warna + teks) saat pengeluaran kategori melebihi limit yang ditentukan

## Teknologi

- HTML5, CSS3 (custom properties, Flexbox/Grid, mobile-first)
- JavaScript murni (ES6+), tanpa framework
- [Chart.js](https://www.chartjs.org/) v4 lewat CDN
- Local Storage API untuk persistensi data
- Dikembangkan dengan pendekatan spec-driven menggunakan Kiro — lihat folder `.kiro/specs/` untuk requirements, design, dan rencana implementasi

## Cara menjalankan

1. Buka [link live demo](https://malaukendui-a11y.github.io/CodingCamp-21September26-AnandaKennyEsqielBisaratua/), **atau**
2. Clone repo ini lalu buka `index.html` langsung di browser (tidak perlu server atau instalasi apa pun)

## Struktur proyek

\```
├── index.html
├── css/
│   └── style.css
├── js/
│   └── app.js
└── .kiro/
    └── specs/
\```

## Catatan pengembangan

- Limit kategori dihitung dari total keseluruhan transaksi kategori tersebut (tanpa periode bulanan), karena data transaksi pada MVP ini tidak menyimpan tanggal untuk keperluan filter waktu.
- Nama kategori bersifat case-sensitive ("Food" dan "food" dianggap kategori berbeda).

## Penulis

Ananda Kenny Esqiel Bisaratua — Coding Camp Software Engineering
