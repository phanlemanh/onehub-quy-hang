# Điểm quyết định — san-sang-ban (Cổng Phạm vi)

| Điểm | Đếm | Hình |
|---|---|---|
| Hỏi-1 — ảnh thật là luật lõi; số ảnh tối thiểu cấu hình theo sàn, ba điều kia giữ cứng | 2 nhánh rẽ (cấu hình theo sàn · giữ hằng) | `loi-vao-dang-ban` |
| Hỏi-2 — Bảng hàng có kiểm ảnh trước khi gửi không | 2 nhánh rẽ (máy chủ chặn, về Cần xem · đọc số ảnh qua API) | `loi-vao-dang-ban` |
| Các lựa chọn máy đã quyết (giá về tay = giá kèm phí; chỗ đặt nút; bỏ quét phủ; bỏ design-pass) | dưới ngưỡng: 1 nhánh, căn cứ trong kho | — |

## Đề bài hình `loi-vao-dang-ban`

- Loại: sơ đồ luồng.
- Nút: ba lối vào Đang bán (nút «Sẵn sàng bán» ở hồ sơ căn · sửa ô Trạng thái · sửa hàng loạt ở Bảng hàng) → hàng đợi đồng bộ → API đổi trạng thái → đếm ảnh thật của căn + đọc `listing.ready_min_real_photos` (mặc định 1) → luật lõi (giá về tay, ảnh thật, pháp lý, tình trạng sử dụng) → đủ: Đang bán, lên Toàn sàn / thiếu: 400, hàng về trạng thái cũ, «Cần xem».
- Nhánh kiểm sớm: nút «Sẵn sàng bán» đọc danh sách ảnh và kiểm trước khi gửi → «Còn thiếu: …» ngay (Hỏi-1 cấu hình); Bảng hàng không kiểm ảnh trước (Hỏi-2, lối khác chấm gạch: đọc số ảnh qua API).
- AC liên quan: AC-1, AC-2, AC-5, AC-6, AC-7.
