# Hình tại điểm quyết định — hom-nay-dau-chu

| Điểm | Đếm | Hình |
|---|---|---|
| Hỏi-1 mốc ép giá + Hỏi-2 thứ tự thắng | bốn bước nối tiếp (xét ép giá → gọi lại → thiếu tin → mới đổi) + hai nhánh của Hỏi-1 | cay-hang-doi |
| Hỏi-3 mở số lead | hai nhánh (tách hàng · làm luôn) | dưới ngưỡng gộp vào chữ: một câu so sánh |

## Đề bài: cay-hang-doi

- Loại hình: luồng quyết định trái → phải cho MỘT căn mình giữ.
- Nút: «Căn mình giữ, chưa Đã bán / Ngừng» → hỏi «Đang bán và ≥ 10 ngày từ mốc ép giá?» → Có: «Nên gọi ép giá» · Không →
  «≥ 14 ngày chưa xác nhận?» → Có: «Cần gọi lại» · Không → «Mức đủ thiếu?» → Có: «Thiếu thông tin» · Không → «Người khác
  đổi giá/trạng thái từ 0 giờ hôm qua?» → Có: «Mới đổi» · Không: «Không vào nhóm».
- Hộp chú thích cạnh nút ép giá, hai nhánh Hỏi-1: «Khuyên: mốc = muộn hơn giữa đổi giá và xác nhận → bấm Còn · giữ giá đặt
  lại đồng hồ, 10 ngày sau là đợt hai» (đánh dấu khuyên) và «Lối khác: mốc = đổi giá → căn giữ giá nằm lì ở nhóm».
- Nhãn nhỏ dưới hình: «Thứ tự thắng = Hỏi-2: ép giá > gọi lại > thiếu tin > mới đổi».
- AC liên quan: AC-1, AC-2, AC-3, AC-7.
