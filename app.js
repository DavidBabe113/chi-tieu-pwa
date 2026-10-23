'use strict';
const VERSION = '2.0.0';
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const sum = a => a.reduce((s, r) => s + Number(r.amount), 0);

// ---------- cấu hình cục bộ ----------
const cfg = {
  get: (k, d) => { try { return localStorage.getItem(k) ?? d; } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem(k, v); } catch {} },
  del: k => { try { localStorage.removeItem(k); } catch {} },
};
const getJSON = (k, d) => { try { return JSON.parse(cfg.get(k, '')) ?? d; } catch { return d; } };

// ---------- ngôn ngữ (English / Tiếng Việt) ----------
let lang = cfg.get('lang', 'en') === 'vi' ? 'vi' : 'en';
const VI = {
  // tab & tiêu đề
  'Expenses': 'Chi tiêu', 'Overview': 'Tổng quan', 'Statistics': 'Thống kê', '6 Jars': '6 hũ', 'Categories': 'Danh mục',
  'Choose from Photos': 'Chọn từ thư viện ảnh', 'No QR code found in this photo': 'Không tìm thấy mã QR trong ảnh này', 'Scan QR from a photo': 'Quét QR từ ảnh',
  'Scan QR': 'Quét QR', 'Choose category': 'Chọn danh mục', 'Details': 'Chi tiết', 'Choose bank': 'Chọn ngân hàng',
  'Photo library': 'Thư viện ảnh', 'Settings': 'Cài đặt', 'Back': 'Quay lại', 'Close': 'Đóng', 'Add manually': 'Nhập tay',
  // tổng quan
  'Spent this month': 'Đã chi tháng này', 'Transactions': 'Giao dịch', 'Previous month': 'Tháng trước', 'Next month': 'Tháng sau',
  'Today': 'Hôm nay', 'Yesterday': 'Hôm qua', 'No transactions in this month.': 'Chưa có giao dịch trong tháng này.',
  '⏳ pending': '⏳ chờ đồng bộ', 'Did the transfer go through?': 'Giao dịch đã thành công?', 'Cancel': 'Huỷ', 'Done': 'Xong',
  // quét & nhập
  'Point the camera at the QR code…': 'Đưa mã QR vào khung hình…',
  'Cannot open the camera. Allow camera access in iPhone Settings > Safari / this app.': 'Không mở được camera. Vào Cài đặt iPhone > Safari / ứng dụng > Camera để cấp quyền.',
  'Payee: {0}': 'Người nhận: {0}', 'Amount (₫)': 'Số tiền (₫)', 'Date': 'Ngày', 'Note': 'Ghi chú', 'e.g. coffee with a client': 'Ví dụ: cà phê với khách',
  '📸 Take a receipt photo': '📸 Chụp ảnh hoá đơn', '📁 Save to the expense album': '📁 Lưu vào album chi tiêu',
  'Save manually via the share sheet': 'Lưu thủ công qua bảng chia sẻ', 'Next: choose bank': 'Tiếp: chọn ngân hàng',
  'Save only, do not open a bank': 'Chỉ lưu, không mở ngân hàng', 'Save income': 'Lưu khoản thu',
  'Choose a bank. Its app opens and you confirm with Face ID as usual. Enter the amount there yourself.': 'Chọn ngân hàng. App ngân hàng sẽ mở, bạn xác thực khuôn mặt như bình thường và tự nhập số tiền ở đó.',
  "This is the app's own photo storage. Tap a photo and choose \"Save Image\" to put it into your iPhone Photos.": 'Đây là kho ảnh riêng của app. Chạm vào ảnh rồi chọn "Lưu hình ảnh" để đưa vào album Ảnh của iPhone.',
  'Enter an amount first': 'Hãy nhập số tiền trước', 'Could not copy the photo, try again': 'Không copy được ảnh, thử lại',
  'No app link for this bank. Set one in Settings': 'Chưa có link app cho ngân hàng này. Thêm trong Cài đặt',
  'Could not open the app. Check the link in Settings.': 'Không mở được app. Kiểm tra link trong Cài đặt.',
  'No photos yet.': 'Chưa có ảnh nào.', 'Press and hold the photo to save it': 'Giữ lâu vào ảnh để lưu',
  // chi tiết giao dịch
  'Bank': 'Ngân hàng', 'Payee': 'Người nhận', 'Type': 'Loại', 'Sync': 'Đồng bộ', 'Synced': 'Đã đồng bộ', 'Pending': 'Đang chờ',
  'Tap the photo to save it to your iPhone Photos.': 'Chạm vào ảnh để lưu vào album Ảnh của iPhone.',
  // thống kê
  'No transactions in this month yet.': 'Tháng này chưa có giao dịch.', 'Daily average': 'Trung bình mỗi ngày', 'Largest expense': 'Khoản chi lớn nhất',
  'Month-end estimate': 'Dự kiến cuối tháng', 'Savings rate': 'Tỷ lệ tiết kiệm', 'vs {0}': 'so với {0}',
  'By category': 'Theo danh mục', 'Last 6 months': '6 tháng gần nhất', 'Daily spending': 'Chi theo ngày', 'By bank': 'Theo ngân hàng',
  'Top expenses': 'Chi lớn nhất', 'Assessment': 'Đánh giá', 'Cash / no bank': 'Tiền mặt / không qua ngân hàng', 'Others': 'Khác',
  'Above your recent average': 'Cao hơn mức trung bình gần đây', 'Below your recent average': 'Thấp hơn mức trung bình gần đây',
  'In line with your recent average': 'Ngang mức trung bình gần đây', 'Not enough history yet': 'Chưa đủ dữ liệu lịch sử',
  '(3-month avg {0})': '(TB 3 tháng {0})', 'higher': 'cao hơn', 'lower': 'thấp hơn',
  'Spending is <b>{0}% {1}</b> than {2} ({3}).': 'Chi tiêu <b>{1} {0}%</b> so với {2} ({3}).',
  '<b>{0}</b> is your biggest category: {1}% of the month ({2}).': '<b>{0}</b> là danh mục lớn nhất: {1}% trong tháng ({2}).',
  'The top 2 categories together make up {0}% of spending.': '2 danh mục lớn nhất chiếm {0}% tổng chi.',
  'You spend about <b>{0}</b> per day.': 'Bạn chi khoảng <b>{0}</b> mỗi ngày.',
  'Spending peaks on <b>{0}</b> ({1}).': 'Chi nhiều nhất vào <b>{0}</b> ({1}).',
  'Largest single expense: <b>{0}</b> ({1}) on {2}.': 'Khoản chi lớn nhất: <b>{0}</b> ({1}) ngày {2}.',
  'You saved <b>{0}%</b> of your income this month.': 'Bạn đã tiết kiệm <b>{0}%</b> thu nhập tháng này.',
  'Spending is higher than income by <b>{0}</b> this month.': 'Chi tiêu vượt thu nhập <b>{0}</b> trong tháng này.',
  'Income vs spending': 'Thu nhập và chi tiêu', 'Net': 'Chênh lệch', 'Income': 'Thu nhập', 'Spending': 'Chi tiêu', 'Expense': 'Chi tiêu',
  // 6 hũ
  'Necessities': 'Thiết yếu', 'Long-term savings': 'Tiết kiệm dài hạn', 'Education': 'Giáo dục', 'Play': 'Hưởng thụ', 'Financial freedom': 'Tự do tài chính', 'Give': 'Cho đi',
  'Income this month': 'Thu nhập tháng này', '{0} income entries': '{0} khoản thu', '{0} income entry': '{0} khoản thu',
  'Jars fill automatically from your income and spending.': 'Các hũ tự cập nhật theo thu nhập và chi tiêu của bạn.',
  'Add income': 'Thêm khoản thu', 'Jars': 'Các hũ', 'Total': 'Tổng', 'Save {0}': 'Lưu {0}', 'Saved for {0}': 'Đã lưu cho {0}',
  'Percentages must add up to 100': 'Tổng phần trăm phải bằng 100',
  'Percentages can differ every month. Save to keep them for {0}.': 'Tỷ lệ có thể khác nhau mỗi tháng. Bấm lưu để giữ cho {0}.',
  'Spent {0}': 'Đã chi {0}', 'Over by {0}': 'Vượt {0}', '{0} left': 'Còn {0}',
  'Not in any jar: <b>{0}</b>. Assign those categories to a jar in the Categories tab.': 'Chưa thuộc hũ nào: <b>{0}</b>. Gán các danh mục đó vào hũ ở tab Danh mục.',
  // danh mục
  'Your categories and the jar each one belongs to. Spending in a category is deducted from its jar.': 'Danh mục của bạn và hũ tương ứng. Chi tiêu của danh mục sẽ được trừ vào hũ đó.',
  '{0} this month': '{0} trong tháng', 'No jar': 'Không thuộc hũ', 'Add a category': 'Thêm danh mục', 'Name': 'Tên', 'Icon': 'Biểu tượng', 'Add': 'Thêm',
  'e.g. Pets': 'Ví dụ: Thú cưng', 'That category already exists': 'Danh mục này đã có', 'Enter a name first': 'Hãy nhập tên trước',
  'Remove this category? Past expenses keep it.': 'Xoá danh mục này? Các khoản đã chi vẫn giữ nguyên.', 'Remove': 'Xoá',
  'Income categories': 'Danh mục thu nhập', 'Add an income category': 'Thêm danh mục thu nhập', 'e.g. Rental': 'Ví dụ: Cho thuê',
  // cài đặt & bảo mật
  'Language': 'Ngôn ngữ', 'Appearance': 'Giao diện', 'Light': 'Sáng', 'Dark': 'Tối', 'Auto': 'Tự động', 'About': 'Thông tin', 'Version': 'Phiên bản',
  'Check for updates': 'Kiểm tra cập nhật', 'Advanced': 'Nâng cao',
  'Security': 'Bảo mật', 'PIN lock': 'Khoá bằng mã PIN', 'Set PIN': 'Đặt mã PIN', 'Change PIN': 'Đổi mã PIN', 'Turn off PIN': 'Tắt mã PIN',
  'On': 'Bật', 'Off': 'Tắt', 'Enter PIN': 'Nhập mã PIN', 'Create a 4-digit PIN': 'Tạo mã PIN 4 số', 'Confirm PIN': 'Nhập lại mã PIN',
  'PINs do not match': 'Hai mã PIN không khớp', 'Wrong PIN': 'Sai mã PIN', 'Too many attempts. Wait {0}s': 'Nhập sai nhiều lần. Chờ {0} giây',
  'Forgot PIN?': 'Quên mã PIN?', 'Face ID': 'Face ID', 'Turn on Face ID': 'Bật Face ID', 'Turn off Face ID': 'Tắt Face ID', 'Use Face ID': 'Dùng Face ID',
  'Face ID failed, enter your PIN': 'Face ID không thành công, hãy nhập mã PIN', 'Face ID could not be turned on on this device': 'Không bật được Face ID trên thiết bị này',
  'To reset a forgotten PIN, delete the app icon and add it again from Safari. Data on this phone that is not synced yet is lost.': 'Quên mã PIN thì xoá icon app rồi thêm lại từ Safari. Dữ liệu trên máy chưa đồng bộ sẽ mất.',
  'Data': 'Dữ liệu', '📊 Open Google Sheet': '📊 Mở Google Sheet', 'Google Sheet file link': 'Link file Google Sheet',
  'Google Apps Script link (Web App)': 'Link Google Apps Script (Web App)', 'Send a test row': 'Gửi thử 1 dòng', 'Banks': 'Ngân hàng',
  'One per line: Name (Brand) | app link. Edit if an app does not open.': 'Mỗi dòng: Tên (Thương hiệu) | link mở app. Sửa lại nếu app không mở được.',
  'Sent. Check the ChiTieu tab in your Sheet': 'Đã gửi. Mở tab ChiTieu trong Sheet để kiểm tra', 'Send failed, check the link': 'Gửi lỗi, kiểm tra link',
  'Save': 'Lưu',
};
const tr = (s, ...a) => { let r = (lang === 'vi' && VI[s]) || s; a.forEach((v, i) => r = r.replace('{' + i + '}', v)); return r; };
const LOC = () => lang === 'vi' ? 'vi-VN' : 'en-US';
const DLOC = () => lang === 'vi' ? 'vi-VN' : 'en-GB';
const fmt = n => (Math.round(Number(n)) || 0).toLocaleString(LOC()) + '₫';

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
    const key = 'data-o-' + a; if (!el.hasAttribute(key)) el.setAttribute(key, el.getAttribute(a));
    const o = el.getAttribute(key); el.setAttribute(a, lang === 'vi' && VI[o] ? VI[o] : o);
  }));
  document.documentElement.lang = lang;
  document.title = tr('Expenses');
}

// ---------- giao diện sáng / tối ----------
function applyTheme() {
  const t = cfg.get('theme', 'auto');
  if (t === 'light' || t === 'dark') document.documentElement.dataset.theme = t; else delete document.documentElement.dataset.theme;
  const dark = t === 'dark' || (t === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
  const m = document.querySelector('meta[name=theme-color]'); if (m) m.content = dark ? '#000000' : '#f5f5f7';
}
applyTheme();

// ---------- mặc định ----------
const DEF_CATS = '⛽ Fuel\n☕ Food & Coffee\n🛍 Shopping\n🏠 Home bills\n🏥 Health\n🎬 Entertainment\n📦 Other';
const DEF_ICATS = '💼 Salary\n🎁 Bonus\n💻 Freelance\n📈 Investment\n🧧 Gift\n💰 Other income';
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
// File Google Sheet chứa dữ liệu (chỉ mở được khi đăng nhập đúng tài khoản Google, Sheet không chia sẻ cho ai)
const SHEET_FILE = 'https://docs.google.com/spreadsheets/d/1h6gpLCcJoevkHnPB9yo8R86ALhcuY2pb5Bjd_H8fLhw/edit';
// Cài đặt cũ chưa chỉnh tay thì tự đổi sang mặc định mới
if (cfg.get('cats', '').startsWith('⛽ Tiền xăng')) cfg.del('cats');
if (/vcbdigibank|dl\.vietqr\.io|techcombank:\/\//.test(cfg.get('banks', '')) || cfg.get('banks', '') === OLD_BANKS) cfg.del('banks');

// ---------- 6 hũ: dữ liệu ----------
const JAR_KEYS = ['Necessities', 'Long-term savings', 'Education', 'Play', 'Financial freedom', 'Give'];
const JAR_ICONS = ['🏠', '🏦', '📚', '🎉', '🌱', '🎁'];
const DEF_PCT = [55, 10, 10, 10, 10, 5];
const DEF_JARMAP = { 'fuel': 0, 'home bills': 0, 'health': 0, 'other': 0, 'food & coffee': 3, 'shopping': 3, 'entertainment': 3 };
if (!cfg.get('jarmap', '')) {   // lần đầu (hoặc nâng cấp từ bản cũ dùng danh sách chữ)
  let m = DEF_JARMAP; const old = cfg.get('jars', '');
  if (old) { m = {}; old.split('\n').forEach((l, i) => (l.split('|')[2] || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean).forEach(c => m[c] = i)); }
  cfg.set('jarmap', JSON.stringify(m));
}
const jarMap = () => getJSON('jarmap', {});
const pctSaved = () => getJSON('jarpct', {});
// Tỷ lệ của một tháng: đã lưu cho tháng đó; nếu chưa thì kế thừa tháng đã lưu gần nhất trước đó; không có thì mặc định 55/10/10/10/10/5
function pctFor(ym) {
  const s = pctSaved(); if (s[ym]) return s[ym].slice();
  const keys = Object.keys(s).sort();
  const before = keys.filter(k => k < ym).pop() || keys[0];
  return before ? s[before].slice() : DEF_PCT.slice();
}
const jarName = i => tr(JAR_KEYS[i]);

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
// Mỗi khi một giao dịch hoàn tất được lưu, tháng đó cần gửi lại bảng 6 hũ (thu nhập/chi tiêu đổi)
const putRec = r => tx('records', 'readwrite', s => s.put(r)).then(x => { if (r.status === 'done') markJars(ymOf(r.time)); return x; });
const delRec = id => tx('records', 'readwrite', s => s.delete(id));
const allRecs = () => tx('records', 'readonly', s => s.getAll());
const putPhoto = (id, blob) => tx('photos', 'readwrite', s => s.put({ id, blob }));
const getPhoto = id => tx('photos', 'readonly', s => s.get(id)).then(x => x && x.blob);
const delPhoto = id => tx('photos', 'readwrite', s => s.delete(id));
const doneRecs = async () => (await allRecs()).filter(r => r.status === 'done');

// ---------- trạng thái ----------
let cur = null;          // bản ghi đang soạn
let curPhoto = null;     // blob ảnh đang soạn
let stream = null, scanning = false, curView = 'home';

const cats = () => cfg.get('cats', DEF_CATS).split('\n').map(s => s.trim()).filter(Boolean);
const icats = () => cfg.get('icats', DEF_ICATS).split('\n').map(s => s.trim()).filter(Boolean);
const isInc = r => r.type === 'income';       // bản ghi cũ không có type = chi tiêu
const banks = () => cfg.get('banks', DEF_BANKS).split('\n').map(l => l.split('|').map(s => s.trim()))
  .filter(a => a[0]).map(a => ({ name: a[0], url: a[1] || '' }));

function toast(msg, ms = 2600) {
  const t = $('#toast'); t.textContent = msg; t.hidden = false;
  clearTimeout(toast.t); toast.t = setTimeout(() => t.hidden = true, ms);
}

// ---------- điều hướng (dùng lịch sử trình duyệt để vuốt cạnh trái = quay lại) ----------
const TITLES = { home: 'Expenses', stats: 'Statistics', jars: '6 Jars', cats: 'Categories', scan: 'Scan QR', cat: 'Choose category', detail: 'Details', bank: 'Choose bank', gallery: 'Photo library', settings: 'Settings' };
const TOP = ['home', 'stats', 'jars', 'cats'];
let depth = 0, pendingTop = null, lastBack = 0, dir = 'fwd';
try { history.replaceState({ v: 'home', d: 0 }, ''); } catch {}
// mode: true = thêm vào lịch sử, false = không đụng lịch sử, 'replace' = thay mục hiện tại
function show(v, mode = true) {
  if (v !== 'scan') stopScan();
  const inner = !TOP.includes(v);
  try {
    if (inner && mode === true) { depth++; history.pushState({ v, d: depth }, ''); }
    else if (inner && mode === 'replace') history.replaceState({ v, d: depth }, '');
    else if (!inner && mode === true && depth === 0) history.replaceState({ v, d: 0 }, '');
  } catch {}
  curView = v;
  document.body.dataset.dir = dir;
  document.querySelectorAll('main > section').forEach(s => s.hidden = s.id !== 'v-' + v);
  $('#title').textContent = tr(TITLES[v]);
  $('#back').hidden = !inner;
  $('#tabs').hidden = inner;
  if (!inner) $('#tabs').style.setProperty('--i', TOP.indexOf(v));
  document.querySelectorAll('#tabs button').forEach(b => b.classList.toggle('on', b.dataset.tab === v));
  window.scrollTo(0, 0);
  if (v === 'home') renderHome();
  if (v === 'stats') renderStats();
  if (v === 'jars') renderJars();
  if (v === 'cats') renderCategories();
  if (v === 'settings') renderSettings();
}
// Về màn hình chính của một tab và dọn lịch sử các màn con
function goTop(v = 'home') {
  if (depth > 0) { pendingTop = v; try { history.go(-depth); } catch { depth = 0; show(v, false); } }
  else show(v, false);
}
window.addEventListener('popstate', e => {
  lastBack = Date.now();
  if (!$('#sheet').hidden) { hideSheet(); return; }
  const s = e.state || { v: 'home', d: 0 };
  depth = s.d || 0;
  dir = 'back';
  let v = pendingTop || s.v; pendingTop = null;
  if (!TOP.includes(v) && v !== 'gallery' && v !== 'settings' && !cur) v = 'home';
  if (v === 'scan') v = 'home';
  show(v, false);
  dir = 'fwd';
});
const goBack = () => { if (depth > 0) history.back(); else show('home', false); };
document.querySelectorAll('#tabs button').forEach(b => b.onclick = () => show(b.dataset.tab, true));
$('#back').onclick = goBack;
$('#openSettings').onclick = () => show('settings');
// Vuốt từ mép trái sang phải để quay lại (trình duyệt tự làm trong chế độ app; đây là dự phòng, có chống gọi hai lần)
let tx0 = 0, ty0 = 0, tracking = false;
addEventListener('touchstart', e => { const t = e.touches[0]; tracking = t.clientX < 28 && (depth > 0 || !$('#sheet').hidden) && $('#lock').hidden; tx0 = t.clientX; ty0 = t.clientY; }, { passive: true });
addEventListener('touchend', e => {
  if (!tracking) return; tracking = false;
  const t = e.changedTouches[0];
  if (t.clientX - tx0 > 70 && Math.abs(t.clientY - ty0) < 60 && Date.now() - lastBack > 700) { lastBack = Date.now(); history.back(); }
}, { passive: true });

// ---------- quét QR ----------
$('#btnScan').onclick = startScan;
$('#btnManual').onclick = () => { cur = newRec(); renderCats(); show('cat'); };
$('#btnGallery').onclick = openGallery;

function newRec() {
  return { type: 'expense', fromQr: false, acc: '', bin: '', id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), time: new Date().toISOString(), category: '', amount: '', note: '', payee: '', bank: '', photo: '', status: 'draft', synced: false };
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

// Quét QR từ ảnh trong thư viện: thu nhỏ ảnh lớn, thử nhiều kích thước và cả mã đảo màu
async function decodeQrFile(file) {
  let bmp;
  try { bmp = await createImageBitmap(file); }
  catch { bmp = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = URL.createObjectURL(file); }); }
  const w0 = bmp.width, h0 = bmp.height;
  for (const maxSide of [1600, 1000, 2400, 600]) {
    const k = Math.min(1, maxSide / Math.max(w0, h0)), w = Math.round(w0 * k), h = Math.round(h0 * k);
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(bmp, 0, 0, w, h);
    const code = jsQR(x.getImageData(0, 0, w, h).data, w, h, { inversionAttempts: 'attemptBoth' });
    if (code && code.data) return code.data;
  }
  return null;
}
$('#btnPhotoQr').onclick = () => $('#qrFile').click();
$('#scanPhotoBtn').onclick = () => $('#qrFile').click();
$('#qrFile').onchange = async e => {
  const f = e.target.files[0]; e.target.value = ''; if (!f) return;
  let data = null;
  try { data = await decodeQrFile(f); } catch {}
  if (data) onQr(data, curView === 'scan' ? 'replace' : true);
  else toast(tr('No QR code found in this photo'));
};

function onQr(raw, mode = 'replace') {
  stopScan();
  cur = newRec(); cur.fromQr = true;
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
  renderCats(); show('cat', mode);   // từ camera: thay màn quét để vuốt quay lại về trang chủ; từ ảnh ở trang chủ: thêm mới
}

// ---------- chọn danh mục / chi tiết ----------
document.querySelectorAll('#segType button').forEach(b => b.onclick = () => { cur.type = b.dataset.v; renderCats(); });
function renderCats() {
  if (!cur.payee) $('#qrInfo').hidden = true;
  $('#segType').hidden = cur.fromQr;   // quét QR chuyển khoản luôn là chi tiêu
  document.querySelectorAll('#segType button').forEach(b => b.classList.toggle('on', b.dataset.v === cur.type));
  $('#cats').innerHTML = '';
  (cur.type === 'income' ? icats() : cats()).forEach(c => {
    const [e, ...rest] = c.split(' ');
    const b = document.createElement('button');
    b.innerHTML = `<span class="e">${esc(e)}</span>${esc(rest.join(' ') || e)}`;
    b.onclick = () => { cur.category = c; openDetail(); };
    $('#cats').append(b);
  });
}
const ymd = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
function openDetail() {
  $('#amount').value = cur.amount ? Number(cur.amount).toLocaleString(LOC()) : '';
  $('#note').value = cur.note;
  $('#dateIn').value = ymd(new Date(cur.time));
  $('#preview').hidden = true; $('#photoSave').hidden = true; $('#photoAlbum').hidden = true; curPhoto = null;
  const inc = cur.type === 'income';   // khoản thu: không ảnh, không ngân hàng
  $('.photo').hidden = inc; $('#toBank').hidden = inc; $('#saveOnly').hidden = inc; $('#saveIncome').hidden = !inc;
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
  const dv = $('#dateIn').value;   // ngày giao dịch (mặc định hôm nay); giữ giờ hiện tại
  if (dv) { const [y, m, d] = dv.split('-').map(Number), n = new Date(); cur.time = new Date(y, m - 1, d, n.getHours(), n.getMinutes(), n.getSeconds()).toISOString(); }
  return true;
}
async function stash() {
  if (curPhoto) {
    cur.photo = `${cur.time.slice(0, 10).replace(/-/g, '')}_${cur.id}.jpg`;
    await putPhoto(cur.id, curPhoto);
  }
}

// "Save only" = chi tiền mặt, không qua ngân hàng → lưu luôn, không báo gì
$('#saveOnly').onclick = async () => {
  if (!collectDetail()) return;
  await stash();
  cur.status = 'done'; await putRec(cur); sync();
  goTop('home');
};
$('#saveIncome').onclick = async () => {
  if (!collectDetail()) return;
  cur.type = 'income'; cur.status = 'done'; await putRec(cur); sync();
  goTop('home');
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
  goTop('home');
  if (!b.url) { toast(tr('No app link for this bank. Set one in Settings')); return; }
  setTimeout(() => {
    location.href = b.url;
    setTimeout(() => { if (!document.hidden) toast(tr('Could not open the app. Check the link in Settings.'), 4000); }, 1800);
  }, 80);
}

// ---------- thẻ xác nhận cũ (giao dịch pending từ bản trước) ----------
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

// ---------- đồng bộ ----------
async function post(r) {
  const url = cfg.get('sheetUrl', '');
  if (!url) return false;
  try {
    await fetch(url, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify(r) });
    return true;
  } catch { return false; }
}
function markJars(ym) {
  const d = getJSON('jarsDirty', []); if (!d.includes(ym)) { d.push(ym); cfg.set('jarsDirty', JSON.stringify(d)); }
}
async function markAllJars() {   // đổi gán danh mục → hũ ảnh hưởng mọi tháng đã có giao dịch
  (await doneRecs()).forEach(r => markJars(ymOf(r.time)));
  markJars(viewYm);
}
// Bảng 6 hũ của một tháng gửi lên Sheet: tỷ lệ, thu nhập, phân bổ, đã chi, còn lại (đồng nhất với số trong app)
function jarSnapshot(ym, recs) {
  const c = computeJars(ym, recs, pctFor(ym));
  return { type: 'jars', month: ym, income: Math.round(c.income), unassigned: Math.round(c.unassigned),
    jars: c.jars.map(j => ({ name: j.key, pct: j.pct, allocated: Math.round(j.allocated), spent: Math.round(j.spent), remaining: Math.round(j.remaining) })) };
}
async function flushJars() {
  const dirty = getJSON('jarsDirty', []);
  if (!dirty.length || !cfg.get('sheetUrl', '')) return;
  const recs = await doneRecs(), left = [];
  for (const ym of dirty) { if (!(await post(jarSnapshot(ym, recs)))) left.push(ym); }
  cfg.set('jarsDirty', JSON.stringify(left));
}
let syncing = false;
async function sync() {
  if (!cfg.get('sheetUrl', '') || syncing) return;
  syncing = true;
  try {
    for (const r of (await allRecs()).filter(x => x.status === 'done' && !x.synced)) {
      if (await post(r)) { r.synced = true; await tx('records', 'readwrite', s => s.put(r)); }
    }
    await flushJars();
  } finally { syncing = false; }
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
// Thanh chuyển tháng: ‹ tháng › và nút nhỏ "Today" (chỉ hiện khi đang xem tháng khác) để về tháng hiện tại
const monthNav = id => `<div class="mnav ${id}"><button data-m="-1" aria-label="${tr('Previous month')}">‹</button>` +
  `<div class="mmid"><span>${monthLabel(viewYm)}</span>${viewYm !== nowYm() ? `<button class="tdy" data-today="1">${tr('Today')}</button>` : ''}</div>` +
  `<button data-m="1" aria-label="${tr('Next month')}" ${viewYm >= nowYm() ? 'disabled' : ''}>›</button></div>`;
function monthClick(e) {   // trả về true nếu bấm vào nút chuyển tháng / Today
  const b = e.target.closest('[data-m],[data-today]');
  if (!b || b.disabled) return false;
  if (b.dataset.today !== undefined) viewYm = nowYm(); else shiftMonth(Number(b.dataset.m));
  return true;
}
function bindMonthNav(box, rerender) {
  box.onclick = e => {
    if (monthClick(e)) { rerender(); return; }
    const it = e.target.closest('.item');
    if (it && recById[it.dataset.id]) openSheet(recById[it.dataset.id]);
  };
}

// ---------- hiệu ứng: đếm số, hiện dần khi cuộn, thanh tiêu đề thu gọn ----------
const lastCount = {};
function countTo(el) {
  const to = Number(el.dataset.count), key = el.dataset.key || '', from = lastCount[key] ?? 0;
  lastCount[key] = to;
  if (from === to || matchMedia('(prefers-reduced-motion: reduce)').matches) { el.textContent = fmt(to); return; }
  const t0 = performance.now();
  const step = t => { const p = Math.min(1, (t - t0) / 800), e = 1 - Math.pow(1 - p, 4); el.textContent = fmt(from + (to - from) * e); if (p < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
}
const runCounts = root => root.querySelectorAll('[data-count]').forEach(countTo);
const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.06 }) : null;
function reveal() {
  document.querySelectorAll('main .card, main .kpi, main h2, main .item, main .dayh').forEach(el => {
    if (el.classList.contains('rv')) return;
    el.classList.add('rv'); if (io) io.observe(el); else el.classList.add('in');
  });
}
let revealQueued = false;
new MutationObserver(() => { if (!revealQueued) { revealQueued = true; requestAnimationFrame(() => { revealQueued = false; reveal(); }); } })
  .observe(document.querySelector('main'), { childList: true, subtree: true });
addEventListener('scroll', () => $('header').classList.toggle('scrolled', scrollY > 24), { passive: true });

// ---------- Tổng quan: số liệu nhanh + dòng thời gian giao dịch ----------
function dayLabel(d) {
  const t = new Date(), y = new Date(); y.setDate(t.getDate() - 1);
  if (d.toDateString() === t.toDateString()) return tr('Today');
  if (d.toDateString() === y.toDateString()) return tr('Yesterday');
  return d.toLocaleDateString(DLOC(), { weekday: 'short', day: 'numeric', month: 'short' });
}
async function renderHome() {
  await renderPending();
  const recs = (await doneRecs()).sort((a, b) => b.time.localeCompare(a.time));
  recs.forEach(r => recById[r.id] = r);
  const monthAll = recs.filter(r => ymOf(r.time) === viewYm);
  const spent = sum(monthAll.filter(r => !isInc(r))), inc = sum(monthAll.filter(isInc)), net = inc - spent;
  $('#stats').innerHTML = monthNav('') +
    `<div class="hl">${tr('Spent this month')}</div><b class="total" data-key="home-spent" data-count="${spent}">${fmt(spent)}</b>` +
    `<div class="trio"><div><span>${tr('Income')}</span><b data-key="home-inc" data-count="${inc}">${fmt(inc)}</b></div>` +
    `<div><span>${tr('Net')}</span><b data-key="home-net" data-count="${net}">${fmt(net)}</b></div>` +
    `<div><span>${tr('Transactions')}</span><b>${monthAll.length}</b></div></div>`;
  runCounts($('#stats'));
  const box = $('#recent'); box.innerHTML = '';
  let grp = null, lastDay = '';
  for (const r of monthAll) {
    const d = new Date(r.time);
    if (d.toDateString() !== lastDay) {
      lastDay = d.toDateString();
      box.insertAdjacentHTML('beforeend', `<div class="dayh">${dayLabel(d)}</div>`);
      grp = document.createElement('div'); grp.className = 'card list'; box.append(grp);
    }
    const it = document.createElement('div'); it.className = 'item'; it.dataset.id = r.id;
    it.innerHTML = `<div class="t">${esc(r.category)}<small>${d.toLocaleTimeString(DLOC(), { hour: '2-digit', minute: '2-digit' })}${r.note ? ' · ' + esc(r.note) : ''}${r.synced ? '' : ' · ' + tr('⏳ pending')}</small></div><div class="amt ${isInc(r) ? 'in' : ''}">${isInc(r) ? '+' : ''}${fmt(r.amount)}</div>`;
    if (r.photo) { const b = await getPhoto(r.id); if (b) { const i = new Image(); i.src = URL.createObjectURL(b); it.prepend(i); } }
    grp.append(it);
  }
  if (!monthAll.length) box.innerHTML = `<p class="hint">${tr('No transactions in this month.')}</p>`;
}
bindMonthNav($('#stats'), renderHome);
$('#recent').onclick = e => {
  const it = e.target.closest('.item');
  if (it && recById[it.dataset.id]) openSheet(recById[it.dataset.id]);
};

// ---------- Thống kê: phân tích bằng biểu đồ (không lặp lại phần tổng quan) ----------
const PAL = ['#3b82f6', '#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#ec4899'];
const short = n => n >= 1e6 ? (n / 1e6).toFixed(n >= 1e7 ? 0 : 1).replace(/\.0$/, '') + 'M' : n >= 1e3 ? Math.round(n / 1e3) + 'k' : String(Math.round(n));
function sumBy(arr, f) { const o = {}; arr.forEach(r => { const k = f(r); o[k] = (o[k] || 0) + Number(r.amount); }); return o; }

async function renderStats() {
  const all = await doneRecs();
  all.forEach(r => recById[r.id] = r);
  const recs = all.filter(r => !isInc(r));   // biểu đồ chi tiêu chỉ tính khoản chi
  const incIn = ym => sum(all.filter(r => isInc(r) && ymOf(r.time) === ym));
  const inM = ym => recs.filter(r => ymOf(r.time) === ym);
  const m = inM(viewYm), total = sum(m);
  const [y, mo] = viewYm.split('-').map(Number);
  const dim = new Date(y, mo, 0).getDate();
  const isCur = viewYm === nowYm();
  const elapsed = isCur ? new Date().getDate() : dim;
  const prevYm = addMonths(viewYm, -1), pTotal = sum(inM(prevYm));
  let h = monthNav('light');
  if (!m.length) { $('#statsBody').innerHTML = h + `<div class="card empty">${tr('No transactions in this month yet.')}</div>`; return; }

  const avgDay = total / Math.max(1, elapsed);
  const biggest = m.reduce((a, b) => Number(b.amount) > Number(a.amount) ? b : a);
  const pct = pTotal ? (total - pTotal) / pTotal * 100 : null;
  const incNow = incIn(viewYm);

  // Đánh giá tổng quát lên đầu
  const prevs = [-1, -2, -3].map(n => sum(inM(addMonths(viewYm, n)))).filter(v => v > 0);
  const avg3 = prevs.length ? prevs.reduce((a, b) => a + b, 0) / prevs.length : 0;
  let rating = ['neutral', 'Not enough history yet'];
  if (avg3) { const r = total / avg3; rating = r > 1.15 ? ['high', 'Above your recent average'] : r < 0.85 ? ['low', 'Below your recent average'] : ['mid', 'In line with your recent average']; }
  h += `<div class="verdict card"><div class="rate ${rating[0]}">${tr(rating[1])}</div>` +
    (pct === null ? '' : `<span class="delta ${pct > 0 ? 'up' : 'down'}">${pct > 0 ? '▲' : '▼'} ${Math.abs(pct).toFixed(0)}% ${tr('vs {0}', monthShort(prevYm))}</span>`) + '</div>';

  h += `<div class="kpis">
    <div class="kpi"><div class="l">${tr('Daily average')}</div><div class="v sm">${fmt(avgDay)}</div></div>
    <div class="kpi"><div class="l">${tr('Largest expense')}</div><div class="v sm">${fmt(biggest.amount)}</div><div class="sub2">${esc(biggest.category)}</div></div>
    ${incNow ? `<div class="kpi"><div class="l">${tr('Savings rate')}</div><div class="v sm">${Math.round((incNow - total) / incNow * 100)}%</div></div>` : ''}
    ${isCur && elapsed < dim ? `<div class="kpi"><div class="l">${tr('Month-end estimate')}</div><div class="v sm">${fmt(avgDay * dim)}</div></div>` : ''}
  </div>`;

  const months = [-5, -4, -3, -2, -1, 0].map(n => addMonths(viewYm, n));
  const inc6 = months.map(incIn), exp6 = months.map(ym => sum(inM(ym)));
  if (inc6.some(v => v > 0)) {
    const mx = Math.max(1, ...inc6, ...exp6);
    h += `<h2>${tr('Income vs spending')}</h2><div class="card">` +
      `<div class="cols two">${months.map((ym, i) => `<div class="col"><div class="pair"><div class="cbar inc" style="height:${Math.max(inc6[i] ? 4 : 0, inc6[i] / mx * 100)}%"></div><div class="cbar sel" style="height:${Math.max(exp6[i] ? 4 : 0, exp6[i] / mx * 100)}%"></div></div><span class="cl">${monthShort(ym)}</span></div>`).join('')}</div>` +
      `<div class="iolg"><span><i class="g"></i>${tr('Income')}</span><span><i class="b"></i>${tr('Spending')}</span></div></div>`;
  } else {
    const mx = Math.max(1, ...exp6);
    h += `<h2>${tr('Last 6 months')}</h2><div class="card"><div class="cols">${months.map((ym, i) =>
      `<div class="col"><span class="cv">${exp6[i] ? short(exp6[i]) : ''}</span><div class="cbar ${ym === viewYm ? 'sel' : ''}" style="height:${Math.max(exp6[i] ? 4 : 0, exp6[i] / mx * 100)}%"></div><span class="cl">${monthShort(ym)}</span></div>`).join('')}</div></div>`;
  }

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

  const wd = Array(7).fill(0); m.forEach(r => wd[new Date(r.time).getDay()] += Number(r.amount));
  const wdTop = wd.indexOf(Math.max(...wd));
  const tips = [];
  if (pct !== null) tips.push(tr('Spending is <b>{0}% {1}</b> than {2} ({3}).', Math.abs(pct).toFixed(0), tr(pct > 0 ? 'higher' : 'lower'), monthLabel(prevYm), fmt(pTotal)));
  tips.push(tr('<b>{0}</b> is your biggest category: {1}% of the month ({2}).', esc(byCat[0][0]), Math.round(byCat[0][1] / total * 100), fmt(byCat[0][1])));
  if (byCat.length > 1) tips.push(tr('The top 2 categories together make up {0}% of spending.', Math.round((byCat[0][1] + byCat[1][1]) / total * 100)));
  tips.push(tr('You spend about <b>{0}</b> per day.', fmt(avgDay)));
  tips.push(tr('Spending peaks on <b>{0}</b> ({1}).', weekdayName(wdTop) + (lang === 'en' ? 's' : ''), fmt(wd[wdTop])));
  tips.push(tr('Largest single expense: <b>{0}</b> ({1}) on {2}.', fmt(biggest.amount), esc(biggest.category), new Date(biggest.time).toLocaleDateString(DLOC())));
  if (incNow) tips.push(incNow >= total ? tr('You saved <b>{0}%</b> of your income this month.', Math.round((incNow - total) / incNow * 100)) : tr('Spending is higher than income by <b>{0}</b> this month.', fmt(total - incNow)));
  h += `<h2>${tr('Assessment')}</h2><div class="card"><ul class="tips">${tips.map(t => `<li>${t}</li>`).join('')}</ul></div>`;
  $('#statsBody').innerHTML = h;
}
bindMonthNav($('#statsBody'), renderStats);

// ---------- 6 hũ: tự cập nhật theo thu nhập (cả tháng) và chi tiêu; % mỗi tháng lưu riêng ----------
function computeJars(ym, recs, pct) {
  const m = recs.filter(r => ymOf(r.time) === ym);
  const incs = m.filter(isInc), income = sum(incs), map = jarMap();
  const spent = Array(6).fill(0); let unassigned = 0;
  m.filter(r => !isInc(r)).forEach(r => {
    const j = map[catName(r.category)];
    if (Number.isInteger(j) && j >= 0 && j < 6) spent[j] += Number(r.amount); else unassigned += Number(r.amount);
  });
  return { income, nInc: incs.length, unassigned, jars: JAR_KEYS.map((k, i) => { const allocated = income * (pct[i] || 0) / 100; return { key: k, pct: pct[i] || 0, allocated, spent: spent[i], remaining: allocated - spent[i] }; }) };
}
let draftPct = [], draftYm = '', jarRecs = [];
const sameArr = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);
async function renderJars() {
  jarRecs = await doneRecs();
  if (draftYm !== viewYm) { draftPct = pctFor(viewYm); draftYm = viewYm; }
  const c = computeJars(viewYm, jarRecs, draftPct);
  let h = monthNav('light') +
    `<div class="card incbox"><div class="hl">${tr('Income this month')}</div><b class="total" data-key="jars-inc" data-count="${c.income}">${fmt(c.income)}</b>` +
    `<div class="sub">${c.nInc === 1 ? tr('{0} income entry', 1) : tr('{0} income entries', c.nInc)} · ${tr('Jars fill automatically from your income and spending.')}</div>` +
    `<button id="jarAddInc" class="pill">+ ${tr('Add income')}</button></div><h2>${tr('Jars')}</h2>`;
  JAR_KEYS.forEach((k, i) => {
    h += `<div class="card jar" data-i="${i}"><div class="jtop"><span class="jic">${JAR_ICONS[i]}</span><div class="jn">${esc(jarName(i))}<small data-alloc></small></div>` +
      `<label class="pct"><input type="number" inputmode="decimal" step="0.5" min="0" max="100" data-pct="${i}" value="${draftPct[i]}"><span>%</span></label></div>` +
      `<div class="jbar"><i data-bar></i></div><div class="jsub"><span data-spent></span><b data-left></b></div></div>`;
  });
  h += `<div class="card totrow"><span>${tr('Total')}</span><b id="pctTotal"></b></div>` +
    `<button id="saveMonth" class="big"></button><p class="hint">${tr('Percentages can differ every month. Save to keep them for {0}.', monthLabel(viewYm))}</p><div id="jarNote"></div>`;
  $('#jarsBody').innerHTML = h;
  runCounts($('#jarsBody'));
  paintJars();
}
// Cập nhật số liệu từng hũ ngay khi gõ % (không dựng lại giao diện để giữ con trỏ)
function paintJars() {
  const c = computeJars(viewYm, jarRecs, draftPct);
  c.jars.forEach((j, i) => {
    const card = $(`.jar[data-i="${i}"]`); if (!card) return;
    const used = j.allocated ? Math.min(100, j.spent / j.allocated * 100) : 0;
    card.querySelector('[data-alloc]').textContent = fmt(j.allocated);
    card.querySelector('[data-spent]').textContent = tr('Spent {0}', fmt(j.spent));
    const left = card.querySelector('[data-left]');
    left.textContent = j.remaining < 0 ? tr('Over by {0}', fmt(-j.remaining)) : tr('{0} left', fmt(j.remaining));
    left.className = j.remaining < 0 ? 'over' : '';
    const bar = card.querySelector('[data-bar]'); bar.style.width = used + '%'; bar.className = j.remaining < 0 ? 'over' : used > 85 ? 'warn' : '';
  });
  const total = Math.round(draftPct.reduce((s, v) => s + (Number(v) || 0), 0) * 100) / 100;
  const ok = total === 100;
  const tEl = $('#pctTotal'); tEl.textContent = total + '%'; tEl.className = ok ? 'pos' : 'neg';
  const saved = pctSaved()[viewYm], isSame = !!saved && sameArr(saved, draftPct);
  const btn = $('#saveMonth');
  btn.textContent = !ok ? tr('Percentages must add up to 100') : isSame ? '✓ ' + tr('Saved for {0}', monthLabel(viewYm)) : tr('Save {0}', monthLabel(viewYm));
  btn.disabled = !ok || isSame;
  $('#jarNote').innerHTML = c.unassigned > 0 ? `<div class="card jsub">${tr('Not in any jar: <b>{0}</b>. Assign those categories to a jar in the Categories tab.', fmt(c.unassigned))}</div>` : '';
}
$('#jarsBody').addEventListener('input', e => {
  const i = e.target.dataset?.pct; if (i === undefined) return;
  draftPct[Number(i)] = Math.max(0, Math.min(100, Number(e.target.value) || 0));
  paintJars();
});
$('#jarsBody').addEventListener('click', e => {
  if (monthClick(e)) { renderJars(); return; }
  if (e.target.closest('#jarAddInc')) { cur = newRec(); cur.type = 'income'; renderCats(); show('cat'); return; }
  if (e.target.closest('#saveMonth') && !$('#saveMonth').disabled) {
    const s = pctSaved(); s[viewYm] = draftPct.slice(); cfg.set('jarpct', JSON.stringify(s));
    markJars(viewYm); sync(); paintJars();
  }
});

// ---------- tab Danh mục: xem, thêm, xoá, gán hũ ----------
async function renderCategories() {
  const recs = (await doneRecs()).filter(r => ymOf(r.time) === viewYm && !isInc(r));
  const spentBy = {}; recs.forEach(r => { const k = catName(r.category); spentBy[k] = (spentBy[k] || 0) + Number(r.amount); });
  const map = jarMap();
  const jarOptions = sel => `<option value="-1">${tr('No jar')}</option>` + JAR_KEYS.map((k, i) => `<option value="${i}" ${sel === i ? 'selected' : ''}>${esc(jarName(i))}</option>`).join('');
  let h = monthNav('light') + `<p class="hint">${tr('Your categories and the jar each one belongs to. Spending in a category is deducted from its jar.')}</p>`;
  cats().forEach((c, i) => {
    const [e, ...rest] = c.split(' '); const name = rest.join(' ') || e;
    const ji = Number.isInteger(map[name.toLowerCase()]) ? map[name.toLowerCase()] : -1;
    h += `<div class="card crow"><span class="cic">${esc(e)}</span><div class="cn">${esc(name)}<small>${tr('{0} this month', fmt(spentBy[name.toLowerCase()] || 0))}</small></div>` +
      `<select class="jsel" data-name="${esc(name)}" aria-label="Jar">${jarOptions(ji)}</select><button class="cdel" data-i="${i}" aria-label="${tr('Remove')}">✕</button></div>`;
  });
  h += `<h2>${tr('Add a category')}</h2><div class="card addcat"><div class="arow"><label class="ico">${tr('Icon')}<input id="newEmoji" value="🏷️" maxlength="4"></label>` +
    `<label class="nm">${tr('Name')}<input id="newName" placeholder="${tr('e.g. Pets')}"></label></div>` +
    `<select id="newJar" class="jsel wide" aria-label="Jar">${jarOptions(-1)}</select><button id="addCat" class="big">${tr('Add')}</button></div>`;
  h += `<h2>${tr('Income categories')}</h2><div class="card list">` + icats().map((c, i) => {
    const [e, ...rest] = c.split(' ');
    return `<div class="crow flat"><span class="cic">${esc(e)}</span><div class="cn">${esc(rest.join(' ') || e)}</div><button class="cdel" data-ii="${i}" aria-label="${tr('Remove')}">✕</button></div>`;
  }).join('') + '</div>' +
    `<h2>${tr('Add an income category')}</h2><div class="card addcat"><div class="arow"><label class="ico">${tr('Icon')}<input id="newIEmoji" value="💰" maxlength="4"></label>` +
    `<label class="nm">${tr('Name')}<input id="newIName" placeholder="${tr('e.g. Rental')}"></label></div><button id="addICat" class="big">${tr('Add')}</button></div>`;
  $('#catsBody').innerHTML = h;
}
const setJarFor = (name, idx) => {
  const map = jarMap(), n = name.toLowerCase();
  if (idx >= 0) map[n] = idx; else delete map[n];
  cfg.set('jarmap', JSON.stringify(map));
  markAllJars().then(sync);   // đổi gán hũ ảnh hưởng số đã chi của các tháng
};
$('#catsBody').onclick = e => {
  if (monthClick(e)) { renderCategories(); return; }
  const del = e.target.closest('.cdel');
  if (del && del.dataset.ii !== undefined) {   // xoá danh mục thu nhập
    if (!confirm(tr('Remove this category? Past expenses keep it.'))) return;
    const list = icats(); list.splice(Number(del.dataset.ii), 1); cfg.set('icats', list.join('\n')); renderCategories(); return;
  }
  if (e.target.id === 'addICat') {
    const name = $('#newIName').value.trim(), emoji = ($('#newIEmoji').value.trim().replace(/\s+/g, '') || '💰');
    if (!name) { toast(tr('Enter a name first')); return; }
    if (icats().some(c => catName(c) === name.toLowerCase())) { toast(tr('That category already exists')); return; }
    cfg.set('icats', icats().concat(`${emoji} ${name}`).join('\n')); renderCategories(); return;
  }
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
    `<div class="d-cat">${esc(r.category)}</div><div class="d-amt ${isInc(r) ? 'in' : ''}">${isInc(r) ? '+' : ''}${fmt(r.amount)}</div>` +
    row('Type', isInc(r) ? tr('Income') : tr('Expense')) + row('Date', new Date(r.time).toLocaleString(DLOC())) + row('Bank', r.bank) + row('Payee', r.payee) +
    row('Note', r.note) + row('Sync', r.synced ? tr('Synced') : tr('Pending')) +
    '<div id="sheetPhoto"></div>';
  $('#sheet').hidden = false;
  document.body.classList.add('noscroll');
  try { history.pushState({ v: curView, d: depth, sheet: 1 }, ''); } catch {}   // vuốt quay lại sẽ đóng cửa sổ này
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
function hideSheet() { $('#sheet').hidden = true; document.body.classList.remove('noscroll'); }
const closeSheet = () => { if (!$('#sheet').hidden) history.back(); };
$('#sheetClose').onclick = closeSheet;
$('#sheet').onclick = e => { if (e.target.id === 'sheet') closeSheet(); };

// ---------- thư viện ảnh ----------
async function openGallery() {
  show('gallery');
  const g = $('#gal'); g.innerHTML = '';
  const recs = (await doneRecs()).filter(r => r.photo).sort((a, b) => b.time.localeCompare(a.time));
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

// ---------- cài đặt: ngôn ngữ, giao diện, bảo mật, dữ liệu, phiên bản (+ nâng cao thu gọn) ----------
function renderSettings() {
  $('#verText').textContent = VERSION;
  $('#openSheetLink').href = cfg.get('sheetFile', SHEET_FILE);
  $('#sheetFile').value = cfg.get('sheetFile', SHEET_FILE);
  $('#pinState').textContent = tr(hasPin() ? 'On' : 'Off');
  $('#pinSet').hidden = hasPin(); $('#pinChange').hidden = !hasPin(); $('#pinOff').hidden = !hasPin();
  // Face ID chỉ hiện khi đã có PIN (làm dự phòng) và thiết bị hỗ trợ
  $('#faceRow').hidden = $('#faceOnBtn').hidden = $('#faceOffBtn').hidden = true;
  if (hasPin()) faceSupported().then(ok => {
    if (!ok) return;
    $('#faceRow').hidden = false; $('#faceState').textContent = tr(faceOn() ? 'On' : 'Off');
    $('#faceOnBtn').hidden = faceOn(); $('#faceOffBtn').hidden = !faceOn();
  });
  $('#sheetUrl').value = cfg.get('sheetUrl', '');
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
  cfg.set('banks', $('#banksText').value);
  markAllJars().then(sync); goTop('home');
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

// ---------- mã PIN (khoá app) ----------
// Lưu ý: PIN nằm trong trình duyệt nên chỉ để chặn người khác mở app, không phải mã hoá dữ liệu.
const hasPin = () => !!cfg.get('pin', '');
const pinHash = async (pin, salt) => {
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(salt + ':' + pin));
  return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
};
let lockMode = 'verify', lockBuf = '', lockFirst = '', lockDone = null, fails = 0, lockedUntil = 0;
const drawDots = () => { $('#dots').innerHTML = [0, 1, 2, 3].map(i => `<i class="${i < lockBuf.length ? 'on' : ''}"></i>`).join(''); };
const lockTitle = () => { $('#lockTitle').textContent = tr(lockMode === 'verify' ? 'Enter PIN' : lockFirst ? 'Confirm PIN' : 'Create a 4-digit PIN'); };
// Face ID qua WebAuthn (xác thực nền tảng của iPhone). Chỉ là khoá phía máy, giống PIN; PIN luôn là dự phòng.
const b64 = buf => btoa(String.fromCharCode(...new Uint8Array(buf)));
const unb64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
const faceOn = () => !!cfg.get('faceId', '');
async function faceSupported() {
  try { return !!(window.PublicKeyCredential && await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()); } catch { return false; }
}
async function faceEnable() {
  const cred = await navigator.credentials.create({ publicKey: {
    challenge: crypto.getRandomValues(new Uint8Array(32)), rp: { name: 'Expenses' },
    user: { id: crypto.getRandomValues(new Uint8Array(16)), name: 'user', displayName: 'Expenses' },
    pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
    authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required', residentKey: 'discouraged' }, timeout: 60000 } });
  cfg.set('faceId', b64(cred.rawId));
}
async function faceVerify() {
  await navigator.credentials.get({ publicKey: {
    challenge: crypto.getRandomValues(new Uint8Array(32)),
    allowCredentials: [{ type: 'public-key', id: unb64(cfg.get('faceId', '')) }], userVerification: 'required', timeout: 60000 } });
}
async function tryFace(silent) {
  try { await faceVerify(); fails = 0; closeLock(); }
  catch { if (!silent) $('#padMsg').textContent = tr('Face ID failed, enter your PIN'); }
}
$('#lockFace').onclick = () => tryFace(false);
function openLock(mode, done, cancelable) {
  lockMode = mode; lockBuf = ''; lockFirst = ''; lockDone = done || null;
  $('#lockCancel').hidden = !cancelable; $('#lockForgot').hidden = !(mode === 'verify' && !cancelable);
  $('#lockFace').hidden = !(mode === 'verify' && faceOn());
  $('#padMsg').textContent = ''; lockTitle(); drawDots(); $('#lock').hidden = false;
  if (mode === 'verify' && faceOn()) tryFace(true);   // iOS có thể đòi chạm nút trước; nếu vậy bấm "Use Face ID"
}
const closeLock = () => { $('#lock').hidden = true; if (lockDone) { const f = lockDone; lockDone = null; f(); } };
async function lockSubmit() {
  const buf = lockBuf; lockBuf = '';
  if (lockMode === 'verify') {
    const [salt, h] = cfg.get('pin', ':').split(':');
    if (await pinHash(buf, salt) === h) { fails = 0; return closeLock(); }
    if (++fails >= 5) { fails = 0; lockedUntil = Date.now() + 30000; }
    $('#padMsg').textContent = tr('Wrong PIN'); $('#dots').classList.add('shake'); setTimeout(() => $('#dots').classList.remove('shake'), 400);
  } else if (!lockFirst) {
    lockFirst = buf; lockTitle();
  } else if (lockFirst === buf) {
    const salt = Math.random().toString(36).slice(2);
    cfg.set('pin', salt + ':' + await pinHash(buf, salt)); return closeLock();
  } else {
    lockFirst = ''; lockTitle(); $('#padMsg').textContent = tr('PINs do not match');
  }
  drawDots();
}
function lockPress(d) {
  if (Date.now() < lockedUntil) { $('#padMsg').textContent = tr('Too many attempts. Wait {0}s', Math.ceil((lockedUntil - Date.now()) / 1000)); return; }
  if (d === 'back') lockBuf = lockBuf.slice(0, -1); else if (lockBuf.length < 4) lockBuf += d;
  drawDots(); $('#padMsg').textContent = '';
  if (lockBuf.length === 4) setTimeout(lockSubmit, 120);
}
$('#pad').innerHTML = [1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, 'back'].map(k =>
  k === '' ? '<span></span>' : `<button data-k="${k}">${k === 'back' ? '⌫' : k}</button>`).join('');
$('#pad').onclick = e => { const b = e.target.closest('button'); if (b) lockPress(b.dataset.k); };
$('#lockCancel').onclick = () => { $('#lock').hidden = true; lockDone = null; };
$('#lockForgot').onclick = () => { $('#padMsg').textContent = tr('To reset a forgotten PIN, delete the app icon and add it again from Safari. Data on this phone that is not synced yet is lost.'); };
$('#pinSet').onclick = () => openLock('set', renderSettings, true);
$('#pinChange').onclick = () => openLock('verify', () => openLock('set', renderSettings, true), true);
$('#pinOff').onclick = () => openLock('verify', () => { cfg.del('pin'); cfg.del('faceId'); renderSettings(); }, true);
$('#faceOnBtn').onclick = async () => {
  try { await faceEnable(); } catch { toast(tr('Face ID could not be turned on on this device')); }
  renderSettings();
};
$('#faceOffBtn').onclick = () => { cfg.del('faceId'); renderSettings(); };
// Khoá ngay lập tức khi rời app (cả lúc chuyển sang app ngân hàng); nội dung cũng bị che trong màn hình chuyển app
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { if (hasPin() && $('#lock').hidden) openLock('verify'); }
  else if (!$('#lock').hidden && lockMode === 'verify' && faceOn()) tryFace(true);   // quay lại thì thử Face ID
});

// ---------- khởi động ----------
if (hasPin()) openLock('verify');
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).catch(() => {});
  let reloaded = false;   // bản mới của service worker lên thì tự tải lại một lần
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (!reloaded) { reloaded = true; location.reload(); } });
}
translateDom();
show('home', false);
sync();
