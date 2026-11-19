# Hình tại điểm quyết định — chuyen-cho-delivery-loop-3-0

| Điểm | Đếm | Hình |
|---|---|---|
| Hỏi-1 + Hỏi-2: luật chọn ghim lại theo hai kết quả (bản sửa × nhánh chính) | hai nhánh rẽ nối tiếp, bốn ô | `bon-nhanh-ghim.html` |
| Thứ tự trước gộp: anh cài sáu plugin cho kho → máy sửa, ghim, chấm → phép thử phiên thật → ký → gộp | năm bước nối tiếp | `trinh-tu.html` |
| Dòng 86 của `ghim-lai-ban-that.yml` sửa tay ngoài bản vá của công cụ | dưới ngưỡng: 1 bước | — |
| `tim-kit.mjs` đọc khoá chợ mới | dưới ngưỡng: 1 bước | — |

## Đề bài `bon-nhanh-ghim`

- Loại: ma trận 2 × 2 (quadrant) — trục ngang «nhánh chính (kit CI 2.39.0): xanh | đỏ», trục dọc «bản sửa (kit 3.0.0): xanh | đỏ».
- Ô đỏ/xanh: «sửa phép đo đúng chỗ đọc vật vừa đổi, ghim lại bằng máy, giữ chữ ký — Hỏi-1». Ô đỏ/đỏ: «nợ cũ: để nguyên, liệt tên — Hỏi-2».
- Ô xanh/đỏ: «chuyển chợ vô tình chữa: liệt tên, không ghim». Ô xanh/xanh: «không ghim».
- Ghi chú dưới: «36 hồ sơ ứng viên — phép đo đọc vật vừa đổi».
- AC liên quan: AC-7.

## Đề bài `trinh-tu`

- Loại: luồng năm bước nối tiếp, ô người khác màu ô máy.
- Bước: (1) anh duyệt Cổng Phạm vi + cài sáu plugin `@delivery-loop` cho kho này trên Mac Studio · (2) máy sửa năm phần, sửa phép đo, ghim lại, chấm · (3) máy chạy phép thử phiên thật trên nhánh · (4) anh ký Cổng Bằng chứng · (5) anh bảo gộp → máy gộp bằng commit gộp, kiểm lại trên nhánh chính.
- AC liên quan: AC-4, AC-7; K6 ngoài phạm vi eval.
