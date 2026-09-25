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

function renderTotal(total) {
  document.getElementById('total-value').textContent = formatRupiah(total);
}

function renderCategoryOptions() {
  const select = document.getElementById('category');
  const prevValue = select.value;

  select.replaceChildren();
  select.appendChild(new Option('Pilih kategori', ''));

  state.categories.forEach(function (cat) {
    select.appendChild(new Option(cat.name, cat.name));
  });

  const stillExists = state.categories.some(function (cat) {
    return cat.name === prevValue;
  });

  if (stillExists) {
    select.value = prevValue;
  }
}

function renderTransactionList(list, totals, categories) {
  const ul = document.getElementById('transaction-list');
  const emptyMsg = document.getElementById('list-empty');

  emptyMsg.hidden = list.length > 0;

  const liArray = list.map(function (tx) {
    const catObj = categories.find(function (c) { return c.name === tx.category; });
    const overLimit = catObj ? isOverLimit(catObj, totals) : false;

    const li = document.createElement('li');
    li.className = 'tx-item' + (overLimit ? ' over-limit' : '');

    const divMain = document.createElement('div');
    divMain.className = 'tx-main';

    const spanName = document.createElement('span');
    spanName.className = 'tx-name';
    spanName.textContent = tx.name;

    const spanAmount = document.createElement('span');
    spanAmount.className = 'tx-amount';
    spanAmount.textContent = formatRupiah(tx.amount);

    const spanCategory = document.createElement('span');
    spanCategory.className = 'tx-category';
    spanCategory.textContent = tx.category;

    divMain.appendChild(spanName);
    divMain.appendChild(spanAmount);
    divMain.appendChild(spanCategory);

    if (overLimit) {
      const spanFlag = document.createElement('span');
      spanFlag.className = 'limit-flag';

      const spanIcon = document.createElement('span');
      spanIcon.setAttribute('aria-hidden', 'true');
      spanIcon.textContent = '⚠';

      spanFlag.appendChild(spanIcon);
      spanFlag.appendChild(document.createTextNode(' Melebihi limit'));
      divMain.appendChild(spanFlag);
    }

    const btnDelete = document.createElement('button');
    btnDelete.type = 'button';
    btnDelete.className = 'btn-delete';
    btnDelete.dataset.id = tx.id;
    btnDelete.setAttribute('aria-label', 'Hapus ' + tx.name);
    btnDelete.textContent = 'Delete';

    li.appendChild(divMain);
    li.appendChild(btnDelete);

    return li;
  });

  ul.replaceChildren(...liArray);
}

let chartInstance = null;

function renderChart(categories, totals) {
  const canvas = document.getElementById('category-chart');
  const emptyMsg = document.getElementById('chart-empty');

  const hasData = categories.some(function (c) { return totals[c.name] > 0; });

  if (!hasData) {
    if (chartInstance !== null) {
      chartInstance.destroy();
      chartInstance = null;
    }
    canvas.hidden = true;
    emptyMsg.hidden = false;
    return;
  }

  canvas.hidden = false;
  emptyMsg.hidden = true;

  const filtered = categories.filter(function (c) { return totals[c.name] > 0; });
  const labels = filtered.map(c => c.name);
  const data = filtered.map(c => totals[c.name]);
  const colors = filtered.map(c => c.color);

  if (chartInstance === null) {
    chartInstance = new Chart(canvas.getContext('2d'), {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: colors,
          borderColor: '#FFFFFF',
          borderWidth: 2,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' },
          tooltip: {
            callbacks: {
              label: function (context) {
                return context.label + ': ' + formatRupiah(context.parsed);
              },
            },
          },
        },
      },
    });
  } else {
    chartInstance.data.labels = labels;
    chartInstance.data.datasets[0].data = data;
    chartInstance.data.datasets[0].backgroundColor = colors;
    chartInstance.update();
  }
}

function buildLimitRows() {
  const ul = document.getElementById('limit-list');

  const liArray = state.categories.map(function (cat) {
    const li = document.createElement('li');
    li.className = 'limit-row';
    li.dataset.category = cat.name;

    // .limit-info
    const divInfo = document.createElement('div');
    divInfo.className = 'limit-info';

    const spanDot = document.createElement('span');
    spanDot.className = 'color-dot';
    spanDot.style.backgroundColor = cat.color;

    const spanName = document.createElement('span');
    spanName.className = 'limit-name';
    spanName.textContent = cat.name;

    const spanUsed = document.createElement('span');
    spanUsed.className = 'limit-used';
    // isi diperbarui oleh updateLimitStatus

    divInfo.appendChild(spanDot);
    divInfo.appendChild(spanName);
    divInfo.appendChild(spanUsed);

    // input limit
    const input = document.createElement('input');
    input.className = 'limit-input';
    input.type = 'text';
    input.inputMode = 'numeric';
    input.autocomplete = 'off';
    input.dataset.category = cat.name;
    input.setAttribute('aria-label', 'Limit ' + cat.name);
    input.placeholder = 'No limit';
    input.value = cat.limit !== null ? String(cat.limit) : '';

    // .limit-flag
    const spanFlag = document.createElement('span');
    spanFlag.className = 'limit-flag';
    spanFlag.hidden = true;

    const spanIcon = document.createElement('span');
    spanIcon.setAttribute('aria-hidden', 'true');
    spanIcon.textContent = '⚠';

    spanFlag.appendChild(spanIcon);
    spanFlag.appendChild(document.createTextNode(' Melebihi limit'));

    // .field-error
    const pError = document.createElement('p');
    pError.className = 'field-error';

    li.appendChild(divInfo);
    li.appendChild(input);
    li.appendChild(spanFlag);
    li.appendChild(pError);

    return li;
  });

  ul.replaceChildren(...liArray);
}

function updateLimitStatus(totals) {
  const rows = document.querySelectorAll('#limit-list .limit-row');

  rows.forEach(function (li) {
    const name = li.dataset.category;
    const category = state.categories.find(function (c) { return c.name === name; });
    if (!category) return;

    const used = totals[name] || 0;
    const over = isOverLimit(category, totals);

    li.querySelector('.limit-used').textContent =
      'Terpakai ' + formatRupiah(used) +
      (category.limit !== null ? ' dari ' + formatRupiah(category.limit) : '');

    li.classList.toggle('over-limit', over);
    li.querySelector('.limit-flag').hidden = !over;
  });
}

function showFieldError(inputId, message) {
  const input = document.getElementById(inputId);
  if (!input) return;

  input.setAttribute('aria-invalid', 'true');

  const describedBy = input.getAttribute('aria-describedby');
  if (describedBy) {
    const errorEl = document.getElementById(describedBy);
    if (errorEl) {
      errorEl.textContent = message;
    }
  }
}

function clearErrors(form) {
  form.querySelectorAll('[aria-invalid="true"]').forEach(function (el) {
    el.removeAttribute('aria-invalid');
  });
  form.querySelectorAll('.field-error').forEach(function (el) {
    el.textContent = '';
  });
}

function render() {
  const sorted = getSortedTransactions(state.transactions, state.sortMode);
  const total = calcTotal(state.transactions);
  const totals = calcTotalsByCategory(state.transactions, state.categories);

  renderTotal(total);
  renderCategoryOptions();
  renderTransactionList(sorted, totals, state.categories);
  renderChart(state.categories, totals);
  updateLimitStatus(totals);
}

function addTransaction(values) {
  const tx = {
    id: generateId(),
    name: values.name,
    amount: values.amount,
    category: values.category,
    createdAt: Date.now(),
  };
  state.transactions.unshift(tx);
  return tx;
}

function deleteTransaction(id) {
  state.transactions = state.transactions.filter(function (tx) {
    return tx.id !== id;
  });
}

function pickCategoryColor(categories) {
  const usedColors = categories.map(function (c) { return c.color; });
  const found = PALETTE.find(function (color) {
    return !usedColors.includes(color);
  });
  if (found !== undefined) {
    return found;
  }
  const hue = Math.round((categories.length * 137.508) % 360);
  return `hsl(${hue}, 55%, 45%)`;
}

function addCategory(name) {
  const cat = { name, color: pickCategoryColor(state.categories), limit: null };
  state.categories.push(cat);
  return cat;
}

function setCategoryLimit(name, limit) {
  const cat = state.categories.find(function (c) { return c.name === name; });
  if (cat) {
    cat.limit = limit;
  }
}

function setSortMode(mode) {
  state.sortMode = SORT_MODES.includes(mode) ? mode : 'default';
}

// ─── 7 EVENT HANDLER

function handleTransactionSubmit(e) {
  e.preventDefault();
  const form = e.target;
  clearErrors(form);

  const raw = {
    name: form.elements['name'].value,
    amount: form.elements['amount'].value,
    category: form.elements['category'].value,
  };

  const result = validateTransaction(raw, state.categories);

  if (!result.ok) {
    Object.entries(result.errors).forEach(function ([fieldId, message]) {
      showFieldError(fieldId, message);
    });
    return;
  }

  addTransaction(result.values);
  saveState();
  form.reset();
  render();
  document.getElementById('item-name').focus();
}

function handleListClick(e) {
  const btn = e.target.closest('[data-id]');
  if (btn === null) return;

  const id = btn.dataset.id;
  deleteTransaction(id);
  saveState();
  render();
}

function handleSortChange(e) {
  setSortMode(e.target.value);
  render();
}

function handleCategorySubmit(e) {
  e.preventDefault();
  const form = e.target;
  clearErrors(form);

  const raw = form.elements['categoryName'].value;
  const result = validateCategoryName(raw, state.categories);

  if (!result.ok) {
    showFieldError('category-name', result.error);
    return;
  }

  addCategory(result.name);
  saveState();
  form.reset();
  buildLimitRows();
  render();
  document.getElementById('category-name').focus();
}

function handleLimitChange(e) {
  const input = e.target.closest('.limit-input');
  if (input === null) return;

  const li = input.closest('.limit-row');
  const name = input.dataset.category;
  const errorEl = li.querySelector('.field-error');

  const result = parseLimit(input.value);

  if (!result.ok) {
    errorEl.textContent = result.error;
    const cat = state.categories.find(c => c.name === name);
    input.value = cat && cat.limit !== null ? String(cat.limit) : '';
    return;
  }

  errorEl.textContent = '';
  setCategoryLimit(name, result.value);
  saveState();
  const totals = calcTotalsByCategory(state.transactions, state.categories);
  updateLimitStatus(totals);
  renderTransactionList(getSortedTransactions(state.transactions, state.sortMode), totals, state.categories);
}

// ─── 8 INIT

function init() {
  const loaded = loadState();
  state.transactions = loaded.transactions;
  state.categories = loaded.categories;

  buildLimitRows();
  render();

  document.getElementById('transaction-form').addEventListener('submit', handleTransactionSubmit);
  document.getElementById('transaction-list').addEventListener('click', handleListClick);
  document.getElementById('sort-select').addEventListener('change', handleSortChange);
  document.getElementById('category-form').addEventListener('submit', handleCategorySubmit);
  document.getElementById('limit-list').addEventListener('change', handleLimitChange);
}

init();
