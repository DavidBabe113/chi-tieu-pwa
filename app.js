'use strict';
const VERSION = '1.4.0';
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// ---------- cấu hình cục bộ ----------
const cfg = {
  get: (k, d) => { try { return localStorage.getItem(k) ?? d; } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem(k, v); } catch {} },
  del: k => { try { localStorage.removeItem(k); } catch {} },
};

// ---------- ngôn ngữ (English / Tiếng Việt) ----------
let lang = cfg.get('lang', 'en') === 'vi' ? 'vi' : 'en';
const VI = {
  // tab & tiêu đề
  'Expenses': 'Chi tiêu', 'Overview': 'Tổng quan', 'Statistics': 'Thống kê', '6 Jars': '6 hũ', 'Categories': 'Danh mục',
  'Scan QR': 'Quét QR', 'Choose category': 'Chọn danh mục', 'Details': 'Chi tiết', 'Choose bank': 'Chọn ngân hàng',
  'Photo library': 'Thư viện ảnh', 'Settings': 'Cài đặt', 'Back': 'Quay lại', 'Close': 'Đóng', 'Add manually': 'Nhập tay',
  // trang chủ
  'Summary': 'Tóm tắt', 'Transactions': 'Giao dịch', 'Previous month': 'Tháng trước', 'Next month': 'Tháng sau',
  '{0} transactions': '{0} giao dịch', '{0} transaction': '{0} giao dịch', 'No transactions in this month.': 'Chưa có giao dịch trong tháng này.',
  'Google Sheet not connected. Open Settings > Advanced and paste the link.': 'Chưa nối Google Sheet. Vào Cài đặt > Nâng cao để dán link.',
  '⏳ not synced yet': '⏳ chưa lên Sheet', 'Did the transfer go through?': 'Giao dịch đã thành công?', 'Cancel': 'Huỷ', 'Done': 'Xong',
  // quét & nhập
  'Point the camera at the QR code…': 'Đưa mã QR vào khung hình…',
  'Cannot open the camera. Allow camera access in iPhone Settings > Safari / this app.': 'Không mở được camera. Vào Cài đặt iPhone > Safari / ứng dụng > Camera để cấp quyền.',
  'Payee: {0}': 'Người nhận: {0}', 'Amount (₫)': 'Số tiền (₫)', 'Note': 'Ghi chú', 'e.g. coffee with a client': 'Ví dụ: cà phê với khách',
  '📸 Take a receipt photo': '📸 Chụp ảnh hoá đơn', '📁 Save to the expense album': '📁 Lưu vào album chi tiêu',
  'Save manually via the share sheet': 'Lưu thủ công qua bảng chia sẻ', 'Next: choose bank': 'Tiếp: chọn ngân hàng',
  'Save only, do not open a bank': 'Chỉ lưu, không mở ngân hàng',
  'Choose a bank. Its app opens and you confirm with Face ID as usual. Enter the amount there yourself.': 'Chọn ngân hàng. App ngân hàng sẽ mở, bạn xác thực khuôn mặt như bình thường và tự nhập số tiền ở đó.',
  "This is the app's own photo storage. Tap a photo and choose \"Save Image\" to put it into your iPhone Photos.": 'Đây là kho ảnh riêng của app. Chạm vào ảnh rồi chọn "Lưu hình ảnh" để đưa vào album Ảnh của iPhone.',
  'Enter an amount first': 'Hãy nhập số tiền trước', 'Could not copy the photo, try again': 'Không copy được ảnh, thử lại',
  'No app link for this bank. Set one in Settings': 'Chưa có link app cho ngân hàng này. Thêm trong Cài đặt',
  'Could not open the app. Check the link in Settings.': 'Không mở được app. Kiểm tra link trong Cài đặt.',
  'No photos yet.': 'Chưa có ảnh nào.', 'Press and hold the photo to save it': 'Giữ lâu vào ảnh để lưu',
  // chi tiết giao dịch
  'Date': 'Ngày', 'Bank': 'Ngân hàng', 'Payee': 'Người nhận', 'Google Sheet': 'Google Sheet', 'Synced': 'Đã lên Sheet', 'Not synced yet': 'Chưa lên Sheet',
  'Tap the photo to save it to your iPhone Photos.': 'Chạm vào ảnh để lưu vào album Ảnh của iPhone.',
  // thống kê
  'No transactions in this month yet.': 'Tháng này chưa có giao dịch.', 'Total spent': 'Tổng chi', 'Daily average': 'Trung bình mỗi ngày',
  'Largest expense': 'Khoản chi lớn nhất', 'No previous month': 'Chưa có tháng trước', 'vs {0}': 'so với {0}',
  'By category': 'Theo danh mục', 'Last 6 months': '6 tháng gần nhất', 'Daily spending': 'Chi theo ngày', 'By bank': 'Theo ngân hàng',
  'Top expenses': 'Chi lớn nhất', 'Assessment': 'Đánh giá', 'Cash / no bank': 'Tiền mặt / không qua ngân hàng', 'Others': 'Khác',
  'Above your recent average': 'Cao hơn mức trung bình gần đây', 'Below your recent average': 'Thấp hơn mức trung bình gần đây',
  'In line with your recent average': 'Ngang mức trung bình gần đây', 'Not enough history yet': 'Chưa đủ dữ liệu lịch sử',
  '(3-month avg {0})': '(TB 3 tháng {0})', 'higher': 'cao hơn', 'lower': 'thấp hơn',
  'Spending is <b>{0}% {1}</b> than {2} ({3}).': 'Chi tiêu <b>{1} {0}%</b> so với {2} ({3}).',
  '<b>{0}</b> is your biggest category: {1}% of the month ({2}).': '<b>{0}</b> là danh mục lớn nhất: {1}% trong tháng ({2}).',
  'The top 2 categories together make up {0}% of spending.': '2 danh mục lớn nhất chiếm {0}% tổng chi.',
  'You spend about <b>{0}</b> per day.': 'Bạn chi khoảng <b>{0}</b> mỗi ngày.',
  ' At this pace the month would end near <b>{0}</b>.': ' Với tốc độ này cả tháng sẽ khoảng <b>{0}</b>.',
  'Spending peaks on <b>{0}</b> ({1}).': 'Chi nhiều nhất vào <b>{0}</b> ({1}).',
  'Largest single expense: <b>{0}</b> ({1}) on {2}.': 'Khoản chi lớn nhất: <b>{0}</b> ({1}) ngày {2}.',
  // 6 hũ
  'Set your monthly income to split it into jars.': 'Nhập thu nhập hàng tháng để chia vào các hũ.', 'Monthly income': 'Thu nhập hàng tháng', 'Save': 'Lưu',
  'Spent {0} · {1}% of income': 'Đã chi {0} · {1}% thu nhập', 'Your jars': 'Các hũ của bạn', 'Over by {0}': 'Vượt {0}', '{0} left': 'Còn {0}',
  'Set aside': 'Để dành', 'Spent {0} of {1}': 'Đã chi {0} / {1}',
  'Your jar percentages add up to {0}%, not 100%. Fix them in Settings > Advanced.': 'Tổng tỷ lệ các hũ là {0}%, không phải 100%. Sửa trong Cài đặt > Nâng cao.',
  'Transfer {0} to this jar each month. Nothing is tracked here.': 'Chuyển {0} vào hũ này mỗi tháng. Không theo dõi chi tiêu ở đây.',
  'Not in any jar: <b>{0}</b>. Assign those categories to a jar in the Categories tab.': 'Chưa thuộc hũ nào: <b>{0}</b>. Gán các danh mục đó vào hũ ở tab Danh mục.',
  // danh mục
  'Your categories and the jar each one belongs to. New ones show up in the expense form and in your Google Sheet as soon as you use them.': 'Danh mục của bạn và hũ tương ứng. Danh mục mới xuất hiện ở form chi tiêu và trong Google Sheet ngay khi bạn dùng.',
  '{0} this month': '{0} trong tháng', 'No jar': 'Không thuộc hũ', 'Add a category': 'Thêm danh mục', 'Name': 'Tên', 'Icon': 'Biểu tượng', 'Add': 'Thêm',
  'e.g. Pets': 'Ví dụ: Thú cưng', 'That category already exists': 'Danh mục này đã có', 'Enter a name first': 'Hãy nhập tên trước',
  'Remove this category? Past expenses keep it.': 'Xoá danh mục này? Các khoản đã chi vẫn giữ nguyên.', 'Remove': 'Xoá',
  // cài đặt
  'Data': 'Dữ liệu', '📊 Open Google Sheet': '📊 Mở Google Sheet', 'Google Sheet file link': 'Link file Google Sheet',
  'Language': 'Ngôn ngữ', 'Appearance': 'Giao diện', 'Light': 'Sáng', 'Dark': 'Tối', 'Auto': 'Tự động', 'About': 'Thông tin', 'Version': 'Phiên bản',
  'Check for updates': 'Kiểm tra cập nhật', 'Advanced': 'Nâng cao', 'Google Apps Script link (Web App)': 'Link Google Apps Script (Web App)',
  'Send a test row': 'Gửi thử 1 dòng', 'Jar percentages': 'Tỷ lệ các hũ', 'Banks': 'Ngân hàng',
  'One jar per line: Name | percent | categories. Percentages should add up to 100.': 'Mỗi dòng một hũ: Tên | phần trăm | danh mục. Tổng phần trăm nên bằng 100.',
  'One per line: Name (Brand) | app link. Edit if an app does not open.': 'Mỗi dòng: Tên (Thương hiệu) | link mở app. Sửa lại nếu app không mở được.',
  'Sent. Check the ChiTieu tab in your Sheet': 'Đã gửi. Mở tab ChiTieu trong Sheet để kiểm tra', 'Send failed, check the link': 'Gửi lỗi, kiểm tra link',
};
const tr = (s, ...a) => { let r = (lang === 'vi' && VI[s]) || s; a.forEach((v, i) => r = r.replace('{' + i + '}', v)); return r; };
const LOC = () => lang === 'vi' ? 'vi-VN' : 'en-US';
const DLOC = () => lang === 'vi' ? 'vi-VN' : 'en-GB';
const fmt = n => (Number(n) || 0).toLocaleString(LOC()) + '₫';

// Dịch phần HTML tĩnh: ghi nhớ bản tiếng Anh gốc rồi thay theo ngôn ngữ đang chọn
function translateDom() {
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n; (n = w.nextNode());) {
    if (/^(SCRIPT|STYLE)$/.test(n.parentNode.nodeName)) continue;
    if (n._o === undefined) n._o = n.nodeValue;
    const k = n._o.trim(); if (!k) continue;
    n.nodeValue = n._o.replace(k, lang === 'vi' && VI[k] ? VI[k] : k);
  }
  document.querySelectorAll('[placeholder],[aria-label]').forEach(el => ['placeholder', 'aria-label'].forEach(a => {
    if (!el.hasAttribute(a)) return;
    const key = 'o' + a; if (!el.dataset[key]) el.dataset[key] = el.getAttribute(a);
    const o = el.dataset[key]; el.setAttribute(a, lang === 'vi' && VI[o] ? VI[o] : o);
  }));
  document.documentElement.lang = lang;
  document.title = tr('Expenses');
}

// ---------- giao diện sáng / tối ----------
function applyTheme() {
  const t = cfg.get('theme', 'auto');
  if (t === 'light' || t === 'dark') document.documentElement.dataset.theme = t; else delete document.documentElement.dataset.theme;
  const dark = t === 'dark' || (t === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
  const m = document.querySelector('meta[name=theme-color]'); if (m) m.content = dark ? '#08122a' : '#1e3a8a';
}
applyTheme();

// ---------- mặc định ----------
const DEF_CATS = '⛽ Fuel\n☕ Food & Coffee\n🛍 Shopping\n🏠 Home bills\n🏥 Health\n🎬 Entertainment\n📦 Other';
// URL scheme mở thẳng app ngân hàng trên iOS (lấy từ trang chuyển tiếp của dl.vietqr.io). Chỉ mở app,
// không truyền được số tiền / tài khoản (iOS không có link điền sẵn đã kiểm chứng).
const DEF_BANKS = [
  'Bank for Foreign Trade of Vietnam (Vietcombank) | vietcombankmobile://',
  'Military Commercial Joint Stock Bank (MB Bank) | mbbank://',
  'Vietnam Technological and Commercial Joint Stock Bank (Techcombank) | tcb://',
  'Vietnam Prosperity Joint Stock Commercial Bank (VPBank) | vpbankneo://',
  'Asia Commercial Joint Stock Bank (ACB) | acbone://',
  'Bank for Investment and Development of Vietnam (BIDV) | bidv.smartbanking.partner://',
  'Tien Phong Commercial Joint Stock Bank (TPBank) | hydro://',
  'Vietnam Joint Stock Commercial Bank for Industry and Trade (VietinBank) | vietinbankipay://',
  'Vietnam Bank for Agriculture and Rural Development (Agribank) | agribankmobile://',
  'Orient Commercial Joint Stock Bank (OCB) | newomni-app://',
].join('\n');
const OLD_BANKS = 'Vietcombank | vietcombankmobile://\nMB Bank | mbbank://\nTechcombank | tcb://\nVPBank | vpbankneo://\nACB | acbone://\nBIDV | bidv.smartbanking.partner://\nTPBank | hydro://\nVietinBank | vietinbankipay://\nAgribank | agribankmobile://\nOCB | newomni-app://';
// Cài đặt cũ chưa chỉnh tay thì tự đổi sang mặc định mới
if (cfg.get('cats', '').startsWith('⛽ Tiền xăng')) cfg.del('cats');
if (/vcbdigibank|dl\.vietqr\.io|techcombank:\/\//.test(cfg.get('banks', '')) || cfg.get('banks', '') === OLD_BANKS) cfg.del('banks');

// ---------- lưu trữ ----------
let dbp;
function db() {
  return dbp ??= new Promise((res, rej) => {
    const r = indexedDB.open('chitieu', 1);
    r.onupgradeneeded = () => {
      r.result.createObjectStore('records', { keyPath: 'id' });
      r.result.createObjectStore('photos', { keyPath: 'id' });
    };
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}
async function tx(store, mode, fn) {
  const d = await db();
  return new Promise((res, rej) => {
    const t = d.transaction(store, mode);
    const out = fn(t.objectStore(store));
    t.oncomplete = () => res(out.result);
    t.onerror = () => rej(t.error);
  });
}
const putRec = r => tx('records', 'readwrite', s => s.put(r));
const delRec = id => tx('records', 'readwrite', s => s.delete(id));
const allRecs = () => tx('records', 'readonly', s => s.getAll());
const putPhoto = (id, blob) => tx('photos', 'readwrite', s => s.put({ id, blob }));
const getPhoto = id => tx('photos', 'readonly', s => s.get(id)).then(x => x && x.blob);
const delPhoto = id => tx('photos', 'readwrite', s => s.delete(id));

// ---------- trạng thái ----------
let cur = null;          // bản ghi đang soạn
let curPhoto = null;     // blob ảnh đang soạn
let stream = null, scanning = false, curView = 'home';
const stack = [];        // lịch sử màn hình để nút quay lại

const cats = () => cfg.get('cats', DEF_CATS).split('\n').map(s => s.trim()).filter(Boolean);
const banks = () => cfg.get('banks', DEF_BANKS).split('\n').map(l => l.split('|').map(s => s.trim()))
  .filter(a => a[0]).map(a => ({ name: a[0], url: a[1] || '' }));

function toast(msg, ms = 2600) {
  const t = $('#toast'); t.textContent = msg; t.hidden = false;
  clearTimeout(toast.t); toast.t = setTimeout(() => t.hidden = true, ms);
}

// ---------- điều hướng ----------
const TITLES = { home: 'Expenses', stats: 'Statistics', jars: '6 Jars', cats: 'Categories', scan: 'Scan QR', cat: 'Choose category', detail: 'Details', bank: 'Choose bank', gallery: 'Photo library', settings: 'Settings' };
const TOP = ['home', 'stats', 'jars', 'cats'];
function show(v, push = true) {
  if (v !== 'scan') stopScan();
  if (push) stack.push(v);
  curView = v;
  document.querySelectorAll('main > section').forEach(s => s.hidden = s.id !== 'v-' + v);
  $('#title').textContent = tr(TITLES[v]);
  const top = TOP.includes(v);
  $('#back').hidden = top;
  $('#tabs').hidden = !top;
  document.querySelectorAll('#tabs button').forEach(b => b.classList.toggle('on', b.dataset.tab === v));
  if (top) stack.length = 0;
  if (v === 'home') renderHome();
  if (v === 'stats') renderStats();
  if (v === 'jars') renderJars();
  if (v === 'cats') renderCategories();
  if (v === 'settings') renderSettings();
}
document.querySelectorAll('#tabs button').forEach(b => b.onclick = () => show(b.dataset.tab, false));
$('#back').onclick = () => { stack.pop(); show(stack.pop() || 'home'); };
$('#openSettings').onclick = () => show('settings');

// ---------- quét QR ----------
$('#btnScan').onclick = startScan;
$('#btnManual').onclick = () => { cur = newRec(); renderCats(); show('cat'); };
$('#btnGallery').onclick = openGallery;

function newRec() {
  return { acc: '', bin: '', id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), time: new Date().toISOString(), category: '', amount: '', note: '', payee: '', bank: '', photo: '', status: 'draft', synced: false };
}

async function startScan() {
  show('scan');
  $('#scanMsg').textContent = tr('Point the camera at the QR code…');
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
  } catch {
    $('#scanMsg').textContent = tr('Cannot open the camera. Allow camera access in iPhone Settings > Safari / this app.');
    return;
  }
  const v = $('#video'); v.srcObject = stream; await v.play();
  scanning = true;
  const c = document.createElement('canvas'), x = c.getContext('2d', { willReadFrequently: true });
  const tick = () => {
    if (!scanning) return;
    if (v.videoWidth) {
      c.width = v.videoWidth; c.height = v.videoHeight;
      x.drawImage(v, 0, 0);
      const code = jsQR(x.getImageData(0, 0, c.width, c.height).data, c.width, c.height);
      if (code && code.data) return onQr(code.data);
    }
    requestAnimationFrame(tick);
  };
  tick();
}
function stopScan() {
  scanning = false;
  if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null; }
}

// Đọc TLV chuẩn EMVCo/VietQR
function tlv(s) {
  const o = {}; let i = 0;
  while (i + 4 <= s.length) {
    const tag = s.substr(i, 2), len = parseInt(s.substr(i + 2, 2), 10);
    if (isNaN(len)) break;
    o[tag] = s.substr(i + 4, len); i += 4 + len;
  }
  return o;
}
function parseVietQR(raw) {
  if (!/^000201/.test(raw)) return null;
  const t = tlv(raw), r = {};
  if (t['54']) r.amount = t['54'].split('.')[0];
  if (t['59']) r.payee = t['59'];
  if (t['62']) { const a = tlv(t['62']); if (a['08']) r.note = a['08']; }
  if (t['38']) { const a = tlv(t['38']); if (a['01']) { const b = tlv(a['01']); r.acc = b['01']; r.bin = b['00']; } }
  return r;
}

function onQr(raw) {
  stopScan();
  cur = newRec();
  const q = parseVietQR(raw);
  if (q) {
    cur.amount = q.amount || ''; cur.payee = q.payee || ''; cur.note = q.note || '';
    cur.acc = q.acc || ''; cur.bin = q.bin || '';
    $('#qrInfo').hidden = false;
    $('#qrInfo').textContent = tr('Payee: {0}', (q.payee || '—') + (q.acc ? ' · ' + q.acc : '') + (q.amount ? ' · ' + fmt(q.amount) : ''));
  } else {
    cur.payee = raw.length > 60 ? raw.slice(0, 60) + '…' : raw;
    $('#qrInfo').hidden = false;
    $('#qrInfo').textContent = 'QR: ' + cur.payee;
  }
  if (navigator.vibrate) navigator.vibrate(60);
  stack.pop();   // bỏ màn quét khỏi lịch sử, quay lại sẽ về trang chủ
  renderCats(); show('cat');
}

// ---------- danh mục (màn chọn khi ghi chi tiêu) / chi tiết ----------
function renderCats() {
  if (!cur.payee) $('#qrInfo').hidden = true;
  $('#cats').innerHTML = '';
  cats().forEach(c => {
    const [e, ...rest] = c.split(' ');
    const b = document.createElement('button');
    b.innerHTML = `<span class="e">${esc(e)}</span>${esc(rest.join(' ') || e)}`;
    b.onclick = () => { cur.category = c; openDetail(); };
    $('#cats').append(b);
  });
}
function openDetail() {
  $('#amount').value = cur.amount ? Number(cur.amount).toLocaleString(LOC()) : '';
  $('#note').value = cur.note;
  $('#preview').hidden = true; $('#photoSave').hidden = true; $('#photoAlbum').hidden = true; curPhoto = null;
  show('detail');
}
$('#amount').oninput = e => {
  const d = e.target.value.replace(/\D/g, '');
  e.target.value = d ? Number(d).toLocaleString(LOC()) : '';
};
$('#photoIn').onchange = async e => {
  const f = e.target.files[0]; if (!f) return;
  curPhoto = await shrink(f);
  $('#preview').src = URL.createObjectURL(curPhoto); $('#preview').hidden = false;
  $('#photoSave').hidden = false; $('#photoAlbum').hidden = false;
  e.target.value = '';
  toAlbum(true);   // thử tự lưu; nếu iOS không cho thì nút bên dưới dùng được
};
// Lưu vào album riêng: copy ảnh vào clipboard rồi chạy Phím tắt "LuuAnhChiTieu" (Lấy clipboard > Lưu vào album).
async function toAlbum(silent) {
  if (!curPhoto) return;
  try {
    const png = new Promise(res => {
      const img = new Image();
      img.onload = () => {
        const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
        c.getContext('2d').drawImage(img, 0, 0); c.toBlob(res, 'image/png'); URL.revokeObjectURL(img.src);
      };
      img.src = URL.createObjectURL(curPhoto);
    });
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': png })]);
  } catch { if (!silent) toast(tr('Could not copy the photo, try again')); return; }
  location.href = 'shortcuts://run-shortcut?name=' + encodeURIComponent('LuuAnhChiTieu');
}
$('#photoAlbum').onclick = () => toAlbum(false);
// iOS không cho web tự ghi vào album Ảnh: mở Share Sheet, bạn chọn "Lưu hình ảnh"
$('#photoSave').onclick = () => savePhoto(curPhoto, `Expense_${Date.now()}.jpg`);
function shrink(file, max = 1280) {
  return new Promise(res => {
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas'); c.width = img.width * k; c.height = img.height * k;
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      c.toBlob(b => res(b), 'image/jpeg', 0.8);
      URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(file);
  });
}
function collectDetail() {
  cur.amount = $('#amount').value.replace(/\D/g, '');
  cur.note = $('#note').value.trim();
  if (!cur.amount) { toast(tr('Enter an amount first')); return false; }
  return true;
}
async function stash() {
  if (curPhoto) {
    cur.photo = `${cur.time.slice(0, 10).replace(/-/g, '')}_${cur.id}.jpg`;
    await putPhoto(cur.id, curPhoto);
  }
}

// "Save only" = chi tiền mặt, không qua ngân hàng → ghi Sheet luôn, không báo gì
$('#saveOnly').onclick = async () => {
  if (!collectDetail()) return;
  await stash();
  cur.status = 'done'; await putRec(cur); sync();
  show('home');
};
$('#toBank').onclick = () => { if (collectDetail()) { renderBanks(); show('bank'); } };

// ---------- chọn ngân hàng ----------
function renderBanks() {
  $('#banks').innerHTML = '';
  banks().forEach(b => {
    const el = document.createElement('button');
    const m = b.name.match(/^(.*?)\s*\((.+)\)$/);   // "Tên đầy đủ (Thương hiệu)" → tên đầy đủ + dòng nhỏ thương hiệu
    el.innerHTML = m ? `<span class="bn">${esc(m[1])}</span><small>${esc(m[2])}</small>` : esc(b.name);
    el.onclick = () => openBank(b);
    $('#banks').append(el);
  });
}
async function openBank(b) {
  await stash();
  cur.bank = b.name; cur.status = 'done';   // đã nhập số tiền + chọn ngân hàng = lưu luôn
  await putRec(cur);
  sync();
  stack.length = 0; stack.push('home');
  if (!b.url) { toast(tr('No app link for this bank. Set one in Settings')); show('home'); return; }
  show('home', false);
  location.href = b.url;
  setTimeout(() => { if (!document.hidden) toast(tr('Could not open the app. Check the link in Settings.'), 4000); }, 1800);
}

// ---------- thẻ xác nhận cũ (giao dịch pending từ bản trước) & đồng bộ ----------
async function renderPending() {
  const recs = (await allRecs()).filter(r => r.status === 'pending');
  const box = $('#pending'); box.innerHTML = '';
  recs.forEach(r => {
    const d = document.createElement('div'); d.className = 'card pend';
    d.innerHTML = `<b>${tr('Did the transfer go through?')}</b><div>${esc(r.category)} · ${fmt(r.amount)} · ${esc(r.bank)}</div>
      <div class="acts"><button class="no">${tr('Cancel')}</button><button class="ok">${tr('Done')}</button></div>`;
    d.querySelector('.ok').onclick = async () => { r.status = 'done'; await putRec(r); renderHome(); sync(); };
    d.querySelector('.no').onclick = async () => { await delRec(r.id); await delPhoto(r.id); renderHome(); };
    box.append(d);
  });
}
document.addEventListener('visibilitychange', () => { if (!document.hidden && curView === 'home') renderHome(); });

async function post(r) {
  const url = cfg.get('sheetUrl', '');
  if (!url) return false;
  try {
    await fetch(url, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify(r) });
    return true;
  } catch { return false; }
}
async function sync() {
  if (!cfg.get('sheetUrl', '')) return;
  for (const r of (await allRecs()).filter(x => x.status === 'done' && !x.synced)) {
    if (await post(r)) { r.synced = true; await putRec(r); }
  }
  if (curView === 'home') renderHome();
}
window.addEventListener('online', sync);

// ---------- tiện ích tháng ----------
const ymOf = iso => { const d = new Date(iso); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'); };
const nowYm = () => ymOf(new Date().toISOString());
let viewYm = nowYm();
const addMonths = (ym, n) => { const [y, m] = ym.split('-').map(Number); return ymOf(new Date(y, m - 1 + n, 1).toISOString()); };
const shiftMonth = n => { viewYm = addMonths(viewYm, n); };
const monthLabel = ym => { const [y, m] = ym.split('-').map(Number); return new Date(y, m - 1, 1).toLocaleString(LOC(), { month: 'long', year: 'numeric' }); };
const monthShort = ym => { const [y, m] = ym.split('-').map(Number); return new Date(y, m - 1, 1).toLocaleString(LOC(), { month: 'short' }); };
const weekdayName = i => new Date(2024, 0, 7 + i).toLocaleDateString(LOC(), { weekday: 'long' });
const catName = c => (c.split(' ').slice(1).join(' ') || c).toLowerCase();
const recById = {};
const monthNav = id => `<div class="mnav ${id}"><button data-m="-1" aria-label="${tr('Previous month')}">‹</button><span>${monthLabel(viewYm)}</span>` +
  `<button data-m="1" aria-label="${tr('Next month')}" ${viewYm >= nowYm() ? 'disabled' : ''}>›</button></div>`;
function bindMonthNav(box, rerender) {
  box.onclick = e => {
    const b = e.target.closest('[data-m]');
    if (b && !b.disabled) { shiftMonth(Number(b.dataset.m)); rerender(); return true; }
    const it = e.target.closest('.item');
    if (it && recById[it.dataset.id]) openSheet(recById[it.dataset.id]);
  };
}

// ---------- trang chủ ----------
async function renderHome() {
  await renderPending();
  const recs = (await allRecs()).filter(r => r.status === 'done').sort((a, b) => b.time.localeCompare(a.time));
  recs.forEach(r => recById[r.id] = r);
  const month = recs.filter(r => ymOf(r.time) === viewYm);
  const by = {}; month.forEach(r => by[r.category] = (by[r.category] || 0) + Number(r.amount));
  const total = month.reduce((s, r) => s + Number(r.amount), 0), max = Math.max(1, ...Object.values(by));
  $('#stats').innerHTML = monthNav('') +
    `<b class="total">${fmt(total)}</b><div class="sub">${month.length === 1 ? tr('{0} transaction', 1) : tr('{0} transactions', month.length)}</div>` +
    Object.entries(by).sort((a, b) => b[1] - a[1]).map(([k, v]) =>
      `<div class="bar"><span>${esc(k)}</span><i style="width:${Math.round(v / max * 100)}px"></i><span>${fmt(v)}</span></div>`).join('') +
    (cfg.get('sheetUrl', '') ? '' : `<p class="hint">${tr('Google Sheet not connected. Open Settings > Advanced and paste the link.')}</p>`);
  const box = $('#recent'); box.innerHTML = '';
  for (const r of month) {
    const d = document.createElement('div'); d.className = 'item'; d.dataset.id = r.id;
    d.innerHTML = `<div class="t">${esc(r.category)}<small>${new Date(r.time).toLocaleString(DLOC())}${r.note ? ' · ' + esc(r.note) : ''}${r.synced ? '' : ' · ' + tr('⏳ not synced yet')}</small></div><div class="amt">${fmt(r.amount)}</div>`;
    if (r.photo) { const b = await getPhoto(r.id); if (b) { const i = new Image(); i.src = URL.createObjectURL(b); d.prepend(i); } }
    box.append(d);
  }
  if (!month.length) box.innerHTML = `<p class="hint">${tr('No transactions in this month.')}</p>`;
}
$('#stats').onclick = e => {
  const b = e.target.closest('[data-m]');
  if (b && !b.disabled) { shiftMonth(Number(b.dataset.m)); renderHome(); }
};
$('#recent').onclick = e => {
  const it = e.target.closest('.item');
  if (it && recById[it.dataset.id]) openSheet(recById[it.dataset.id]);
};

// ---------- thống kê trực quan (SVG/CSS thuần, không cần thư viện) ----------
const PAL = ['#3b82f6', '#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#ec4899'];
const short = n => n >= 1e6 ? (n / 1e6).toFixed(n >= 1e7 ? 0 : 1).replace(/\.0$/, '') + 'M' : n >= 1e3 ? Math.round(n / 1e3) + 'k' : String(Math.round(n));
function sumBy(arr, f) { const o = {}; arr.forEach(r => { const k = f(r); o[k] = (o[k] || 0) + Number(r.amount); }); return o; }

async function renderStats() {
  const recs = (await allRecs()).filter(r => r.status === 'done');
  recs.forEach(r => recById[r.id] = r);
  const inM = ym => recs.filter(r => ymOf(r.time) === ym);
  const tot = a => a.reduce((s, r) => s + Number(r.amount), 0);
  const m = inM(viewYm), total = tot(m);
  const [y, mo] = viewYm.split('-').map(Number);
  const dim = new Date(y, mo, 0).getDate();
  const isCur = viewYm === nowYm();
  const elapsed = isCur ? new Date().getDate() : dim;
  const prevYm = addMonths(viewYm, -1), pTotal = tot(inM(prevYm));
  let h = monthNav('light');
  if (!m.length) { $('#statsBody').innerHTML = h + `<div class="card empty">${tr('No transactions in this month yet.')}</div>`; return; }

  const avgDay = total / Math.max(1, elapsed);
  const biggest = m.reduce((a, b) => Number(b.amount) > Number(a.amount) ? b : a);
  const pct = pTotal ? (total - pTotal) / pTotal * 100 : null;
  const delta = pct === null ? `<span class="delta">${tr('No previous month')}</span>`
    : `<span class="delta ${pct > 0 ? 'up' : 'down'}">${pct > 0 ? '▲' : '▼'} ${Math.abs(pct).toFixed(0)}% ${tr('vs {0}', monthShort(prevYm))}</span>`;

  h += `<div class="kpis">
    <div class="kpi wide"><div class="l">${tr('Total spent')}</div><div class="v">${fmt(total)}</div>${delta}</div>
    <div class="kpi"><div class="l">${tr('Daily average')}</div><div class="v sm">${fmt(avgDay)}</div></div>
    <div class="kpi"><div class="l">${tr('Transactions')}</div><div class="v sm">${m.length}</div></div>
    <div class="kpi wide"><div class="l">${tr('Largest expense')}</div><div class="v sm">${fmt(biggest.amount)}</div><div class="sub2">${esc(biggest.category)}${biggest.note ? ' · ' + esc(biggest.note) : ''}</div></div>
  </div>`;

  const byCat = Object.entries(sumBy(m, r => r.category)).sort((a, b) => b[1] - a[1]);
  const slices = byCat.slice(0, 7); const rest = byCat.slice(7).reduce((s, [, v]) => s + v, 0); if (rest) slices.push([tr('Others'), rest]);
  let off = 0;
  const arcs = slices.map(([, v], i) => {
    const p = v / total * 100;
    const s = `<circle r="15.9155" cx="21" cy="21" fill="none" stroke="${PAL[i % PAL.length]}" stroke-width="6" stroke-dasharray="${p} ${100 - p}" stroke-dashoffset="${-off}" transform="rotate(-90 21 21)"/>`;
    off += p; return s;
  }).join('');
  h += `<h2>${tr('By category')}</h2><div class="card donut">
    <svg viewBox="0 0 42 42" class="dsvg" role="img" aria-label="${tr('By category')}">${arcs}<text x="21" y="22.5" text-anchor="middle" class="dtxt">${short(total)}</text></svg>
    <div class="legend">${slices.map(([k, v], i) => `<div class="lg"><i style="background:${PAL[i % PAL.length]}"></i><span>${esc(k)}</span><b>${Math.round(v / total * 100)}%</b></div>`).join('')}</div>
  </div>`;

  const months = [-5, -4, -3, -2, -1, 0].map(n => addMonths(viewYm, n));
  const mt = months.map(ym => tot(inM(ym))), mmax = Math.max(1, ...mt);
  h += `<h2>${tr('Last 6 months')}</h2><div class="card"><div class="cols">${months.map((ym, i) =>
    `<div class="col"><span class="cv">${mt[i] ? short(mt[i]) : ''}</span><div class="cbar ${ym === viewYm ? 'sel' : ''}" style="height:${Math.max(mt[i] ? 4 : 0, mt[i] / mmax * 100)}%"></div><span class="cl">${monthShort(ym)}</span></div>`).join('')}</div></div>`;

  const days = Array(dim).fill(0); m.forEach(r => days[new Date(r.time).getDate() - 1] += Number(r.amount));
  const dmax = Math.max(1, ...days);
  h += `<h2>${tr('Daily spending')}</h2><div class="card"><div class="dcols">${days.map(v =>
    `<div class="dc"><div class="dbar ${v === dmax && v ? 'peak' : ''}" style="height:${v ? Math.max(4, v / dmax * 100) : 0}%"></div></div>`).join('')}</div>
    <div class="dax"><span>1</span><span>${Math.ceil(dim / 2)}</span><span>${dim}</span></div></div>`;

  const byBank = Object.entries(sumBy(m, r => r.bank || tr('Cash / no bank'))).sort((a, b) => b[1] - a[1]);
  const bmax = byBank[0][1];
  h += `<h2>${tr('By bank')}</h2><div class="card">${byBank.map(([k, v]) =>
    `<div class="hbar"><span>${esc(k.replace(/^.*\((.+)\)$/, '$1'))}</span><div class="ht"><i style="width:${Math.round(v / bmax * 100)}%"></i></div><b>${fmt(v)}</b></div>`).join('')}</div>`;

  h += `<h2>${tr('Top expenses')}</h2><div class="card list">${[...m].sort((a, b) => Number(b.amount) - Number(a.amount)).slice(0, 5).map((r, i) =>
    `<div class="item" data-id="${r.id}"><div class="rank">${i + 1}</div><div class="t">${esc(r.category)}<small>${new Date(r.time).toLocaleDateString(DLOC())}${r.note ? ' · ' + esc(r.note) : ''}</small></div><div class="amt">${fmt(r.amount)}</div></div>`).join('')}</div>`;

  const prevs = [-1, -2, -3].map(n => tot(inM(addMonths(viewYm, n)))).filter(v => v > 0);
  const avg3 = prevs.length ? prevs.reduce((a, b) => a + b, 0) / prevs.length : 0;
  let rating = ['neutral', 'Not enough history yet'];
  if (avg3) { const r = total / avg3; rating = r > 1.15 ? ['high', 'Above your recent average'] : r < 0.85 ? ['low', 'Below your recent average'] : ['mid', 'In line with your recent average']; }
  const wd = Array(7).fill(0); m.forEach(r => wd[new Date(r.time).getDay()] += Number(r.amount));
  const wdTop = wd.indexOf(Math.max(...wd));
  const tips = [];
  if (pct !== null) tips.push(tr('Spending is <b>{0}% {1}</b> than {2} ({3}).', Math.abs(pct).toFixed(0), tr(pct > 0 ? 'higher' : 'lower'), monthLabel(prevYm), fmt(pTotal)));
  tips.push(tr('<b>{0}</b> is your biggest category: {1}% of the month ({2}).', esc(byCat[0][0]), Math.round(byCat[0][1] / total * 100), fmt(byCat[0][1])));
  if (byCat.length > 1) tips.push(tr('The top 2 categories together make up {0}% of spending.', Math.round((byCat[0][1] + byCat[1][1]) / total * 100)));
  tips.push(tr('You spend about <b>{0}</b> per day.', fmt(avgDay)) + (isCur && elapsed < dim ? tr(' At this pace the month would end near <b>{0}</b>.', fmt(avgDay * dim)) : ''));
  tips.push(tr('Spending peaks on <b>{0}</b> ({1}).', weekdayName(wdTop) + (lang === 'en' ? 's' : ''), fmt(wd[wdTop])));
  tips.push(tr('Largest single expense: <b>{0}</b> ({1}) on {2}.', fmt(biggest.amount), esc(biggest.category), new Date(biggest.time).toLocaleDateString(DLOC())));
  h += `<h2>${tr('Assessment')}</h2><div class="card"><div class="rate ${rating[0]}">${tr(rating[1])}${avg3 ? ` <small>${tr('(3-month avg {0})', fmt(avg3))}</small>` : ''}</div><ul class="tips">${tips.map(t => `<li>${t}</li>`).join('')}</ul></div>`;
  $('#statsBody').innerHTML = h;
}
bindMonthNav($('#statsBody'), renderStats);

// ---------- quy tắc 6 hũ (55/10/10/10/10/5) ----------
const DEF_JARS = 'Necessities | 55 | Fuel, Home bills, Health, Other\nLong-term savings | 10 |\nEducation | 10 |\nPlay | 10 | Food & Coffee, Shopping, Entertainment\nFinancial freedom | 10 |\nGive | 5 |';
const JAR_ICONS = ['🏠', '🏦', '📚', '🎉', '🌱', '🎁'];
const jarCfg = () => cfg.get('jars', DEF_JARS).split('\n').map(l => l.split('|').map(s => s.trim())).filter(a => a[0])
  .map(a => { const raw = (a[2] || '').split(',').map(s => s.trim()).filter(Boolean); return { name: a[0], pct: Number(a[1]) || 0, raw, cats: raw.map(s => s.toLowerCase()) }; });
const saveJars = jars => cfg.set('jars', jars.map(j => `${j.name} | ${j.pct} | ${j.raw.join(', ')}`).join('\n'));
const income = () => Number(cfg.get('income', '0')) || 0;

async function renderJars() {
  const recs = (await allRecs()).filter(r => r.status === 'done' && ymOf(r.time) === viewYm);
  const jars = jarCfg(), inc = income();
  let h = monthNav('light') +
    `<div class="card incrow"><label>${tr('Monthly income')}<input id="incomeIn" inputmode="numeric" placeholder="0" value="${inc ? inc.toLocaleString(LOC()) : ''}"></label><button id="incomeSave" class="big">${tr('Save')}</button></div>`;
  if (!inc) {
    $('#jarsBody').innerHTML = h + `<p class="hint">${tr('Set your monthly income to split it into jars.')}</p>`;
    bindIncome(); return;
  }
  const spentOf = j => recs.filter(r => j.cats.includes(catName(r.category))).reduce((s, r) => s + Number(r.amount), 0);
  const mapped = new Set(jars.flatMap(j => j.cats));
  const unassigned = recs.filter(r => !mapped.has(catName(r.category))).reduce((s, r) => s + Number(r.amount), 0);
  const totalSpent = recs.reduce((s, r) => s + Number(r.amount), 0);
  const sumPct = jars.reduce((s, j) => s + j.pct, 0);
  h += `<div class="kpis"><div class="kpi wide"><div class="l">${tr('Monthly income')}</div><div class="v">${fmt(inc)}</div>` +
    `<div class="sub2">${tr('Spent {0} · {1}% of income', fmt(totalSpent), Math.round(totalSpent / inc * 100))}</div></div></div>`;
  if (sumPct !== 100) h += `<div class="card warnbox">${tr('Your jar percentages add up to {0}%, not 100%. Fix them in Settings > Advanced.', sumPct)}</div>`;
  h += `<h2>${tr('Your jars')}</h2>`;
  jars.forEach((j, i) => {
    const alloc = inc * j.pct / 100, spent = spentOf(j), left = alloc - spent;
    const track = j.cats.length > 0;
    const used = alloc ? Math.min(100, spent / alloc * 100) : 0;
    h += `<div class="card jar"><div class="jtop"><span class="jic">${JAR_ICONS[i % JAR_ICONS.length]}</span><div class="jn">${esc(j.name)}<small>${j.pct}% · ${fmt(alloc)}</small></div>` +
      (track ? `<div class="jr ${left < 0 ? 'over' : ''}">${left < 0 ? tr('Over by {0}', fmt(-left)) : tr('{0} left', fmt(left))}</div>` : `<div class="jr">${tr('Set aside')}</div>`) + '</div>' +
      (track ? `<div class="jbar"><i class="${left < 0 ? 'over' : used > 85 ? 'warn' : ''}" style="width:${used}%"></i></div><div class="jsub">${tr('Spent {0} of {1}', fmt(spent), fmt(alloc))}</div>`
        : `<div class="jsub">${tr('Transfer {0} to this jar each month. Nothing is tracked here.', fmt(alloc))}</div>`) + '</div>';
  });
  if (unassigned > 0) h += `<div class="card jsub">${tr('Not in any jar: <b>{0}</b>. Assign those categories to a jar in the Categories tab.', fmt(unassigned))}</div>`;
  $('#jarsBody').innerHTML = h;
  bindIncome();
}
function bindIncome() {
  const i = $('#incomeIn'); if (!i) return;
  i.oninput = () => { const d = i.value.replace(/\D/g, ''); i.value = d ? Number(d).toLocaleString(LOC()) : ''; };
  $('#incomeSave').onclick = () => { cfg.set('income', i.value.replace(/\D/g, '')); renderJars(); };
}
bindMonthNav($('#jarsBody'), renderJars);

// ---------- tab Danh mục: xem, thêm, xoá, gán hũ ----------
async function renderCategories() {
  const recs = (await allRecs()).filter(r => r.status === 'done' && ymOf(r.time) === viewYm);
  const spentBy = {}; recs.forEach(r => { const k = catName(r.category); spentBy[k] = (spentBy[k] || 0) + Number(r.amount); });
  const jars = jarCfg();
  const jarOptions = sel => `<option value="-1">${tr('No jar')}</option>` + jars.map((j, i) => `<option value="${i}" ${sel === i ? 'selected' : ''}>${esc(j.name)}</option>`).join('');
  let h = monthNav('light') + `<p class="hint">${tr('Your categories and the jar each one belongs to. New ones show up in the expense form and in your Google Sheet as soon as you use them.')}</p>`;
  cats().forEach((c, i) => {
    const [e, ...rest] = c.split(' '); const name = rest.join(' ') || e;
    const ji = jars.findIndex(j => j.cats.includes(name.toLowerCase()));
    h += `<div class="card crow"><span class="cic">${esc(e)}</span><div class="cn">${esc(name)}<small>${tr('{0} this month', fmt(spentBy[name.toLowerCase()] || 0))}</small></div>` +
      `<select class="jsel" data-name="${esc(name)}" aria-label="Jar">${jarOptions(ji)}</select><button class="cdel" data-i="${i}" aria-label="${tr('Remove')}">✕</button></div>`;
  });
  h += `<h2>${tr('Add a category')}</h2><div class="card addcat"><div class="arow"><label class="ico">${tr('Icon')}<input id="newEmoji" value="🏷️" maxlength="4"></label>` +
    `<label class="nm">${tr('Name')}<input id="newName" placeholder="${tr('e.g. Pets')}"></label></div>` +
    `<select id="newJar" class="jsel wide" aria-label="Jar">${jarOptions(-1)}</select><button id="addCat" class="big">${tr('Add')}</button></div>`;
  $('#catsBody').innerHTML = h;
}
const setJarFor = (name, idx) => {
  const jars = jarCfg(), n = name.toLowerCase();
  jars.forEach(j => { j.raw = j.raw.filter(c => c.toLowerCase() !== n); });
  if (idx >= 0 && jars[idx]) jars[idx].raw.push(name);
  saveJars(jars);
};
$('#catsBody').onclick = e => {
  const b = e.target.closest('[data-m]');
  if (b && !b.disabled) { shiftMonth(Number(b.dataset.m)); renderCategories(); return; }
  const del = e.target.closest('.cdel');
  if (del) {
    if (!confirm(tr('Remove this category? Past expenses keep it.'))) return;
    const list = cats(); const [removed] = list.splice(Number(del.dataset.i), 1);
    cfg.set('cats', list.join('\n')); setJarFor(removed.split(' ').slice(1).join(' ') || removed, -1); renderCategories(); return;
  }
  if (e.target.id === 'addCat') {
    const name = $('#newName').value.trim(), emoji = ($('#newEmoji').value.trim().replace(/\s+/g, '') || '🏷️');
    if (!name) { toast(tr('Enter a name first')); return; }
    if (cats().some(c => catName(c) === name.toLowerCase())) { toast(tr('That category already exists')); return; }
    cfg.set('cats', cats().concat(`${emoji} ${name}`).join('\n'));
    setJarFor(name, Number($('#newJar').value));
    renderCategories();
  }
};
$('#catsBody').onchange = e => {
  if (e.target.classList.contains('jsel') && e.target.dataset.name) setJarFor(e.target.dataset.name, Number(e.target.value));
};

// ---------- phóng to chi tiết giao dịch ----------
async function openSheet(r) {
  const row = (k, v) => v ? `<div class="drow"><span>${tr(k)}</span><b>${esc(v)}</b></div>` : '';
  $('#sheetBody').innerHTML =
    `<div class="d-cat">${esc(r.category)}</div><div class="d-amt">${fmt(r.amount)}</div>` +
    row('Date', new Date(r.time).toLocaleString(DLOC())) + row('Bank', r.bank) + row('Payee', r.payee) +
    row('Note', r.note) + row('Google Sheet', r.synced ? tr('Synced') : tr('Not synced yet')) +
    '<div id="sheetPhoto"></div>';
  $('#sheet').hidden = false;
  document.body.classList.add('noscroll');
  if (r.photo) {
    const b = await getPhoto(r.id);
    if (b) {
      const i = new Image(); i.src = URL.createObjectURL(b); i.className = 'd-photo';
      i.onclick = () => savePhoto(b, r.photo);
      $('#sheetPhoto').append(i);
      $('#sheetPhoto').insertAdjacentHTML('beforeend', `<p class="hint">${tr('Tap the photo to save it to your iPhone Photos.')}</p>`);
    }
  }
}
function closeSheet() { $('#sheet').hidden = true; document.body.classList.remove('noscroll'); }
$('#sheetClose').onclick = closeSheet;
$('#sheet').onclick = e => { if (e.target.id === 'sheet') closeSheet(); };

// ---------- thư viện ảnh ----------
async function openGallery() {
  show('gallery');
  const g = $('#gal'); g.innerHTML = '';
  const recs = (await allRecs()).filter(r => r.photo && r.status === 'done').sort((a, b) => b.time.localeCompare(a.time));
  if (!recs.length) g.innerHTML = `<p class="hint">${tr('No photos yet.')}</p>`;
  for (const r of recs) {
    const b = await getPhoto(r.id); if (!b) continue;
    const i = new Image(); i.src = URL.createObjectURL(b);
    i.onclick = () => savePhoto(b, r.photo);
    g.append(i);
  }
}
// iOS không cho web tự ghi vào Photos: dùng Share Sheet > "Lưu hình ảnh"
async function savePhoto(blob, name) {
  const f = new File([blob], name, { type: 'image/jpeg' });
  if (navigator.canShare && navigator.canShare({ files: [f] })) {
    try { await navigator.share({ files: [f] }); } catch {}
  } else toast(tr('Press and hold the photo to save it'));
}

// ---------- cài đặt: ngôn ngữ, giao diện, phiên bản (+ nâng cao thu gọn) ----------
// File Google Sheet chứa dữ liệu (chỉ mở được khi đăng nhập đúng tài khoản Google, Sheet không chia sẻ cho ai)
const SHEET_FILE = 'https://docs.google.com/spreadsheets/d/1h6gpLCcJoevkHnPB9yo8R86ALhcuY2pb5Bjd_H8fLhw/edit';
function renderSettings() {
  $('#verText').textContent = VERSION;
  $('#openSheetLink').href = cfg.get('sheetFile', SHEET_FILE);
  $('#sheetFile').value = cfg.get('sheetFile', SHEET_FILE);
  $('#sheetUrl').value = cfg.get('sheetUrl', '');
  $('#jarsText').value = cfg.get('jars', DEF_JARS);
  $('#banksText').value = cfg.get('banks', DEF_BANKS);
  document.querySelectorAll('#segLang button').forEach(b => b.classList.toggle('on', b.dataset.v === lang));
  document.querySelectorAll('#segTheme button').forEach(b => b.classList.toggle('on', b.dataset.v === cfg.get('theme', 'auto')));
}
document.querySelectorAll('#segLang button').forEach(b => b.onclick = () => {
  lang = b.dataset.v; cfg.set('lang', lang); translateDom(); show(curView, false);
});
document.querySelectorAll('#segTheme button').forEach(b => b.onclick = () => {
  cfg.set('theme', b.dataset.v); applyTheme(); renderSettings();
});
$('#saveAdv').onclick = () => {
  cfg.set('sheetFile', $('#sheetFile').value.trim() || SHEET_FILE);
  cfg.set('sheetUrl', $('#sheetUrl').value.trim());
  cfg.set('jars', $('#jarsText').value);
  cfg.set('banks', $('#banksText').value);
  sync(); show('home');
};
$('#testSheet').onclick = async () => {
  cfg.set('sheetUrl', $('#sheetUrl').value.trim());
  const ok = await post({ id: 'test-' + Date.now(), time: new Date().toISOString(), category: 'TEST', amount: 0, note: 'test row', payee: '', bank: '', photo: '' });
  toast(tr(ok ? 'Sent. Check the ChiTieu tab in your Sheet' : 'Send failed, check the link'));
};
$('#updateApp').onclick = async () => {   // xoá service worker + cache rồi tải lại để lấy bản mới nhất
  try {
    const rs = await navigator.serviceWorker.getRegistrations(); await Promise.all(rs.map(r => r.unregister()));
    const ks = await caches.keys(); await Promise.all(ks.map(k => caches.delete(k)));
  } catch {}
  location.reload();
};

// ---------- khởi động ----------
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).catch(() => {});
  let reloaded = false;   // bản mới của service worker lên thì tự tải lại một lần
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (!reloaded) { reloaded = true; location.reload(); } });
}
translateDom();
show('home', false);
sync();
