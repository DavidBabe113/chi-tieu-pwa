'use strict';
const $ = s => document.querySelector(s);
const fmt = n => (Number(n) || 0).toLocaleString('vi-VN') + '₫';

const DEF_CATS = '⛽ Tiền xăng\n☕ Ăn / cà phê\n🛍 Shopping\n🏠 Hoá đơn nhà\n🏥 Sức khoẻ\n🎬 Giải trí\n📦 Khác';
// URL scheme mở thẳng app ngân hàng trên iOS (lấy từ trang chuyển tiếp của dl.vietqr.io). Chỉ mở app,
// không truyền được số tiền / tài khoản (iOS không có link điền sẵn đã kiểm chứng).
const DEF_BANKS = [
  'Vietcombank | vietcombankmobile://', 'MB Bank | mbbank://', 'Techcombank | tcb://',
  'VPBank | vpbankneo://', 'ACB | acbone://', 'BIDV | bidv.smartbanking.partner://',
  'TPBank | hydro://', 'VietinBank | vietinbankipay://', 'Agribank | agribankmobile://',
  'OCB | newomni-app://',
].join('\n');

// ---------- lưu trữ ----------
const cfg = {
  get: (k, d) => { try { return localStorage.getItem(k) ?? d; } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem(k, v); } catch {} },
};

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
let stream = null, scanning = false;
const stack = [];        // lịch sử màn hình để nút quay lại

const cats = () => cfg.get('cats', DEF_CATS).split('\n').map(s => s.trim()).filter(Boolean);
const banks = () => cfg.get('banks', DEF_BANKS).split('\n').map(l => l.split('|').map(s => s.trim()))
  .filter(a => a[0]).map(a => ({ name: a[0], url: a[1] || '' }));

function toast(msg, ms = 2600) {
  const t = $('#toast'); t.textContent = msg; t.hidden = false;
  clearTimeout(toast.t); toast.t = setTimeout(() => t.hidden = true, ms);
}

// ---------- điều hướng ----------
const TITLES = { home: 'Chi tiêu', scan: 'Quét QR', cat: 'Chọn danh mục', detail: 'Chi tiết', bank: 'Chọn ngân hàng', gallery: 'Thư viện ảnh', settings: 'Cài đặt' };
function show(v, push = true) {
  if (v !== 'scan') stopScan();
  if (push) stack.push(v);
  document.querySelectorAll('main > section').forEach(s => s.hidden = s.id !== 'v-' + v);
  $('#title').textContent = TITLES[v];
  $('#back').hidden = v === 'home';
  if (v === 'home') { stack.length = 0; renderHome(); }
}
$('#back').onclick = () => { stack.pop(); show(stack.pop() || 'home'); };
$('#openSettings').onclick = openSettings;

// ---------- quét QR ----------
$('#btnScan').onclick = startScan;
$('#btnManual').onclick = () => { cur = newRec(); renderCats(); show('cat'); };
$('#btnGallery').onclick = openGallery;

function newRec() {
  return { acc: '', bin: '', id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), time: new Date().toISOString(), category: '', amount: '', note: '', payee: '', bank: '', photo: '', status: 'draft', synced: false };
}

async function startScan() {
  show('scan');
  $('#scanMsg').textContent = 'Đưa mã QR vào khung hình…';
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
  } catch {
    $('#scanMsg').textContent = 'Không mở được camera. Vào Cài đặt iPhone > Safari / app > Camera để cấp quyền.';
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
    $('#qrInfo').textContent = `Người nhận: ${q.payee || '—'}${q.acc ? ' · ' + q.acc : ''}${q.amount ? ' · ' + fmt(q.amount) : ''}`;
  } else {
    cur.payee = raw.length > 60 ? raw.slice(0, 60) + '…' : raw;
    $('#qrInfo').hidden = false;
    $('#qrInfo').textContent = 'QR: ' + cur.payee;
  }
  if (navigator.vibrate) navigator.vibrate(60);
  stack.pop();   // bỏ màn quét khỏi lịch sử, quay lại sẽ về trang chủ
  renderCats(); show('cat');
}

// ---------- danh mục / chi tiết ----------
function renderCats() {
  if (!cur.payee) $('#qrInfo').hidden = true;
  $('#cats').innerHTML = '';
  cats().forEach(c => {
    const [e, ...rest] = c.split(' ');
    const b = document.createElement('button');
    b.innerHTML = `<span class="e">${e}</span>${rest.join(' ') || e}`;
    b.onclick = () => { cur.category = c; openDetail(); };
    $('#cats').append(b);
  });
}
function openDetail() {
  $('#amount').value = cur.amount ? Number(cur.amount).toLocaleString('vi-VN') : '';
  $('#note').value = cur.note;
  $('#preview').hidden = true; $('#photoSave').hidden = true; $('#photoAlbum').hidden = true; curPhoto = null;
  show('detail');
}
$('#amount').oninput = e => {
  const d = e.target.value.replace(/\D/g, '');
  e.target.value = d ? Number(d).toLocaleString('vi-VN') : '';
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
  } catch { if (!silent) toast('Không copy được ảnh, thử lại'); return; }
  location.href = 'shortcuts://run-shortcut?name=' + encodeURIComponent('LuuAnhChiTieu');
}
$('#photoAlbum').onclick = () => toAlbum(false);
// iOS không cho web tự ghi vào album Ảnh: mở Share Sheet, bạn chọn "Lưu hình ảnh"
$('#photoSave').onclick = () => savePhoto(curPhoto, `ChiTieu_${Date.now()}.jpg`);
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
  if (!cur.amount) { toast('Nhập số tiền trước nhé'); return false; }
  return true;
}
async function stash() {
  if (curPhoto) {
    cur.photo = `${cur.time.slice(0, 10).replace(/-/g, '')}_${cur.id}.jpg`;
    await putPhoto(cur.id, curPhoto);
  }
}

// "Chỉ lưu" = chi tiền mặt, không qua ngân hàng → coi như thành công, ghi Sheet luôn
$('#saveOnly').onclick = async () => {
  if (!collectDetail()) return;
  await stash();
  cur.status = 'done'; await putRec(cur); sync();
  toast('Đã lưu'); show('home');
};
$('#toBank').onclick = () => { if (collectDetail()) { renderBanks(); show('bank'); } };

// ---------- chọn ngân hàng ----------
function renderBanks() {
  $('#banks').innerHTML = '';
  banks().forEach(b => {
    const el = document.createElement('button');
    el.textContent = b.name;
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
  if (!b.url) { toast('Chưa có link app cho ngân hàng này, sửa trong Cài đặt'); show('home'); return; }
  show('home', false);
  location.href = b.url;
  setTimeout(() => { if (!document.hidden) toast('Không mở được app. Kiểm tra link trong Cài đặt.', 4000); }, 1800);
}

// ---------- xác nhận giao dịch & đồng bộ ----------
async function renderPending() {
  const recs = (await allRecs()).filter(r => r.status === 'pending');
  const box = $('#pending'); box.innerHTML = '';
  recs.forEach(r => {
    const d = document.createElement('div'); d.className = 'card pend';
    d.innerHTML = `<b>Giao dịch thành công?</b><div>${r.category} · ${fmt(r.amount)} · ${r.bank}</div>
      <div class="acts"><button class="no">Huỷ</button><button class="ok">Thành công</button></div>`;
    d.querySelector('.ok').onclick = async () => { r.status = 'done'; await putRec(r); renderHome(); sync(); };
    d.querySelector('.no').onclick = async () => { await delRec(r.id); await delPhoto(r.id); renderHome(); };
    box.append(d);
  });
}
document.addEventListener('visibilitychange', () => { if (!document.hidden && stack.length <= 1) renderHome(); });

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
  renderHome();
}
window.addEventListener('online', sync);

// ---------- trang chủ ----------
async function renderHome() {
  await renderPending();
  const recs = (await allRecs()).filter(r => r.status === 'done').sort((a, b) => b.time.localeCompare(a.time));
  const ym = new Date().toISOString().slice(0, 7);
  const month = recs.filter(r => r.time.startsWith(ym));
  const by = {}; month.forEach(r => by[r.category] = (by[r.category] || 0) + Number(r.amount));
  const total = month.reduce((s, r) => s + Number(r.amount), 0), max = Math.max(1, ...Object.values(by));
  $('#stats').innerHTML = `<b style="font-size:22px">${fmt(total)}</b>` +
    Object.entries(by).sort((a, b) => b[1] - a[1]).map(([k, v]) =>
      `<div class="bar"><span style="width:110px">${k}</span><i style="width:${Math.round(v / max * 100)}px"></i><span>${fmt(v)}</span></div>`).join('') +
    (cfg.get('sheetUrl', '') ? '' : '<p class="hint">Chưa nối Google Sheet. Vào ⚙ Cài đặt để dán link.</p>');
  const box = $('#recent'); box.innerHTML = '';
  for (const r of recs.slice(0, 15)) {
    const d = document.createElement('div'); d.className = 'item';
    d.innerHTML = `<div class="t">${r.category}<small>${new Date(r.time).toLocaleString('vi-VN')}${r.note ? ' · ' + r.note : ''}${r.synced ? '' : ' · ⏳ chưa lên Sheet'}</small></div><div class="amt">${fmt(r.amount)}</div>`;
    if (r.photo) { const b = await getPhoto(r.id); if (b) { const i = new Image(); i.src = URL.createObjectURL(b); d.prepend(i); } }
    box.append(d);
  }
}

// ---------- thư viện ảnh ----------
async function openGallery() {
  show('gallery');
  const g = $('#gal'); g.innerHTML = '';
  const recs = (await allRecs()).filter(r => r.photo && r.status === 'done').sort((a, b) => b.time.localeCompare(a.time));
  if (!recs.length) g.innerHTML = '<p class="hint">Chưa có ảnh nào.</p>';
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
  } else toast('Giữ lâu vào ảnh để lưu');
}

// ---------- cài đặt ----------
function openSettings() {
  $('#sheetUrl').value = cfg.get('sheetUrl', '');
  $('#catsText').value = cfg.get('cats', DEF_CATS);
  $('#banksText').value = cfg.get('banks', DEF_BANKS);
  show('settings');
}
$('#saveSettings').onclick = () => {
  cfg.set('sheetUrl', $('#sheetUrl').value.trim());
  cfg.set('cats', $('#catsText').value);
  cfg.set('banks', $('#banksText').value);
  toast('Đã lưu cài đặt'); sync(); show('home');
};
$('#testSheet').onclick = async () => {
  cfg.set('sheetUrl', $('#sheetUrl').value.trim());
  const ok = await post({ id: 'test-' + Date.now(), time: new Date().toISOString(), category: 'TEST', amount: 0, note: 'dòng thử', payee: '', bank: '', photo: '' });
  toast(ok ? 'Đã gửi, mở Sheet kiểm tra tab ChiTieu' : 'Gửi lỗi, kiểm tra link');
};

// ---------- khởi động ----------
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
show('home', false);
sync();
