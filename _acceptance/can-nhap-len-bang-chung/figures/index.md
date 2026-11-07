# Hình tại điểm quyết định — can-nhap-len-bang-chung

| Điểm | Đếm | Hình |
| --- | --- | --- |
| Hỏi-1 · căn có sẵn mà file ghi «còn hàng» | 2 nhánh rẽ (dòng tạo · dòng cập nhật) × 3 bước (đọc dòng → xét điều kiện → trạng thái) | `duong-dong-nhap.html` |
| Hỏi-2 · sàn bật lại «cửa nhập đòi pháp lý» | 1 nhánh, 1 bước — dưới ngưỡng | — |
| Gap-probe | 0 mục `human-gate1` | — |

## Đề bài `duong-dong-nhap`

- Loại: flowchart trái → phải.
- Nút: «Dòng file ghi Đang bán» → rẽ «căn mới» / «căn có sẵn». Nhánh căn mới → «Xét điều kiện, cửa nhập: bỏ pháp lý, tình trạng sử dụng; giữ mã, giá kèm phí, ảnh» → rẽ «đủ» → «Đang bán + việc Thiếu thông tin ở Hôm nay» / «thiếu giá, phí, mã, ảnh» → «Chưa đủ để rao + lý do». Nhánh căn có sẵn → «Giữ trạng thái hiện tại (Hỏi-1, khuyến nghị)», nét đứt tới «Lối khác: lên Đang bán».
- Nhãn bằng chữ tiếng Việt như trên, không mã.
- AC liên quan: AC-2, AC-4, AC-7, Hỏi-1.
