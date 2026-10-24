# Chi tiêu (PWA cho iPhone)

Quét QR → chọn danh mục → nhập số tiền / chụp ảnh → chọn ngân hàng (mở app ngân hàng) → quay lại 

- Số tiền: Google Sheet qua Apps Script (`apps-script/Code.gs`). Chỉ ghi sau khi bạn xác nhận giao dịch thành công.
- Ảnh hoá đơn: lưu trong bộ nhớ app trên máy (IndexedDB), không lên cloud. Chạm vào ảnh trong Thư viện để lưu vào Photos qua Share Sheet.
- App không can thiệp vào xác thực khuôn mặt của ngân hàng.

## Cài đặt
1. Tạo Google Sheet, mở Tiện ích mở rộng > Apps Script, dán `apps-script/Code.gs`, Triển khai > Ứng dụng web (Tôi / Bất kỳ ai), copy link `/exec`.
2. Trên iPhone mở link GitHub Pages bằng Safari > Chia sẻ > Thêm vào Màn hình chính.
3. Mở app > ⚙ > dán link `/exec` > Gửi thử.

## Lưu ý
- Luồng: quét QR (hoặc nhập tay) > danh mục > nhập số tiền > chọn ngân hàng. Chọn ngân hàng là lưu luôn và đẩy lên Sheet (không có bước xác nhận). App ngân hàng mở ra, bạn tự nhập số tiền và xác thực ở đó.
- Link `/exec` chỉ lưu trên máy bạn, không nằm trong repo.

## Chia sẻ cho người khác dùng
Repo không chứa dữ liệu hay khoá bí mật nào của bạn. Mỗi người dùng bản của mình theo 3 bước:
1. **Fork** repo này, bật GitHub Pages (Settings > Pages > nhánh `main`, thư mục gốc).
2. Tạo Google Sheet + Apps Script riêng (mục "Cài đặt" ở trên) và dán link `/exec` của họ vào ⚙ > Advanced. Dữ liệu từng người nằm trong Sheet và máy của chính họ.
3. Mở link Pages bằng Safari > Chia sẻ > Thêm vào Màn hình chính. Lần đầu mở sẽ tạo tài khoản admin riêng.

Các file cốt lõi: `index.html`, `app.js`, `style.css`, `sw.js`, `scan-worker.js`, `manifest.webmanifest`, icon, `vendor/jsQR.js`.

## Dựng bản chạy
Mã nguồn dễ đọc nằm ở `src/`. Sau khi sửa, chạy `node build.mjs` để sinh `app.js` và `style.css` (đã nén) ở thư mục gốc rồi đẩy lên GitHub. Mỗi bản phát hành nhớ đổi `VERSION` trong `src/app.js` và tên cache trong `sw.js`.
