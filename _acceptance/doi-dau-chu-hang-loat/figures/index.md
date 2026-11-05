# Hình tại điểm quyết định — doi-dau-chu-hang-loat

| Điểm | Đếm | Hình |
|---|---|---|
| Luồng đổi đầu chủ hàng loạt (tích → xem trước kéo theo → đổi → hoàn tác) | 4 bước nối tiếp | cần hình: `doi-dau-chu` |
| Hỏi-1 · lối gán một căn | 2 nhánh (giữ nguyên · đi chung hàm mới) | cần hình: `doi-dau-chu` (chung) |
| Hỏi-2 · hoàn tác căn trước chưa có đầu chủ | 3 nhánh (giữ người nhận kèm lời · loại khỏi lô · dòng gán «không đầu chủ») | cần hình: `doi-dau-chu` (chung) |

## Đề bài `doi-dau-chu`

- Loại: sơ đồ luồng trái → phải, một làn chính và hai khung câu hỏi đứt nét.
- Làn chính: «Trưởng nhóm tích căn» → «Xem trước: căn đã tích + căn cùng chủ nhà, đầu chủ cũ, số liên hệ» → «Đổi: mọi căn và liên hệ sang đầu chủ mới» → «Thông báo 10 giây · Hoàn tác» → «Hoàn tác: trả người giữ cũ, bỏ qua căn/liên hệ đã đổi tiếp».
- Khung Hỏi-1 (gắn vào ghi chú «Lối gán một căn đang có»): «Giữ nguyên ở hàng này (khuyên)» · «Đi chung hàm mới».
- Khung Hỏi-2 (gắn vào bước Hoàn tác): «Căn chưa có đầu chủ và liên hệ cùng chủ giữ người nhận, lời riêng (khuyên)» · «Loại căn chưa có đầu chủ khỏi lô» · «Thêm dòng gán "không đầu chủ"».
- AC liên quan: AC-3, AC-4, AC-5, AC-8.
