/**
 * Financial Tracking - Google Apps Script (Web App)
 * Nhận giao dịch từ app và ghi vào Google Sheet gắn với script này.
 * Tab: ChiTieu, ThuNhap, 6Hu, ThongKe (tự tạo nếu chưa có). Cột nhận theo tiêu đề nên thêm/đổi thứ tự cột không sao.
 * Cài đặt: Tiện ích mở rộng > Apps Script > dán file này > Triển khai > Ứng dụng web
 *          (Thực thi bằng: Tôi, Ai có quyền truy cập: Bất kỳ ai) > sao chép link /exec dán vào app (Cài đặt > Advanced).
 * Sửa code sau này: Triển khai > Quản lý bản triển khai > bút chì > Phiên bản mới (link /exec giữ nguyên).
 */
var VERSION = 7;

var TABS = {
  ChiTieu: ['ID', 'Ngày', 'Giờ', 'Hạng mục', 'Số tiền', 'Ghi chú', 'Người nhận', 'Ngân hàng', 'Ví', 'Vị trí', 'Tháng'],
  ThuNhap: ['ID', 'Ngày', 'Giờ', 'Hạng mục', 'Số tiền', 'Ghi chú', 'Tháng'],
  '6Hu': ['Tháng', 'Hũ', 'Tỷ lệ %', 'Thu nhập tháng', 'Phân bổ', 'Đã chi', 'Còn lại']
};

function doGet() {
  return json_({ ok: true, version: VERSION });
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var r = JSON.parse(e.postData.contents);
    if (r.type === 'jars') saveJars_(r);
    else if (r.type === 'income') upsert_('ThuNhap', row_(r, false));
    else upsert_('ChiTieu', row_(r, true));
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

function row_(r, expense) {
  var o = {
    'ID': r.id, 'Ngày': r.date || '', 'Giờ': r.clock || '', 'Hạng mục': r.category || '',
    'Số tiền': Number(r.amount) || 0, 'Ghi chú': r.note || '', 'Tháng': String(r.date || '').slice(0, 7)
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

// Bảng 6 hũ: mỗi tháng 6 dòng, ghi đè theo (Tháng, Hũ)
function saveJars_(r) {
  var t = tab_('6Hu'), n = t.sh.getLastRow(), map = {};
  if (n > 1) {
    var v = t.sh.getRange(2, 1, n - 1, t.sh.getLastColumn()).getValues();
    v.forEach(function (x, i) { map[x[t.col['Tháng'] - 1] + '|' + x[t.col['Hũ'] - 1]] = i + 2; });
  }
  n = Math.max(n, 1);
  r.jars.forEach(function (j) {
    var key = r.month + '|' + j.name, rowNum = map[key];
    if (!rowNum) { rowNum = ++n; map[key] = rowNum; }
    put_(t, rowNum, { 'Tháng': r.month, 'Hũ': j.name, 'Tỷ lệ %': j.pct, 'Thu nhập tháng': r.income, 'Phân bổ': j.allocated, 'Đã chi': j.spent, 'Còn lại': j.remaining });
  });
}

/** Chạy 1 lần (tuỳ chọn): tạo đủ các tab và tab ThongKe tổng hợp theo tháng. */
function setup() {
  var ct = tab_('ChiTieu'), tn = tab_('ThuNhap');
  tab_('6Hu');
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
