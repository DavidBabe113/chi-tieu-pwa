'use strict';
const VERSION = '2.29.0';
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
  'Scan QR': 'Quét QR', 'Choose category': 'Chọn danh mục', 'Details': 'Chi tiết', 'Choose bank': 'Chọn ngân hàng', 'Payment method': 'Lựa chọn thanh toán', 'Continue to pay': 'Tiếp tục thanh toán', 'Save only': 'Chỉ lưu', 'Choose a payment method': 'Hãy chọn phương thức thanh toán', 'Not in any jar: <b>{0}</b>': 'Chưa thuộc hũ nào: <b>{0}</b>', 'No locations yet': 'Chưa có vị trí nào', 'Each slice is one day: how much of the month spending happened that day. Tap a day for details.': 'Mỗi miếng là một ngày: ngày đó chiếm bao nhiêu phần chi của tháng. Chạm vào ngày để xem chi tiết.', 'Other days': 'Các ngày còn lại', 'Highest': 'Cao nhất', 'Tap to see the list': 'Chạm để xem danh sách', 'Payment places': 'Các nơi thanh toán', 'Next: payment method': 'Tiếp: lựa chọn thanh toán', 'Banks': 'Ngân hàng', 'Nothing found': 'Không tìm thấy', 'Search': 'Tìm kiếm', 'Choose how you pay. The app opens and you confirm as usual. Enter the amount there yourself.': 'Chọn cách thanh toán. App sẽ mở, bạn xác nhận như bình thường và tự nhập số tiền ở đó.', 'By payment method': 'Theo hình thức thanh toán',
  'Photo library': 'Thư viện ảnh', 'Settings': 'Cài đặt', 'Back': 'Quay lại', 'Close': 'Đóng', 'Add manually': 'Nhập tay',
  // tổng quan
  'Spent this month': 'Đã chi tháng này', 'Dashboard': 'Bảng tổng hợp', 'Monthly summary': 'Tổng hợp theo tháng', 'Each bar is one day of the month. Touch a bar to see that day.': 'Mỗi cột là một ngày trong tháng. Chạm vào cột để xem ngày đó.', 'Places in {0}': 'Số nơi thanh toán trong {0}', 'Places on {0}': 'Số nơi thanh toán ngày {0}', 'Map': 'Bản đồ', 'Wallet': 'Ví', 'Wallets': 'Ví', 'Payments': 'Thanh toán', '+ Add wallet': '+ Thêm ví', 'No wallet': 'Chưa chọn ví', 'By wallet': 'Theo ví', 'Wallet name': 'Tên ví', 'Savings rate': 'Tỷ lệ thiết kiệm', 'Projected remaining': 'Dự kiến còn lại', 'Total income': 'Tổng thu nhập', 'Total spending': 'Tổng chi tiêu tháng', 'Average per day': 'Trung bình mỗi ngày',
  'Link my Google account': 'Liên kết tài khoản Google của tôi', 'Google Client ID': 'Google Client ID', 'Google email or username': 'Email Google hoặc tên đăng nhập',
  'Password (leave empty for a Google email)': 'Mật khẩu (bỏ trống nếu dùng email Google)', 'This Google account is not on the member list': 'Tài khoản Google này chưa có trong danh sách thành viên',
  'Google sign-in failed': 'Đăng nhập Google không thành công', 'or': 'hoặc',
  'Account': 'Tài khoản', 'Signed in as': 'Đăng nhập với', 'Change password': 'Đổi mật khẩu', 'Log out': 'Đăng xuất', 'Members': 'Thành viên', 'Username': 'Tên đăng nhập', 'Password': 'Mật khẩu',
  'Member': 'Thành viên', 'Admin': 'Quản trị viên', 'Role': 'Vai trò', 'Add member': 'Thêm thành viên', 'You': 'Bạn', 'Reset password': 'Đặt lại mật khẩu',
  'Administrators can do everything.': 'Quản trị viên có mọi quyền.', 'Remove this member? Their transactions stay.': 'Xoá thành viên này? Giao dịch của họ vẫn được giữ.',
  'New password for {0}': 'Mật khẩu mới cho {0}', 'Sign in': 'Đăng nhập', 'Create your admin account': 'Tạo tài khoản quản trị', 'Create account': 'Tạo tài khoản',
  'This account will be the administrator. Choose a password you will remember.': 'Tài khoản này sẽ là quản trị viên. Hãy chọn mật khẩu bạn nhớ được.',
  'Save password': 'Lưu mật khẩu', 'New password': 'Mật khẩu mới', 'Current password': 'Mật khẩu hiện tại', 'Confirm password': 'Nhập lại mật khẩu',
  'Wrong username or password': 'Sai tên đăng nhập hoặc mật khẩu', 'Wrong current password': 'Sai mật khẩu hiện tại', 'Password must have at least 4 characters': 'Mật khẩu cần ít nhất 4 ký tự',
  'Passwords do not match': 'Hai mật khẩu không khớp', 'That username is already taken': 'Tên đăng nhập này đã có',
  'Add expenses': 'Thêm chi tiêu', 'Add income': 'Thêm khoản thu', "See everyone's transactions": 'Xem giao dịch của mọi người', 'See the Dashboard': 'Xem bảng tổng hợp',
  'See 6 Jars': 'Xem 6 hũ', 'Edit jar percentages': 'Sửa tỷ lệ các hũ', 'Manage categories': 'Quản lý danh mục', 'Transactions': 'Giao dịch', 'Remaining': 'Còn lại', 'Payment map': 'Bản đồ thanh toán', '{0} places with a saved location. Tap a pin for details.': '{0} nơi có vị trí đã lưu. Chạm vào ghim để xem chi tiết.', 'No locations saved yet. A location is saved when you enter an amount (allow location access).': 'Chưa có vị trí nào. Vị trí được lưu khi bạn nhập số tiền (hãy cho phép truy cập vị trí).', 'The map could not load. Check your connection.': 'Không tải được bản đồ. Kiểm tra kết nối mạng.', 'All categories': 'Tất cả hạng mục', 'Location': 'Vị trí', 'Open in Maps': 'Mở bản đồ', 'Open in Google Maps': 'Mở Google Maps', 'Save payment location': 'Lưu vị trí khi thanh toán', 'Privacy': 'Quyền riêng tư', 'Financial Tracking': 'Theo dõi tài chính', 'By month': 'Theo tháng', 'Balance': 'Số dư', 'Days elapsed': 'Số ngày đã qua', 'Category': 'Hạng mục', 'Edit': 'Sửa', 'Save changes': 'Lưu thay đổi', 'Time': 'Giờ', 'Enter an amount': 'Nhập số tiền', 'Active days': 'Ngày có chi', 'Per active day': 'TB ngày có chi', 'No spending': 'Không chi', 'transactions': 'giao dịch', 'transaction': 'giao dịch', 'No bank found': 'Không tìm thấy ngân hàng', 'Search bank': 'Tìm ngân hàng', 'Total money': 'Tổng số tiền', 'Spent so far': 'Đã chi tổng cộng', 'Spent in {0}': 'Đã chi trong {0}', 'Income in {0}': 'Thu nhập trong {0}', 'Spending chart': 'Biểu đồ chi tiêu', 'Peak day': 'Ngày chi nhiều nhất',
  'Bank name': 'Tên ngân hàng', 'App link': 'Liên kết mở app', 'Add a bank…': 'Thêm ngân hàng…', 'Custom bank': 'Ngân hàng khác (tự nhập)', 'Banks': 'Ngân hàng', 'Remove': 'Xoá', 'No data yet': 'Chưa có dữ liệu', 'Previous month': 'Tháng trước', 'Next month': 'Tháng sau',
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
  'Top expenses': 'Chi lớn nhất', 'Top category': 'Hạng mục chi nhiều nhất', 'Assessment': 'Đánh giá', 'Cash / no bank': 'Tiền mặt / không qua ngân hàng', 'Others': 'Khác',
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
  'Google Apps Script link (Web App)': 'Link Google Apps Script (Web App)', 'Reset app': 'Đặt lại app', 'Goal reached': 'Đã đạt mục tiêu', 'Overdue': 'Quá hạn', 'Due today': 'Đến hạn hôm nay', '{0} days left': 'Còn {0} ngày', 'Completed': 'Hoàn thành', '{0} to go': 'Còn {0}', 'Set your first goal': 'Đặt mục tiêu đầu tiên', 'Save for a trip, a laptop, a rainy day…': 'Tiết kiệm cho chuyến đi, laptop, quỹ dự phòng…', 'Move to Trash': 'Chuyển vào thùng rác', 'Trash': 'Thùng rác', 'Restore': 'Khôi phục', 'Delete forever': 'Xoá vĩnh viễn', 'Deleted': 'Đã xoá', 'Goal': 'Mục tiêu', 'Empty Trash': 'Dọn sạch thùng rác', 'Trash is empty': 'Thùng rác trống', 'Delete everything in the Trash forever?': 'Xoá vĩnh viễn mọi thứ trong thùng rác?', 'Delete forever? This cannot be undone.': 'Xoá vĩnh viễn? Không thể hoàn tác.', 'Deadline (from today)': 'Hạn chót (tính từ hôm nay)', 'Years': 'Năm', 'Months': 'Tháng', 'Days': 'Ngày', 'Take from': 'Lấy từ', 'Outside money': 'Tiền bên ngoài (không trừ hũ)', 'Remaining in this jar: {0}': 'Còn lại trong hũ này: {0}', 'Added from outside, no jar is reduced': 'Nạp từ nguồn ngoài, không trừ hũ nào', 'Not enough in this jar. Remaining: {0}': 'Hũ này không đủ tiền. Còn lại: {0}', 'Export to Excel': 'Xuất ra Excel', 'Export': 'Xuất file', 'All': 'Tất cả', 'All months': 'Tất cả các tháng', 'Savings goals': 'Mục tiêu tiết kiệm', 'New goal': 'Mục tiêu mới', 'Due': 'Hạn chót', 'Saved': 'Đã tích lũy', 'Add money': 'Nạp thêm tiền', 'No goals yet': 'Chưa có mục tiêu nào', 'Goal name': 'Tên mục tiêu', 'e.g. Japan trip': 'vd: Du lịch Nhật Bản', 'Target': 'Số tiền cần đạt', 'Deadline': 'Hạn chót', '3 mo': '3 tháng', '6 mo': '6 tháng', '1 yr': '1 năm', '2 yr': '2 năm', 'None': 'Không', 'Create goal': 'Tạo mục tiêu', 'Delete this goal?': 'Xoá mục tiêu này?', 'Enter an amount first': 'Hãy nhập số tiền', 'Amount': 'Số tiền', 'Date': 'Ngày', 'Reset the app? All transactions, photos and settings on this phone are deleted. Your Google Sheet is not touched.': 'Đặt lại app? Toàn bộ giao dịch, ảnh và cài đặt trên điện thoại này sẽ bị xoá. Google Sheet không bị ảnh hưởng.', 'Banks': 'Ngân hàng',
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
  const m = document.querySelector('meta[name=theme-color]'); if (m) m.content = dark ? '#000000' : '#fbf6e4';
}
applyTheme();

// ---------- mặc định ----------
const DEF_CATS = '⛽ Fuel\n☕ Food & Coffee\n🛍 Shopping\n🏥 Health\n🎬 Entertainment\n📦 Other';
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
const rawDone = async () => (await allRecs()).filter(r => r.status === 'done');   // toàn bộ (dùng cho đồng bộ)
const doneRecs = async () => { const a = await rawDone(); return can('seeAll') ? a : a.filter(mine); };   // theo quyền người xem

// ---------- trạng thái ----------
let cur = null;          // bản ghi đang soạn
let curPhoto = null;     // blob ảnh đang soạn
let stream = null, scanning = false, curView = 'home';

const cats = () => cfg.get('cats', DEF_CATS).split('\n').map(s => s.trim()).filter(Boolean);
const icats = () => cfg.get('icats', DEF_ICATS).split('\n').map(s => s.trim()).filter(Boolean);
{ const sc = cfg.get('cats', ''); if (/Home bills/i.test(sc)) cfg.set('cats', sc.split('\n').filter(l => !/Home bills/i.test(l)).join('\n')); }   // đã bỏ hạng mục Home bills
const DEF_WALLETS = '💵 Cash\n🟣 MoMo\n🔵 ZaloPay';
const wallets = () => cfg.get('wallets', DEF_WALLETS).split('\n').map(s => s.trim()).filter(Boolean);
const isInc = r => r.type === 'income';       // bản ghi cũ không có type = chi tiêu
const banks = () => cfg.get('banks', DEF_BANKS).split('\n').map(l => l.split('|').map(s => s.trim()))
  .filter(a => a[0] && !/momo|zalopay/i.test(a[0])).map(a => ({ name: a[0], url: a[1] || '' }));
const WALLET_APPS = [{ name: 'MoMo', url: 'momo://' }, { name: 'ZaloPay', url: 'zalopay://' }];   // mở app ví điện tử
let payTab = 'bank', payPick = null;

function toast(msg, ms = 2600) {
  const t = $('#toast'); t.textContent = msg; t.hidden = false;
  clearTimeout(toast.t); toast.t = setTimeout(() => t.hidden = true, ms);
}

// ---------- điều hướng (dùng lịch sử trình duyệt để vuốt cạnh trái = quay lại) ----------
const TITLES = { home: 'Financial Tracking', txn: 'Transactions', jars: '6 Jars', cats: 'Categories', scan: 'Scan QR', cat: 'Choose category', detail: 'Details', bank: 'Payment method', settings: 'Settings' };
const TOP = ['home', 'txn', 'jars', 'cats'];
let depth = 0, pendingTop = null, lastBack = 0, dir = 'fwd';
try { history.replaceState({ v: 'home', d: 0 }, ''); } catch {}
// mode: true = thêm vào lịch sử, false = không đụng lịch sử, 'replace' = thay mục hiện tại
function show(v, mode = true) {
  if (v !== 'home' && TOP.includes(v) && !TABKEYS.includes(v)) v = 'home';
  if (v !== 'scan') stopScan();
  const inner = !TOP.includes(v);
  try {
    if (inner && mode === true) { depth++; history.pushState({ v, d: depth }, ''); }
    else if (inner && mode === 'replace') history.replaceState({ v, d: depth }, '');
    else if (!inner && mode === true && depth === 0) history.replaceState({ v, d: 0 }, '');
  } catch {}
  const pv = curView;
  curView = v;
  let dr = dir;
  if (dr === 'fwd' && pv !== v && TOP.includes(pv) && TOP.includes(v)) dr = TOP.indexOf(v) > TOP.indexOf(pv) ? 'next' : 'prev';   // chuyển tab trượt theo chiều
  document.body.dataset.dir = dr;
  $('#fabs').hidden = !(v === 'home' || v === 'txn');
  if (v !== 'jars') $('#saveMonth').hidden = true;
  document.querySelectorAll('main > section').forEach(s => s.hidden = s.id !== 'v-' + v);
  $('#title').textContent = tr(TOP.includes(v) ? 'Financial Tracking' : TITLES[v]);   // cả 4 tab chính dùng chung tiêu đề app
  $('#back').hidden = !inner;
  $('#openSettings').hidden = inner;
  $('#tabs').hidden = inner || TABKEYS.length < 2;
  if (!inner) $('#tabs').style.setProperty('--i', Math.max(0, TABKEYS.indexOf(v)));
  document.querySelectorAll('#tabs button').forEach(b => b.classList.toggle('on', b.dataset.tab === v));
  window.scrollTo(0, 0);
  if (v === 'home') renderHome();
  if (v === 'txn') renderTxn();
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
  if (!TOP.includes(v) && v !== 'settings' && !cur) v = 'home';
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

// Vuốt ngang giữa các tab: trang đi theo ngón tay (như iOS), thả ra thì trượt sang tab kế hoặc bật lại; mép trái dành cho vuốt quay lại
let sw = null;
const swReset = el => { el.style.transition = ''; el.style.transform = ''; el.style.opacity = ''; };
addEventListener('touchstart', e => {
  sw = null;
  if (!(depth === 0 && TOP.includes(curView) && TABKEYS.length > 1 && $('#sheet').hidden && $('#lock').hidden)) return;
  const t = e.touches[0];
  if (t.clientX < 28 || e.target.closest('input,textarea,select,.cols,.dwrap')) return;
  sw = { x: t.clientX, y: t.clientY, t: Date.now(), axis: '', dx: 0, raf: 0, el: $('#v-' + curView) };
}, { passive: true });
addEventListener('touchmove', e => {
  if (!sw) return;
  const t = e.touches[0], dx = t.clientX - sw.x, dy = t.clientY - sw.y;
  if (!sw.axis) { if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return; sw.axis = Math.abs(dx) > Math.abs(dy) * 1.2 ? 'x' : 'y'; }
  if (sw.axis !== 'x') return;
  const i = TABKEYS.indexOf(curView), edge = (dx > 0 && i === 0) || (dx < 0 && i === TABKEYS.length - 1);
  sw.dx = edge ? dx * 0.25 : dx;   // ở tab đầu/cuối thì kéo nặng tay
  if (!sw.raf) sw.raf = requestAnimationFrame(() => {
    if (!sw) return; sw.raf = 0;
    sw.el.style.transition = 'none';
    sw.el.style.transform = 'translate3d(' + sw.dx + 'px,0,0)';
    sw.el.style.opacity = String(1 - Math.min(0.5, Math.abs(sw.dx) / innerWidth));
  });
}, { passive: true });
addEventListener('touchcancel', () => { if (sw) { cancelAnimationFrame(sw.raf); swReset(sw.el); sw = null; } }, { passive: true });
addEventListener('touchend', e => {
  if (!sw) return;
  const s0 = sw; sw = null; cancelAnimationFrame(s0.raf);
  if (s0.axis !== 'x') return;
  const t = e.changedTouches[0], dx = t.clientX - s0.x, vel = Math.abs(dx) / Math.max(1, Date.now() - s0.t);
  const n = TABKEYS.indexOf(curView) + (dx < 0 ? 1 : -1);
  const go = (Math.abs(dx) > innerWidth * 0.25 || vel > 0.5) && Math.abs(dx) > 30 && n >= 0 && n < TABKEYS.length;
  const el = s0.el;
  if (!go) { el.style.transition = 'transform .28s var(--ease),opacity .28s'; el.style.transform = ''; el.style.opacity = ''; setTimeout(() => swReset(el), 300); return; }
  el.style.transition = 'transform .14s ease-out,opacity .14s'; el.style.transform = 'translate3d(' + (dx < 0 ? -70 : 70) + 'px,0,0)'; el.style.opacity = '0';
  setTimeout(() => { swReset(el); show(TABKEYS[n], true); }, 130);
}, { passive: true });

// ---------- quét QR ----------
$('#btnScan').onclick = startScan;
// Nút +: hiện nhỏ hai lựa chọn Income / Expense, chọn xong mới hiện hạng mục
function addMenu() {
  const m = $('#addMenu');
  m.querySelectorAll('button').forEach(b => { b.textContent = tr(b.dataset.t === 'income' ? 'Income' : 'Expense'); b.hidden = !can(b.dataset.t === 'income' ? 'addIncome' : 'addExpense'); });
  m.hidden = !m.hidden;
}
$('#btnManual').onclick = addMenu;
$('#addMenu').onclick = e => {
  const b = e.target.closest('button'); if (!b) return;
  $('#addMenu').hidden = true;
  cur = newRec(); cur.type = b.dataset.t; renderCats(); show('cat');
};
document.addEventListener('click', e => { if (!$('#addMenu').hidden && !e.target.closest('#addMenu,#btnManual')) $('#addMenu').hidden = true; });

function newRec() {
  return { type: 'expense', by: me ? me.id : '', fromQr: false, acc: '', bin: '', id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), time: new Date().toISOString(), category: '', amount: '', note: '', payee: '', bank: '', photo: '', status: 'draft', synced: false };
}

const scanCv = document.createElement('canvas'), scanCx = scanCv.getContext('2d', { willReadFrequently: true });
function scanGrab(v, maxSide, crop) {   // lấy khung hình (có thể thu nhỏ / cắt giữa) thành ImageData
  let sw = v.videoWidth, sh = v.videoHeight, sx = 0, sy = 0;
  if (crop) { sx = sw * 0.15; sy = sh * 0.15; sw *= 0.7; sh *= 0.7; }
  const k = Math.min(1, maxSide / Math.max(sw, sh));
  scanCv.width = Math.max(1, Math.round(sw * k)); scanCv.height = Math.max(1, Math.round(sh * k));
  scanCx.drawImage(v, sx, sy, sw, sh, 0, 0, scanCv.width, scanCv.height);
  return scanCx.getImageData(0, 0, scanCv.width, scanCv.height);
}
// Các cách quét xoay vòng: nhỏ nhanh → vừa → cắt giữa → độ phân giải cao (có thử mã đảo màu)
const SCAN_PASSES = [[640, false, false], [1024, false, false], [800, false, true], [480, false, false], [1600, true, false], [1280, false, true]];
let scanWorker = null;
function stopWorker() { if (scanWorker) { scanWorker.terminate(); scanWorker = null; } }
async function startScan() {
  show('scan');
  $('#scanMsg').textContent = '';
  $('.camwrap').classList.remove('found');
  const hi = { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 }, frameRate: { ideal: 30 } };
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: hi, audio: false });
  } catch {
    try { stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false }); }
    catch { $('#scanMsg').textContent = tr('Cannot open the camera. Allow camera access in iPhone Settings > Safari / this app.'); return; }
  }
  try {   // lấy nét liên tục + phóng nhẹ nếu thiết bị hỗ trợ
    const tk = stream.getVideoTracks()[0], caps = (tk.getCapabilities && tk.getCapabilities()) || {}, adv = [];
    if (caps.focusMode && caps.focusMode.includes('continuous')) adv.push({ focusMode: 'continuous' });
    if (caps.zoom) adv.push({ zoom: Math.min(caps.zoom.max, Math.max(caps.zoom.min, 1.5)) });
    if (adv.length) await tk.applyConstraints({ advanced: adv });
  } catch {}
  const v = $('#video'); v.srcObject = stream; await v.play();
  scanning = true;
  let det = null; try { if ('BarcodeDetector' in window) det = new BarcodeDetector({ formats: ['qr_code'] }); } catch {}
  stopWorker();
  try { scanWorker = new Worker('scan-worker.js'); } catch { scanWorker = null; }
  const found = data => {   // viền xanh báo đã nhận mã rồi mới chuyển màn
    if (!scanning) return; scanning = false;
    $('.camwrap').classList.add('found');
    setTimeout(() => { stopWorker(); onQr(data); }, 160);
  };
  let n = 0, busy = false;
  if (scanWorker) scanWorker.onmessage = m => { busy = false; if (m.data && m.data.data) found(m.data.data); };
  const tick = async () => {
    if (!scanning) return;
    if (v.videoWidth && v.readyState >= 2 && !busy) {
      const [side, inv, crop] = SCAN_PASSES[n++ % SCAN_PASSES.length];
      try {
        if (det) { const r = await det.detect(v); if (r.length && r[0].rawValue) return found(r[0].rawValue); }
        const im = scanGrab(v, side, crop);
        if (scanWorker) { busy = true; scanWorker.postMessage({ buf: im.data.buffer, w: im.width, h: im.height, inv }, [im.data.buffer]); }
        else { const d = jsQR(im.data, im.width, im.height, { inversionAttempts: inv ? 'attemptBoth' : 'dontInvert' }); if (d && d.data) return found(d.data); }
      } catch { busy = false; }
    }
    requestAnimationFrame(tick);
  };
  tick();
}
function stopScan() {
  scanning = false; stopWorker();
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
  const types = ['expense', 'income'].filter(k => can(k === 'expense' ? 'addExpense' : 'addIncome'));
  if (!types.includes(cur.type)) cur.type = types[0] || 'expense';
  $('#segType').hidden = cur.fromQr || types.length < 2;   // quét QR chuyển khoản luôn là chi tiêu
  document.querySelectorAll('#segType button').forEach(b => { b.hidden = !types.includes(b.dataset.v); b.classList.toggle('on', b.dataset.v === cur.type); });
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
  $('#amount').value = commas(cur.amount || '');
  $('#note').value = cur.note;
  $('#preview').hidden = true; curPhoto = null;
  const inc = cur.type === 'income';   // khoản thu: không ảnh, không ngân hàng
  $('.photo').hidden = false; $('#payBox').hidden = inc; payPick = null; payTab = 'bank'; $('#bankQ').value = ''; $('#bankQ').hidden = true; $('#bankQ').placeholder = tr('Search'); renderBanks(); $('#toBank').hidden = inc; $('#saveOnly').hidden = inc; $('#saveIncome').hidden = !inc;
  show('detail');
  // Ghi lại vị trí lúc nhập số tiền (cần bạn cho phép định vị; tắt được trong Cài đặt)
  const rec = cur; rec.loc = null;
  if (cfg.get('locOn', '1') !== '0' && navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(p => { rec.loc = { lat: +p.coords.latitude.toFixed(5), lng: +p.coords.longitude.toFixed(5), acc: Math.round(p.coords.accuracy) }; }, () => {}, { enableHighAccuracy: true, timeout: 10000, maximumAge: 120000 });
  }
}
const commas = v => { const d = String(v).replace(/\D/g, ''); return d ? Number(d).toLocaleString('en-US') : ''; };
document.addEventListener('input', e => { if (e.target.matches('input[inputmode="numeric"]')) e.target.value = commas(e.target.value); });
$('#photoIn').onchange = async e => {
  const f = e.target.files[0]; if (!f) return;
  curPhoto = await shrink(f);
  $('#preview').src = URL.createObjectURL(curPhoto); $('#preview').hidden = false;
  e.target.value = '';   // ảnh chỉ lưu trong app; không tự lưu ra album nữa
};
// Lưu thủ công khi cần: chạm vào ảnh trong chi tiết giao dịch → bảng chia sẻ của iOS → "Lưu hình ảnh"
async function savePhoto(blob, name) {
  const f = new File([blob], name, { type: 'image/jpeg' });
  if (navigator.canShare && navigator.canShare({ files: [f] })) {
    try { await navigator.share({ files: [f] }); } catch {}
  } else toast(tr('Press and hold the photo to save it'));
}
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
  cur.time = new Date().toISOString();   // ngày giờ lấy đúng lúc lưu, không chỉnh được
  return true;
}
async function stash() {
  if (curPhoto) {
    cur.photo = `${cur.time.slice(0, 10).replace(/-/g, '')}_${cur.id}.jpg`;
    await putPhoto(cur.id, curPhoto);
  }
}

// "Save only" = chi tiền mặt, không qua ngân hàng → lưu luôn, không báo gì
$('#saveOnly').onclick = () => { if (can('addExpense')) finishPay(false); };
$('#saveIncome').onclick = async () => {
  if (!can('addIncome') || !collectDetail()) return;
  await stash();
  cur.type = 'income'; cur.status = 'done'; await putRec(cur); sync();
  goTop('home');
};
$('#toBank').onclick = () => { if (can('addExpense')) finishPay(true); };

// ---------- chọn ngân hàng ----------
// Chọn ngân hàng: tên viết tắt (thương hiệu) ở trên, tên đầy đủ ở dưới; có ô tìm nhanh
const fold = t => t.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd').toLowerCase();
function renderBanks() {
  const q = fold(($('#bankQ').value || '').trim());
  $('#banks').innerHTML = '';
  let n = 0;
  document.querySelectorAll('#segPay button').forEach(x => x.classList.toggle('on', x.dataset.v === payTab));
  (payTab === 'wallet' ? WALLET_APPS : banks()).forEach(b => {
    if (q && !fold(b.name).includes(q)) return;
    n++;
    const el = document.createElement('button');
    const m = b.name.match(/^(.*?)\s*\((.+)\)$/);   // "Tên đầy đủ (Viết tắt)"
    el.innerHTML = m ? `<span class="bk1">${esc(m[2])}</span><small class="bk2">${esc(m[1])}</small>` : `<span class="bk1">${esc(b.name)}</span>`;
    if (payPick && payPick.name === b.name) el.className = 'on';
    el.onclick = () => { payPick = payPick && payPick.name === b.name ? null : b; renderBanks(); };
    $('#banks').append(el);
  });
  if (!n) $('#banks').innerHTML = `<p class="hint">${tr('Nothing found')}</p>`;
}
$('#bankSearchBtn').onclick = () => {
  const q = $('#bankQ'); q.hidden = !q.hidden;
  if (q.hidden) { q.value = ''; renderBanks(); } else q.focus();
};
$('#bankQ').oninput = renderBanks;
document.querySelectorAll('#segPay button').forEach(b => b.onclick = () => { payTab = b.dataset.v; renderBanks(); });
// Hoàn tất: lưu giao dịch (kèm phương thức đã chọn). open = true → mở app ngân hàng / ví để thanh toán
async function finishPay(open) {
  if (open && !payPick) { toast(tr('Choose a payment method')); return; }
  if (!collectDetail()) return;
  await stash();
  cur.bank = payPick ? payPick.name : ''; cur.status = 'done';
  await putRec(cur); sync();
  const go = open ? payPick : null;
  goTop('home');
  if (!go) return;
  if (!go.url) { toast(tr('No app link for this bank. Set one in Settings')); return; }
  setTimeout(() => {
    location.href = go.url;
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
document.addEventListener('visibilitychange', () => { if (!document.hidden && curView === 'home') renderHome(); else if (!document.hidden && curView === 'txn') renderTxn(); });

// ---------- đồng bộ ----------
async function post(r) {
  const url = cfg.get('sheetUrl', '');
  if (!url) return false;
  try {
    let body = r;
    if (r.time && r.type !== 'jars') {   // ngày và giờ thành hai cột riêng trong Sheet
      const d = new Date(r.time);
      body = { ...r, date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`, clock: `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}` };
    }
    await fetch(url, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify(body) });
    return true;
  } catch { return false; }
}
function markJars(ym) {
  const d = getJSON('jarsDirty', []); if (!d.includes(ym)) { d.push(ym); cfg.set('jarsDirty', JSON.stringify(d)); }
}
async function markAllJars() {   // đổi gán danh mục → hũ ảnh hưởng mọi tháng đã có giao dịch
  (await rawDone()).forEach(r => markJars(ymOf(r.time)));
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
  const recs = await rawDone(), left = [];
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
  if (curView === 'txn') renderTxn();
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
const monthNav = (id, noToday) => `<div class="mnav ${id}"><button data-m="-1" aria-label="${tr('Previous month')}">‹</button>` +
  `<div class="mmid"><span>${monthLabel(viewYm)}</span>${!noToday && viewYm !== nowYm() ? `<button class="tdy" data-today="1">${tr('Today')}</button>` : ''}</div>` +
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
function countTo(el) { el.textContent = fmt(Number(el.dataset.count)); }   // hiện số ngay, không chạy hiệu ứng đếm (tránh nhảy số)
const runCounts = root => root.querySelectorAll('[data-count]').forEach(countTo);
const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.06 }) : null;
function reveal() { /* đã tắt: hiệu ứng hiện dần làm các ô nháy mỗi lần dữ liệu vẽ lại */ }
let revealQueued = false;
new MutationObserver(() => { if (!revealQueued) { revealQueued = true; requestAnimationFrame(() => { revealQueued = false; reveal(); }); } })
  .observe(document.querySelector('main'), { childList: true, subtree: true });
let hdrOn = false;
addEventListener('scroll', () => { const on = scrollY > 24; if (on !== hdrOn) { hdrOn = on; $('header').classList.toggle('scrolled', on); } }, { passive: true });

// ---------- Tổng quan: đã chi tháng này + chi theo danh mục, giao dịch gần nhất, rồi Dashboard ở dưới ----------
function dayLabel(d) {
  const t = new Date(), y = new Date(); y.setDate(t.getDate() - 1);
  if (d.toDateString() === t.toDateString()) return tr('Today');
  if (d.toDateString() === y.toDateString()) return tr('Yesterday');
  return d.toLocaleDateString(DLOC(), { weekday: 'short', day: 'numeric', month: 'short' });
}
// Danh sách giao dịch theo ngày (dùng cho tab Giao dịch): mỗi ngày có tiêu đề + tổng của ngày
async function fillDays(box, items) {
  box.innerHTML = '';
  const groups = [], todayKey = new Date().toDateString();
  items.forEach(r => {
    const d = new Date(r.time), k = d.toDateString();
    let g = groups[groups.length - 1];
    if (!g || g.k !== k) { g = { k, d, items: [], sum: 0 }; groups.push(g); }
    g.items.push(r); g.sum += Number(r.amount);
  });
  for (const g of groups) {
    const head = document.createElement('div'); head.className = 'dayh'; if (g.k === todayKey) head.dataset.today = '1';
    head.innerHTML = `<span>${dayLabel(g.d)}</span><b>${fmt(g.sum)}</b>`;
    const grp = document.createElement('div'); grp.className = 'card list';
    for (const r of g.items) {
      const d = new Date(r.time);
      const it = document.createElement('div'); it.className = 'item'; it.dataset.id = r.id;
      it.innerHTML = `<div class="t">${esc(r.category)}<small>${d.toLocaleTimeString(DLOC(), { hour: '2-digit', minute: '2-digit' })}${r.bank ? ' · ' + esc(r.bank.replace(/^.*\((.+)\)$/, '$1')) : ''}</small>${r.note ? `<span class="nt">${esc(r.note)}</span>` : ''}</div><div class="amt ${isInc(r) ? 'in' : ''}">${isInc(r) ? '+' : ''}${fmt(r.amount)}</div>`;
      if (r.photo) { const b = await getPhoto(r.id); if (b) { const i = new Image(); i.decoding = 'async'; i.loading = 'lazy'; i.src = URL.createObjectURL(b); it.prepend(i); } }
      grp.append(it);
    }
    box.append(head, grp);
  }
}
function donut(by, total, colors) {   // biểu đồ tròn theo hạng mục (chu vi = 100)
  let cum = 0;
  const segs = by.map(([k, v], i) => { const p = v / total * 100, o = 25 - cum; cum += p; return `<circle cx="21" cy="21" r="15.9155" fill="none" stroke="${(colors && colors[i]) || PAL[i % PAL.length]}" stroke-width="6" stroke-dasharray="${p.toFixed(3)} ${(100 - p).toFixed(3)}" stroke-dashoffset="${o.toFixed(3)}"></circle>`; }).join('');
  return `<svg class="donut" viewBox="0 0 42 42" role="img" aria-label="${tr('Spending chart')}"><circle cx="21" cy="21" r="15.9155" fill="none" stroke="var(--fill)" stroke-width="6"></circle>${segs}<text x="21" y="22.4" text-anchor="middle" class="dtx">${short(total)}</text></svg>`;
}
async function renderHome() {
  renderGoals();
  await renderPending();
  const all = await doneRecs();
  all.forEach(r => recById[r.id] = r);
  // Tổng số tiền (tất cả thu nhập) và số tiền còn lại: tính trên toàn bộ dữ liệu, không theo tháng
  const totalInc = sum(all.filter(isInc)), totalExp = sum(all.filter(r => !isInc(r))), remain = totalInc - totalExp;
  $('#balance').innerHTML = `<div class="hl">${tr('Remaining')}</div><b class="total ${remain < 0 ? 'neg' : ''}" data-key="home-remain" data-count="${remain}">${fmt(remain)}</b>` +
    `<div class="duo"><div><span>${tr('Total money')}</span><b class="pos" data-key="home-total" data-count="${totalInc}">${fmt(totalInc)}</b></div><div><span>${tr('Spent so far')}</span><b data-key="home-all" data-count="${totalExp}">${fmt(totalExp)}</b></div></div>`;
  // Phần dưới chỉ của tháng đang xem
  const exp = all.filter(r => !isInc(r) && ymOf(r.time) === viewYm);
  const spent = sum(exp);
  const by = Object.entries(sumBy(exp, r => r.category)).sort((a, b) => b[1] - a[1]);
  $('#stats').innerHTML = monthNav('') +
    `<div class="hl">${tr('Spent in {0}', monthLabel(viewYm))}</div><b class="total" data-key="home-spent" data-count="${spent}">${fmt(spent)}</b>` +
    (by.length ? `<div class="chart hchart">${donut(by, spent)}<div class="legend">${by.map(([k, v], i) =>
      `<div class="lg2" data-info="cat" data-arg="${esc(k)}"><i style="background:${PAL[i % PAL.length]}"></i><span>${esc(k)}</span><div class="pc"><b>${Math.round(v / spent * 100)}%</b><small>${fmt(v)}</small></div></div>`).join('')}</div></div>` : '');
  const bd = $('#balance'); bd.querySelectorAll('.hl,.total').forEach(e => e.dataset.info = 'remain');
  const duo = bd.querySelector('.duo').children; duo[0].dataset.info = 'income'; duo[1].dataset.info = 'spent';
  $('#stats').querySelectorAll('.hl,.total').forEach(e => e.dataset.info = 'month');
  runCounts($('#balance')); runCounts($('#stats'));
  renderDash(all);
}
bindMonthNav($('#stats'), renderHome);

// ---------- Giao dịch: ba mục Chi tiêu / Thu nhập / Bản đồ ----------
let txnType = 'out', txnCat = '', txnDay = '';
async function renderTxn() {
  const all = await doneRecs();
  all.forEach(r => recById[r.id] = r);
  const totalInc = sum(all.filter(isInc)), totalExp = sum(all.filter(r => !isInc(r)));
  const mapMode = txnType === 'map', inc = txnType === 'in';
  // ô chọn hạng mục: danh mục đã cài + danh mục có trong dữ liệu của loại này
  const ofType = mapMode ? all : all.filter(r => isInc(r) === inc);
  const catOpts = [...new Set([...(mapMode ? [...cats(), ...icats()] : inc ? icats() : cats()), ...ofType.map(r => r.category)])].filter(Boolean);
  if (txnCat && !catOpts.includes(txnCat)) txnCat = '';
  $('#txnCat').innerHTML = `<option value="">${tr('All categories')}</option>` + catOpts.map(c => `<option value="${esc(c)}"${c === txnCat ? ' selected' : ''}>${esc(c)}</option>`).join('');
  if (txnDay && txnDay.slice(0, 7) !== viewYm) txnDay = '';
  $('#txnDay').textContent = txnDay ? new Date(txnDay + 'T00:00').toLocaleDateString(DLOC(), { day: 'numeric', month: 'short', year: 'numeric' }) : tr('Date'); $('#txnDay').classList.toggle('set', !!txnDay); $('#txnDayClear').hidden = !txnDay;
  const items = ofType.filter(r => ymOf(r.time) === viewYm && (!txnCat || r.category === txnCat) && (!txnDay || ymd(new Date(r.time)) === txnDay)).sort((a, b) => b.time.localeCompare(a.time));
  const tot = sum(items);
  document.querySelectorAll('#segTxn button').forEach(b => b.classList.toggle('on', b.dataset.v === txnType));
  $('#txnList').hidden = mapMode; $('#txnMapBox').hidden = !mapMode;
  if (mapMode) {
    const n = items.filter(r => r.loc).length;
    $('#txnHead').innerHTML = monthNav('', true) + `<div class="hl" data-info="places">${tr(txnDay ? 'Places on {0}' : 'Places in {0}', txnDay ? new Date(txnDay + 'T00:00').toLocaleDateString(DLOC(), { day: 'numeric', month: 'short' }) : monthLabel(viewYm))}</div><b class="total" data-info="places">${n}</b>`;
    renderMap(items); return;
  }
  $('#txnHead').innerHTML = monthNav('', true) +
    `<div class="hl">${tr(inc ? 'Income in {0}' : 'Spent in {0}', monthLabel(viewYm))}</div><b class="total" data-key="txn-sum" data-count="${tot}">${fmt(tot)}</b>` +
    `<div class="duo w"><div><span>${tr('Remaining')}</span><b>${fmt(totalInc - totalExp)}</b></div><div><span>${tr(inc ? 'Income' : 'Expense')}</span><b>${items.length}</b></div></div>`;
  runCounts($('#txnHead'));
  await fillDays($('#txnList'), items);
  if (!items.length) $('#txnList').innerHTML = `<p class="hint">${tr('No transactions in this month.')}</p>`;
}
bindMonthNav($('#txnHead'), () => { txnDay = ''; renderTxn(); });
$('#txnCat').onchange = e => { txnCat = e.target.value; renderTxn(); };
// Lịch chọn ngày của app (theo ngôn ngữ đã chọn, không dùng bộ chọn ngày của hệ điều hành)
let cal = { y: 0, m: 0 };
function calendar() {
  const first = new Date(cal.y, cal.m - 1, 1), lead = (first.getDay() + 6) % 7, dim = new Date(cal.y, cal.m, 0).getDate(), td = ymd(new Date());
  const wd = Array.from({ length: 7 }, (_, i) => `<span>${new Date(2024, 0, 1 + i).toLocaleDateString(LOC(), { weekday: 'short' })}</span>`).join('');
  const cells = Array(lead).fill('<i></i>').concat(Array.from({ length: dim }, (_, i) => {
    const d = `${cal.y}-${String(cal.m).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`;
    return `<button data-pd="${d}" class="${d === txnDay ? 'on' : d === td ? 'td' : ''}">${i + 1}</button>`;
  })).join('');
  $('#sheetBody').innerHTML = `<div class="mpk"><div class="mpy"><button data-cm="-1" aria-label="-1">‹</button><b>${first.toLocaleString(LOC(), { month: 'long', year: 'numeric' })}</b><button data-cm="1" aria-label="+1">›</button></div><div class="cwd">${wd}</div><div class="cgrid">${cells}</div></div>`;
}
$('#txnDay').onclick = () => { const d = txnDay || ymd(new Date()); cal = { y: Number(d.slice(0, 4)), m: Number(d.slice(5, 7)) }; openPanel(''); calendar(); };
document.addEventListener('click', e => {
  const cm = e.target.closest('#sheet [data-cm]');
  if (cm) { const d = new Date(cal.y, cal.m - 1 + Number(cm.dataset.cm), 1); cal = { y: d.getFullYear(), m: d.getMonth() + 1 }; calendar(); return; }
  const pd = e.target.closest('#sheet [data-pd]');
  if (pd) { txnDay = pd.dataset.pd; viewYm = txnDay.slice(0, 7); renderTxn(); closeSheet(); }
});
$('#txnDayClear').onclick = () => { txnDay = ''; renderTxn(); };
$('#mapList').onclick = e => { const it = e.target.closest('.item'); if (it && recById[it.dataset.id]) openSheet(recById[it.dataset.id]); };
$('#txnList').onclick = e => { const it = e.target.closest('.item'); if (it && recById[it.dataset.id]) openSheet(recById[it.dataset.id]); };
$('#txnToday').onclick = () => { viewYm = nowYm(); txnDay = ymd(new Date()); renderTxn(); window.scrollTo({ top: 0, behavior: 'smooth' }); };   // Today: lọc đúng hôm nay
document.querySelectorAll('#segTxn button').forEach(b => b.onclick = () => { txnType = b.dataset.v; renderTxn(); });
// ---------- bản đồ các nơi đã thanh toán (Leaflet + OpenStreetMap; vị trí chỉ đọc từ dữ liệu trong máy) ----------
let leaf = null, leafLayer = null;
const hasEmoji = t => /^\p{Extended_Pictographic}/u.test(t);
function pinHtml(r, k = 0) {   // nhãn nhỏ: biểu tượng hạng mục + tên + số tiền + ghi chú ngắn; k = thứ tự khi nhiều giao dịch cùng một chỗ (xếp chồng lên trên)
  const inc = isInc(r), em = hasEmoji(r.category) ? r.category.split(' ')[0] : '📍', name = (hasEmoji(r.category) ? r.category.split(' ').slice(1).join(' ') : r.category) || r.category;
  const note = r.note ? ' · ' + (r.note.length > 18 ? r.note.slice(0, 17) + '…' : r.note) : '';
  return `<div class="pin ${inc ? 'in' : 'out'}" style="margin-top:${-k * 30}px"><i>${esc(em)}</i><span>${esc(name)} ${inc ? '+' : '−'}${short(Number(r.amount))}${esc(note)}</span></div>`;
}
const locKeyOf = r => r.loc.lat.toFixed(4) + ',' + r.loc.lng.toFixed(4), locKey = locKeyOf;
const _lk = r => r.loc.lat.toFixed(4) + ',' + r.loc.lng.toFixed(4);
function renderMap(items) {
  const pts = [], withLoc = items.filter(r => r.loc && isFinite(r.loc.lat) && isFinite(r.loc.lng));
  $('#mapNote').textContent = withLoc.length ? '' : tr('No locations yet');
  if (typeof L === 'undefined') { $('#mapNote').textContent = tr('The map could not load. Check your connection.'); return; }
  if (!leaf) {
    leaf = L.map('map', { zoomControl: true, attributionControl: true }).setView([16.05, 108.2], 5);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' }).addTo(leaf);
    leafLayer = L.layerGroup().addTo(leaf);
  }
  leafLayer.clearLayers();
  fillDays($('#mapList'), withLoc);
  const seen = {};   // các giao dịch cùng một chỗ (làm tròn ~10 m) được xếp chồng lên nhau để không che nhau
  withLoc.forEach(r => {
    const p = [r.loc.lat, r.loc.lng], key = r.loc.lat.toFixed(4) + ',' + r.loc.lng.toFixed(4), k = seen[key] = (seen[key] ?? -1) + 1; pts.push(p);
    L.marker(p, { icon: L.divIcon({ className: 'pinwrap', html: pinHtml(r, k), iconSize: [0, 0] }) }).on('click', () => showInfo('place', key)).addTo(leafLayer);
  });
  setTimeout(() => {
    leaf.invalidateSize();
    if (pts.length === 1) leaf.setView(pts[0], 16); else if (pts.length) leaf.fitBounds(pts, { padding: [50, 50], maxZoom: 16 });
  }, 60);
}
$('#dash').onclick = e => { const it = e.target.closest('.item'); if (it && recById[it.dataset.id]) openSheet(recById[it.dataset.id]); };

// ---------- mục tiêu tiết kiệm: tên, số tiền cần đạt, hạn chót; nạp thêm tiền để theo dõi tiến độ ----------
const goals = () => getJSON('goals', []);
const saveGoals = a => cfg.set('goals', JSON.stringify(a));
const GOAL_ICONS = ['🎯', '✈️', '🏠', '💻', '🚗', '🎓', '💍', '🌴', '📱', '🎁'];
const goalIcon = g => GOAL_ICONS[[...g.id].reduce((a, ch) => a + ch.charCodeAt(0), 0) % GOAL_ICONS.length];
function renderGoals() {
  const list = goals(), C = 2 * Math.PI * 28;
  $('#goals').innerHTML = `<div class="gtop"><h2>${tr('Savings goals')}</h2><button class="gnew" data-g="new" aria-label="${tr('New goal')}">+</button></div>` +
    (list.length ? `<div class="glist">` + list.map((g, i) => {
      const raw = g.target ? g.saved / g.target * 100 : 0, p = Math.min(100, raw), done = raw >= 100, left = Math.max(0, g.target - g.saved);
      let chip = '';
      if (done) chip = `<span class="gchip win">🎉 ${tr('Goal reached')}</span>`;
      else if (g.due) {
        const days = Math.ceil((new Date(g.due + 'T00:00') - new Date(ymd(new Date()) + 'T00:00')) / 864e5);
        chip = `<span class="gchip ${days < 0 ? 'late' : days <= 30 ? 'soon' : ''}">${days < 0 ? tr('Overdue') : days === 0 ? tr('Due today') : tr('{0} days left', days)}</span>`;
      }
      return `<div class="card goal ${done ? 'done' : ''}" style="animation-delay:${i * 60}ms"><div class="gring"><svg viewBox="0 0 64 64" width="72" height="72"><circle cx="32" cy="32" r="28" class="gbg"/><circle cx="32" cy="32" r="28" class="gfg" style="stroke-dasharray:${C.toFixed(1)};--off:${(C * (1 - p / 100)).toFixed(1)};--full:${C.toFixed(1)}"/></svg><span class="gem">${done ? '🏆' : goalIcon(g)}</span></div>` +
        `<div class="gbody"><div class="gh"><div class="gn"><b>${esc(g.name)}</b>${chip}</div><button class="gdel" data-g="del" data-id="${g.id}" aria-label="${tr('Delete')}">🗑</button></div>` +
        `<div class="gv"><b>${fmt(g.saved)}</b><small> / ${fmt(g.target)}</small></div>` +
        `<div class="gbar"><i style="width:${p}%"></i></div>` +
        `<div class="gfoot"><span><b>${Math.round(p)}%</b> · ${done ? tr('Completed') : tr('{0} to go', fmt(left))}</span><button class="gadd" data-g="add" data-id="${g.id}">+ ${tr('Add money')}</button></div></div></div>`;
    }).join('') + `</div>` : `<div class="card gempty" data-g="new"><span class="gem big">🎯</span><div><b>${tr('Set your first goal')}</b><small>${tr('Save for a trip, a laptop, a rainy day…')}</small></div></div>`);
}
let goalDue = 12, goalJars = [];
const goalNote = () => { const i = Number($('#gSrc').value); $('#gRem').textContent = i < 0 ? tr('Added from outside, no jar is reduced') : tr('Remaining in this jar: {0}', fmt(goalJars[i].remaining)); };
async function goalForm(id) {
  const g = id ? goals().find(x => x.id === id) : null;
  goalDue = 12;
  if (g) goalJars = computeJars(nowYm(), await doneRecs(), pctFor(nowYm())).jars;
  openPanel(`<h3 class="ih">${tr(g ? 'Add money' : 'New goal')}</h3>` + (g
    ? `<p class="gname">${esc(g.name)}</p><label>${tr('Amount')} (₫)<input id="gAmt" inputmode="numeric" placeholder="0"></label>` +
      `<label>${tr('Take from')}</label><select id="gSrc" class="jsel wide">${goalJars.map((j, i) => `<option value="${i}" ${i === 1 ? 'selected' : ''}>${esc(jarName(i))} · ${fmt(j.remaining)}</option>`).join('')}<option value="-1">${tr('Outside money')}</option></select>` +
      `<p class="hint" id="gRem"></p><button class="big" id="gSave" data-id="${g.id}">${tr('Add money')}</button>`
    : `<label>${tr('Goal name')}<input id="gName" placeholder="${tr('e.g. Japan trip')}"></label><label>${tr('Target')} (₫)<input id="gAmt" inputmode="numeric" placeholder="0"></label>` +
      `<label>${tr('Deadline (from today)')}</label><div class="gdl"><label>${tr('Years')}<input id="gY" inputmode="numeric" placeholder="0"></label><label>${tr('Months')}<input id="gM" inputmode="numeric" placeholder="0"></label><label>${tr('Days')}<input id="gD" inputmode="numeric" placeholder="0"></label></div>` +
      `<button class="big" id="gSave">${tr('Create goal')}</button>`));
  if (g) goalNote();
}
document.addEventListener('change', e => { if (e.target.id === 'gSrc') goalNote(); });
$('#goals').addEventListener('click', e => {
  const b = e.target.closest('[data-g]'); if (!b) return;
  if (b.dataset.g === 'new') goalForm();
  else if (b.dataset.g === 'add') goalForm(b.dataset.id);
  else if (b.dataset.g === 'del') {
    const g = goals().find(x => x.id === b.dataset.id); if (!g) return;
    cfg.set('goalsTrash', JSON.stringify([...getJSON('goalsTrash', []), { ...g, deletedAt: new Date().toISOString() }]));
    saveGoals(goals().filter(x => x.id !== g.id)); renderGoals();
  }
});
document.addEventListener('click', e => {
  const sv = e.target.closest('#gSave'); if (!sv) return;
  const amt = Math.round(Number(($('#gAmt').value || '').replace(/[^\d]/g, '')));
  if (!amt) { toast(tr('Enter an amount first')); return; }
  const list = goals(), id = sv.dataset.id;
  if (id) {
    const g = list.find(x => x.id === id), jar = Number($('#gSrc').value);
    if (jar >= 0 && amt > goalJars[jar].remaining) { toast(tr('Not enough in this jar. Remaining: {0}', fmt(Math.max(0, goalJars[jar].remaining)))); return; }
    if (g) { g.saved += amt; (g.log = g.log || []).push({ ym: nowYm(), jar, amt, t: new Date().toISOString() }); }
  }
  else {
    const name = $('#gName').value.trim(); if (!name) { toast(tr('Enter a name first')); return; }
    const v = k => Number(($(k).value || '').replace(/\D/g, '')) || 0, n = new Date(), due = v('#gY') || v('#gM') || v('#gD') ? ymd(new Date(n.getFullYear() + v('#gY'), n.getMonth() + v('#gM'), n.getDate() + v('#gD'))) : '';
    list.push({ id: Date.now().toString(36), name, target: amt, saved: 0, due });
  }
  saveGoals(list); closeSheet(); renderGoals();
});

// ---------- xuất Excel (.xlsx thật, tự dựng: zip không nén + XML) theo tháng / hạng mục / loại ----------
const crcT = (() => { const t = []; for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
const crc32 = u => { let c = 0xFFFFFFFF; for (let i = 0; i < u.length; i++) c = crcT[(c ^ u[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
function zipStore(files) {   // files: [[tên, chuỗi]]
  const enc = new TextEncoder(), parts = [], cen = []; let off = 0;
  const u16 = n => [n & 255, n >> 8 & 255], u32 = n => [n & 255, n >> 8 & 255, n >> 16 & 255, n >>> 24 & 255];
  files.forEach(([name, text]) => {
    const nb = enc.encode(name), d = enc.encode(text), crc = crc32(d);
    const head = [0x50, 0x4B, 3, 4, 20, 0, 0, 8, 0, 0, 0, 0, 0, 0, ...u32(crc), ...u32(d.length), ...u32(d.length), ...u16(nb.length), 0, 0];
    parts.push(new Uint8Array(head), nb, d);
    cen.push(new Uint8Array([0x50, 0x4B, 1, 2, 20, 0, 20, 0, 0, 8, 0, 0, 0, 0, 0, 0, ...u32(crc), ...u32(d.length), ...u32(d.length), ...u16(nb.length), 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ...u32(off)]), nb);
    off += head.length + nb.length + d.length;
  });
  const cl = cen.reduce((a, x) => a + x.length, 0);
  return new Blob([...parts, ...cen, new Uint8Array([0x50, 0x4B, 5, 6, 0, 0, 0, 0, ...u16(files.length), ...u16(files.length), ...u32(cl), ...u32(off), 0, 0])], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}
const xe = v => String(v).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);
const colL = i => String.fromCharCode(65 + i);
function xlsxBlob(rows) {   // rows[0] = tiêu đề; số là ô số, còn lại là chuỗi
  const sd = rows.map((r, y) => `<row r="${y + 1}">` + r.map((v, x) => typeof v === 'number'
    ? `<c r="${colL(x)}${y + 1}"><v>${v}</v></c>` : `<c r="${colL(x)}${y + 1}" t="inlineStr"${y ? '' : ' s="1"'}><is><t>${xe(v)}</t></is></c>`).join('') + '</row>').join('');
  const X = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
  return zipStore([
    ['[Content_Types].xml', X + '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>'],
    ['_rels/.rels', X + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>'],
    ['xl/workbook.xml', X + '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Transactions" sheetId="1" r:id="rId1"/></sheets></workbook>'],
    ['xl/_rels/workbook.xml.rels', X + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>'],
    ['xl/styles.xml', X + '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>'],
    ['xl/worksheets/sheet1.xml', X + '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><cols><col min="1" max="2" width="12" customWidth="1"/><col min="3" max="4" width="16" customWidth="1"/><col min="5" max="5" width="14" customWidth="1"/><col min="6" max="9" width="26" customWidth="1"/></cols><sheetData>' + sd + '</sheetData></worksheet>'],
  ]);
}
let exp = { type: 'all', ym: '', cat: '', all: [] };
const expItems = () => exp.all.filter(r => (exp.type === 'all' || (exp.type === 'in') === isInc(r)) && (!exp.ym || ymOf(r.time) === exp.ym) && (!exp.cat || r.category === exp.cat)).sort((a, b) => a.time.localeCompare(b.time));
function paintExport() {
  const base = exp.all.filter(r => exp.type === 'all' || (exp.type === 'in') === isInc(r));
  const months = [...new Set(base.map(r => ymOf(r.time)))].sort().reverse(), catsL = [...new Set(base.map(r => r.category))].filter(Boolean).sort();
  if (exp.ym && !months.includes(exp.ym)) exp.ym = ''; if (exp.cat && !catsL.includes(exp.cat)) exp.cat = '';
  const n = expItems().length;
  $('#sheetBody').innerHTML = `<h3 class="ih">${tr('Export to Excel')}</h3>` +
    `<div class="seg" id="xType">${[['all', 'All'], ['out', 'Expense'], ['in', 'Income']].map(([v, t]) => `<button data-v="${v}" class="${exp.type === v ? 'on' : ''}">${tr(t)}</button>`).join('')}</div>` +
    `<select id="xMonth" class="jsel wide"><option value="">${tr('All months')}</option>${months.map(m => `<option value="${m}" ${m === exp.ym ? 'selected' : ''}>${monthLabel(m)}</option>`).join('')}</select>` +
    `<select id="xCat" class="jsel wide"><option value="">${tr('All categories')}</option>${catsL.map(k => `<option value="${esc(k)}" ${k === exp.cat ? 'selected' : ''}>${esc(k)}</option>`).join('')}</select>` +
    `<p class="hint">${n} ${tr(n === 1 ? 'transaction' : 'transactions')}</p><button class="big" id="xGo" ${n ? '' : 'disabled'}>${tr('Export')}</button>`;
}
$('#exportXlsx').onclick = async () => { exp = { type: 'all', ym: '', cat: '', all: await doneRecs() }; openPanel(''); paintExport(); };
document.addEventListener('click', async e => {
  const t = e.target.closest('#xType button');
  if (t) { exp.type = t.dataset.v; paintExport(); return; }
  if (!e.target.closest('#xGo')) return;
  const items = expItems(), rows = [['Date', 'Time', 'Type', 'Category', 'Amount (VND)', 'Note', 'Payee', 'Payment method', 'Location']];
  items.forEach(r => {
    const d = new Date(r.time);
    rows.push([ymd(d), d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }), isInc(r) ? 'Income' : 'Expense', r.category || '', Number(r.amount) || 0, r.note || '', r.payee || '', r.bank || '',
      r.loc ? `https://www.google.com/maps/search/?api=1&query=${r.loc.lat},${r.loc.lng}` : '']);
  });
  const name = `FinancialTracking_${exp.ym || 'all'}${exp.cat ? '_' + exp.cat.replace(/[^\w\p{L}]+/gu, '') : ''}.xlsx`, blob = xlsxBlob(rows);
  try {
    const f = new File([blob], name, { type: blob.type });
    if (navigator.canShare && navigator.canShare({ files: [f] })) { await navigator.share({ files: [f] }); return; }
  } catch (err) { if (err && err.name === 'AbortError') return; }
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
});
document.addEventListener('change', e => {
  if (e.target.id === 'xMonth') { exp.ym = e.target.value; paintExport(); }
  else if (e.target.id === 'xCat') { exp.cat = e.target.value; paintExport(); }
});

// ---------- thùng rác: giao dịch và mục tiêu đã xoá, khôi phục được; tự dọn sau 30 ngày ----------
const TRASH_DAYS = 30;
async function paintTrash() {
  const cut = Date.now() - TRASH_DAYS * 864e5;
  const recs = (await allRecs()).filter(r => r.status === 'trash');
  for (const r of recs.filter(r => new Date(r.deletedAt || 0).getTime() < cut)) { await delRec(r.id); await delPhoto(r.id); }
  const items = recs.filter(r => new Date(r.deletedAt || 0).getTime() >= cut).sort((a, b) => (b.deletedAt || '').localeCompare(a.deletedAt || ''));
  const gt = getJSON('goalsTrash', []).filter(g => new Date(g.deletedAt || 0).getTime() >= cut);
  cfg.set('goalsTrash', JSON.stringify(gt));
  const when = t => new Date(t).toLocaleDateString(DLOC(), { day: 'numeric', month: 'short' });
  const row = (kind, id, title, sub, val) => `<div class="irow trow"><div class="il">${esc(title)}<small>${esc(sub)}</small></div><b>${val}</b><button class="mini" data-tr="restore" data-k="${kind}" data-id="${id}">${tr('Restore')}</button><button class="cdel" data-tr="purge" data-k="${kind}" data-id="${id}" aria-label="${tr('Delete forever')}">✕</button></div>`;
  $('#sheetBody').innerHTML = `<h3 class="ih">${tr('Trash')}</h3>` +
    (items.length + gt.length ? items.map(r => row('rec', r.id, r.category, `${tr('Deleted')} ${when(r.deletedAt)} · ${new Date(r.time).toLocaleDateString(DLOC(), { day: 'numeric', month: 'short' })}${r.note ? ' · ' + r.note : ''}`, (isInc(r) ? '+' : '') + fmt(r.amount))).join('') +
      gt.map(g => row('goal', g.id, g.name, `${tr('Goal')} · ${tr('Deleted')} ${when(g.deletedAt)}`, fmt(g.saved))).join('') +
      `<button class="ghost danger" data-tr="empty">${tr('Empty Trash')}</button>` : `<p class="hint">${tr('Trash is empty')}</p>`);
}
$('#openTrash').onclick = () => { openPanel(''); paintTrash(); };
document.addEventListener('click', async e => {
  const b = e.target.closest('#sheet [data-tr]'); if (!b) return;
  const k = b.dataset.k, id = b.dataset.id, act = b.dataset.tr;
  if (act === 'empty') {
    if (!confirm(tr('Delete everything in the Trash forever?'))) return;
    for (const r of (await allRecs()).filter(r => r.status === 'trash')) { await delRec(r.id); await delPhoto(r.id); }
    cfg.set('goalsTrash', '[]');
  } else if (k === 'rec') {
    const r = (await allRecs()).find(x => x.id === id); if (!r) return;
    if (act === 'restore') { r.status = 'done'; delete r.deletedAt; r.synced = false; await putRec(r); markJars(ymOf(r.time)); sync(); }
    else { if (!confirm(tr('Delete forever? This cannot be undone.'))) return; await delRec(id); await delPhoto(id); }
  } else {
    const gt = getJSON('goalsTrash', []), g = gt.find(x => x.id === id); if (!g) return;
    if (act === 'restore') { delete g.deletedAt; saveGoals([...goals(), g]); renderGoals(); }
    else if (!confirm(tr('Delete forever? This cannot be undone.'))) return;
    cfg.set('goalsTrash', JSON.stringify(gt.filter(x => x.id !== id)));
  }
  paintTrash();
  if (curView === 'home') renderHome(); else if (curView === 'txn') renderTxn(); else if (curView === 'jars') renderJars();
});

// ---------- bấm vào một ô tổng hợp để xem chi tiết (theo tháng / hạng mục / giao dịch) ----------
function openPanel(html) {
  $('#sheetBody').innerHTML = html;
  const was = $('#sheet').hidden;
  $('#sheet').hidden = false;
  document.body.classList.add('noscroll');
  if (was) { try { history.pushState({ v: curView, d: depth, sheet: 1 }, ''); } catch {} }
  $('#sheet .sheet-card').scrollTop = 0;
}
const infoRow = (label, value, sub, cls, id) =>
  `<div class="irow ${id ? 'tap' : ''}" ${id ? `data-id="${esc(id)}"` : ''}><div class="il">${esc(label)}${sub ? `<small>${sub}</small>` : ''}</div><b class="${cls || ''}">${value}</b></div>`;
async function showInfo(kind, arg, ymArg) {
  const VM = ymArg || viewYm;
  const all = await doneRecs();
  all.forEach(r => recById[r.id] = r);
  const inM = (ym, f) => all.filter(r => ymOf(r.time) === ym && f(r));
  const incOf = ym => sum(inM(ym, isInc)), expOf = ym => sum(inM(ym, r => !isInc(r)));
  const months = [...new Set(all.map(r => ymOf(r.time)))].sort();
  const last6 = [-5, -4, -3, -2, -1, 0].map(n => addMonths(viewYm, n));
  const head = (t, v, cls) => `<div class="d-cat">${esc(t)}</div><div class="d-amt ${cls || ''}">${v}</div>`;
  let html = '';
  if (kind === 'income' || kind === 'spent') {
    const f = kind === 'income' ? incOf : expOf, tot = kind === 'income' ? sum(all.filter(isInc)) : sum(all.filter(r => !isInc(r)));
    html = head(tr(kind === 'income' ? 'Total money' : 'Spent so far'), fmt(tot), kind === 'income' ? 'in' : '') + `<h3 class="ih">${tr('By month')}</h3>` +
      ([...months].reverse().map(ym => infoRow(monthLabel(ym), fmt(f(ym)), '', kind === 'income' ? 'pos' : 'neg')).join('') || `<p class="hint">${tr('No data yet')}</p>`);
  } else if (kind === 'remain') {
    let cum = 0; const rows = months.map(ym => { const n = incOf(ym) - expOf(ym); cum += n; return infoRow(monthLabel(ym), (n >= 0 ? '+' : '') + fmt(n), `${tr('Balance')} ${fmt(cum)}`, n < 0 ? 'neg' : 'pos'); }).reverse();
    html = head(tr('Remaining'), fmt(cum)) + `<h3 class="ih">${tr('By month')}</h3>` + (rows.join('') || `<p class="hint">${tr('No data yet')}</p>`);
  } else if (kind === 'month') {
    const exp = inM(viewYm, r => !isInc(r)), tot = sum(exp), by = Object.entries(sumBy(exp, r => r.category)).sort((a, b) => b[1] - a[1]);
    html = head(tr('Spent in {0}', monthLabel(viewYm)), fmt(tot)) + `<h3 class="ih">${tr('By category')}</h3>` +
      (by.map(([k, v]) => `<div data-info="cat" data-arg="${esc(k)}">${infoRow(k, fmt(v), Math.round(v / tot * 100) + '%')}</div>`).join('') || `<p class="hint">${tr('No data yet')}</p>`);
  } else if (kind === 'cat') {
    const items = inM(VM, r => r.category === arg).sort((a, b) => b.time.localeCompare(a.time));
    html = head(arg, fmt(sum(items)), items.length && isInc(items[0]) ? 'in' : '') + `<h3 class="ih">${monthLabel(VM)}</h3>` +
      items.map(r => infoRow(new Date(r.time).toLocaleDateString(DLOC(), { day: 'numeric', month: 'short' }) + ' ' + new Date(r.time).toLocaleTimeString(DLOC(), { hour: '2-digit', minute: '2-digit' }), (isInc(r) ? '+' : '') + fmt(r.amount), esc(r.note || ''), isInc(r) ? 'pos' : '', r.id)).join('');
  } else if (kind === 'inc') {
    const items = inM(viewYm, isInc), by = Object.entries(sumBy(items, r => r.category)).sort((a, b) => b[1] - a[1]);
    html = head(tr('Income in {0}', monthLabel(viewYm)), fmt(sum(items)), 'in') + `<h3 class="ih">${tr('By category')}</h3>` +
      (by.map(([k, v]) => `<div data-info="cat" data-arg="${esc(k)}">${infoRow(k, fmt(v), '', 'pos')}</div>`).join('') || `<p class="hint">${tr('No data yet')}</p>`);
  } else if (kind === 'net' || kind === 'rate') {
    html = head(tr(kind === 'net' ? 'Net' : 'Savings rate'), '') + `<h3 class="ih">${tr('Last 6 months')}</h3>` +
      [...last6].reverse().map(ym => { const i = incOf(ym), e = expOf(ym), n = i - e;
        if (kind === 'rate') return i ? infoRow(monthLabel(ym), Math.round(n / i * 100) + '%', `${tr('Income')} ${fmt(i)} · ${tr('Spending')} ${fmt(e)}`, n < 0 ? 'neg' : 'pos') : '';
        return infoRow(monthLabel(ym), (n >= 0 ? '+' : '') + fmt(n), `${tr('Income')} ${fmt(i)} · ${tr('Spending')} ${fmt(e)}`, n < 0 ? 'neg' : 'pos'); }).join('');
  } else if (kind === 'avg' || kind === 'est') {
    const exp = inM(viewYm, r => !isInc(r)), tot = sum(exp), [yy, mm] = viewYm.split('-').map(Number), dim = new Date(yy, mm, 0).getDate();
    const el = viewYm === nowYm() ? new Date().getDate() : dim, avg = tot / Math.max(1, el);
    if (kind === 'est') {
      const inc = incOf(viewYm), left = inc - avg * dim;
      html = inc ? head(tr('Projected remaining'), fmt(left), left < 0 ? 'neg' : 'in') + infoRow(tr('Total income'), fmt(inc), '', 'pos') + infoRow(tr('Spent so far'), fmt(tot), '', 'neg') + infoRow(tr('Days elapsed'), el + '/' + dim) + infoRow(tr('Average per day'), fmt(avg)) + infoRow(tr('Month-end estimate'), fmt(avg * dim), '', 'neg')
        : head(tr('Month-end estimate'), fmt(avg * dim)) + infoRow(tr('Spent so far'), fmt(tot)) + infoRow(tr('Days elapsed'), el + '/' + dim) + infoRow(tr('Average per day'), fmt(avg));
    }
    else {
      const byDay = {}; exp.forEach(r => { const k = new Date(r.time).getDate(); byDay[k] = (byDay[k] || 0) + Number(r.amount); });
      html = head(tr('Average per day'), fmt(avg)) + `<h3 class="ih">${tr('Daily spending')}</h3>` +
        Object.keys(byDay).map(Number).sort((a, b) => b - a).map(d => infoRow(new Date(yy, mm - 1, d).toLocaleDateString(DLOC(), { weekday: 'short', day: 'numeric', month: 'short' }), fmt(byDay[d]))).join('');
    }
  } else if (kind === 'day') {
    const items = all.filter(r => !isInc(r) && ymd(new Date(r.time)) === arg).sort((a, b) => a.time.localeCompare(b.time));
    html = head(new Date(arg + 'T00:00').toLocaleDateString(DLOC(), { weekday: 'long', day: 'numeric', month: 'long' }), fmt(sum(items))) +
      `<h3 class="ih">${items.length} ${tr(items.length > 1 ? 'transactions' : 'transaction')}</h3>` +
      items.map(r => infoRow(r.category, fmt(r.amount), esc(new Date(r.time).toLocaleTimeString(DLOC(), { hour: '2-digit', minute: '2-digit' }) + (r.bank ? ' · ' + r.bank.replace(/^.*\((.+)\)$/, '$1') : '') + (r.note ? ' · ' + r.note : '')), 'neg', r.id)).join('');
  } else if (kind === 'places') {   // danh sách các giao dịch có vị trí (cùng bộ lọc với bản đồ)
    const items = all.filter(r => r.loc && ymOf(r.time) === viewYm && (!txnCat || r.category === txnCat) && (!txnDay || ymd(new Date(r.time)) === txnDay)).sort((a, b) => b.time.localeCompare(a.time));
    html = head(tr('Payment places'), items.length) +
      (items.map(r => infoRow(r.category, (isInc(r) ? '+' : '') + fmt(r.amount),
        esc(new Date(r.time).toLocaleDateString(DLOC(), { day: 'numeric', month: 'short' }) + ' ' + new Date(r.time).toLocaleTimeString(DLOC(), { hour: '2-digit', minute: '2-digit' }) + (r.bank ? ' · ' + r.bank.replace(/^.*\((.+)\)$/, '$1') : '') + (r.note ? ' · ' + r.note : '')), isInc(r) ? 'pos' : 'neg', r.id)).join('') || `<p class="hint">${tr('No data yet')}</p>`);
  } else if (kind === 'place') {
    const items = all.filter(r => r.loc && locKeyOf(r) === arg && ymOf(r.time) === viewYm && (!txnCat || r.category === txnCat) && (!txnDay || ymd(new Date(r.time)) === txnDay)).sort((a, b) => b.time.localeCompare(a.time));
    const [la, ln] = arg.split(',');
    html = head(tr('Payment places'), fmt(sum(items))) +
      `<a class="ghost linkbtn" href="https://www.google.com/maps/search/?api=1&query=${la},${ln}" target="_blank" rel="noopener">📍 ${tr('Open in Google Maps')}</a>` +
      items.map(r => infoRow(r.category, (isInc(r) ? '+' : '') + fmt(r.amount),
        esc(new Date(r.time).toLocaleDateString(DLOC(), { day: 'numeric', month: 'short' }) + ' ' + new Date(r.time).toLocaleTimeString(DLOC(), { hour: '2-digit', minute: '2-digit' }) + (r.note ? ' · ' + r.note : '')), isInc(r) ? 'pos' : 'neg', r.id)).join('');
  } else if (kind === 'bank' || kind === 'wallet') {
    const key = r => kind === 'bank' ? (r.bank || tr('Cash / no bank')) : (r.wallet || tr('No wallet'));
    const items = inM(viewYm, r => !isInc(r) && key(r) === arg).sort((a, b) => b.time.localeCompare(a.time));
    html = head(kind === 'bank' ? arg.replace(/^.*\((.+)\)$/, '$1') : arg, fmt(sum(items))) + `<h3 class="ih">${monthLabel(viewYm)} · ${items.length} ${tr(items.length > 1 ? 'transactions' : 'transaction')}</h3>` +
      items.map(r => infoRow(r.category, fmt(r.amount), esc(new Date(r.time).toLocaleDateString(DLOC(), { day: 'numeric', month: 'short' }) + (r.note ? ' · ' + r.note : '')), 'neg', r.id)).join('');
  } else if (kind === 'mon') {
    const ym = arg, i = incOf(ym), e = expOf(ym), n = i - e;
    const grp = (f, cls) => Object.entries(sumBy(inM(ym, f), r => r.category)).sort((a, b) => b[1] - a[1]).map(([k, v]) =>
      `<div data-info="cat" data-arg="${esc(k)}" data-ym="${ym}">${infoRow(k, fmt(v), '', cls)}</div>`).join('');
    html = head(monthLabel(ym), (n >= 0 ? '+' : '') + fmt(n), n < 0 ? 'neg' : 'in') + infoRow(tr('Income'), fmt(i), '', 'pos') + infoRow(tr('Spending'), fmt(e), '', 'neg') +
      (e ? `<h3 class="ih">${tr('Spending')}</h3>` + grp(r => !isInc(r), 'neg') : '') + (i ? `<h3 class="ih">${tr('Income')}</h3>` + grp(isInc, 'pos') : '') + (!i && !e ? `<p class="hint">${tr('No data yet')}</p>` : '');
  } else return;
  openPanel(html);
}
document.addEventListener('click', e => {
  const row = e.target.closest('#sheet .irow[data-id]');
  if (row && recById[row.dataset.id]) { openSheet(recById[row.dataset.id]); return; }
  const t = e.target.closest('[data-info]');
  if (!t || e.target.closest('.mnav')) return;
  if (t.dataset.info === 'big') { if (recById[t.dataset.id]) openSheet(recById[t.dataset.id]); return; }
  showInfo(t.dataset.info, t.dataset.arg, t.dataset.ym);
});

// ---------- Dashboard (nằm cuối tab Tổng quan): thu nhập, chênh lệch và phân tích ----------
const PAL = ['#2563eb', '#14b8a6', '#f59e0b', '#ef4444', '#0ea5e9', '#06b6d4', '#84cc16', '#ec4899'];
const short = n => n >= 1e6 ? (n / 1e6).toFixed(n >= 1e7 ? 0 : 1).replace(/\.0$/, '') + 'M' : n >= 1e3 ? Math.round(n / 1e3) + 'k' : String(Math.round(n));
function sumBy(arr, f) { const o = {}; arr.forEach(r => { const k = f(r); o[k] = (o[k] || 0) + Number(r.amount); }); return o; }

// Biểu đồ chi theo ngày: chạm hoặc kéo ngón tay qua các cột để xem từng ngày
let dailyInfo = [], dailySel = 0;
function paintDaily() {
  const rd = $('#dread'); if (!rd || !dailyInfo[dailySel]) return;
  const d = dailyInfo[dailySel];
  rd.innerHTML = `<b>${esc(d.label)}</b><span>${d.v ? fmt(d.v) : tr('No spending')}</span>` + (d.n ? `<small>${d.n} ${tr(d.n > 1 ? 'transactions' : 'transaction')} · ${esc(d.cat)}</small>` : '');
  document.querySelectorAll('#dwrap .dc').forEach((el, i) => el.classList.toggle('sel', i === dailySel));
}
function pickDaily(e) {
  const w = $('#dwrap'); if (!w) return;
  const r = w.getBoundingClientRect(), n = dailyInfo.length;
  const i = Math.max(0, Math.min(n - 1, Math.floor((e.clientX - r.left) / r.width * n)));
  if (i !== dailySel) { dailySel = i; paintDaily(); }
}
{
  let down = false;
  $('#dash').addEventListener('pointerdown', e => { if (e.target.closest('#dwrap')) { down = true; pickDaily(e); } });
  $('#dash').addEventListener('pointermove', e => { if (down) pickDaily(e); });
  addEventListener('pointerup', () => { down = false; });
  addEventListener('pointercancel', () => { down = false; });
}

// Trục Y: chọn bước tròn (1/2/5 × 10^k) để các mốc dễ đọc, tối đa khoảng 4 mức
function niceAxis(max) {
  const raw = Math.max(1, max) / 4, mag = Math.pow(10, Math.floor(Math.log10(raw))), n = raw / mag;
  const step = (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * mag, cnt = Math.max(1, Math.ceil(Math.max(1, max) / step));
  return { step, cnt, top: step * cnt };
}
const axisLines = ax => Array.from({ length: ax.cnt + 1 }, (_, i) =>
  `<div class="gl" style="bottom:${(i / ax.cnt * 100).toFixed(2)}%"><em>${i ? short(ax.step * i) : '0'}</em></div>`).join('');
function renderDash(all) {
  const recs = all.filter(r => !isInc(r));   // biểu đồ chi tiêu chỉ tính khoản chi
  const incIn = ym => sum(all.filter(r => isInc(r) && ymOf(r.time) === ym));
  const inM = ym => recs.filter(r => ymOf(r.time) === ym);
  const m = inM(viewYm), total = sum(m), incNow = incIn(viewYm), net = incNow - total;
  const [y, mo] = viewYm.split('-').map(Number);
  const dim = new Date(y, mo, 0).getDate();
  const isCur = viewYm === nowYm();
  const elapsed = isCur ? new Date().getDate() : dim;
  const prevYm = addMonths(viewYm, -1), pTotal = sum(inM(prevYm));

  // Thu nhập và chênh lệch nằm ở đây (không còn trong thẻ tóm tắt)
  let h = `<h2>${tr('Monthly summary')}</h2><div class="kpis">` +
    `<div class="kpi" data-info="inc"><div class="l">${tr('Total income')}</div><div class="v sm pos" data-key="d-inc" data-count="${incNow}">${fmt(incNow)}</div></div>` +
    `<div class="kpi" data-info="month"><div class="l">${tr('Total spending')}</div><div class="v sm neg" data-key="d-exp" data-count="${total}">${fmt(total)}</div></div></div>`;
  if (!m.length) { $('#dash').innerHTML = h; runCounts($('#dash')); return; }

  const avgDay = total / Math.max(1, elapsed);
  const pct = pTotal ? (total - pTotal) / pTotal * 100 : null;

  h += `<div class="kpis">
    <div class="kpi" data-info="avg"><div class="l">${tr('Average per day')}</div><div class="v sm">${fmt(avgDay)}</div></div>
    ${incNow ? `<div class="kpi" data-info="rate"><div class="l">${tr('Savings rate')}</div><div class="v sm">${Math.round(net / incNow * 100)}%</div></div>` : ''}
    ${isCur && elapsed < dim ? (incNow
      ? `<div class="kpi" data-info="est"><div class="l">${tr('Projected remaining')}</div><div class="v sm ${incNow - avgDay * dim < 0 ? 'neg' : 'pos'}">${fmt(incNow - avgDay * dim)}</div></div>`
      : `<div class="kpi" data-info="est"><div class="l">${tr('Month-end estimate')}</div><div class="v sm">${fmt(avgDay * dim)}</div></div>`) : ''}
  </div>`;

  const months = [-5, -4, -3, -2, -1, 0].map(n => addMonths(viewYm, n));
  const inc6 = months.map(incIn), exp6 = months.map(ym => sum(inM(ym)));
  // Biểu đồ cột theo tháng: trục Y theo mốc số tiền tròn; thu nhập xanh lá, chi tiêu đỏ
  const hasInc = inc6.some(v => v > 0), ax6 = niceAxis(Math.max(1, ...exp6, ...(hasInc ? inc6 : [])));
  const px6 = v => v ? Math.max(4, Math.round(v / ax6.top * 150)) : 0;
  h += `<h2>${tr(hasInc ? 'Income vs spending' : 'Last 6 months')}</h2><div class="card"><div class="ychart"><div class="ygrid">${axisLines(ax6)}</div><div class="ycols">` +
    months.map((ym, i) => `<div class="ycol ${ym === viewYm ? 'cur' : ''}" data-info="mon" data-arg="${ym}"><div class="ypair">` +
      (hasInc ? `<div class="yb inc" style="height:${px6(inc6[i])}px"></div>` : '') + `<div class="yb exp" style="height:${px6(exp6[i])}px"></div></div><span class="ycl">${monthShort(ym)}</span></div>`).join('') +
    `</div></div><div class="iolg">${hasInc ? `<span><i class="dot inc"></i>${tr('Income')}</span>` : ''}<span><i class="dot exp"></i>${tr('Spending')}</span></div></div>`;

  const days = Array(dim).fill(0); m.forEach(r => days[new Date(r.time).getDate() - 1] += Number(r.amount));
  const dmax = Math.max(1, ...days);
  const peakDay = days.indexOf(dmax) + 1, active = days.filter(Boolean).length;
  const dYmd = d => `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  const axD = niceAxis(dmax), pxD = v => v ? Math.max(3, Math.round(v / axD.top * 150)) : 0;
  h += `<h2>${tr('Daily spending')}</h2><div class="card"><div class="ychart"><div class="ygrid">${axisLines(axD)}</div><div class="ycols dcols">` +
    days.map((v, i) => `<div class="ycol ${v ? '' : 'z'}"${v ? ` data-info="day" data-arg="${dYmd(i + 1)}"` : ''}><div class="ypair"><div class="yb exp" style="height:${pxD(v)}px"></div></div>` +
      (i === 0 || (i + 1) % 5 === 0 ? `<span class="ycl">${i + 1}</span>` : '') + `</div>`).join('') +
    `</div></div><div class="dstats"><div><span>${tr('Peak day')}</span><b>${peakDay}/${mo}</b></div><div><span>${tr('Highest')}</span><b>${short(dmax)}</b></div><div><span>${tr('Active days')}</span><b>${active}/${elapsed}</b></div></div></div>`;

  $('#dash').innerHTML = h;
  runCounts($('#dash'));
}

// ---------- 6 hũ: tự cập nhật theo thu nhập (cả tháng) và chi tiêu; % mỗi tháng lưu riêng ----------
function computeJars(ym, recs, pct) {
  const m = recs.filter(r => ymOf(r.time) === ym);
  const incs = m.filter(isInc), income = sum(incs), map = jarMap();
  const spent = Array(6).fill(0); let unassigned = 0;
  m.filter(r => !isInc(r)).forEach(r => {
    const j = map[catName(r.category)];
    if (Number.isInteger(j) && j >= 0 && j < 6) spent[j] += Number(r.amount); else unassigned += Number(r.amount);
  });
  goals().forEach(g => (g.log || []).forEach(l => { if (l.ym === ym && l.jar >= 0 && l.jar < 6) spent[l.jar] += l.amt; }));   // tiền nạp vào mục tiêu trừ vào hũ nguồn
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
    `</div><h2>${tr('Jars')}</h2>`;
  JAR_KEYS.forEach((k, i) => {
    h += `<div class="card jar" data-i="${i}"><div class="jtop"><span class="jic">${JAR_ICONS[i]}</span><div class="jn">${esc(jarName(i))}<small data-alloc></small></div>` +
      `<div class="pct">${can('editJars') ? `<button class="stp" data-step="-5" data-i="${i}" aria-label="-5%">−</button>` : ''}<b data-pctv="${i}">${draftPct[i]}%</b>${can('editJars') ? `<button class="stp" data-step="5" data-i="${i}" aria-label="+5%">+</button>` : ''}</div></div>` +
      `<div class="jbar"><i data-bar></i></div><div class="jsub"><span data-spent></span><b data-left></b></div></div>`;
  });
  h += `<div id="jarNote"></div>`;
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
  const saved = pctSaved()[viewYm], isSame = !!saved && sameArr(saved, draftPct);
  const btn = $('#saveMonth');
  btn.className = 'fab-save ' + (!ok ? 'bad' : isSame ? 'done' : '');   // nút tròn dấu tích: đỏ = tổng chưa đủ 100%, xanh lá = đã lưu
  btn.title = !ok ? tr('Percentages must add up to 100') : isSame ? tr('Saved for {0}', monthLabel(viewYm)) : tr('Save {0}', monthLabel(viewYm));
  btn.disabled = !ok || isSame; btn.hidden = !(can('editJars') && curView === 'jars');
  $('#jarNote').innerHTML = c.unassigned > 0 ? `<div class="card jsub">${tr('Not in any jar: <b>{0}</b>', fmt(c.unassigned))}</div>` : '';
}
$('#jarsBody').addEventListener('click', e => {
  const st = e.target.closest('[data-step]');
  if (st) {
    const i = Number(st.dataset.i);
    draftPct[i] = Math.max(0, Math.min(100, (Number(draftPct[i]) || 0) + Number(st.dataset.step)));
    $(`[data-pctv="${i}"]`).textContent = draftPct[i] + '%'; paintJars(); return;
  }
  if (monthClick(e)) renderJars();
});
$('#saveMonth').onclick = () => {
  if (!can('editJars') || $('#saveMonth').disabled) return;
  const s = pctSaved(); s[viewYm] = draftPct.slice(); cfg.set('jarpct', JSON.stringify(s));
  markJars(viewYm); sync(); paintJars();
};

// ---------- tab Danh mục: xem, thêm, xoá, gán hũ ----------
async function renderCategories() {
  const recs = (await doneRecs()).filter(r => ymOf(r.time) === viewYm && !isInc(r));
  const spentBy = {}; recs.forEach(r => { const k = catName(r.category); spentBy[k] = (spentBy[k] || 0) + Number(r.amount); });
  const map = jarMap();
  const jarOptions = sel => `<option value="-1">${tr('No jar')}</option>` + JAR_KEYS.map((k, i) => `<option value="${i}" ${sel === i ? 'selected' : ''}>${esc(jarName(i))}</option>`).join('');
  let h = monthNav('light');
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
    row('Category', r.category) + row('Type', isInc(r) ? tr('Income') : tr('Expense')) + row('Date', new Date(r.time).toLocaleDateString(DLOC())) + row('Time', new Date(r.time).toLocaleTimeString(DLOC(), { hour: '2-digit', minute: '2-digit' })) + row('Bank', r.bank) + row('Payee', r.payee) +
    row('Note', r.note) +
    (r.loc ? `<div class="drow"><span>${tr('Location')}</span><b><a href="https://www.google.com/maps/search/?api=1&query=${r.loc.lat},${r.loc.lng}" target="_blank" rel="noopener">${tr('Open in Google Maps')}</a></b></div>` : '') +
    '<div id="sheetPhoto"></div>' +
    (r.status === 'done' ? `<button id="editTx" class="ghost">${tr('Edit')}</button><button id="delTx" class="ghost danger">${tr('Move to Trash')}</button>` : '');
  const et = $('#editTx'); if (et) et.onclick = () => editTx(r);
  const dt = $('#delTx'); if (dt) dt.onclick = async () => {   // vào thùng rác (khôi phục được), chưa xoá hẳn
    Object.assign(r, { status: 'trash', deletedAt: new Date().toISOString() });
    await putRec(r); markJars(ymOf(r.time)); closeSheet();
    if (curView === 'home') renderHome(); else if (curView === 'txn') renderTxn();
    sync();
  };
  const wasHidden = $('#sheet').hidden;
  $('#sheet').hidden = false;
  document.body.classList.add('noscroll');
  if (wasHidden) { try { history.pushState({ v: curView, d: depth, sheet: 1 }, ''); } catch {} }   // vuốt quay lại sẽ đóng cửa sổ này
  if (r.photo) {
    const b = await getPhoto(r.id);
    if (b) {
      const i = new Image(); i.src = URL.createObjectURL(b); i.className = 'd-photo';
      i.onclick = () => savePhoto(b, r.photo);
      $('#sheetPhoto').append(i);
    }
  }
}
// Sửa lại giao dịch đã nhập sai: hạng mục, số tiền, ghi chú (ngày giờ không đổi được)
function editTx(r) {
  const list = (isInc(r) ? icats() : cats()).slice(); if (r.category && !list.includes(r.category)) list.unshift(r.category);
  let pick = r.category;
  $('#sheetBody').innerHTML = `<div class="d-cat">${tr('Edit')}</div>` +
    `<div class="chips">${list.map((c, i) => `<button class="chip ${c === pick ? 'on' : ''}" data-i="${i}">${esc(c)}</button>`).join('')}</div>` +
    `<label>${tr('Amount (₫)')}<input id="eAmt" inputmode="numeric" value="${commas(r.amount)}"></label>` +
    `<label>${tr('Note')}<input id="eNote" value="${esc(r.note || '')}"></label>` +
    `<button id="eSave" class="big">${tr('Save changes')}</button>`;
  document.querySelectorAll('#sheetBody .chip').forEach(b => b.onclick = () => {
    pick = list[Number(b.dataset.i)];
    document.querySelectorAll('#sheetBody .chip').forEach(x => x.classList.toggle('on', x === b));
  });
  $('#eSave').onclick = async () => {
    const amt = $('#eAmt').value.replace(/\D/g, '');
    if (!amt || !Number(amt)) { toast(tr('Enter an amount')); return; }
    Object.assign(r, { category: pick, amount: amt, note: $('#eNote').value.trim(), synced: false });   // ngày giờ giữ nguyên
    await putRec(r);
    closeSheet();
    if (curView === 'home') renderHome(); else if (curView === 'txn') renderTxn();
    sync();
  };
}
function hideSheet() { $('#sheet').hidden = true; document.body.classList.remove('noscroll'); }
const closeSheet = () => { if (!$('#sheet').hidden) history.back(); };
// Chạm vào tháng/năm trên thanh chuyển tháng → bảng lịch chọn tháng khác
let pickYear = 0;
function monthPicker() {
  const now = nowYm(), cy = Number(now.slice(0, 4)), cm = Number(now.slice(5));
  const vy = Number(viewYm.slice(0, 4)), vm = Number(viewYm.slice(5));
  const mn = m => new Date(2024, m - 1, 1).toLocaleString(LOC(), { month: 'short' });
  $('#sheetBody').innerHTML = `<div class="mpk"><div class="mpy"><button data-yr="-1" aria-label="-1">‹</button><b>${pickYear}</b><button data-yr="1" ${pickYear >= cy ? 'disabled' : ''} aria-label="+1">›</button></div><div class="mpg">` +
    Array.from({ length: 12 }, (_, i) => i + 1).map(m => {
      const fut = pickYear > cy || (pickYear === cy && m > cm);
      return `<button data-pm="${m}" class="${pickYear === vy && m === vm ? 'on' : ''}" ${fut ? 'disabled' : ''}>${mn(m)}</button>`;
    }).join('') + `</div></div>`;
}
document.addEventListener('click', e => {
  const sp = e.target.closest('.mmid span');
  if (sp && $('#sheet').hidden) { pickYear = Number(viewYm.slice(0, 4)); openPanel(''); monthPicker(); return; }
  const yb = e.target.closest('#sheet [data-yr]');
  if (yb && !yb.disabled) { pickYear += Number(yb.dataset.yr); monthPicker(); return; }
  const pb = e.target.closest('#sheet [data-pm]');
  if (pb && !pb.disabled) {
    viewYm = pickYear + '-' + String(pb.dataset.pm).padStart(2, '0');
    if (curView === 'home') renderHome(); else if (curView === 'txn') { txnDay = ''; renderTxn(); } else if (curView === 'jars') renderJars(); else if (curView === 'cats') renderCategories();
    closeSheet();
  }
});
$('#sheetClose').onclick = closeSheet;
$('#sheet').onclick = e => { if (e.target.id === 'sheet') closeSheet(); };

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
  $('#locSw').checked = cfg.get('locOn', '1') !== '0';
  document.querySelectorAll('#segLang button').forEach(b => b.classList.toggle('on', b.dataset.v === lang));
  document.querySelectorAll('#segTheme button').forEach(b => b.classList.toggle('on', b.dataset.v === cfg.get('theme', 'auto')));
}
document.querySelectorAll('#segLang button').forEach(b => b.onclick = () => {
  lang = b.dataset.v; cfg.set('lang', lang); translateDom(); show(curView, false);
});
document.querySelectorAll('#segTheme button').forEach(b => b.onclick = () => {
  cfg.set('theme', b.dataset.v); applyTheme(); renderSettings();
});
$('#locSw').onchange = e => cfg.set('locOn', e.target.checked ? '1' : '0');
$('#saveAdv').onclick = () => {
  cfg.set('sheetFile', $('#sheetFile').value.trim() || SHEET_FILE);
  cfg.set('sheetUrl', $('#sheetUrl').value.trim());
  markAllJars().then(sync); goTop('home');
};
$('#clearData').onclick = async () => {   // đưa app về mặc định: xoá giao dịch, ảnh và mọi cài đặt; chỉ giữ link Google Sheet
  if (!confirm(tr('Reset the app? All transactions, photos and settings on this phone are deleted. Your Google Sheet is not touched.'))) return;
  await Promise.all([tx('records', 'readwrite', st => st.clear()), tx('photos', 'readwrite', st => st.clear())]);
  try { const keep = ['sheetUrl', 'sheetFile'].map(k => [k, localStorage.getItem(k)]); localStorage.clear(); keep.forEach(([k, v]) => v != null && localStorage.setItem(k, v)); } catch {}
  location.reload();
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

// ---------- người dùng: app chạy mặc định với vai trò member (không đăng nhập); admin/member quản lý ở phần mềm khác ----------
let TABKEYS = ['home', 'txn', 'jars', 'cats'];
const legacyAdmin = () => (getJSON('users', []).find(u => u.role === 'admin') || {}).id;   // dữ liệu cũ gắn với tài khoản admin trước đây
const me = { id: legacyAdmin() || 'local', name: 'Member', role: 'member' };
const isAdmin = () => false;
const can = () => true;
const mine = () => true;
const adminId = () => me.id;
function applyPermissions() {
  document.querySelectorAll('#tabs button').forEach(b => b.hidden = false);
  $('#tabs').style.setProperty('--n', TABKEYS.length);
}
function initAccount() { applyPermissions(); show('home', false); sync(); }

// ---------- khởi động ----------
if (hasPin()) openLock('verify');
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).catch(() => {});
  let reloaded = false;   // bản mới của service worker lên thì tự tải lại một lần
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (!reloaded) { reloaded = true; location.reload(); } });
}
translateDom();
initAccount();
