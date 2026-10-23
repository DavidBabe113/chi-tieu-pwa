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
