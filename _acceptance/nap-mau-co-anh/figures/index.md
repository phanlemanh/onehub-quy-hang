# Điểm quyết định — nap-mau-co-anh (Cổng Phạm vi)

| Điểm | Đếm | Hình |
|---|---|---|
| Hỏi-1 — ảnh mẫu ghi vào kho nào trên bản thật | hai nhánh rẽ (Storage như API · luôn Postgres) → cần hình | `hoi-1-kho-anh` |
| Hỏi-2 — bộ nạp xoá byte ảnh trên Storage bản thật (gỡ, hỏng giữa chừng) | hai nhánh rẽ (cho xoá theo mã sàn mẫu · không xoá) → cần hình | `hoi-2-xoa-byte` |

## Đề bài hình

### hoi-1-kho-anh
- Loại: luồng rẽ nhánh (flowchart), trái → phải.
- Nút: «Chủ kho bấm nút Nạp dữ liệu mẫu (GitHub)» → «Bộ nạp đọc khoá kho ảnh» → rẽ: (A, khuyến nghị) «đủ ba khoá STORAGE_S3_*» → «ảnh vào Storage — bản thật hiện ảnh»; «thiếu khoá» → «dừng trước mọi câu ghi, báo thiếu khoá»; (B) «luôn ghi Postgres» → «nạp xong nhưng 29 căn mẫu hiện ô ảnh vỡ trên bản thật».
- Nhãn phụ: «việc của chủ kho: thêm ba secret ở environment production».
- AC: AC-4, AC-7.

### hoi-2-xoa-byte
- Loại: luồng rẽ nhánh hai tình huống (gỡ · hỏng giữa chừng).
- Nút: «Gỡ sàn mẫu» → «đọc mã ảnh của đúng sàn mẫu» → rẽ: (A, khuyến nghị) «xoá byte dưới tiền tố mã sàn mẫu» → «Storage sạch»; (B) «không xoá» → «58 đối tượng mồ côi mỗi lần gỡ». Nhánh hai: «Lần nạp hỏng» → «sổ ghi của lần chạy» → (A) «xoá đúng các mã đã ghi» / (B) «byte mồ côi tới 58».
- Nhãn cảnh báo: «xoá trên Storage bản thật không đảo được — mỗi lệnh xoá mang mã sàn mẫu, ca kiểm ghim».
- AC: AC-5, AC-6.
