# Hình tại điểm quyết định — khuon-xac-nhan-danh-muc (Cổng Phạm vi)

| Điểm | Đếm | Hình |
|---|---|---|
| Hỏi-1 mốc ngày hay tuần | dưới ngưỡng: 1 lựa chọn, 2 giá trị, không luồng | — |
| Hỏi-2 ô xác minh chủ với sổ | dưới ngưỡng: có / không | — |
| Hỏi-3 toà ngoài danh mục | dưới ngưỡng: 2 lối, không luồng | — |
| Hỏi-4 giữ cứng danh sách báo sai | dưới ngưỡng: 2 lối | — |
| Hỏi-5 cách sinh mã mờ (gap-probe P0, human-gate1) | cần hình: 3 nhánh rẽ × 2 hệ quả (nối giữa hai bên nhận, xoay khoá) | ma-mo-ba-loi |

## Đề bài: ma-mo-ba-loi
- Loại hình: so sánh ba nhánh (ba cột song song), mỗi nhánh cùng hai hàng hệ quả.
- Nút: «Sàn A» → hàm dựng → mã gửi «Bên nhận 1 (Invest)» và «Bên nhận 2 (bên sau này)»; ba cột: (1) Khoá riêng từng bên nhận [máy khuyên] · (2) Khoá chung · (3) Bảng ánh xạ mã ngẫu nhiên.
- Hàng hệ quả 1 «Hai bên nhận có nối được Sàn A với nhau?»: (1) không — mã khác nhau · (2) có — cùng một mã · (3) không — mỗi bên một mã ngẫu nhiên.
- Hàng hệ quả 2 «Xoay khoá thì sao?»: (1) mọi mã của bên ấy đổi, Invest mất nối lịch sử · (2) mọi mã của mọi bên đổi một lượt · (3) không đổi mã, nhưng thêm một bảng giữ nối mã ↔ sàn (hàng 97).
- AC liên quan: AC-7.
