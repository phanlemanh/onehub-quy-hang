# Hình tại điểm quyết định — luat-an-va-kiem-ro-ri

| Điểm | Đếm | Hình |
|---|---|---|
| Hỏi-1 — tầng cao / thấp và mã căn theo người nhận | 3 nhánh rẽ nối tiếp (người nhận → sàn ẩn mã căn → danh mục có số tầng toà → tầng so với nửa toà) | `vi-tri-can.html` / `.png` |
| Hỏi-2 — tập trường được ra cứng ở lõi hay sàn chỉnh | dưới ngưỡng: 1 lựa chọn, không nhánh nối tiếp | — |
| Hỏi-3 — khách riêng thấy đặc điểm căn tới đâu | dưới ngưỡng: 1 lựa chọn tập trường, không nhánh nối tiếp | — |
| Hỏi-4 — tình trạng và giá theo trạng thái | dưới ngưỡng: một bảng tra 6 dòng (design.md §4), 1 lần rẽ | — |
| Coverage `[GIẢ ĐỊNH]` — dạng mã hoá của văn bản | dưới ngưỡng: một danh sách, không rẽ | — |

## Đề bài hình `vi-tri-can`

- Loại hình: cây quyết định (flowchart), trái sang phải, chữ tiếng Việt.
- Nút: «Bản đầy đủ của căn» → rẽ «Người nhận?» — nhánh «Nhóm môi giới» → lá «Mã căn, trục, số tầng, UPI, toà»; nhánh
  «Khách riêng» → rẽ «Sàn bật ẩn mã căn? (#13, mặc định bật)» — «Tắt» → cùng lá đầy đủ như nhóm môi giới; «Bật» → rẽ «Danh
  mục có số tầng của toà?» — «Không» → lá «Chỉ toà»; «Có» → rẽ «Tầng > nửa số tầng toà?» — «Có» → lá «Toà · Tầng cao»;
  «Không» → lá «Toà · Tầng thấp».
- Ghi chú dưới hình: «Ở mọi nhánh: không chủ nhà, số, giá đáy, liên hệ, người giữ, ảnh nội bộ — trần lớp, không cấu hình
  nào mở». Đánh dấu nút «Tầng > nửa số tầng toà?» là Hỏi-1.
- AC liên quan: AC-4 (vị trí), AC-3 (không rò ở mọi nhánh).
