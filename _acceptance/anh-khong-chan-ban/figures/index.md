# Hình tại điểm quyết định — anh-khong-chan-ban

| Điểm | Đếm | Hình |
| --- | --- | --- |
| Hỏi-6 — sàn đang chạy lật theo mặc định 0 hay giữ 1 | 3 bước nối tiếp (gộp → đọc cấu hình sàn → xét căn ở ba cửa) + 2 nhánh (sàn đã lưu / chưa lưu) | `ba-cua.html`, `ba-cua.png` |
| Hỏi-1 — mục ảnh đủ khi ≥ 1 hay theo tối thiểu | dưới ngưỡng: 1 bước, 2 lựa chọn | — |
| Hỏi-2 — số đo mức đủ cao nhất | dưới ngưỡng: 1 bước | — |
| Hỏi-3 — bộ nhóm sàn đã lưu | dưới ngưỡng: 1 bước | — |
| Hỏi-4 — trạng thái vào nhóm «Bổ sung ảnh» | dưới ngưỡng: 1 bước | — |
| Hỏi-5 — chỗ đặt ô cài đặt | dưới ngưỡng: 1 bước | — |

## Đề bài hình `ba-cua`

- Loại: luồng (flow), trái sang phải.
- Nút: ba cửa vào («Sẵn sàng bán» ở hồ sơ căn · ô Trạng thái và sửa hàng loạt ở Bảng hàng · nhập file dòng «còn hàng») → một bước kiểm ở máy chủ (đếm ảnh thật gửi được, so với số tối thiểu của sàn) → rẽ: sàn đã lưu số riêng (dùng số ấy) / sàn chưa lưu (mặc định mới 0 — Hỏi-6).
- Nhánh ra: đủ → Đang bán, đầu khách thấy, mục «Ảnh thật» còn thiếu ở mức đủ, việc «Bổ sung ảnh» ở Hôm nay · thiếu → từ chối «thiếu ảnh thật» (Cần xem / Chưa đủ để rao).
- Nhãn tiếng Việt; AC-2, AC-3, AC-5, AC-6.
