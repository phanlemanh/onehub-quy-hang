# Hình tại điểm quyết định — da-gui

| Điểm | Đếm | Hình |
|---|---|---|
| Tắt link và «Gợi ý căn thay» (Hỏi-2, Hỏi-3, Hỏi-4; AC-4, AC-5): xem link → căn vừa đổi → gợi ý → gửi căn thay; nhánh tắt link → hàm → trang khách | 4 bước nối tiếp, 2 nhánh rẽ | `da-gui-luong.html` / `.png` |
| Hỏi-1 lối giao diện | dưới ngưỡng: trang ba lối là hình | `../ba-loi/index.html` |

## Đề bài hình `da-gui-luong`

Loại: sơ đồ luồng hai nhánh. Gốc: Đầu khách mở Đã gửi → chạm thẻ một link → chi tiết các căn (số quan tâm từng căn).
Nhánh A «Căn vừa đổi» (giá đổi hay đã cọc/không còn sau lúc gửi) → «Gợi ý căn thay» theo luật dựng sẵn (Đang bán, chưa trong
link, cùng số phòng ngủ, giá ±15%, cùng toà trước) → chạm → mở luồng Gửi với căn ấy (người vẫn tự bấm gửi). Nhánh B «Tắt
link» (người gửi hay trưởng nhóm — Hỏi-2) → hỏi xác nhận → hàm tắt link của cơ sở dữ liệu → thẻ «Đã tắt», trang khách «Link
không còn mở được»; không bật lại (Hỏi-4). Nhãn tiếng Việt; AC-3, AC-4, AC-5.
