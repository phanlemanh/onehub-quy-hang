# Hình tại điểm quyết định — trang-khach-rieng

| Điểm | Đếm | Hình |
|---|---|---|
| Đọc công khai theo mã (Hỏi-6, AC-1, AC-9): mã → hàm tìm theo mã → đọc căn trong phiên người gửi → banRaNgoai → trang | 5 bước nối tiếp | `doc-cong-khai.html` / `.png` |
| Lượt mở và Quan tâm (AC-4, AC-5): trang chạy → báo mở; chạm → ghi; Zalo xem trước rẽ nhánh không ghi | 2 nhánh rẽ | `doc-cong-khai.html` (cùng hình, làn dưới) |
| Hỏi-1 lối giao diện | dưới ngưỡng: 1 lựa chọn ba lối — trang ba lối là hình | `../ba-loi/index.html` |
| Hỏi-2, Hỏi-3, Hỏi-4, Hỏi-5 | dưới ngưỡng: 1 bước mỗi câu | — |

## Đề bài hình `doc-cong-khai`

Loại: sơ đồ luồng hai làn. Làn trên «Đọc»: Khách mở /s/<mã> → Trang (máy chủ web) → API route công khai → hàm tìm theo mã
(trả sàn, người gửi, người nhận, cờ bật; tắt/không có/người gửi rời sàn → «Link không còn mở được») → đọc căn trong phiên
người gửi (luật theo dòng) → banRaNgoai của lõi → trang chỉ nhận bản ra. Làn dưới «Sự kiện»: Trang chạy ở trình duyệt →
báo «link_opened» (một máy một ngày) · Chạm «Quan tâm» → «interest» (một máy một căn); nhánh Zalo lấy ảnh xem trước → chỉ
tải trang ở máy chủ, không ghi. Nhãn tiếng Việt; AC-1, AC-4, AC-5, AC-6, AC-9.
