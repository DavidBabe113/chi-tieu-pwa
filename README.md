# Financial Tracking (PWA)

Ứng dụng chi tiêu cá nhân cho iPhone (chạy được cả trên laptop): quét QR chuyển khoản, ghi chi tiêu / thu nhập, 6 hũ, mục tiêu tiết kiệm, bản đồ nơi thanh toán, xuất Excel. Không cần cài từ App Store: mở bằng Safari rồi **Chia sẻ > Thêm vào Màn hình chính**.

- App: https://davidbabe113.github.io/chi-tieu-pwa/
- Dữ liệu giao dịch lưu trong máy (IndexedDB); số tiền, hạng mục, ngân hàng được đồng bộ lên **Google Sheet riêng** qua Apps Script. Ảnh hoá đơn chỉ ở trong máy.
- App không gắn với ngân hàng nào: chọn ngân hàng / ví chỉ để mở app tương ứng, bạn tự xác thực ở đó.

## Cài đặt
1. Tạo Google Sheet, mở Tiện ích mở rộng > Apps Script, dán mã web app, triển khai (Tôi / Bất kỳ ai), lấy link `/exec`.
2. Mở app > ⚙ > Advanced > dán link `/exec` và link file Sheet. Link `/exec` chỉ lưu trên thiết bị, không nằm trong repo.
3. Dùng chung dữ liệu giữa điện thoại và laptop: dán cùng link `/exec` trên cả hai.

## Cấu trúc
| Đường dẫn | Vai trò |
|---|---|
| `src/app.js`, `src/style.css` | Mã nguồn dễ đọc (sửa ở đây) |
| `app.js`, `style.css` | Bản nén sinh ra từ `src/` (GitHub Pages chạy bản này) |
| `index.html`, `manifest.webmanifest`, `sw.js` | Giao diện, khai báo PWA, service worker (cache trước, chạy offline) |
| `scan-worker.js` | Giải mã QR trong Web Worker |
| `vendor/` | jsQR, Leaflet (chỉ nạp khi cần quét ảnh / mở bản đồ) |
| `build.mjs` | Dựng bản nén: `node build.mjs` |
| `serve.mjs`, `start-pc.bat` | Chạy trên máy tính: bấm đúp `start-pc.bat` (cần Node.js) rồi mở http://localhost:8080 |

## Phát hành
1. Sửa trong `src/`.
2. Đổi `VERSION` trong `src/app.js` và tên cache trong `sw.js`.
3. `node build.mjs`, rồi commit và push. Pages cập nhật sau khoảng 1 phút; app tự tải bản mới.

## Ghi chú
- Màu: nền trắng / đen (chế độ tối), màu chủ đạo xanh lá, nút vàng. Ngôn ngữ English / Tiếng Việt chọn trong Cài đặt.
- Hũ cảnh báo theo mức đã dùng: xanh < 30%, vàng 30–70%, đỏ > 70%.
- Việc quản trị nhiều người dùng (admin / member) dự kiến làm ở phần mềm riêng, app này mặc định chạy như một thành viên.
