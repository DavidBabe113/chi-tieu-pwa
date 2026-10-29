/**
 * Financial Tracking - Google Apps Script (Web App)
 * Nhận giao dịch từ app, quản lý tài khoản (admin / member) và ghi vào Google Sheet gắn với script này.
 * Tab: ChiTieu, ThuNhap, 6Hu, Users, ThongKe (tự tạo nếu chưa có). Cột nhận theo tiêu đề nên thêm/đổi thứ tự cột không sao.
 * Tab Users chứa tài khoản: đừng chia sẻ Sheet cho người khác.
 * Cài đặt: Tiện ích mở rộng > Apps Script > dán file này > chạy hàm setup > Triển khai > Ứng dụng web
 *          (Thực thi bằng: Tôi, Ai có quyền truy cập: Bất kỳ ai) > sao chép link /exec dán vào app.
 * Sửa code sau này: Triển khai > Quản lý bản triển khai > bút chì > Phiên bản mới (link /exec giữ nguyên).
 * setup() tạo sẵn 2 tài khoản admin và member với mật khẩu NGẪU NHIÊN, gửi qua email cho chủ script (và ghi ở Xem > Nhật ký thực thi).
 */
var VERSION = 8;
// Email nhận thông báo khi có người tạo tài khoản mới. Để trống = gửi tới chính chủ Google đang chạy script.
var NOTIFY_EMAIL = '';

var TABS = {
  ChiTieu: ['ID', 'Ngày', 'Giờ', 'Hạng mục', 'Số tiền', 'Ghi chú', 'Người nhận', 'Ngân hàng', 'Ví', 'Vị trí', 'Tháng', 'Người nhập'],
  ThuNhap: ['ID', 'Ngày', 'Giờ', 'Hạng mục', 'Số tiền', 'Ghi chú', 'Tháng', 'Người nhập'],
  '6Hu': ['Tháng', 'Hũ', 'Tỷ lệ %', 'Thu nhập tháng', 'Phân bổ', 'Đã chi', 'Còn lại', 'Người nhập'],
  Users: ['Tài khoản', 'Mật khẩu (hash)', 'Vai trò', 'Trạng thái', 'Khoá phiên', 'Tạo lúc']
};

function doGet() {
  return json_({ ok: true, version: VERSION });
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var r = JSON.parse(e.postData.contents);
    if (r.a) return json_(action_(r));
    auth_(r, false);   // giao dịch chỉ nhận từ tài khoản còn hoạt động
    if (r.type === 'jars') saveJars_(r);
    else if (r.type === 'income') upsert_('ThuNhap', row_(r, false));
    else upsert_('ChiTieu', row_(r, true));
    return json_({ ok: true });
  } catch (err) {
    if (String(err) === 'AUTH') return json_({ ok: false, auth: true });
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

// ---------- tài khoản ----------
// Mật khẩu không bao giờ gửi dạng chữ: app gửi SHA-256('ft:' + tên.viết.thường + ':' + mật khẩu)
function hash_(u, p) {
  var b = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, 'ft:' + String(u).toLowerCase() + ':' + p, Utilities.Charset.UTF_8);
  return b.map(function (x) { return ('0' + (x < 0 ? x + 256 : x).toString(16)).slice(-2); }).join('');
}
function key_() { return Utilities.getUuid().replace(/-/g, ''); }

function users_() {
  var t = tab_('Users'), n = t.sh.getLastRow(), out = [];
  if (n < 2) return { t: t, list: out };
  var v = t.sh.getRange(2, 1, n - 1, t.sh.getLastColumn()).getValues();
  v.forEach(function (x, i) {
    out.push({ row: i + 2, name: String(x[t.col['Tài khoản'] - 1]), hash: String(x[t.col['Mật khẩu (hash)'] - 1]),
      role: String(x[t.col['Vai trò'] - 1]), status: String(x[t.col['Trạng thái'] - 1]), key: String(x[t.col['Khoá phiên'] - 1]) });
  });
  return { t: t, list: out };
}
function find_(list, name) {
  name = String(name || '').toLowerCase();
  for (var i = 0; i < list.length; i++) if (list[i].name.toLowerCase() === name) return list[i];
  return null;
}
function addUser_(name, hash, role, status) {
  var U = users_(), rowNum = Math.max(U.t.sh.getLastRow(), 1) + 1;
  put_(U.t, rowNum, { 'Tài khoản': name, 'Mật khẩu (hash)': hash, 'Vai trò': role, 'Trạng thái': status || 'active', 'Khoá phiên': key_(), 'Tạo lúc': new Date().toISOString() });
}
// Tạo admin + member với mật khẩu ngẫu nhiên (chỉ khi chưa có ai); gửi mật khẩu cho chủ script
function ensureUsers_() {
  if (users_().list.length) return;
  var pw = function () { return key_().slice(0, 10); }, pa = pw(), pm = pw();
  addUser_('admin', hash_('admin', pa), 'admin');
  addUser_('member', hash_('member', pm), 'member');
  Logger.log('admin / ' + pa + '   member / ' + pm);
  notify_('Tài khoản ban đầu', 'Tài khoản admin: ' + pa + ' | Tài khoản member: ' + pm + ' | Đổi mật khẩu ngay sau khi đăng nhập (Cài đặt > Account > Change password).');
}
// Hợp lệ khi tài khoản còn hoạt động và khoá phiên khớp (đổi mật khẩu / khoá tài khoản thì khoá phiên đổi → thiết bị cũ phải đăng nhập lại)
function auth_(r, needAdmin) {
  var u = find_(users_().list, r.u);
  if (!u || u.status !== 'active' || !r.t || u.key !== r.t || (needAdmin && u.role !== 'admin')) throw 'AUTH';
  return u;
}

function action_(r) {
  var U, u, a = r.a;
  if (a === 'login') {
    U = users_(); u = find_(U.list, r.u);
    if (!u || u.hash !== r.h) return { ok: false, error: 'bad' };
    if (u.status !== 'active') return { ok: false, error: u.status === 'pending' ? 'pending' : 'blocked' };
    if (!u.key) { u.key = key_(); put_(U.t, u.row, { 'Khoá phiên': u.key }); }
    return { ok: true, user: u.name, role: u.role, token: u.key };
  }
  if (a === 'register') {   // người dùng tự tạo tài khoản trên app (luôn là member, trạng thái pending; admin kích hoạt mới dùng được)
    U = users_();
    if (!/^[A-Za-z0-9_.-]{3,20}$/.test(String(r.u || ''))) return { ok: false, error: 'name' };
    if (find_(U.list, r.u)) return { ok: false, error: 'exists' };
    if (!r.h) return { ok: false, error: 'bad' };
    addUser_(r.u, r.h, 'member', 'pending');   // chờ admin kích hoạt mới đăng nhập được
    notify_('Tài khoản mới chờ kích hoạt: ' + r.u, 'Người dùng "' + r.u + '" vừa tự tạo tài khoản trên app Financial Tracking lúc ' + new Date().toLocaleString('vi-VN') + '. Vào app > Cài đặt > Users > Activate để cho phép sử dụng, hoặc Delete nếu không nhận ra.');
    return { ok: true, pending: true };
  }
  u = auth_(r, false);
  U = users_();
  if (a === 'me') return { ok: true, user: u.name, role: u.role };
  if (a === 'changePass') {
    if (u.hash !== r.oh || !r.nh) return { ok: false, error: 'bad' };
    var k = key_();
    put_(U.t, u.row, { 'Mật khẩu (hash)': r.nh, 'Khoá phiên': k });
    return { ok: true, token: k };
  }
  auth_(r, true);   // từ đây chỉ admin
  if (a === 'collect') return { ok: true, data: collect_() };
  if (a === 'users') return { ok: true, users: U.list.map(function (x) { return { name: x.name, role: x.role, status: x.status }; }) };
  var tg = find_(U.list, r.nu);
  if (a === 'addUser') {
    if (!/^[A-Za-z0-9_.-]{3,20}$/.test(String(r.nu || ''))) return { ok: false, error: 'name' };
    if (tg) return { ok: false, error: 'exists' };
    if (!r.nh) return { ok: false, error: 'bad' };
    addUser_(r.nu, r.nh, r.role === 'admin' ? 'admin' : 'member');
    return { ok: true };
  }
  if (!tg) return { ok: false, error: 'none' };
  if (a === 'resetPass') {
    if (!r.nh) return { ok: false, error: 'bad' };
    put_(U.t, tg.row, { 'Mật khẩu (hash)': r.nh, 'Khoá phiên': key_() });
    return { ok: true };
  }
  if (a === 'block') {
    if (tg.name === u.name) return { ok: false, error: 'self' };
    put_(U.t, tg.row, { 'Trạng thái': r.blocked ? 'blocked' : 'active', 'Khoá phiên': key_() });   // blocked=false cũng là kích hoạt tài khoản pending
    return { ok: true };
  }
  if (a === 'setRole') {
    var admins = U.list.filter(function (x) { return x.role === 'admin' && x.status === 'active'; }).length;
    if (tg.role === 'admin' && r.role !== 'admin' && admins < 2) return { ok: false, error: 'lastAdmin' };
    put_(U.t, tg.row, { 'Vai trò': r.role === 'admin' ? 'admin' : 'member' });
    return { ok: true };
  }
  if (a === 'delUser') {
    if (tg.name === u.name) return { ok: false, error: 'self' };
    U.t.sh.deleteRow(tg.row);
    return { ok: true };
  }
  return { ok: false, error: 'unknown' };
}

// Gửi thông báo qua email, lỗi gửi mail không làm hỏng thao tác chính
function notify_(subject, body) {
  try { MailApp.sendEmail(NOTIFY_EMAIL || Session.getEffectiveUser().getEmail(), '[Financial Tracking] ' + subject, body); } catch (err) {}
}

// Admin gom toàn bộ dữ liệu của mọi người dùng (hàng đầu là tiêu đề)
function collect_() {
  var out = {};
  ['ChiTieu', 'ThuNhap'].forEach(function (n) {
    var t = tab_(n), last = t.sh.getLastRow(), w = t.sh.getLastColumn();
    out[n] = last < 1 ? [] : t.sh.getRange(1, 1, last, w).getDisplayValues();
  });
  return out;
}

// ---------- giao dịch ----------
function row_(r, expense) {
  var o = {
    'ID': r.id, 'Ngày': r.date || '', 'Giờ': r.clock || '', 'Hạng mục': r.category || '',
    'Số tiền': Number(r.amount) || 0, 'Ghi chú': r.note || '', 'Tháng': String(r.date || '').slice(0, 7), 'Người nhập': r.u || ''
  };
  if (expense) {
    o['Người nhận'] = r.payee || '';
    o['Ngân hàng'] = r.bank || '';
    o['Ví'] = r.wallet || '';
    o['Vị trí'] = r.loc ? 'https://www.google.com/maps/search/?api=1&query=' + r.loc.lat + ',' + r.loc.lng : '';
  }
  return o;
}

// Lấy tab, tạo nếu thiếu, thêm tiêu đề còn thiếu; trả về {sh, col: {tiêu đề: số cột}}
function tab_(name) {
  var ss = SpreadsheetApp.getActive(), sh = ss.getSheetByName(name) || ss.insertSheet(name);
  var want = TABS[name], lastCol = Math.max(sh.getLastColumn(), 1);
  var have = sh.getRange(1, 1, 1, lastCol).getValues()[0].map(String);
  if (!have.some(String)) have = [];
  want.forEach(function (h) {
    if (have.indexOf(h) >= 0) return;
    have.push(h);
    sh.getRange(1, have.length).setValue(h).setFontWeight('bold');
  });
  sh.setFrozenRows(1);
  var col = {};
  have.forEach(function (h, i) { if (h) col[h] = i + 1; });
  return { sh: sh, col: col };
}

function put_(t, rowNum, o) {
  Object.keys(o).forEach(function (h) {
    if (!t.col[h]) return;
    var cell = t.sh.getRange(rowNum, t.col[h]);
    if (h === 'Tháng' || h === 'Ngày' || h === 'Giờ' || h === 'ID') cell.setNumberFormat('@');   // giữ chữ, không để Sheet tự đổi thành ngày
    cell.setValue(o[h]);
  });
}

// Ghi theo ID: có rồi thì cập nhật đúng dòng, chưa có thì thêm cuối
function upsert_(name, o) {
  var t = tab_(name), n = t.sh.getLastRow(), rowNum = n + 1;
  if (n > 1) {
    var ids = t.sh.getRange(2, t.col['ID'], n - 1, 1).getValues();
    for (var i = 0; i < ids.length; i++) if (String(ids[i][0]) === String(o['ID'])) { rowNum = i + 2; break; }
  }
  put_(t, rowNum, o);
}

// Bảng 6 hũ: mỗi người mỗi tháng 6 dòng, ghi đè theo (Người nhập, Tháng, Hũ)
function saveJars_(r) {
  var t = tab_('6Hu'), n = t.sh.getLastRow(), map = {};
  if (n > 1) {
    var v = t.sh.getRange(2, 1, n - 1, t.sh.getLastColumn()).getValues();
    v.forEach(function (x, i) { map[x[t.col['Người nhập'] - 1] + '|' + x[t.col['Tháng'] - 1] + '|' + x[t.col['Hũ'] - 1]] = i + 2; });
  }
  n = Math.max(n, 1);
  r.jars.forEach(function (j) {
    var key = (r.u || '') + '|' + r.month + '|' + j.name, rowNum = map[key];
    if (!rowNum) { rowNum = ++n; map[key] = rowNum; }
    put_(t, rowNum, { 'Tháng': r.month, 'Hũ': j.name, 'Tỷ lệ %': j.pct, 'Thu nhập tháng': r.income, 'Phân bổ': j.allocated, 'Đã chi': j.spent, 'Còn lại': j.remaining, 'Người nhập': r.u || '' });
  });
}

/** Chạy 1 lần: tạo đủ các tab, 2 tài khoản mặc định và tab ThongKe tổng hợp theo tháng (cũng xin quyền gửi email). */
function setup() {
  MailApp.getRemainingDailyQuota();
  var ct = tab_('ChiTieu'), tn = tab_('ThuNhap');
  tab_('6Hu');
  ensureUsers_();
  var ss = SpreadsheetApp.getActive(), st = ss.getSheetByName('ThongKe') || ss.insertSheet('ThongKe');
  var L = function (t, h) { return t.sh.getRange(1, t.col[h]).getA1Notation().replace('1', ''); };
  st.clear();
  st.getRange('A1:D1').setValues([['Tháng', 'Thu nhập', 'Chi tiêu', 'Còn lại']]).setFontWeight('bold');
  st.getRange('A2').setFormula('=SORT(UNIQUE({FILTER(ChiTieu!' + L(ct, 'Tháng') + '2:' + L(ct, 'Tháng') + ',ChiTieu!' + L(ct, 'Tháng') + '2:' + L(ct, 'Tháng') + '<>"");FILTER(ThuNhap!' + L(tn, 'Tháng') + '2:' + L(tn, 'Tháng') + ',ThuNhap!' + L(tn, 'Tháng') + '2:' + L(tn, 'Tháng') + '<>"")}),1,FALSE)');
  st.getRange('B2:B200').setFormula('=IF(A2="","",SUMIF(ThuNhap!$' + L(tn, 'Tháng') + ':$' + L(tn, 'Tháng') + ',A2,ThuNhap!$' + L(tn, 'Số tiền') + ':$' + L(tn, 'Số tiền') + '))');
  st.getRange('C2:C200').setFormula('=IF(A2="","",SUMIF(ChiTieu!$' + L(ct, 'Tháng') + ':$' + L(ct, 'Tháng') + ',A2,ChiTieu!$' + L(ct, 'Số tiền') + ':$' + L(ct, 'Số tiền') + '))');
  st.getRange('D2:D200').setFormula('=IF(A2="","",B2-C2)');
  st.getRange('B2:D200').setNumberFormat('#,##0');
  st.setFrozenRows(1);
}
