# Hình tại điểm quyết định — nhap-nho-mau

| Điểm | Đếm | Hình |
| --- | --- | --- |
| Hỏi-1 — bộ nhớ ở đâu | hai nhánh rẽ (dựng từ imports đã ghi · bảng import_templates mới) | `bo-nho-o-dau.html` |
| Khớp theo từng tiêu đề, mới nhất thắng | dưới ngưỡng: một bước, không nhánh | — |
| Sửa ô thành cách gọi của cột | dưới ngưỡng: hai bước nối tiếp | — |

## Đề bài: bo-nho-o-dau

- Loại hình: so sánh hai nhánh (hai cột cạnh nhau), cùng một luồng đầu: «tệp mới → màn đọc mẫu → ghép sẵn».
- Nhánh trái «Máy khuyên — từ lần nhập đã ghi»: bảng `imports` (có sẵn) → lọc `committed` → mới nhất theo tiêu đề → mẫu; nhãn: «không migration · T2 · hàng 50 dựng bảng mẫu sau».
- Nhánh phải «Lối khác — bảng import_templates»: migration mới → luật theo dòng + ca cách ly → ghi mẫu khi ghi lần nhập → mẫu; nhãn: «T3 · Cổng 1.5 · vượt vùng hàng 67».
- Chữ tiếng Việt, không mã máy ngoài tên bảng.
- AC liên quan: AC-1, AC-4, AC-5.

Bổ sung sau phản biện: Hỏi-2 (lan sang ô cùng chữ — dưới ngưỡng: một bước, hai lối nêu bằng chữ) · Hỏi-3 (đo — dưới ngưỡng: một
bước, hai lối nêu bằng chữ).
