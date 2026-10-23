// Dán vào Google Sheet: Tiện ích mở rộng > Apps Script, rồi Triển khai > Ứng dụng web
// (Thực thi với tư cách: Tôi; Ai có quyền truy cập: Bất kỳ ai). Copy link /exec dán vào Cài đặt của app.
const SHEET = 'ChiTieu';
const HEAD = ['ID', 'Thời gian', 'Danh mục', 'Số tiền', 'Ghi chú', 'Người nhận', 'Ngân hàng', 'Tên file ảnh'];

function doPost(e) {
  const r = JSON.parse(e.postData.contents);
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(SHEET) || ss.insertSheet(SHEET);
  if (sh.getLastRow() === 0) sh.appendRow(HEAD);
  const ids = sh.getRange(2, 1, Math.max(sh.getLastRow() - 1, 1), 1).getValues().flat();
  if (ids.indexOf(r.id) === -1) {
    sh.appendRow([r.id, new Date(r.time), r.category, r.amount, r.note, r.payee, r.bank, r.photo]);
  }
  return ContentService.createTextOutput('ok');
}

function doGet() {
  return ContentService.createTextOutput('Chi tiêu API đang chạy');
}
