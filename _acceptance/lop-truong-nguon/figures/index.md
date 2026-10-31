# Hình tại điểm quyết định — lop-truong-nguon

| Điểm | Đếm | Hình |
|---|---|---|
| Hỏi-1 — mã hoá số chủ: tách hàng sau hay làm ngay | 2 nhánh rẽ (tách · làm ngay), mỗi nhánh 3 bước nối tiếp → cần hình | cua-mo-so |
| Hỏi-2 — trưởng nhóm thấy cả sàn tới khi có nhóm | 2 nhánh rẽ, 1 bước mỗi nhánh → cần hình (gộp vào hình ai-thay-gi) | ai-thay-gi |
| Sổ: số chỉ ra qua một hàm, cột số không đọc thẳng | 3 bước nối tiếp (gọi → xét quyền → ghi sự kiện → trả số) → cần hình (gộp vào cua-mo-so) | cua-mo-so |
| Hỏi-3 — ai thành đầu chủ giữ căn | dưới ngưỡng: 2 nhánh nhưng mỗi nhánh 1 bước — nêu bằng chữ trên thẻ | — |
| Sổ: bảng gán đầu chủ chỉ thêm · sự kiện mở số ở bảng riêng · quản trị không thấy · chỉ cờ «có số» | dưới ngưỡng: mỗi điểm 1 bước | — |

## Đề bài

### ai-thay-gi
- Loại: ma trận (người xem × điều nhận được).
- Hàng: đầu chủ giữ căn · trưởng nhóm (Hỏi-2: cả sàn) · đầu chủ khác · đầu khách · telesales · quản trị sàn · sàn khác.
- Cột: tên chủ · giá đáy · biết «có số» · số đầy đủ (qua «Mở số», ghi sự kiện) · mã đầu chủ giữ căn.
- Ô: «thấy» / «qua Mở số» / «không» ; sàn khác: «404».
- AC: AC-2, AC-3, AC-5, AC-6, AC-9.

### cua-mo-so
- Loại: luồng có nhánh.
- Nút: Đầu chủ / trưởng nhóm bấm «Mở số» → API → hàm cơ sở dữ liệu «mở số» → xét: cùng sàn? người thấy nguồn? có số? → (đạt) ghi một sự kiện mở số rồi trả số · (không) 403 / 404, không ghi gì.
- Nhánh bên: đọc thẳng cột số → bị từ chối quyền (không đường vòng).
- Ghi chú Hỏi-1: mã hoá sau này chỉ thay thân hàm «mở số» (giải mã ở đây) — khuyến nghị tách hàng.
- AC: AC-7, AC-8.
