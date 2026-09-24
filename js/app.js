'use strict';

// ─── 1 KONSTANTA

const STORAGE_KEY = 'ebv:v1';
const MAX_AMOUNT = 1000000000;
const NAME_MAX = 50;
const CATEGORY_MAX = 30;

const DEFAULT_CATEGORIES = [
  { name: 'Food',      color: '#1E8E4E', limit: null },
  { name: 'Transport', color: '#2A76C6', limit: null },
  { name: 'Fun',       color: '#D35400', limit: null },
];

const PALETTE = [
  '#7B4EA3', '#0F8B8D', '#C2185B', '#8D5B3A',
  '#6B7A1F', '#3F51B5', '#546E7A', '#B8860B',
];

const SORT_MODES = ['default', 'amount-asc', 'amount-desc', 'category-asc'];

// ─── 2 STATE

const state = {
  transactions: [],
  categories: [],
  sortMode: 'default',
};

// ─── 3 STORAGE

function createDefaultData() {
  return {
    transactions: [],
    categories: DEFAULT_CATEGORIES.map(function (c) {
      return { name: c.name, color: c.color, limit: c.limit };
    }),
  };
}

function loadState() {
  var raw;

  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch (e) {
    showStorageWarning();
    return createDefaultData();
  }

  if (raw === null) {
    return createDefaultData();
  }

  var parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    console.warn('[ebv] loadState: JSON.parse gagal, memakai data bawaan.', e);
    return createDefaultData();
  }

  return sanitizeData(parsed);
}

function sanitizeData(raw) {
  if (
    raw === null ||
    typeof raw !== 'object' ||
    Array.isArray(raw) ||
    !Array.isArray(raw.transactions) ||
    !Array.isArray(raw.categories)
  ) {
    console.warn('[ebv] sanitizeData: struktur data tidak valid, memakai data bawaan.');
    return createDefaultData();
  }

  // --- Sanitasi kategori ---
  var seenCatNames = Object.create(null);
  var customCategories = [];

  raw.categories.forEach(function (item) {
    if (
      !item ||
      typeof item !== 'object' ||
      typeof item.name !== 'string' ||
      item.name.trim() === '' ||
      item.name.trim().length > CATEGORY_MAX ||
      typeof item.color !== 'string' ||
      item.color === ''
    ) {
      console.warn('[ebv] sanitizeData: kategori tidak valid dibuang.', item);
      return;
    }

    var name = item.name.trim();

    if (seenCatNames[name]) {
      console.warn('[ebv] sanitizeData: nama kategori duplikat dibuang:', name);
      return;
    }

    var limit = null;
    if (item.limit !== null && item.limit !== undefined) {
      var l = item.limit;
      if (Number.isInteger(l) && l >= 1 && l <= MAX_AMOUNT) {
        limit = l;
      } else {
        console.warn('[ebv] sanitizeData: limit tidak valid di kategori "' + name + '", diset null.');
      }
    }

    seenCatNames[name] = true;
    customCategories.push({ name: name, color: item.color, limit: limit });
  });

  // Bangun daftar akhir: tiga bawaan dulu, lalu kustom
  var finalCategories = [];
  var defaultNames = DEFAULT_CATEGORIES.map(function (d) { return d.name; });

  DEFAULT_CATEGORIES.forEach(function (def) {
    var stored = null;
    customCategories.forEach(function (c) {
      if (c.name === def.name) stored = c;
    });

    if (stored) {
      finalCategories.push({ name: stored.name, color: stored.color, limit: stored.limit });
    } else {
      finalCategories.push({ name: def.name, color: def.color, limit: def.limit });
    }
  });

  customCategories.forEach(function (c) {
    if (defaultNames.indexOf(c.name) === -1) {
      finalCategories.push(c);
    }
  });

  // Buat set nama kategori valid untuk validasi transaksi
  var validCatNames = Object.create(null);
  finalCategories.forEach(function (c) { validCatNames[c.name] = true; });

  // --- Sanitasi transaksi ---
  var seenTxIds = Object.create(null);
  var finalTransactions = [];

  raw.transactions.forEach(function (item) {
    if (
      !item ||
      typeof item !== 'object' ||
      typeof item.id !== 'string' ||
      item.id === ''
    ) {
      console.warn('[ebv] sanitizeData: transaksi tidak valid (id) dibuang.', item);
      return;
    }

    if (seenTxIds[item.id]) {
      console.warn('[ebv] sanitizeData: id transaksi duplikat dibuang:', item.id);
      return;
    }

    if (
      typeof item.name !== 'string' ||
      item.name.trim() === '' ||
      item.name.trim().length > NAME_MAX
    ) {
      console.warn('[ebv] sanitizeData: transaksi tidak valid (name) dibuang.', item.id);
      return;
    }

    if (
      !Number.isInteger(item.amount) ||
      item.amount < 1 ||
      item.amount > MAX_AMOUNT
    ) {
      console.warn('[ebv] sanitizeData: transaksi tidak valid (amount) dibuang.', item.id);
      return;
    }

    if (
      typeof item.category !== 'string' ||
      !validCatNames[item.category]
    ) {
      console.warn('[ebv] sanitizeData: transaksi tidak valid (category) dibuang.', item.id);
      return;
    }

    var createdAt = typeof item.createdAt === 'number' ? item.createdAt : 0;

    seenTxIds[item.id] = true;
    finalTransactions.push({
      id: item.id,
      name: item.name.trim(),
      amount: item.amount,
      category: item.category,
      createdAt: createdAt,
    });
  });

  return { transactions: finalTransactions, categories: finalCategories };
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      version: 1,
      transactions: state.transactions,
      categories: state.categories,
    }));
    return true;
  } catch (e) {
    showStorageWarning();
    return false;
  }
}

// ─── 4 VALIDASI

function parseIntegerText(text) {
  const str = String(text ?? '').trim();

  if (str === '') {
    return { ok: false, reason: 'empty' };
  }

  const FORMAT_RE = /^(\d+|\d{1,3}(\.\d{3})+)$/;
  if (!FORMAT_RE.test(str)) {
    return { ok: false, reason: 'format' };
  }

  const value = Number(str.replace(/\./g, ''));

  if (value <= 0) {
    return { ok: false, reason: 'min' };
  }

  if (value > MAX_AMOUNT) {
    return { ok: false, reason: 'max' };
  }

  return { ok: true, value };
}

function parseAmount(text) {
  const result = parseIntegerText(text);

  if (result.ok) {
    return { ok: true, value: result.value };
  }

  if (result.reason === 'empty') {
    return { ok: false, error: 'Amount wajib diisi' };
  }

  if (result.reason === 'max') {
    return { ok: false, error: 'Amount maksimal ' + formatRupiah(MAX_AMOUNT) };
  }

  // 'format' atau 'min'
  return { ok: false, error: 'Amount harus bilangan bulat lebih dari 0 (contoh: 15000 atau 15.000)' };
}

function parseLimit(text) {
  const str = String(text ?? '').trim();

  if (str === '') {
    return { ok: true, value: null };
  }

  const result = parseIntegerText(str);

  if (result.ok) {
    return { ok: true, value: result.value };
  }

  if (result.reason === 'max') {
    return { ok: false, error: 'Limit maksimal ' + formatRupiah(MAX_AMOUNT) };
  }

  // 'format' atau 'min'
  return { ok: false, error: 'Limit harus bilangan bulat lebih dari 0 atau dikosongkan' };
}

function validateTransaction(input, categories) {
  const errors = {};

  // Validasi name
  const name = String(input.name ?? '').trim();
  if (name === '') {
    errors['item-name'] = 'Item Name wajib diisi';
  } else if (name.length > NAME_MAX) {
    errors['item-name'] = 'Item Name maksimal ' + NAME_MAX + ' karakter';
  }

  // Validasi amount
  const amountResult = parseAmount(input.amount);
  if (!amountResult.ok) {
    errors['amount'] = amountResult.error;
  }

  // Validasi category
  const categoryStr = String(input.category ?? '').trim();
  if (categoryStr === '') {
    errors['category'] = 'Category wajib dipilih';
  } else {
    const exists = categories.some(function (c) { return c.name === categoryStr; });
    if (!exists) {
      errors['category'] = 'Category tidak valid';
    }
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    values: {
      name,
      amount: amountResult.value,
      category: categoryStr,
    },
  };
}

function validateCategoryName(text, categories) {
  const name = String(text ?? '').trim();

  if (name === '') {
    return { ok: false, error: 'Nama kategori wajib diisi' };
  }

  if (name.length > CATEGORY_MAX) {
    return { ok: false, error: 'Nama kategori maksimal ' + CATEGORY_MAX + ' karakter' };
  }

  const exists = categories.some(function (c) { return c.name === name; });
  if (exists) {
    return { ok: false, error: 'Nama kategori sudah ada' };
  }

  return { ok: true, name };
}

// ─── 5 DATA TURUNAN

var rupiahFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

function formatRupiah(n) {
  return rupiahFormatter.format(n);
}

function generateId() {
  return Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6);
}

function calcTotal(transactions) {
  return transactions.reduce(function (sum, tx) {
    return sum + tx.amount;
  }, 0);
}

function calcTotalsByCategory(transactions, categories) {
  var totals = Object.create(null);
  categories.forEach(function (c) {
    totals[c.name] = 0;
  });
  transactions.forEach(function (tx) {
    if (totals[tx.category] !== undefined) {
      totals[tx.category] += tx.amount;
    }
  });
  return totals;
}

function isOverLimit(category, totals) {
  return category.limit !== null && totals[category.name] > category.limit;
}

function getSortedTransactions(transactions, mode) {
  var copy = transactions.slice();
  if (mode === 'amount-asc') {
    copy.sort(function (a, b) { return a.amount - b.amount; });
  } else if (mode === 'amount-desc') {
    copy.sort(function (a, b) { return b.amount - a.amount; });
  } else if (mode === 'category-asc') {
    copy.sort(function (a, b) { return a.category.localeCompare(b.category, 'id'); });
  }
  // 'default' dan mode tak dikenal: urutan asli (copy tidak diubah)
  return copy;
}

// ─── 6 RENDER

function showStorageWarning() {
  var el = document.getElementById('storage-warning');
  if (el) {
    el.removeAttribute('hidden');
  }
}

// (diisi di langkah berikutnya)

// ─── 7 EVENT HANDLER

// (diisi di langkah berikutnya)

// ─── 8 INIT

// (diisi di langkah berikutnya)
