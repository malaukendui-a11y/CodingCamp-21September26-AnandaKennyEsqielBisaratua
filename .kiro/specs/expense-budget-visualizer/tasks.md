# Implementation Plan: Expense & Budget Visualizer

## Overview

Implementasi aplikasi web *mobile-first* berbasis HTML + CSS + JavaScript murni. Tiga file sumber sudah ada sebagai file kosong (`index.html`, `css/style.css`, `js/app.js`). Pendekatan: isi HTML terlebih dahulu, lalu CSS, lalu JS section per section sesuai urutan bagian kode yang didefinisikan di desain.

## Tasks

- [ ] 1. Bangun struktur HTML dan muat dependensi
  - [ ] 1.1 Tulis markup semantik lengkap di `index.html`
    - Tambahkan `<meta charset>`, `<meta name="viewport">`, `<link>` ke CSS
    - Muat Chart.js dari jsDelivr CDN dengan atribut `defer` sebelum tag `<script>` JS
    - Muat `js/index.js` dengan atribut `defer`
    - Tulis semua elemen HTML sesuai desain: `<header>`, `#total`, `#transaction-form`, `#transactions`, `#chart`, `#categories`, `#storage-warning`
    - Pastikan setiap `<input>` dan `<select>` punya `<label>` terhubung via `for`/`id`
    - Tambahkan atribut aksesibilitas: `aria-live="polite"` pada `#total-value`, `role="status"` pada `#storage-warning`, `aria-describedby` pada setiap field ke elemen pesan error-nya
    - Input Amount pakai `type="text" inputmode="numeric"`
    - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.3_

- [ ] 2. Tulis CSS — design tokens, layout, dan komponen
  - [ ] 2.1 Definisikan design tokens dan gaya dasar di `css/style.css`
    - Tulis semua CSS custom properties (`--color-bg`, `--color-surface`, `--color-border`, dll.) di `:root`
    - Set `font-family: system-ui, -apple-system, sans-serif`; tidak ada font eksternal
    - Terapkan reset box-sizing dan margin/padding dasar
    - _Requirements: 5.3, NFR-3_
  - [ ] 2.2 Implementasikan layout mobile-first dan responsif
    - Semua seksi ditumpuk vertikal secara default (mobile)
    - Tambahkan media query `@media (min-width: 768px)`: `#transactions` dan `#chart` tampil dua kolom dengan `display: grid; grid-template-columns: 1fr 1fr`
    - Container maksimum 1000px, `margin: 0 auto`
    - `#transaction-list`: `max-height: 360px; overflow-y: auto`
    - Pastikan tidak ada scroll horizontal pada lebar 360px: `min-width: 0`, `overflow-wrap: anywhere` pada nama item
    - _Requirements: 5.3, NFR-3_
  - [ ] 2.3 Gaya form, tombol, dan pesan error
    - Gaya `#transaction-form` dan `#category-form`: label, input, select, tombol submit
    - Input font-size ≥ 16px untuk mencegah auto-zoom di iOS Safari
    - Elemen `.field-error` tampil merah (`--color-danger`) saat ada konten
    - `[aria-invalid="true"]` dapat border berwarna `--color-danger`
    - Outline fokus selalu terlihat, minimal 2px, warna `--color-accent`
    - _Requirements: 1.3, 6.2, 7.3_
  - [ ] 2.4 Gaya daftar transaksi, limit rows, dan penanda over-limit
    - Gaya `#transaction-list` item: nama, amount, kategori, tombol Delete
    - Gaya `#limit-list` rows: label kategori, input limit, area penanda
    - Kelas penanda over-limit (misal `.over-limit`): warna `--color-danger`, background `--color-danger-bg`
    - Ikon peringatan `aria-hidden="true"`, teks "Melebihi limit" tampil paralel dengan warna
    - _Requirements: 2.1, 7.4_
  - [ ] 2.5 Gaya chart area dan storage warning
    - `.chart-wrap` responsif, canvas mengisi lebar kontainernya
    - `#chart-empty` tampil terpusat saat canvas disembunyikan
    - `#storage-warning` gaya banner peringatan, tersembunyi secara default (`hidden`)
    - _Requirements: 4.1, 4.3, 5.2_

- [ ] 3. Checkpoint — HTML dan CSS
  - Buka `index.htmloject` di browser, pastikan semua seksi terlihat dengan layout yang benar di lebar 360px dan 768px. Tanya pengguna jika ada pertanyaan sebelum lanjut.

- [ ] 4. JS Bagian 1–3: Konstanta, State, dan Storage
  - [ ] 4.1 Tulis Bagian 1 (Konstanta) dan Bagian 2 (State) di `js/app.js`
    - Tambahkan komentar seksi `// ─── 1 KONSTANTA` dan `// ─── 2 STATE`
    - Definisikan `STORAGE_KEY`, `MAX_AMOUNT`, `NAME_MAX`, `CATEGORY_MAX`, `DEFAULT_CATEGORIES`, `PALETTE`
    - Definisikan objek `state` dengan properti `transactions`, `categories`, `sortMode`
    - `sortMode` default ke `'default'`; tidak pernah disimpan ke Local Storage
    - _Requirements: 5.1, 5.4_
  - [ ] 4.2 Tulis Bagian 3 (Storage): `loadState`, `sanitizeData`, `saveState`
    - Tambahkan komentar seksi `// ─── 3 STORAGE`
    - `loadState()`: bungkus `localStorage.getItem` dalam `try/catch`; pada error panggil `showStorageWarning()` dan kembalikan default
    - `sanitizeData(raw)`: filter `Transaction` dan `Category` yang tidak valid (field hilang / tipe salah), `console.warn` untuk item yang dibuang, pastikan tiga kategori default selalu ada, hapus duplikat nama kategori dengan pertahankan yang pertama
    - `saveState()`: bungkus `localStorage.setItem` dalam `try/catch`; pada error panggil `showStorageWarning()` dan kembalikan `false`; simpan `{ version: 1, transactions, categories }` ke kunci `ebv:v1`
    - `sortMode` tidak disimpan
    - _Requirements: 3.4, 5.1, 5.2, 5.4_

- [ ] 5. JS Bagian 4–5: Validasi dan Data Turunan
  - [ ] 5.1 Tulis Bagian 4 (Validasi)
    - Tambahkan komentar seksi `// ─── 4 VALIDASI`
    - `parseAmount(text)`: kembalikan `{ok, value?, error?}`; tangani kosong, non-angka, ≤ 0, desimal, > MAX_AMOUNT
    - `validateTransaction(input, categories)`: validasi ketiga field (nama, amount, kategori); kembalikan `{ok, values?, errors?}` di mana `errors` adalah map `fieldId → pesan`
    - `validateCategoryName(text, categories)`: trim, cek panjang 0, cek > CATEGORY_MAX, cek duplikat case-sensitive; kembalikan `{ok, name?, error?}`
    - `parseLimit(text)`: string kosong → `{ok: true, value: null}`; integer 1–MAX_AMOUNT → valid; selainnya → error
    - _Requirements: 1.2, 1.3, 6.1, 6.2, 7.1, 7.2, 7.3_
  - [ ] 5.2 Tulis Bagian 5 (Data Turunan)
    - Tambahkan komentar seksi `// ─── 5 DATA TURUNAN`
    - `formatRupiah(n)`: gunakan `Intl.NumberFormat('id-ID', {style:'currency', currency:'IDR', minimumFractionDigits:0})`
    - `generateId()`: `Date.now().toString(36) + '_' + Math.random().toString(36).slice(2,6)`
    - `calcTotal(transactions)`: `reduce` jumlahkan `amount`; kembalikan `0` untuk array kosong
    - `calcTotalsByCategory(transactions, categories)`: kembalikan `Record<string, number>` (total per nama kategori)
    - `isOverLimit(category, totals)`: `category.limit !== null && totals[category.name] > category.limit` (strictly greater than)
    - `getSortedTransactions(transactions, mode)`: buat salinan `[...transactions]`; sort sesuai mode; kembalikan salinan; jangan mutasi `state.transactions`
    - _Requirements: 3.1, 3.3, 7.4, 8.1, 8.2, 8.3, 8.6_


- [ ] 6. JS Bagian 6 Render — Subfungsi inti
  - [ ] 6.1 Implementasikan `renderTotal` dan `renderCategoryOptions`
    - Pertahankan pilihan yang sedang aktif.
    - Tambahkan komentar seksi `// ─── 6 RENDER`
    - `renderTotal(total)`: set `#total-value.textContent = formatRupiah(total)`
    - `renderCategoryOptions()`: rebuild `<option>` di dropdown `#transaction-form select[name="category"]` menggunakan `new Option(cat.name, cat.name)`; tambahkan opsi placeholder kosong di posisi pertama
    - _Requirements: 1.1, 3.1, 3.2, 3.3_
  - [ ] 6.2 Implementasikan `renderTransactionList`
    - `renderTransactionList(list, totals, categories)`: jika `list.length === 0`, tampilkan `#list-empty` dan kosongkan `#transaction-list`; selainnya sembunyikan `#list-empty`
    - Bangun `<li>` untuk setiap transaksi: nama via `.textContent`, amount via `formatRupiah`, nama kategori; tombol Delete dengan `data-id` dan `aria-label="Hapus {nama}"`
    - Tandai over-limit pada baris transaksi: tambahkan kelas CSS dan teks "Melebihi limit" (dengan ikon `aria-hidden="true"`) jika kategori transaksi tersebut over-limit berdasarkan `totals` dan `categories`
    - Gunakan `ul.replaceChildren(...liNodes)` — tidak pernah `innerHTML +=` dalam loop
    - Semua teks dari data pengguna via `.textContent`, tidak pernah `.innerHTML` dengan data pengguna
    - _Requirements: 2.1, 2.3, 7.4, 7.8_
  - [ ] 6.3 Implementasikan `renderChart`
    - Gunakan variabel module-level `let chartInstance = null`
    - Jika `transactions.length === 0`: hancurkan instance yang ada (`chartInstance.destroy()`), set ke `null`, sembunyikan canvas, tampilkan `#chart-empty`
    - Jika ada transaksi: sembunyikan `#chart-empty`, tampilkan canvas; jika `chartInstance === null` buat `new Chart(ctx, config)`, jika tidak panggil `chartInstance.data = …; chartInstance.update()`
    - Config Chart.js: tipe `'pie'`, label dari nama kategori, data dari `totals`, backgroundColor dari `category.color`
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  - [ ] 6.4 Implementasikan `buildLimitRows` dan `updateLimitStatus`
    - `buildLimitRows()`: rebuild seluruh `#limit-list` dengan satu `<li>` per kategori; setiap `<li>` berisi label nama, `<input type="text">` untuk limit dengan `data-category`, dan area penanda over-limit
    - `updateLimitStatus(totals)`: **hanya perbarui teks dan kelas** pada `<li>` yang sudah ada — tidak rebuild ulang list; ini mencegah kehilangan fokus keyboard
    - Tambahkan kelas over-limit dan teks "Melebihi limit" jika `isOverLimit(cat, totals)` bernilai true; hapus jika false
    - _Requirements: 7.1, 7.2, 7.4, 7.5, 7.6, 7.7_
  - [ ] 6.5 Implementasikan fungsi helper render: `showFieldError`, `clearErrors`, `showStorageWarning`
    - `showFieldError(inputId, msg)`: `input.setAttribute('aria-invalid','true')`, set `textContent` elemen error yang berelasi
    - `clearErrors(form)`: hapus semua `aria-invalid`, kosongkan semua `.field-error`
    - `showStorageWarning()`: hapus atribut `hidden` dari `#storage-warning`
    - _Requirements: 1.3, 5.2, 6.2, 7.3_
  - [ ] 6.6 Implementasikan fungsi `render()` utama dan fungsi mutasi state
    - `render()`: hitung `sorted`, `total`, `totals` sekali, kemudian panggil semua subfungsi render secara berurutan
    - `addTransaction(values)`: buat objek `Transaction` dengan `generateId()` dan `Date.now()`; `state.transactions.push(newTx)` (terbaru di atas); kembalikan transaksi baru
    - `deleteTransaction(id)`: filter `state.transactions` untuk hapus berdasarkan id
    - `addCategory(name)`: buat objek `Category` dengan `pickCategoryColor(state.categories)`; push ke `state.categories`
    - `pickCategoryColor(categories)`: coba warna dari `PALETTE`, jika habis gunakan rumus golden-angle hue
    - `setCategoryLimit(name, limit)`: temukan kategori by name, set `category.limit = limit`
    - `setSortMode(mode)`: set `state.sortMode = mode`
    - _Requirements: 1.2, 2.2, 3.2, 6.1, 7.1, 7.2_

- [ ] 7. Checkpoint — Logika inti JS
  - Buka `index.html` di browser: pastikan halaman tampil tanpa error console, total "Rp 0" muncul di atas, chart-empty tampil, list-empty tampil. Tanya pengguna jika ada pertanyaan sebelum lanjut.


- [ ] 8. JS Bagian 7: Event Handlers
  - [ ] 8.1 Implementasikan `handleTransactionSubmit`
    - Tambahkan reset form sebelum fokus ke Item Name 
    - Tambahkan komentar seksi `// ─── 7 EVENT HANDLER`
    - Panggil `e.preventDefault()`, kemudian `clearErrors(form)`
    - Panggil `validateTransaction(input, state.categories)`; jika tidak valid, panggil `showFieldError` untuk setiap field yang error dan return
    - Jika valid: `addTransaction(values)` → `saveState()` → `render()` → fokus kembali ke input Item Name
    - _Requirements: 1.2, 1.3_
  - [ ] 8.2 Implementasikan `handleListClick` (event delegation untuk Delete)
    - Pasang listener pada `#transaction-list`; cek `e.target.closest('[data-id]')`
    - `deleteTransaction(id)` → `saveState()` → `render()`
    - _Requirements: 2.2_
  - [ ] 8.3 Implementasikan `handleCategorySubmit`
    - Panggil `e.preventDefault()`, kemudian `clearErrors(categoryForm)`
    - Panggil `validateCategoryName(text, state.categories)`; jika tidak valid panggil `showFieldError` dan return
    - Jika valid: `addCategory(name)` → `saveState()` → `buildLimitRows()` → `render()` → kosongkan field input
    - `buildLimitRows()` dipanggil di sini (bukan di dalam `render()`) agar tidak rebuild list setiap render
    - _Requirements: 6.1, 6.2, 6.6_
  - [ ] 8.4 Implementasikan `handleLimitChange`
    - Pasang listener pada `#limit-list` (event delegation via `data-category`)
    - Panggil `parseLimit(input.value)`; jika error tampilkan pesan error inline pada baris limit yang bersangkutan dan return
    - Jika valid: `setCategoryLimit(name, value)` → `saveState()` → `updateLimitStatus(totals)`
    - Hitung `totals` fresh dari state sebelum memanggil `updateLimitStatus`
    - _Requirements: 7.1, 7.2, 7.3, 7.7_
  - [ ] 8.5 Implementasikan `handleSortChange`
    - Pasang listener pada `#sort-select`
    - `setSortMode(e.target.value)` → `render()`
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 9. JS Bagian 8: Init — sambungkan semua bagian
  - [ ] 9.1 Tulis fungsi `init()` dan panggil di akhir file
    - Tambahkan komentar seksi `// ─── 8 INIT`
    - `loadState()` → salin hasil ke `state.transactions` dan `state.categories`
    - `buildLimitRows()` — dipanggil sekali di init
    - `render()` — render awal dari state yang dimuat
    - Pasang semua event listener: `#transaction-form` submit, `#transaction-list` click, `#category-form` submit, `#limit-list` change (event delegation), `#sort-select` change
    - Panggil `init()` di baris terakhir file
    - _Requirements: 1.1, 5.1, 5.2_

- [ ] 10. Checkpoint akhir — Integrasi dan validasi manual
  - Pastikan semua alur fungsional bekerja: tambah transaksi, hapus, chart update, kategori kustom, limit dan over-limit highlight, sort, persistensi setelah refresh. Tanya pengguna jika ada pertanyaan.


## Notes

- Tidak ada test framework — pengujian dilakukan secara manual menggunakan checklist di `design.md` (Testing Strategy)
- Sub-task bertanda `*` adalah opsional dan dapat dilewati untuk MVP lebih cepat
- Setiap task mereferensikan requirement spesifik untuk keterlacakan
- `buildLimitRows()` **hanya** dipanggil di `init()` dan `handleCategorySubmit()`, tidak di dalam `render()`, agar fokus keyboard tidak hilang saat pengguna mengetik nilai limit
- Chart.js harus dimuat dengan `defer` sebelum `js/app.js` di HTML agar `Chart` tersedia saat `init()` berjalan
- Semua data pengguna masuk ke DOM hanya via `.textContent` atau `new Option()` — tidak pernah `.innerHTML` dengan data pengguna (XSS prevention)
- `getSortedTransactions` selalu bekerja pada salinan array `[...transactions]`, tidak pernah memutasi `state.transactions`

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["2.1"] },
    { "id": 2, "tasks": ["2.2", "2.3"] },
    { "id": 3, "tasks": ["2.4", "2.5", "4.1"] },
    { "id": 4, "tasks": ["4.2", "5.1"] },
    { "id": 5, "tasks": ["5.2"] },
    { "id": 6, "tasks": ["6.1", "6.5"] },
    { "id": 7, "tasks": ["6.2", "6.3", "6.4"] },
    { "id": 8, "tasks": ["6.6"] },
    { "id": 9, "tasks": ["8.1", "8.2", "8.3", "8.4", "8.5"] },
    { "id": 10, "tasks": ["9.1"] }
  ]
}
```
