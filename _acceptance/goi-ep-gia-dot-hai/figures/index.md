# Điểm quyết định — goi-ep-gia-dot-hai (Cổng Phạm vi)

| Điểm | Đếm | Hình |
| --- | --- | --- |
| Hỏi-1 · bố cục chế độ cuộc gọi | 2 nhánh (Hồ sơ một cột · ba cột) | ảnh chụp hai lối ở `design-pass/` (ho-so-1440.png, ba-cot-1440.png) |
| Hỏi-2 · «Không nghe máy» | 2 nhánh, nằm trong luồng kết quả gọi | `luong-ket-qua-goi.html` / `.png` |
| Hỏi-3 · ghi giá đáy mới | 2 nhánh | dưới ngưỡng hình riêng — một dòng chú thích trong `luong-ket-qua-goi` |
| Hỏi-4 · ô tắt xác nhận khi hạ giá | 2 nhánh, nằm trong nhánh Hạ giá | `luong-ket-qua-goi.html` / `.png` |

## Đề bài — luong-ket-qua-goi

- Loại hình: sơ đồ luồng (flowchart) trái → phải.
- Nút: Hôm nay «Nên gọi điều chỉnh giá» → «Gọi» → Chế độ ép giá (đầu căn · lịch sử trả giá · giá đáy) → bốn nhánh phím: H Hạ giá
  (ô giá → «Hiểu là … · trước … · −x%» → quá 20%? hỏi lại → ghi «đổi giá», tính là xác nhận [Hỏi-4]) · G Giữ giá (ghi «Còn · giữ
  giá») · B Đã cọc / bán… (1 Đã cọc → Đang giao dịch · 2 Sàn mình bán → Đã bán + giá chốt · 3 Chủ bán nơi khác → Ngừng hẳn) · K
  Không nghe máy (không ghi gì [Hỏi-2]) → về Hôm nay.
- Chú thích nhỏ: giá đáy chỉ hiện cho người thấy nguồn; ghi giá đáy mới không làm ở vòng này [Hỏi-3].
- AC liên quan: AC-1, AC-3, AC-4, AC-5, AC-6, AC-7, AC-8.
