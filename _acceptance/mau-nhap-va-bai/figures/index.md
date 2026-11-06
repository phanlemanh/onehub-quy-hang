# Hình tại điểm quyết định — mau-nhap-va-bai (Cổng Phạm vi)

| Điểm | Đếm | Hình |
|---|---|---|
| Hỏi-1 tách hàng 50 (mẫu file nhập nay · mẫu bảng hàng + mẫu bài hàng kế) | 2 nhánh | dưới gộp: chữ đủ, không vẽ riêng |
| Hỏi-2 một «mẫu» là một cột đã nhớ | 2 nhánh | `gop-mau` (cột là đơn vị của hình) |
| Mô hình sổ sửa + «mục mới nhất thắng», mốc lúc mở (approach) | 4 bước nối tiếp + 2 nhánh | `gop-mau` |
| Hỏi-3 duyệt UI bằng chữ | 2 nhánh | dưới gộp: chữ đủ |
| Hỏi-4 ngưỡng đo cho phạm vi đã tách | 2 nhánh | dưới gộp: chữ đủ |
| Hỏi-5 bỏ phép quét độ phủ | 2 nhánh | dưới gộp: chữ đủ |

## Đề bài `gop-mau`

- Loại: luồng dữ liệu (data flow), trái → phải, có một dải thời gian.
- Nút: «Lần nhập đã ghi (mở lúc t)» → «Rút cột theo tiêu đề» ; «Quản trị sửa / xoá (lúc t)» → «Sổ sửa import_templates (chỉ thêm)» ; cả hai → «Gộp: mỗi tiêu đề giữ mục mới nhất» → «Mẫu» → hai đầu ra «Màn Mẫu nhập (Quản trị)» và «Màn Nhập Excel (Đầu chủ)».
- Nhánh: mục mới nhất là «xoá» → tiêu đề vắng khỏi mẫu, lần nhập kế ghép lại từ đầu.
- Dải thời gian ví dụ: mở lần nhập A (t1) → quản trị sửa cột «Giá/m2» (t2) → A ghi xong (t3): mẫu giữ bản sửa vì mốc của A là t1.
- AC liên quan: AC-1, AC-2, AC-3, AC-4.
