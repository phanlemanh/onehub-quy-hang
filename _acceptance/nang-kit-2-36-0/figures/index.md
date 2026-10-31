# Hình tại điểm quyết định — nang-kit-2-36-0

| Điểm | Đếm | Hình |
| --- | --- | --- |
| Hỏi-1 — chặn mở việc ngoài lộ trình | 3 bước nối tiếp (mở việc bằng câu mô tả → máy thêm hàng → lưới gộp kiểm hồ sơ thuộc hàng) | `duong-viec-moi.html` |
| Hỏi-2 — máy tự định tuyến mục ngoài hợp đồng | 2 nhánh rẽ (hồ sơ T2 sạch → máy ghi · còn lại → người) | `duong-viec-moi.html` (cùng hình) |
| Hạng T3 thay T2 | dưới ngưỡng: 1 bước | — |
| Phản biện bắt buộc | dưới ngưỡng: 1 nhánh (thiếu thì chặn) | — |
| Driver tệp sinh qua npm install | dưới ngưỡng: 1 bước | — |

## Đề bài — `duong-viec-moi`

- Loại hình: luồng (flowchart) trái → phải, hai làn.
- Làn trên «Mở việc»: Câu mô tả việc mới → Máy thêm một hàng vào lộ trình → Hồ sơ mở, thuộc hàng → Lưới gộp: hồ sơ có hàng? (có → qua · không → chặn, nêu tên hồ sơ).
- Làn dưới «Cổng Bằng chứng»: Mục ngoài hợp đồng → rẽ: hồ sơ T2 · đạt · không mục chưa chắc · máy đề xuất ghi giới hạn hoặc chấp nhận → Máy ghi, thẻ in lệnh đảo · ngược lại (T3, mở hợp đồng mới, có mục chưa chắc) → Chủ kho quyết như hôm nay.
- AC liên quan: AC-6, AC-7.
